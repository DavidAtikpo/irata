import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from 'lib/prisma';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const statut = searchParams.get('statut');

    // Si on demande seulement le comptage pour les notifications
    if (statut === 'SIGNE') {
      const count = await prisma.contrat.count({
        where: {
          statut: 'SIGNE'
        }
      });
      return NextResponse.json(count);
    }

    const contrats = await prisma.contrat.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            nom: true,
            prenom: true,
          },
        },
        devis: {
          select: {
            id: true,
            numero: true,
            montant: true,
            statut: true,
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