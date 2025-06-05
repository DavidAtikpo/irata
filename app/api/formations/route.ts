import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/formations
export async function GET() {
  try {
    const formations = await prisma.formation.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(formations);
  } catch (error) {
    console.error('Erreur lors de la récupération des formations:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des formations' },
      { status: 500 }
    );
  }
} 