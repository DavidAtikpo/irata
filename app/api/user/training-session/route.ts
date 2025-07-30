import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Récupérer la session de l'utilisateur connecté
    const userDemande = await prisma.demande.findFirst({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        session: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!userDemande) {
      return NextResponse.json(null);
    }

    return NextResponse.json({
      id: userDemande.session,
      name: userDemande.session,
      startDate: userDemande.createdAt,
      endDate: userDemande.updatedAt,
      status: 'ACTIVE'
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la session:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
} 