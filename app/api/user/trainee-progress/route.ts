import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Récupérer les vraies données de progression depuis la base de données
    const progress = await prisma.traineeProgress.findMany({
      where: {
        traineeId: session.user.id
      },
      select: {
        syllabusItem: true,
        traineeId: true,
        day: true,
        completed: true,
      },
      orderBy: [
        { syllabusItem: 'asc' },
        { day: 'asc' }
      ]
    });

    return NextResponse.json(progress);
  } catch (error) {
    console.error('Erreur lors de la récupération de la progression:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { syllabusItem, traineeId, day, completed } = await request.json();
    
    console.log('Mise à jour de la progression stagiaire:', { 
      syllabusItem, 
      traineeId, 
      day, 
      completed,
      updatedBy: session.user.email 
    });

    // Sauvegarder dans la base de données avec Prisma
    const updatedProgress = await prisma.traineeProgress.upsert({
      where: {
        syllabusItem_traineeId_day: {
          syllabusItem,
          traineeId,
          day
        }
      },
      update: { completed },
      create: { syllabusItem, traineeId, day, completed },
    });

    return NextResponse.json(updatedProgress);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la progression:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
} 