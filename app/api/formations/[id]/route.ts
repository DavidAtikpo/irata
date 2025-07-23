import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/formations/[id]
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const formation = await prisma.formation.findUnique({
      where: { id },
    });

    if (!formation) {
      return NextResponse.json(
        { message: 'Formation non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json(formation);
  } catch (error) {
    console.error('Erreur lors de la récupération de la formation:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération de la formation' },
      { status: 500 }
    );
  }
} 