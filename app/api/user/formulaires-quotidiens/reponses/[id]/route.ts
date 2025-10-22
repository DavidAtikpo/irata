import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    if (session.user.role !== 'USER') {
      return NextResponse.json({ error: 'Accès réservé aux utilisateurs' }, { status: 403 });
    }

    const { id } = await params;

    // Récupérer la réponse avec ses détails
    const reponse = await prisma.reponseFormulaire.findUnique({
      where: { id },
      include: {
        formulaire: {
          select: {
            id: true,
            titre: true,
            questions: true
          }
        },
        correction: true
      }
    });

    if (!reponse) {
      return NextResponse.json({ error: 'Réponse non trouvée' }, { status: 404 });
    }

    // Vérifier que la réponse appartient à l'utilisateur
    if (reponse.stagiaireId !== session.user.id) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    // Calculer le scoring côté serveur pour chaque réponse (même logique que l'API admin)
    const questions = (reponse.formulaire.questions as any[]) ?? [];
    const reponsesUtilisateur = (reponse.reponses as any[]) ?? [];
    
    const reponsesCorrigees = (Array.isArray(reponsesUtilisateur) ? reponsesUtilisateur : []).map((reponseQuestion: any) => {
      const question = questions.find((q: any) => q.id === reponseQuestion.questionId);
      if (!question) return reponseQuestion;

      const pointsMaxQuestion = question.points || 1;
      let pointsObtenus = 0;
      let correcte = false;

      if (question.type === 'number') {
        const reponseNormalisee = parseFloat(reponseQuestion.reponse);
        const bonneReponseNormalisee = parseFloat(question.correctAnswers[0] || '');
        const tolerance = 0.01;
        correcte = !isNaN(reponseNormalisee) && !isNaN(bonneReponseNormalisee) && Math.abs(reponseNormalisee - bonneReponseNormalisee) <= tolerance;
        pointsObtenus = correcte ? pointsMaxQuestion : 0;
      } else if (question.type === 'text' || question.type === 'textarea') {
        const reponseNormalisee = reponseQuestion.reponse.toLowerCase().trim();
        const bonneReponseNormalisee = (question.correctAnswers[0] || '').toLowerCase().trim();
        correcte = reponseNormalisee === bonneReponseNormalisee;
        pointsObtenus = correcte ? pointsMaxQuestion : 0;
      } else if (question.type === 'radio' || question.type === 'select') {
        const reponseNormalisee = reponseQuestion.reponse.toLowerCase().trim();
        const bonneReponseNormalisee = (question.correctAnswers[0] || '').toLowerCase().trim();
        correcte = reponseNormalisee === bonneReponseNormalisee;
        pointsObtenus = correcte ? pointsMaxQuestion : 0;
      } else if (question.type === 'checkbox') {
        const reponsesUser = Array.isArray(reponseQuestion.reponse) 
          ? reponseQuestion.reponse 
          : [reponseQuestion.reponse];
        
        const reponsesUserNormalisees = reponsesUser.map((r: any) => r.toLowerCase().trim());
        const bonnesReponsesNormalisees = question.correctAnswers.map((r: any) => r.toLowerCase().trim());
        
        const toutesBonnesReponsesSelectionnees = bonnesReponsesNormalisees.every((r: any) => 
          reponsesUserNormalisees.includes(r)
        );
        const aucuneMauvaiseReponse = reponsesUserNormalisees.every((r: any) => 
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

    return NextResponse.json({
      id: reponse.id,
      formulaireId: reponse.formulaireId,
      formulaire: reponse.formulaire,
      reponses: reponsesCorrigees,
      commentaires: reponse.commentaires,
      dateReponse: reponse.dateReponse,
      version: reponse.version,
      correction: reponse.correction
    });

  } catch (error) {
    console.error('Erreur lors de la récupération de la réponse:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' }, 
      { status: 500 }
    );
  }
}














