import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '../../../../lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Récupérer tous les stagiaires avec leur jour actuel depuis TraineeSignature
    const traineeSignatures = await prisma.traineeSignature.findMany({
      select: {
        traineeId: true,
        currentDay: true,
        trainee: {
          select: {
            id: true,
            nom: true,
            prenom: true
          }
        }
      }
    });

    // Calculer le jour global (maximum de tous les stagiaires)
    const allDays = traineeSignatures.map(sig => sig.currentDay || 1);
    const globalCurrentDay = allDays.length > 0 ? Math.max(...allDays) : 1;

    console.log('TraineeSignatures avec leurs jours:', traineeSignatures);
    console.log('Jours récupérés:', allDays);
    console.log('Jour global calculé:', globalCurrentDay);

    return NextResponse.json({
      currentDay: globalCurrentDay,
      trainees: traineeSignatures
    });

  } catch (error) {
    console.error('Erreur lors de la récupération du jour global:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du jour global' },
      { status: 500 }
    );
  }
} 