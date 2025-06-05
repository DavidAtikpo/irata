import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const demandes = await prisma.demande.findMany({
      include: {
        user: {
          select: {
            nom: true,
            prenom: true,
            email: true,
          },
        },
        formation: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(demandes);
  } catch (error) {
    console.error('Erreur lors de la récupération des demandes:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des demandes' },
      { status: 500 }
    );
  }
} 