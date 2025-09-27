import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from 'lib/prisma';

// GET /api/user/actions-correctives - Récupérer les actions correctives de l'utilisateur
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const statut = searchParams.get('statut');
    const type = searchParams.get('type');
    const priorite = searchParams.get('priorite');
    const nonConformiteId = searchParams.get('nonConformiteId');

    // Construire les filtres
    const where: any = {
      responsableId: session?.user?.id
    };

    if (statut) {
      where.statut = statut;
    }
    if (type) {
      where.type = type;
    }
    if (priorite) {
      where.priorite = priorite;
    }
    if (nonConformiteId) {
      where.nonConformiteId = nonConformiteId;
    }

    const actionsCorrectives = await prisma.actionCorrective.findMany({
      where,
      include: {
        nonConformite: {
          select: {
            id: true,
            numero: true,
            titre: true,
            type: true,
            gravite: true,
            statut: true
          }
        },
        responsable: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true
          }
        },
        commentaires: {
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
        },
        _count: {
          select: {
            commentaires: true
          }
        }
      },
      orderBy: [
        { priorite: 'desc' },
        { dateEcheance: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json(actionsCorrectives);
  } catch (error) {
    console.error('Erreur lors de la récupération des actions correctives:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des actions correctives' },
      { status: 500 }
    );
  }
}

// POST /api/user/actions-correctives - Créer une nouvelle action corrective
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
    const {
      nonConformiteId,
      titre,
      description,
      type,
      priorite,
      responsableId,
      dateEcheance
    } = body;

    // Validation des données requises
    if (!nonConformiteId || !titre || !description || !type || !responsableId) {
      return NextResponse.json(
        { message: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }

    // Vérifier que la non-conformité existe
    const nonConformite = await prisma.nonConformite.findUnique({
      where: { id: nonConformiteId },
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

    // Vérifier les permissions (seuls les détecteurs, responsables ou admins peuvent créer des actions correctives)
    const canCreate = 
      nonConformite.detecteurId === session?.user?.id ||
      nonConformite.responsableId === session?.user?.id ||
      session?.user?.role === 'ADMIN' ||
      session?.user?.role === 'GESTIONNAIRE';

    if (!canCreate) {
      return NextResponse.json(
        { message: 'Permission insuffisante pour créer une action corrective' },
        { status: 403 }
      );
    }

    const actionCorrective = await prisma.actionCorrective.create({
      data: {
        nonConformiteId,
        titre,
        description,
        type,
        priorite: priorite || 'MOYENNE',
        responsableId,
        dateEcheance: dateEcheance ? new Date(dateEcheance) : null
      },
      include: {
        nonConformite: {
          select: {
            id: true,
            numero: true,
            titre: true,
            type: true,
            gravite: true,
            statut: true
          }
        },
        responsable: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true
          }
        }
      }
    });

    // Créer une notification pour le responsable de l'action corrective
    await prisma.notification.create({
      data: {
        userId: responsableId,
        title: 'Nouvelle action corrective assignée',
        message: `Une nouvelle action corrective "${titre}" vous a été assignée pour la non-conformité "${nonConformite.titre}".`,
        type: 'action_corrective',
        category: 'assignment',
        relatedId: actionCorrective.id
      }
    });

    // Créer une notification pour le détecteur de la non-conformité
    if (nonConformite.detecteurId !== responsableId) {
      await prisma.notification.create({
        data: {
          userId: nonConformite.detecteurId,
          title: 'Action corrective créée',
          message: `Une action corrective "${titre}" a été créée pour votre non-conformité "${nonConformite.titre}".`,
          type: 'action_corrective',
          category: 'created',
          relatedId: actionCorrective.id
        }
      });
    }

    return NextResponse.json({
      message: 'Action corrective créée avec succès',
      actionCorrective
    }, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de l\'action corrective:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la création de l\'action corrective' },
      { status: 500 }
    );
  }
}
