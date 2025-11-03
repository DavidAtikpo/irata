import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { prisma } from 'lib/prisma';

// PATCH /api/demandes/[id] - Créer une demande de changement de session
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { session: newSession, reason } = body;

    if (!newSession) {
      return NextResponse.json(
        { error: 'La nouvelle session est requise' },
        { status: 400 }
      );
    }

    // Vérifier que la demande existe et appartient à l'utilisateur
    const demande = await prisma.demande.findUnique({
      where: { id },
    });

    if (!demande) {
      return NextResponse.json(
        { error: 'Demande non trouvée' },
        { status: 404 }
      );
    }

    // Vérifier que l'utilisateur est le propriétaire ou un admin
    if (demande.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      );
    }

    // Vérifier qu'il n'y a pas déjà une demande de changement en attente
    if (demande.sessionChangeStatus === 'PENDING') {
      return NextResponse.json(
        { error: 'Une demande de changement est déjà en attente' },
        { status: 400 }
      );
    }

    // Vérifier que la nouvelle session est différente de l'actuelle
    if (demande.session === newSession) {
      return NextResponse.json(
        { error: 'La nouvelle session doit être différente de l\'actuelle' },
        { status: 400 }
      );
    }

    // Créer la demande de changement
    const updatedDemande = await prisma.demande.update({
      where: { id },
      data: {
        sessionChangeRequest: newSession,
        sessionChangeStatus: 'PENDING',
        sessionChangeReason: reason || null,
        sessionChangeDate: new Date(),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedDemande);
  } catch (error) {
    console.error('Erreur lors de la création de la demande de changement:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la demande de changement' },
      { status: 500 }
    );
  }
}

