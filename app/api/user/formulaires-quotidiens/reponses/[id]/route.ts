import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
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

    return NextResponse.json({
      id: reponse.id,
      formulaireId: reponse.formulaireId,
      formulaire: reponse.formulaire,
      reponses: reponse.reponses,
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


