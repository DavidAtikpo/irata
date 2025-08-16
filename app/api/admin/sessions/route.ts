import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const sessions = await prisma.demande.findMany({
      select: {
        id: true,
        session: true,
        statut: true,
        message: true,
        commentaire: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            nom: true,
            prenom: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(sessions);

  } catch (error) {
    console.error('Erreur lors de la récupération des sessions:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
