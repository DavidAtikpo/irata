import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from '../../../../lib/prisma';

// GET /api/admin/sessions - Récupérer la liste des sessions disponibles
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'GESTIONNAIRE')) {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Récupérer toutes les sessions uniques depuis les demandes
    const sessionsFromDemandes = await prisma.demande.findMany({
      select: {
        session: true
      },
      distinct: ['session'],
      orderBy: {
        session: 'asc'
      }
    });

    // Récupérer toutes les sessions depuis les formulaires
    const sessionsFromFormulaires = await prisma.formulairesQuotidiens.findMany({
      select: {
        session: true
      },
      distinct: ['session'],
      orderBy: {
        session: 'asc'
      }
    });

    // Récupérer toutes les sessions depuis les réponses de satisfaction
    const sessionsFromSatisfaction = await prisma.customerSatisfactionResponse.findMany({
      select: {
        session: true
      },
      where: {
        session: {
          not: null
        }
      },
      distinct: ['session'],
      orderBy: {
        session: 'asc'
      }
    });

    // Récupérer toutes les sessions depuis les TrainingSession
    const trainingSessions = await prisma.trainingSession.findMany({
      select: {
        id: true,
        name: true,
        startDate: true,
        endDate: true
      },
      orderBy: {
        startDate: 'desc'
      }
    });

    // Combiner toutes les sessions uniques
    const allSessions = new Set<string>();
    
    sessionsFromDemandes.forEach(item => {
      if (item.session) allSessions.add(item.session);
    });
    
    sessionsFromFormulaires.forEach(item => {
      if (item.session) allSessions.add(item.session);
    });
    
    sessionsFromSatisfaction.forEach(item => {
      if (item.session) allSessions.add(item.session);
    });

    // Convertir en tableau et trier
    const sessionsList = Array.from(allSessions).sort();

    return NextResponse.json({
      sessions: sessionsList,
      trainingSessions: trainingSessions
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des sessions:', error);
    return NextResponse.json(
      { message: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}