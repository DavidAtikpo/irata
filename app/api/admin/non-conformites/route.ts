import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from '../../../../lib/prisma';

// GET /api/admin/non-conformites - Récupérer toutes les non-conformités (admin)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'GESTIONNAIRE')) {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const statut = searchParams.get('statut');
    const type = searchParams.get('type');
    const gravite = searchParams.get('gravite');
    const detecteurId = searchParams.get('detecteurId');
    const responsableId = searchParams.get('responsableId');
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
    if (gravite) {
      where.gravite = gravite;
    }
    if (detecteurId) {
      where.detecteurId = detecteurId;
    }
    if (responsableId) {
      where.responsableId = responsableId;
    }
    if (search) {
      where.OR = [
        { titre: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { numero: { contains: search, mode: 'insensitive' } }
      ];
    }

    const skip = (page - 1) * limit;

    const [nonConformites, total] = await Promise.all([
      prisma.nonConformite.findMany({
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
            select: {
              id: true,
              statut: true,
              priorite: true,
              dateEcheance: true
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
        },
        skip,
        take: limit
      }),
      prisma.nonConformite.count({ where })
    ]);

    return NextResponse.json({
      nonConformites,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des non-conformités:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des non-conformités' },
      { status: 500 }
    );
  }
}

// POST /api/admin/non-conformites - Créer une non-conformité (admin)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'GESTIONNAIRE')) {
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
      detecteurId,
      responsableId,
      sessionId,
      formulaireId,
      inspectionId,
      dateEcheance
    } = body;

    // Validation des données requises
    if (!titre || !description || !type || !gravite || !detecteurId) {
      return NextResponse.json(
        { message: 'Titre, description, type, gravité et détecteur sont requis' },
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
        detecteurId,
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

    // Créer une notification pour le détecteur
    await prisma.notification.create({
      data: {
        userId: detecteurId,
        title: 'Non-conformité créée',
        message: `Une non-conformité "${titre}" vous a été assignée comme détecteur.`,
        type: 'non_conformite',
        category: 'created',
        relatedId: nonConformite.id
      }
    });

    // Créer une notification pour le responsable si assigné
    if (responsableId) {
      await prisma.notification.create({
        data: {
          userId: responsableId,
          title: 'Non-conformité assignée',
          message: `Une non-conformité "${titre}" vous a été assignée.`,
          type: 'non_conformite',
          category: 'assignment',
          relatedId: nonConformite.id
        }
      });
    }

    return NextResponse.json({
      message: 'Non-conformité créée avec succès',
      nonConformite
    }, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de la non-conformité:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la création de la non-conformité' },
      { status: 500 }
    );
  }
}
