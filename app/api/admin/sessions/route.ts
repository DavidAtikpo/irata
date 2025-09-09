import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/admin/sessions - Récupérer la liste des sessions disponibles
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'GESTIONNAIRE')) {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Récupérer toutes les sessions uniques depuis les demandes avec leurs dates
    const sessionsFromDemandes = await prisma.demande.findMany({
      select: {
        session: true,
        createdAt: true
      },
      distinct: ['session'],
      orderBy: {
        createdAt: 'desc' // Plus récent en premier
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

    // Convertir en tableau et trier par ordre de création (plus récent en premier)
    const sessionsList = Array.from(allSessions).sort();

    // Créer un objet avec les sessions et leurs dates de création
    const sessionsWithDates = sessionsFromDemandes.map(demande => ({
      name: demande.session,
      createdAt: demande.createdAt
    }));

    return NextResponse.json({
      sessions: sessionsList,
      trainingSessions: trainingSessions,
      sessionsFromDemandes: sessionsWithDates // Ajouter les sessions avec dates
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des sessions:', error);
    return NextResponse.json(
      { message: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}