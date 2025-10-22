import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

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
      
      // Calculer le scoring côté serveur pour chaque réponse (même logique que l'API admin)
      const reponsesCorrigees = (Array.isArray(reponses) ? reponses : []).map((reponseQuestion: any) => {
        const question = questions.find((q: any) => q.id === reponseQuestion.questionId);
        if (!question) return reponseQuestion;

        const pointsMaxQuestion = question.points || 1;
        let pointsObtenus = 0;
        let correcte = false;

        if (question.type === 'number') {
          // Pour les questions numériques
          const reponseNormalisee = parseFloat(reponseQuestion.reponse);
          const bonneReponseNormalisee = parseFloat(question.correctAnswers[0] || '');
          const tolerance = 0.01;
          correcte = !isNaN(reponseNormalisee) && !isNaN(bonneReponseNormalisee) && Math.abs(reponseNormalisee - bonneReponseNormalisee) <= tolerance;
          pointsObtenus = correcte ? pointsMaxQuestion : 0;
        } else if (question.type === 'text' || question.type === 'textarea') {
          // Pour les questions texte
          const reponseNormalisee = reponseQuestion.reponse.toLowerCase().trim();
          const bonneReponseNormalisee = (question.correctAnswers[0] || '').toLowerCase().trim();
          correcte = reponseNormalisee === bonneReponseNormalisee;
          pointsObtenus = correcte ? pointsMaxQuestion : 0;
        } else if (question.type === 'radio' || question.type === 'select') {
          // Pour les questions à choix unique
          const reponseNormalisee = reponseQuestion.reponse.toLowerCase().trim();
          const bonneReponseNormalisee = (question.correctAnswers[0] || '').toLowerCase().trim();
          correcte = reponseNormalisee === bonneReponseNormalisee;
          pointsObtenus = correcte ? pointsMaxQuestion : 0;
        } else if (question.type === 'checkbox') {
          // Pour les questions à choix multiples
          const reponsesUtilisateur = Array.isArray(reponseQuestion.reponse) 
            ? reponseQuestion.reponse 
            : [reponseQuestion.reponse];
          
          const reponsesUtilisateurNormalisees = reponsesUtilisateur.map((r: any) => r.toLowerCase().trim());
          const bonnesReponsesNormalisees = question.correctAnswers.map((r: any) => r.toLowerCase().trim());
          
          // Vérifier que toutes les bonnes réponses sont sélectionnées et qu'il n'y a pas de mauvaises réponses
          const toutesBonnesReponsesSelectionnees = bonnesReponsesNormalisees.every((r: any) => 
            reponsesUtilisateurNormalisees.includes(r)
          );
          const aucuneMauvaiseReponse = reponsesUtilisateurNormalisees.every((r: any) => 
            bonnesReponsesNormalisees.includes(r)
          );
          
          correcte = toutesBonnesReponsesSelectionnees && aucuneMauvaiseReponse;
          pointsObtenus = correcte ? pointsMaxQuestion : 0;
        }

        return {
          ...reponseQuestion,
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
        reponsesApresCorrigees = reponsesApres.map((reponseQuestion: any) => {
          const question = questions.find((q: any) => q.id === reponseQuestion.questionId);
          if (!question) return reponseQuestion;

          const pointsMaxQuestion = question.points || 1;
          let pointsObtenus = 0;
          let correcte = false;

          if (question.type === 'number') {
            // Pour les questions numériques
            const reponseNormalisee = parseFloat(reponseQuestion.reponse);
            const bonneReponseNormalisee = parseFloat(question.correctAnswers[0] || '');
            const tolerance = 0.01;
            correcte = !isNaN(reponseNormalisee) && !isNaN(bonneReponseNormalisee) && Math.abs(reponseNormalisee - bonneReponseNormalisee) <= tolerance;
            pointsObtenus = correcte ? pointsMaxQuestion : 0;
          } else if (question.type === 'text' || question.type === 'textarea') {
            // Pour les questions texte
            const reponseNormalisee = reponseQuestion.reponse.toLowerCase().trim();
            const bonneReponseNormalisee = (question.correctAnswers[0] || '').toLowerCase().trim();
            correcte = reponseNormalisee === bonneReponseNormalisee;
            pointsObtenus = correcte ? pointsMaxQuestion : 0;
          } else if (question.type === 'radio' || question.type === 'select') {
            // Pour les questions à choix unique
            const reponseNormalisee = reponseQuestion.reponse.toLowerCase().trim();
            const bonneReponseNormalisee = (question.correctAnswers[0] || '').toLowerCase().trim();
            correcte = reponseNormalisee === bonneReponseNormalisee;
            pointsObtenus = correcte ? pointsMaxQuestion : 0;
          } else if (question.type === 'checkbox') {
            // Pour les questions à choix multiples
            const reponsesUtilisateur = Array.isArray(reponseQuestion.reponse) 
              ? reponseQuestion.reponse 
              : [reponseQuestion.reponse];
            
            const reponsesUtilisateurNormalisees = reponsesUtilisateur.map((r: any) => r.toLowerCase().trim());
            const bonnesReponsesNormalisees = question.correctAnswers.map((r: any) => r.toLowerCase().trim());
            
            // Vérifier que toutes les bonnes réponses sont sélectionnées et qu'il n'y a pas de mauvaises réponses
            const toutesBonnesReponsesSelectionnees = bonnesReponsesNormalisees.every((r: any) => 
              reponsesUtilisateurNormalisees.includes(r)
            );
            const aucuneMauvaiseReponse = reponsesUtilisateurNormalisees.every((r: any) => 
              bonnesReponsesNormalisees.includes(r)
            );
            
            correcte = toutesBonnesReponsesSelectionnees && aucuneMauvaiseReponse;
            pointsObtenus = correcte ? pointsMaxQuestion : 0;
          }

          return { ...reponseQuestion, pointsObtenus, correcte };
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


