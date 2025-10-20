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
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id } = await params;
    const inspection = await prisma.equipmentDetailedInspection.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
          },
        },
      },
    });

    if (!inspection) {
      return NextResponse.json({ error: 'Inspection non trouvée' }, { status: 404 });
    }

    return NextResponse.json(inspection);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'inspection:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'inspection' },
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
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    
    // Remove fields that are not updatable or not part of the database schema
    const { 
      inspectionData, 
      createdById, 
      createdAt, 
      updatedAt, 
      createdBy,
      id: bodyId,
      ...updateData 
    } = body;
    
    const inspection = await prisma.equipmentDetailedInspection.update({
      where: { id },
      data: updateData,
      include: {
        createdBy: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(inspection);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'inspection:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de l\'inspection' },
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
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id } = await params;
    await prisma.equipmentDetailedInspection.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Inspection supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'inspection:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l\'inspection' },
      { status: 500 }
    );
  }
}
