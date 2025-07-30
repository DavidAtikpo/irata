import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Récupérer les vraies données de niveau depuis la base de données
    const levelData = await prisma.traineeLevelData.findMany({
      select: {
        syllabusItem: true,
        level: true,
        required: true,
      },
      orderBy: [
        { syllabusItem: 'asc' },
        { level: 'asc' }
      ]
    });

    return NextResponse.json(levelData);
  } catch (error) {
    console.error('Erreur lors de la récupération des données de niveau:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des données de niveau' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { syllabusItem, level, required } = await request.json();

    // Mettre à jour ou créer les données de niveau dans la base de données
    const updatedLevelData = await prisma.traineeLevelData.upsert({
      where: { 
        syllabusItem_level: {
          syllabusItem,
          level
        }
      },
      update: { required },
      create: { syllabusItem, level, required },
    });

    return NextResponse.json(updatedLevelData);
  } catch (error) {
    console.error('Erreur lors de la mise à jour des données de niveau:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la mise à jour des données de niveau' },
      { status: 500 }
    );
  }
} 