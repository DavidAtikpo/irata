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

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès réservé aux administrateurs' }, { status: 403 });
    }

    // Récupérer toutes les réponses aux formulaires quotidiens
    const reponses = await prisma.reponseFormulaire.findMany({
      include: {
        stagiaire: {
          select: {
            nom: true,
            prenom: true,
            email: true
          }
        },
        formulaire: {
          select: {
            id: true,
            titre: true,
            questions: true
          }
        }
      },
      orderBy: {
        dateReponse: 'desc'
      }
    });

    // Calculer les scores et moyennes pour chaque réponse
    const reponsesAvecScores = reponses.map(reponse => {
      let totalPoints = 0;
      let pointsMax = 0;
      
      // Parser les questions du formulaire (stockées en JSON)
      const questions = Array.isArray(reponse.formulaire.questions) 
        ? reponse.formulaire.questions 
        : JSON.parse(String(reponse.formulaire.questions || '[]'));
      
      // Parser les réponses de l'utilisateur (stockées en JSON)
      const reponsesUtilisateur = Array.isArray(reponse.reponses) 
        ? reponse.reponses 
        : JSON.parse(String(reponse.reponses || '[]'));
      
      const reponsesCorrigees = reponsesUtilisateur.map((reponseQuestion: any) => {
        const question = questions.find((q: any) => q.id === reponseQuestion.questionId);
        if (!question) return reponseQuestion;

        const pointsMaxQuestion = question.points || 1;
        pointsMax += pointsMaxQuestion;

        // Comparer la réponse avec la/les bonne(s) réponse(s)
        let pointsObtenus = 0;
        let correcte = false;

        if (question.type === 'number') {
          // Pour les questions numériques, comparer les valeurs
          const reponseNum = parseFloat(reponseQuestion.reponse);
          const bonneReponseNum = parseFloat(question.correctAnswers[0] || '');
          if (!isNaN(reponseNum) && !isNaN(bonneReponseNum)) {
            correcte = Math.abs(reponseNum - bonneReponseNum) < 0.01; // Tolérance pour les erreurs d'arrondi
            pointsObtenus = correcte ? pointsMaxQuestion : 0;
          }
        } else if (question.type === 'text' || question.type === 'textarea') {
          // Pour les questions texte, comparer les chaînes (insensible à la casse)
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

        totalPoints += pointsObtenus;

        return {
          ...reponseQuestion,
          pointsObtenus,
          correcte
        };
      });

      // Calculer la moyenne sur 20
      const moyenne = pointsMax > 0 ? (totalPoints / pointsMax) * 20 : 0;

      return {
        id: reponse.id,
        userId: reponse.stagiaireId,
        user: reponse.stagiaire,
        formulaireId: reponse.formulaireId,
        dateReponse: reponse.dateReponse,
        reponses: reponsesCorrigees,
        totalPoints,
        pointsMax,
        moyenne: Math.round(moyenne * 100) / 100
      };
    });

    return NextResponse.json(reponsesAvecScores);

  } catch (error) {
    console.error('Erreur lors de la récupération des réponses:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' }, 
      { status: 500 }
    );
  }
}
