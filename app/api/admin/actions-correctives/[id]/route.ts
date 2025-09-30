import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Vérifier que l'utilisateur est admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const { id: actionCorrectiveId } = await params;

    // Récupérer l'action corrective avec toutes les informations
    const actionCorrective = await prisma.actionCorrective.findUnique({
      where: { id: actionCorrectiveId },
      include: {
        nonConformite: {
          select: {
            id: true,
            numero: true,
            titre: true,
            statut: true
          }
        },
        responsable: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true
          }
        }
      }
    });

    if (!actionCorrective) {
      return NextResponse.json(
        { error: 'Action corrective non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json({ actionCorrective });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'action corrective:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Vérifier que l'utilisateur est admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const { id: actionCorrectiveId } = await params;
    const body = await request.json();
    const { statut, priorite, responsableId, dateEcheance } = body;

    // Vérifier que l'action corrective existe
    const existingActionCorrective = await prisma.actionCorrective.findUnique({
      where: { id: actionCorrectiveId }
    });

    if (!existingActionCorrective) {
      return NextResponse.json(
        { error: 'Action corrective non trouvée' },
        { status: 404 }
      );
    }

    // Mettre à jour l'action corrective
    const updatedActionCorrective = await prisma.actionCorrective.update({
      where: { id: actionCorrectiveId },
      data: {
        ...(statut && { statut }),
        ...(priorite && { priorite }),
        ...(responsableId && { responsableId }),
        ...(dateEcheance && { dateEcheance: new Date(dateEcheance) }),
        updatedAt: new Date()
      },
      include: {
        nonConformite: {
          select: {
            numero: true,
            titre: true
          }
        },
        responsable: {
          select: {
            nom: true,
            prenom: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({ 
      message: 'Action corrective mise à jour avec succès',
      actionCorrective: updatedActionCorrective 
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'action corrective:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Vérifier que l'utilisateur est admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const { id: actionCorrectiveId } = await params;

    // Vérifier que l'action corrective existe
    const existingActionCorrective = await prisma.actionCorrective.findUnique({
      where: { id: actionCorrectiveId }
    });

    if (!existingActionCorrective) {
      return NextResponse.json(
        { error: 'Action corrective non trouvée' },
        { status: 404 }
      );
    }

    // Supprimer l'action corrective
    await prisma.actionCorrective.delete({
      where: { id: actionCorrectiveId }
    });

    return NextResponse.json({ 
      message: 'Action corrective supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'action corrective:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}