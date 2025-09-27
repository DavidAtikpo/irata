import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from 'lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'USER') {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const contrats = await prisma.contrat.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        devis: {
          select: {
            numero: true,
            montant: true,
            dateFormation: true,
            demande: {
              select: {
                session: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(contrats);
  } catch (error) {
    console.error('Erreur lors de la récupération des contrats:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des contrats' },
      { status: 500 }
    );
  }
} 