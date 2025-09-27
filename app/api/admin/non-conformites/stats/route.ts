import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from '../../../../../lib/prisma';

// GET /api/admin/non-conformites/stats - Statistiques des non-conformités
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
    const periode = searchParams.get('periode') || '30'; // jours

    const dateDebut = new Date();
    dateDebut.setDate(dateDebut.getDate() - parseInt(periode));

    // Statistiques générales
    const [
      totalNonConformites,
      nonConformitesOuvertes,
      nonConformitesEnCours,
      nonConformitesFermees,
      nonConformitesParType,
      nonConformitesParGravite,
      nonConformitesParStatut,
      actionsCorrectivesEnCours,
      actionsCorrectivesTerminees,
      nonConformitesRecentes
    ] = await Promise.all([
      // Total des non-conformités
      prisma.nonConformite.count(),
      
      // Non-conformités ouvertes
      prisma.nonConformite.count({
        where: { statut: 'OUVERTE' }
      }),
      
      // Non-conformités en cours
      prisma.nonConformite.count({
        where: { statut: 'EN_COURS' }
      }),
      
      // Non-conformités fermées
      prisma.nonConformite.count({
        where: { statut: 'FERMEE' }
      }),
      
      // Non-conformités par type
      prisma.nonConformite.groupBy({
        by: ['type'],
        _count: {
          type: true
        }
      }),
      
      // Non-conformités par gravité
      prisma.nonConformite.groupBy({
        by: ['gravite'],
        _count: {
          gravite: true
        }
      }),
      
      // Non-conformités par statut
      prisma.nonConformite.groupBy({
        by: ['statut'],
        _count: {
          statut: true
        }
      }),
      
      // Actions correctives en cours
      prisma.actionCorrective.count({
        where: { statut: 'EN_COURS' }
      }),
      
      // Actions correctives terminées
      prisma.actionCorrective.count({
        where: { statut: 'TERMINEE' }
      }),
      
      // Non-conformités récentes (période spécifiée)
      prisma.nonConformite.count({
        where: {
          createdAt: {
            gte: dateDebut
          }
        }
      })
    ]);

    // Top détecteurs
    const topDetecteurs = await prisma.nonConformite.groupBy({
      by: ['detecteurId'],
      _count: {
        detecteurId: true
      },
      orderBy: {
        _count: {
          detecteurId: 'desc'
        }
      },
      take: 5
    });

    // Récupérer les détails des détecteurs
    const detecteursDetails = await Promise.all(
      topDetecteurs.map(async (item) => {
        const user = await prisma.user.findUnique({
          where: { id: item.detecteurId },
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true
          }
        });
        return {
          ...item,
          user
        };
      })
    );

    // Non-conformités en retard (avec date d'échéance dépassée)
    const nonConformitesEnRetard = await prisma.nonConformite.count({
      where: {
        dateEcheance: {
          lt: new Date()
        },
        statut: {
          in: ['OUVERTE', 'EN_COURS']
        }
      }
    });

    // Actions correctives en retard
    const actionsCorrectivesEnRetard = await prisma.actionCorrective.count({
      where: {
        dateEcheance: {
          lt: new Date()
        },
        statut: {
          in: ['EN_COURS', 'EN_ATTENTE']
        }
      }
    });

    const stats = {
      general: {
        total: totalNonConformites,
        ouvertes: nonConformitesOuvertes,
        enCours: nonConformitesEnCours,
        fermees: nonConformitesFermees,
        recentes: nonConformitesRecentes,
        enRetard: nonConformitesEnRetard
      },
      actionsCorrectives: {
        enCours: actionsCorrectivesEnCours,
        terminees: actionsCorrectivesTerminees,
        enRetard: actionsCorrectivesEnRetard
      },
      repartition: {
        parType: nonConformitesParType.map(item => ({
          type: item.type,
          count: item._count.type
        })),
        parGravite: nonConformitesParGravite.map(item => ({
          gravite: item.gravite,
          count: item._count.gravite
        })),
        parStatut: nonConformitesParStatut.map(item => ({
          statut: item.statut,
          count: item._count.statut
        }))
      },
      topDetecteurs: detecteursDetails
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des statistiques' },
      { status: 500 }
    );
  }
}
