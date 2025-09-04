import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/user/non-conformites - Récupérer les non-conformités de l'utilisateur
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
    const gravite = searchParams.get('gravite');

    // Construire les filtres
    const where: any = {
      OR: [
        { detecteurId: session.user.id },
        { responsableId: session.user.id }
      ]
    };

    if (statut) {
      where.statut = statut;
    }
    if (type) {
      where.type = type;
    }
    if (gravite) {
      where.gravite = gravite;
    }

    const nonConformites = await prisma.nonConformite.findMany({
      where,
      include: {
        detecteur: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true
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
        actionsCorrectives: {
          include: {
            responsable: {
              select: {
                id: true,
                nom: true,
                prenom: true,
                email: true
              }
            }
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
            actionsCorrectives: true,
            commentaires: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(nonConformites);
  } catch (error) {
    console.error('Erreur lors de la récupération des non-conformités:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des non-conformités' },
      { status: 500 }
    );
  }
}

// POST /api/user/non-conformites - Créer une nouvelle non-conformité
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
      titre,
      description,
      type,
      gravite,
      lieu,
      responsableId,
      sessionId,
      formulaireId,
      inspectionId,
      dateEcheance
    } = body;

    // Validation des données requises
    if (!titre || !description || !type || !gravite) {
      return NextResponse.json(
        { message: 'Titre, description, type et gravité sont requis' },
        { status: 400 }
      );
    }

    // Générer un numéro unique pour la non-conformité
    const count = await prisma.nonConformite.count();
    const numero = `NC-${String(count + 1).padStart(4, '0')}-${new Date().getFullYear()}`;

    const nonConformite = await prisma.nonConformite.create({
      data: {
        numero,
        titre,
        description,
        type,
        gravite,
        lieu: lieu || null,
        detecteurId: session.user.id,
        responsableId: responsableId || null,
        sessionId: sessionId || null,
        formulaireId: formulaireId || null,
        inspectionId: inspectionId || null,
        dateEcheance: dateEcheance ? new Date(dateEcheance) : null
      },
      include: {
        detecteur: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true
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

    // Créer une notification pour le responsable si assigné
    if (responsableId) {
      await prisma.notification.create({
        data: {
          userId: responsableId,
          title: 'Nouvelle non-conformité assignée',
          message: `Une nouvelle non-conformité "${titre}" vous a été assignée.`,
          type: 'non_conformite',
          category: 'assignment',
          relatedId: nonConformite.id
        }
      });
    }

    // Créer une notification pour les admins
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true }
    });

    for (const admin of admins) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          title: 'Nouvelle non-conformité déclarée',
          message: `Une nouvelle non-conformité "${titre}" a été déclarée par ${session.user.nom || session.user.email}.`,
          type: 'non_conformite',
          category: 'new',
          relatedId: nonConformite.id
        }
      });
    }

    return NextResponse.json(
      {
        message: 'Non-conformité créée avec succès',
        nonConformite
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erreur lors de la création de la non-conformité:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la création de la non-conformité' },
      { status: 500 }
    );
  }
}
