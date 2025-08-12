import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/user/formulaires-quotidiens/reponses
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { formulaireId, reponses, commentaires, score, maxScore } = body;

    // Validation des données
    if (!formulaireId || !reponses || !Array.isArray(reponses)) {
      return NextResponse.json(
        { message: 'Données invalides' },
        { status: 400 }
      );
    }

    // Vérifier que le formulaire existe et est valide
    const formulaire = await prisma.formulairesQuotidiens.findUnique({
      where: { id: formulaireId }
    });

    if (!formulaire) {
      return NextResponse.json(
        { message: 'Formulaire non trouvé' },
        { status: 404 }
      );
    }

    if (!formulaire.valide || !formulaire.actif) {
      return NextResponse.json(
        { message: 'Ce formulaire n\'est plus disponible' },
        { status: 400 }
      );
    }

    // Vérifier que l'utilisateur est dans la période du formulaire
    const now = new Date();
    const debut = new Date(formulaire.dateDebut);
    const fin = new Date(formulaire.dateFin);

    if (now < debut || now > fin) {
      return NextResponse.json(
        { message: 'Ce formulaire n\'est pas disponible actuellement' },
        { status: 400 }
      );
    }

    // Vérifier si l'utilisateur a déjà répondu aujourd'hui
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const reponseExistante = await prisma.reponseFormulaire.findFirst({
      where: {
        formulaireId,
        stagiaireId: session.user.id,
        dateReponse: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    if (reponseExistante) {
      return NextResponse.json(
        { message: 'Vous avez déjà répondu à ce formulaire aujourd\'hui' },
        { status: 400 }
      );
    }

    // Créer la réponse
    const reponse = await prisma.reponseFormulaire.create({
      data: {
        formulaireId,
        stagiaireId: session.user.id,
        reponses,
        commentaires: commentaires || null,
        soumis: true,
        ...(score !== undefined && maxScore !== undefined && {
          score: score,
          maxScore: maxScore
        })
      }
    });

    return NextResponse.json({
      message: 'Réponse soumise avec succès',
      reponse: {
        id: reponse.id,
        dateReponse: reponse.dateReponse,
        soumis: reponse.soumis
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la soumission de la réponse:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la soumission de la réponse' },
      { status: 500 }
    );
  }
} 