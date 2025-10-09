import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from 'lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session?.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const sessionFilter = searchParams.get('session');

    const where: any = {};
    
    if (type) {
      where.type = type as 'ENVIRONMENT_RECEPTION' | 'EQUIPMENT' | 'TRAINING_PEDAGOGY';
    }
    
    if (sessionFilter) {
      where.session = {
        contains: sessionFilter,
        mode: 'insensitive'
      };
    }

    // Si on demande les sessions disponibles
    if (searchParams.get('sessions') === 'true') {
      const sessions = await prisma.customerSatisfactionResponse.findMany({
        select: {
          session: true,
        },
        where: {
          session: {
            not: null,
          },
        },
        distinct: ['session'],
        orderBy: {
          session: 'asc',
        },
      });

      return NextResponse.json(
        sessions.map(s => s.session).filter(Boolean)
      );
    }

    const results = await prisma.customerSatisfactionResponse.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            email: true,
            nom: true,
            prenom: true,
          },
        },
      },
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error('Erreur lors de la récupération des réponses satisfaction:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération' },
      { status: 500 }
    );
  }
}






