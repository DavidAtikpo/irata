import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Récupérer toutes les sessions uniques depuis les demandes
    const demandes = await prisma.demande.findMany({
      select: {
        session: true,
        createdAt: true,
        updatedAt: true,
        userId: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Extraire les sessions uniques avec les utilisateurs
    const uniqueSessions = demandes.reduce((acc: any[], demande) => {
      const existingSession = acc.find(s => s.name === demande.session);
      if (!existingSession) {
        acc.push({
          id: demande.session, // Utiliser le nom de session comme ID
          name: demande.session,
          startDate: demande.createdAt,
          endDate: demande.updatedAt,
          status: 'ACTIVE',
          traineeIds: [demande.userId]
        });
      } else {
        existingSession.traineeIds.push(demande.userId);
      }
      return acc;
    }, []);

    return NextResponse.json(uniqueSessions);
  } catch (error) {
    console.error('Erreur lors de la récupération des sessions:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { name, startDate, endDate } = await request.json();

    // Créer une nouvelle demande avec la session
    const newDemande = await prisma.demande.create({
      data: {
        userId: session.user.id, // Utiliser l'ID de l'admin
        session: name,
        message: `Session créée: ${name}`,
        statut: 'EN_ATTENTE'
      }
    });

    return NextResponse.json({
      id: name,
      name,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      status: 'ACTIVE'
    });
  } catch (error) {
    console.error('Erreur lors de la création de la session:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
} 