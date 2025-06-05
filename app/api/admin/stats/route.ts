import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Statistiques générales
    const [
      totalDemandes,
      demandesEnAttente,
      demandesAcceptees,
      demandesRefusees,
      totalFormations,
      totalDevis,
      devisEnAttente,
      devisValides,
      devisRefuses,
      totalContrats,
      contratsEnAttente,
      contratsValides,
      contratsRefuses,
      montantTotalDevis,
      montantTotalContrats
    ] = await Promise.all([
      prisma.demande.count(),
      prisma.demande.count({ where: { statut: 'EN_ATTENTE' } }),
      prisma.demande.count({ where: { statut: 'VALIDE' } }),
      prisma.demande.count({ where: { statut: 'REFUSE' } }),
      prisma.formation.count(),
      prisma.devis.count(),
      prisma.devis.count({ where: { statut: 'EN_ATTENTE' } }),
      prisma.devis.count({ where: { statut: 'VALIDE' } }),
      prisma.devis.count({ where: { statut: 'REFUSE' } }),
      prisma.contrat.count(),
      prisma.contrat.count({ where: { statut: 'EN_ATTENTE' } }),
      prisma.contrat.count({ where: { statut: 'VALIDE' } }),
      prisma.contrat.count({ where: { statut: 'REFUSE' } }),
      prisma.devis.aggregate({
        where: { statut: 'VALIDE' },
        _sum: {
          montant: true
        }
      }),
      prisma.contrat.findMany({
        where: { statut: 'VALIDE' },
        include: {
          devis: {
            select: {
              montant: true
            }
          }
        }
      })
    ]);

    // Formations les plus demandées
    const formationsPopulaires = await prisma.demande.groupBy({
      by: ['formationId'],
      _count: {
        formationId: true,
      },
      orderBy: {
        _count: {
          formationId: 'desc',
        },
      },
      take: 5,
    });

    const formationsDetails = await Promise.all(
      formationsPopulaires.map(async (formation) => {
        const details = await prisma.formation.findUnique({
          where: { id: formation.formationId },
          select: { titre: true, prix: true },
        });
        return {
          id: formation.formationId,
          titre: details?.titre || 'Formation inconnue',
          prix: details?.prix || 0,
          count: formation._count.formationId,
        };
      })
    );

    // Évolution des demandes par mois
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const demandesParMois = await prisma.demande.groupBy({
      by: ['createdAt'],
      _count: {
        createdAt: true,
      },
      where: {
        createdAt: {
          gte: sixMonthsAgo,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const demandesParMoisFormatted = demandesParMois.map((item) => ({
      mois: new Date(item.createdAt).toLocaleDateString('fr-FR', {
        month: 'long',
        year: 'numeric',
      }),
      count: item._count.createdAt,
    }));

    return NextResponse.json({
      totalDemandes,
      demandesEnAttente,
      demandesAcceptees,
      demandesRefusees,
      totalFormations,
      totalDevis,
      devisEnAttente,
      devisValides,
      devisRefuses,
      totalContrats,
      contratsEnAttente,
      contratsValides,
      contratsRefuses,
      montantTotalDevis: montantTotalDevis._sum?.montant || 0,
      montantTotalContrats: montantTotalContrats.reduce((sum, contrat) => sum + (contrat.devis?.montant || 0), 0),
      formationsPopulaires: formationsDetails,
      demandesParMois: demandesParMoisFormatted,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des statistiques' },
      { status: 500 }
    );
  }
} 