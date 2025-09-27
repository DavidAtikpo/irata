import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Récupérer les vraies données de progression depuis la base de données
    const progress = await prisma.traineeProgress.findMany({
      select: {
        syllabusItem: true,
        traineeId: true,
        day: true,
        completed: true,
      },
      orderBy: [
        { traineeId: 'asc' },
        { syllabusItem: 'asc' },
        { day: 'asc' }
      ]
    });

    return NextResponse.json(progress);
  } catch (error) {
    console.error('Erreur lors de la récupération des progrès:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des progrès' },
      { status: 500 }
    );
  }
} 