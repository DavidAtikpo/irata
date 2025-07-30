import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { traineeId, nextDay } = await request.json();

    // Mettre à jour le jour autorisé pour le stagiaire
    const updatedSignature = await prisma.traineeSignature.upsert({
      where: {
        traineeId
      },
      update: {
        currentDay: nextDay
      } as any,
      create: {
        traineeId,
        signature: '',
        adminSignature: '',
        currentDay: nextDay,
        isValidated: false
      } as any,
    });

    return NextResponse.json({
      success: true,
      message: `Jour ${nextDay} débloqué pour le stagiaire`,
      currentDay: (updatedSignature as any).currentDay
    });
  } catch (error) {
    console.error('Erreur lors du déblocage du jour:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
} 