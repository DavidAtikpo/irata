import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/admin/actions-correctives - Récupérer toutes les actions correctives (admin)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'GESTIONNAIRE')) {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const statut = searchParams.get('statut');
    const type = searchParams.get('type');
    const priorite = searchParams.get('priorite');
    const responsableId = searchParams.get('responsableId');
    const nonConformiteId = searchParams.get('nonConformiteId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');

    // Construire les filtres
    const where: any = {};

    if (statut) {
      where.statut = statut;
    }
    if (type) {
      where.type = type;
    }
    if (priorite) {
      where.priorite = priorite;
    }
    if (responsableId) {
      where.responsableId = responsableId;
    }
    if (nonConformiteId) {
      where.nonConformiteId = nonConformiteId;
    }
    if (search) {
      where.OR = [
        { titre: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const skip = (page - 1) * limit;

    const [actionsCorrectives, total] = await Promise.all([
      prisma.actionCorrective.findMany({
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
        ],
        skip,
        take: limit
      }),
      prisma.actionCorrective.count({ where })
    ]);

    return NextResponse.json({
      actionsCorrectives,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des actions correctives:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des actions correctives' },
      { status: 500 }
    );
  }
}

// POST /api/admin/actions-correctives - Créer une action corrective (admin)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'GESTIONNAIRE')) {
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
    if (!titre || !description || !type || !responsableId) {
      return NextResponse.json(
        { message: 'Titre, description, type et responsable sont requis' },
        { status: 400 }
      );
    }

    // Vérifier que la non-conformité existe si fournie
    let nonConformite = null;
    if (nonConformiteId) {
      nonConformite = await prisma.nonConformite.findUnique({
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
        message: nonConformite 
          ? `Une nouvelle action corrective "${titre}" vous a été assignée pour la non-conformité "${nonConformite.titre}".`
          : `Une nouvelle action corrective "${titre}" vous a été assignée.`,
        type: 'action_corrective',
        category: 'assignment',
        relatedId: actionCorrective.id
      }
    });

    // Créer une notification pour le détecteur de la non-conformité si applicable
    if (nonConformite && nonConformite.detecteurId !== responsableId) {
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
