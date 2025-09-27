import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({
        success: false,
        error: 'Non autorisé'
      }, { status: 401 });
    }

    // Récupérer les investissements de l'utilisateur
    const investments = await prisma.contribution.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Calculer les statistiques utilisateur
    const totalInvestment = investments.reduce((sum, inv) => sum + inv.amount, 0);
    const totalExpectedReturn = investments.reduce((sum, inv) => sum + inv.returnAmount, 0);
    
    // Statistiques globales du projet
    const globalStats = await prisma.contribution.aggregate({
      _sum: { amount: true },
      _count: { id: true },
      _avg: { amount: true }
    });

    const goal = 50000000; // 50M FCFA
    const totalRaised = globalStats._sum.amount || 0;
    const contributorCount = globalStats._count.id || 0;

    const transformedInvestments = investments.map(inv => ({
      id: inv.id,
      amount: inv.amount,
      type: inv.type,
      status: inv.status.toLowerCase(),
      date: inv.createdAt.toISOString(),
      returnAmount: inv.returnAmount,
      returnDescription: inv.returnDescription,
      paymentMethod: inv.paymentMethod,
      expectedReturn: inv.type === 'PREFORMATION' ? '10% remise formation' : 
                     inv.type === 'FINANCIAL' ? '8%' : 
                     'Récompenses matérielles',
      maturityDate: inv.type === 'FINANCIAL' ? 
        new Date(inv.createdAt.getTime() + 4 * 30 * 24 * 60 * 60 * 1000).toISOString() : 
        undefined
    }));

    const stats = {
      totalRaised,
      goal,
      progressPercentage: Math.round((totalRaised / goal) * 100),
      contributorCount,
      myTotalInvestment: totalInvestment,
      myExpectedReturn: totalExpectedReturn,
      nextMilestone: {
        name: totalRaised < 15000000 ? 'Premier équipement cordiste' : 
              totalRaised < 30000000 ? 'Appareil ultrasons CND' : 
              'Équipement SST complet',
        amount: totalRaised < 15000000 ? 15000000 : 
                totalRaised < 30000000 ? 30000000 : 
                50000000,
        progress: totalRaised < 15000000 ? Math.round((totalRaised / 15000000) * 100) : 
                  totalRaised < 30000000 ? Math.round(((totalRaised - 15000000) / 15000000) * 100) :
                  Math.round(((totalRaised - 30000000) / 20000000) * 100)
      }
    };

    return NextResponse.json({
      success: true,
      data: {
        investments: transformedInvestments,
        stats
      }
    });

  } catch (error) {
    console.error('Erreur récupération investissements:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur serveur'
    }, { status: 500 });
  }
}