import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'all'; // all, month, week

    let dateFilter = {};
    const now = new Date();

    switch (period) {
      case 'month':
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        dateFilter = { createdAt: { gte: startOfMonth } };
        break;
      case 'week':
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        dateFilter = { createdAt: { gte: startOfWeek } };
        break;
      default:
        dateFilter = {};
    }

    const [
      globalStats,
      periodStats,
      statusBreakdown,
      typeBreakdown,
      recentContributions,
      topContributors
    ] = await Promise.all([
      // Stats globales
      prisma.contribution.aggregate({
        _sum: { amount: true },
        _avg: { amount: true },
        _count: { id: true },
        _max: { amount: true },
        _min: { amount: true }
      }),

      // Stats de la période
      prisma.contribution.aggregate({
        where: dateFilter,
        _sum: { amount: true },
        _count: { id: true }
      }),

      // Répartition par statut
      prisma.contribution.groupBy({
        by: ['status'],
        _sum: { amount: true },
        _count: { id: true }
      }),

      // Répartition par type
      prisma.contribution.groupBy({
        by: ['type'],
        _sum: { amount: true },
        _count: { id: true }
      }),

      // Contributions récentes
      prisma.contribution.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              nom: true,
              prenom: true
            }
          }
        }
      }),

      // Top contributeurs
      prisma.contribution.groupBy({
        by: ['donorEmail'],
        _sum: { amount: true },
        _count: { id: true },
        orderBy: { _sum: { amount: 'desc' } },
        take: 5
      })
    ]);

    const goal = 50000000; // 50M FCFA objectif
    const totalRaised = globalStats._sum.amount || 0;
    const contributorCount = globalStats._count.id || 0;
    const averageContribution = Math.round(globalStats._avg.amount || 0);
    const progressPercentage = Math.round((totalRaised / goal) * 100);

    // Calcul des jalons
    const milestones = [
      { amount: 15000000, label: 'Premier équipement cordiste', reached: totalRaised >= 15000000 },
      { amount: 30000000, label: 'Appareil à ultrasons', reached: totalRaised >= 30000000 },
      { amount: 50000000, label: 'Équipement complet', reached: totalRaised >= 50000000 }
    ];

    // Transformation des données pour le front-end
    const transformedRecentContributions = recentContributions.map(c => ({
      id: c.id,
      donorName: c.user ? `${c.user.prenom} ${c.user.nom}` : c.donorName,
      amount: c.amount,
      type: c.type,
      date: c.createdAt.toISOString(),
      status: c.status
    }));

    const response = {
      success: true,
      data: {
        overview: {
          totalRaised,
          goal,
          contributorCount,
          averageContribution,
          progressPercentage,
          maxContribution: globalStats._max.amount || 0,
          minContribution: globalStats._min.amount || 0,
          remainingAmount: Math.max(0, goal - totalRaised)
        },
        period: {
          label: period === 'month' ? 'Ce mois' : period === 'week' ? 'Cette semaine' : 'Total',
          raised: periodStats._sum.amount || 0,
          contributions: periodStats._count.id || 0
        },
        breakdowns: {
          byStatus: statusBreakdown.map(s => ({
            status: s.status,
            count: s._count.id,
            amount: s._sum.amount || 0
          })),
          byType: typeBreakdown.map(t => ({
            type: t.type,
            count: t._count.id,
            amount: t._sum.amount || 0,
            label: t.type === 'PREFORMATION' ? 'Formation' : 
                   t.type === 'FINANCIAL' ? 'Financier' : 'Matériel'
          }))
        },
        milestones,
        recentContributions: transformedRecentContributions,
        topContributors: topContributors.map(tc => ({
          email: tc.donorEmail,
          totalAmount: tc._sum.amount || 0,
          contributionCount: tc._count.id
        }))
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la récupération des statistiques' 
      },
      { status: 500 }
    );
  }
}