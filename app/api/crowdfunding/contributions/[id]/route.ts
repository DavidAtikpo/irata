import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, ContributionStatus as PrismaContributionStatus } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const contribution = await prisma.contribution.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true
          }
        }
      }
    });

    if (!contribution) {
      return NextResponse.json(
        { success: false, error: 'Contribution non trouvée' },
        { status: 404 }
      );
    }

    const transformedContribution = {
      id: contribution.id,
      donorName: contribution.user ? 
        `${contribution.user.prenom} ${contribution.user.nom}` : 
        contribution.donorName,
      donorEmail: contribution.user?.email || contribution.donorEmail,
      donorPhone: contribution.donorPhone,
      amount: contribution.amount,
      type: contribution.type,
      status: contribution.status,
      returnAmount: contribution.returnAmount,
      returnDescription: contribution.returnDescription,
      paymentMethod: contribution.paymentMethod,
      notes: contribution.notes,
      createdAt: contribution.createdAt.toISOString(),
      updatedAt: contribution.updatedAt.toISOString(),
      userId: contribution.userId
    };

    return NextResponse.json({
      success: true,
      data: transformedContribution
    });

  } catch (error) {
    console.error('Erreur lors de la récupération de la contribution:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();
    const { status, notes, paymentMethod } = data;

    const statusMap = {
      pending: PrismaContributionStatus.PENDING,
      confirmed: PrismaContributionStatus.CONFIRMED,
      processed: PrismaContributionStatus.PROCESSED,
      cancelled: PrismaContributionStatus.CANCELLED
    } as const;
    const mappedStatus = status ? statusMap[status as keyof typeof statusMap] : undefined;

    const contribution = await prisma.contribution.findUnique({
      where: { id }
    });

    if (!contribution) {
      return NextResponse.json(
        { success: false, error: 'Contribution non trouvée' },
        { status: 404 }
      );
    }

    const updatedContribution = await prisma.contribution.update({
      where: { id },
      data: {
        ...(mappedStatus && { status: mappedStatus }),
        ...(notes && { notes }),
        ...(paymentMethod && { paymentMethod }),
        updatedAt: new Date()
      }
    });

    // Envoyer notification selon le statut
    if (status === 'confirmed') {
      // await sendContributionConfirmedEmail(updatedContribution);
    } else if (status === 'processed') {
      // await sendContributionProcessedEmail(updatedContribution);
    }

    return NextResponse.json({
      success: true,
      data: {
        id: updatedContribution.id,
        status: updatedContribution.status,
        message: 'Contribution mise à jour avec succès'
      }
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour de la contribution:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const contribution = await prisma.contribution.findUnique({
      where: { id }
    });

    if (!contribution) {
      return NextResponse.json(
        { success: false, error: 'Contribution non trouvée' },
        { status: 404 }
      );
    }

    // Seules les contributions en statut 'pending' peuvent être supprimées
    if (contribution.status !== PrismaContributionStatus.PENDING) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Seules les contributions en attente peuvent être supprimées' 
        },
        { status: 400 }
      );
    }

    await prisma.contribution.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Contribution supprimée avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression de la contribution:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}