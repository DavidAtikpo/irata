import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/user/non-conformites/[id]/commentaires - Récupérer les commentaires d'une non-conformité
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Vérifier que la non-conformité existe et que l'utilisateur y a accès
    const nonConformite = await prisma.nonConformite.findUnique({
      where: { id },
      select: {
        id: true,
        detecteurId: true,
        responsableId: true
      }
    });

    if (!nonConformite) {
      return NextResponse.json(
        { message: 'Non-conformité non trouvée' },
        { status: 404 }
      );
    }

    const hasAccess = 
      nonConformite.detecteurId === session.user.id ||
      nonConformite.responsableId === session.user.id ||
      session.user.role === 'ADMIN' ||
      session.user.role === 'GESTIONNAIRE';

    if (!hasAccess) {
      return NextResponse.json(
        { message: 'Accès non autorisé' },
        { status: 403 }
      );
    }

    const commentaires = await prisma.nonConformiteCommentaire.findMany({
      where: { nonConformiteId: id },
      include: {
        user: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(commentaires);
  } catch (error) {
    console.error('Erreur lors de la récupération des commentaires:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des commentaires' },
      { status: 500 }
    );
  }
}

// POST /api/user/non-conformites/[id]/commentaires - Ajouter un commentaire
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const { commentaire } = body;

    if (!commentaire || commentaire.trim().length === 0) {
      return NextResponse.json(
        { message: 'Le commentaire ne peut pas être vide' },
        { status: 400 }
      );
    }

    // Vérifier que la non-conformité existe et que l'utilisateur y a accès
    const nonConformite = await prisma.nonConformite.findUnique({
      where: { id },
      select: {
        id: true,
        titre: true,
        detecteurId: true,
        responsableId: true
      }
    });

    if (!nonConformite) {
      return NextResponse.json(
        { message: 'Non-conformité non trouvée' },
        { status: 404 }
      );
    }

    const hasAccess = 
      nonConformite.detecteurId === session.user.id ||
      nonConformite.responsableId === session.user.id ||
      session.user.role === 'ADMIN' ||
      session.user.role === 'GESTIONNAIRE';

    if (!hasAccess) {
      return NextResponse.json(
        { message: 'Accès non autorisé' },
        { status: 403 }
      );
    }

    const nouveauCommentaire = await prisma.nonConformiteCommentaire.create({
      data: {
        nonConformiteId: id,
        userId: session.user.id,
        commentaire: commentaire.trim()
      },
      include: {
        user: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true
          }
        }
      }
    });

    // Créer des notifications pour les autres participants
    const participants = [
      nonConformite.detecteurId,
      nonConformite.responsableId
    ].filter((participantId) => participantId && participantId !== session.user.id);

    for (const participantId of participants) {
      if (participantId) {
        await prisma.notification.create({
          data: {
            userId: participantId,
          title: 'Nouveau commentaire',
          message: `Un nouveau commentaire a été ajouté à la non-conformité "${nonConformite.titre}".`,
          type: 'non_conformite',
          category: 'comment',
          relatedId: id
        }
      });
      }
    }

    return NextResponse.json({
      message: 'Commentaire ajouté avec succès',
      commentaire: nouveauCommentaire
    }, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de l\'ajout du commentaire:', error);
    return NextResponse.json(
      { message: 'Erreur lors de l\'ajout du commentaire' },
      { status: 500 }
    );
  }
}
