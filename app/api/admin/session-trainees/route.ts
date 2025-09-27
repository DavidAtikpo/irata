import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionName = searchParams.get('session');

    if (!sessionName) {
      return NextResponse.json({ error: 'Session requise' }, { status: 400 });
    }

    // Récupérer les demandes pour cette session
    const demandes = await prisma.demande.findMany({
      where: {
        session: sessionName
      },
      select: {
        userId: true
      }
    });

    const traineeIds = demandes.map(d => d.userId);

    // Récupérer les utilisateurs de cette session
    const trainees = await prisma.user.findMany({
      where: {
        id: {
          in: traineeIds
        },
        role: 'USER'
      },
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true
      }
    });

    return NextResponse.json(trainees);
  } catch (error) {
    console.error('Erreur lors de la récupération des stagiaires:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
} 