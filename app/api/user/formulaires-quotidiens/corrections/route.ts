import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { isTextAnswerCorrect, isNumberAnswerCorrect } from '@/lib/fuzzy-matching';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    if (session.user.role !== 'USER') {
      return NextResponse.json({ error: 'Accès réservé aux utilisateurs' }, { status: 403 });
    }

    // Récupérer toutes les corrections pour l'utilisateur
    const corrections = await prisma.correctionFormulaire.findMany({
      where: {
        reponse: {
          stagiaireId: session.user.id
        }
      },
      include: {
        reponse: {
          include: {
            formulaire: {
              select: {
                id: true,
                titre: true,
                session: true,
                questions: true
              }
            }
          }
        },
        admin: {
          select: { nom: true, prenom: true, email: true }
        }
      },
      orderBy: {
        dateCorrection: 'desc'
      }
    });

    // Transformer les données pour l'affichage avec scoring côté serveur
    const correctionsFormatees = await Promise.all(corrections.map(async correction => {
      const questions = (correction.reponse.formulaire.questions as any[]) ?? [];
      const reponses = (correction.reponse.reponses as any[]) ?? [];
      
      // Calculer le scoring côté serveur pour chaque réponse
      const reponsesCorrigees = (Array.isArray(reponses) ? reponses : []).map((reponse: any) => {
        const question = questions.find((q: any) => q.id === reponse.questionId);
        if (!question) return reponse;

        let pointsObtenus = 0;
        let correcte = false;

        // Normaliser le type et décider si on score même si scoringEnabled est absent
        const rawType = (question.type || '').toString();
        const normalizedType = rawType.toLowerCase();
        const isRadio = normalizedType === 'radio' || normalizedType === 'select';
        const isCheckbox = normalizedType === 'checkbox' || normalizedType === 'choix_multiple'.toLowerCase();
        const isText = normalizedType === 'text' || normalizedType === 'textarea' || normalizedType === 'texte_libre'.toLowerCase();
        const isVraiFaux = normalizedType === 'vrai_faux' || normalizedType === 'boolean' || normalizedType === 'truefalse';

        const pointsValue = Number(question.points);
        const hasPoints = !Number.isNaN(pointsValue);
        const correctAnswers = question.correctAnswers || [];
        const hasCorrectAnswers = Array.isArray(correctAnswers) && correctAnswers.length > 0;
        const scoringEnabled = question.scoringEnabled !== false; // par défaut true

        if (scoringEnabled && (hasPoints || hasCorrectAnswers)) {
          const userResponse = getSimpleResponse(reponse.reponse);

          if (isRadio) {
            const userAnswer = Array.isArray(userResponse) ? userResponse[0] : userResponse;
            const correctAnswer = correctAnswers[0];
            correcte = userAnswer?.toLowerCase().trim() === correctAnswer?.toLowerCase().trim();
            pointsObtenus = correcte ? pointsValue : 0;
          } else if (isCheckbox) {
            const userAnswers = Array.isArray(userResponse) ? userResponse : [userResponse];
            const normalizedUserAnswers = userAnswers.map((a: string) => a?.toLowerCase().trim()).filter(Boolean);
            const normalizedCorrectAnswers = correctAnswers.map((a: string) => a?.toLowerCase().trim()).filter(Boolean);
            
            const toutesBonnesReponsesSelectionnees = normalizedCorrectAnswers.every((correctAnswer: string) => 
              normalizedUserAnswers.includes(correctAnswer)
            );
            const aucuneMauvaiseReponse = normalizedUserAnswers.every((userAnswer: string) => 
              normalizedCorrectAnswers.includes(userAnswer)
            );
            
            correcte = toutesBonnesReponsesSelectionnees && aucuneMauvaiseReponse;
            pointsObtenus = correcte ? pointsValue : 0;
          } else if (isText) {
            const userAnswer = Array.isArray(userResponse) ? userResponse[0] : userResponse;
            const correctAnswer = correctAnswers[0];
            correcte = isTextAnswerCorrect(userAnswer || '', correctAnswer || '');
            pointsObtenus = correcte ? pointsValue : 0;
          } else if (normalizedType === 'number') {
            const userAnswer = Array.isArray(userResponse) ? userResponse[0] : userResponse;
            const correctAnswer = correctAnswers[0];
            correcte = isNumberAnswerCorrect(userAnswer, correctAnswer);
            pointsObtenus = correcte ? pointsValue : 0;
          } else if (isVraiFaux) {
            const userAnswer = (Array.isArray(userResponse) ? userResponse[0] : userResponse)?.toString().toLowerCase().trim();
            const correctAnswer = (correctAnswers[0])?.toString().toLowerCase().trim();
            const normalizeBool = (v: string | undefined) => {
              if (v === undefined) return undefined;
              if (v === 'true' || v === 'vrai' || v === 'oui') return 'true';
              if (v === 'false' || v === 'faux' || v === 'non') return 'false';
              return v;
            };
            correcte = normalizeBool(userAnswer) === normalizeBool(correctAnswer);
            pointsObtenus = correcte ? pointsValue : 0;
          }
        }

        return {
          ...reponse,
          pointsObtenus,
          correcte
        };
      });

      // Chercher la dernière version soumise après correction (s'il y en a)
      const derniereVersion = await prisma.reponseFormulaire.findFirst({
        where: { reponseOriginaleId: correction.reponseId },
        orderBy: { version: 'desc' }
      });

      let reponsesApresCorrigees: any[] | null = null;
      if (derniereVersion && Array.isArray((derniereVersion as any).reponses)) {
        const reponsesApres = (derniereVersion as any).reponses as any[];
        reponsesApresCorrigees = reponsesApres.map((reponse: any) => {
          const question = questions.find((q: any) => q.id === reponse.questionId);
          if (!question) return reponse;

          let pointsObtenus = 0;
          let correcte = false;

          const rawType = (question.type || '').toString();
          const normalizedType = rawType.toLowerCase();
          const isRadio = normalizedType === 'radio' || normalizedType === 'select';
          const isCheckbox = normalizedType === 'checkbox' || normalizedType === 'choix_multiple'.toLowerCase();
          const isText = normalizedType === 'text' || normalizedType === 'textarea' || normalizedType === 'texte_libre'.toLowerCase();
          const isVraiFaux = normalizedType === 'vrai_faux' || normalizedType === 'boolean' || normalizedType === 'truefalse';

          const pointsValue = Number(question.points);
          const correctAnswers = question.correctAnswers || [];
          const scoringEnabled = question.scoringEnabled !== false;

          if (scoringEnabled && (!Number.isNaN(pointsValue) || (Array.isArray(correctAnswers) && correctAnswers.length > 0))) {
            const userResponse = getSimpleResponse(reponse.reponse);
            if (isRadio) {
              const userAnswer = Array.isArray(userResponse) ? userResponse[0] : userResponse;
              const correctAnswer = correctAnswers[0];
              correcte = userAnswer?.toLowerCase().trim() === correctAnswer?.toLowerCase().trim();
              pointsObtenus = correcte ? pointsValue : 0;
            } else if (isCheckbox) {
              const userAnswers = Array.isArray(userResponse) ? userResponse : [userResponse];
              const normalizedUserAnswers = userAnswers.map((a: string) => a?.toLowerCase().trim()).filter(Boolean);
              const normalizedCorrectAnswers = correctAnswers.map((a: string) => a?.toLowerCase().trim()).filter(Boolean);
              const toutesBonnes = normalizedCorrectAnswers.every((c: string) => normalizedUserAnswers.includes(c));
              const aucuneMauvaise = normalizedUserAnswers.every((u: string) => normalizedCorrectAnswers.includes(u));
              correcte = toutesBonnes && aucuneMauvaise;
              pointsObtenus = correcte ? pointsValue : 0;
            } else if (isText) {
              const userAnswer = Array.isArray(userResponse) ? userResponse[0] : userResponse;
              const correctAnswer = correctAnswers[0];
              correcte = isTextAnswerCorrect(userAnswer || '', correctAnswer || '');
              pointsObtenus = correcte ? pointsValue : 0;
            } else if (normalizedType === 'number') {
              const userAnswer = Array.isArray(userResponse) ? userResponse[0] : userResponse;
              const correctAnswer = correctAnswers[0];
              correcte = isNumberAnswerCorrect(userAnswer, correctAnswer);
              pointsObtenus = correcte ? pointsValue : 0;
            } else if (isVraiFaux) {
              const userAnswer = (Array.isArray(userResponse) ? userResponse[0] : userResponse)?.toString().toLowerCase().trim();
              const correctAnswer = (correctAnswers[0])?.toString().toLowerCase().trim();
              const normalizeBool = (v: string | undefined) => {
                if (v === undefined) return undefined;
                if (v === 'true' || v === 'vrai' || v === 'oui') return 'true';
                if (v === 'false' || v === 'faux' || v === 'non') return 'false';
                return v;
              };
              correcte = normalizeBool(userAnswer) === normalizeBool(correctAnswer);
              pointsObtenus = correcte ? pointsValue : 0;
            }
          }

          return { ...reponse, pointsObtenus, correcte };
        });
      }

      return {
        id: correction.id,
        reponseId: correction.reponseId,
        decision: correction.decision,
        commentaire: correction.commentaire,
        score: correction.score,
        dateCorrection: correction.dateCorrection,
        // Champs à plat attendus par le frontend
        formulaireId: correction.reponse.formulaire.id,
        formulaireTitre: correction.reponse.formulaire.titre,
        formulaireSession: (correction.reponse.formulaire as any).session,
        adminNom: [correction.admin?.prenom, correction.admin?.nom].filter(Boolean).join(' ') || correction.admin?.email || '—',
        // Conserver aussi l'objet formulaire si nécessaire ailleurs
        formulaire: {
          id: correction.reponse.formulaire.id,
          titre: correction.reponse.formulaire.titre,
          session: (correction.reponse.formulaire as any).session,
          questions: questions
        },
        // Questions et réponses au niveau racine pour la modale
        questions: questions,
        reponses: reponsesCorrigees,
        reponsesApres: reponsesApresCorrigees,
        versionApres: derniereVersion?.version || null,
        dateReponseApres: derniereVersion?.dateReponse || null,
        dateReponse: correction.reponse.dateReponse
      };
    }));

    return NextResponse.json(correctionsFormatees);

  } catch (error) {
    console.error('Erreur lors de la récupération des corrections:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' }, 
      { status: 500 }
    );
  }
}

// Fonction helper pour extraire la réponse simple
function getSimpleResponse(response: any): any {
  if (typeof response === 'string') {
    return response;
  }
  
  if (Array.isArray(response)) {
    return response;
  }
  
  if (typeof response === 'object' && response !== null) {
    if (response.reponse !== undefined) {
      return response.reponse;
    }
    if (response.value !== undefined) {
      return response.value;
    }
    if (response.answer !== undefined) {
      return response.answer;
    }
  }
  
  return response;
}

