import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Récupérer un template spécifique
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
    const template = await prisma.equipmentTemplate.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            nom: true,
            prenom: true,
          },
        },
      },
    });

    if (!template) {
      return NextResponse.json({ error: 'Template non trouvé' }, { status: 404 });
    }

    return NextResponse.json(template);
  } catch (error) {
    console.error('Erreur lors de la récupération du template:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour un template
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
    const { name, description, structure } = body;

    const template = await prisma.equipmentTemplate.update({
      where: { id },
      data: {
        name,
        description,
        structure,
      },
    });

    return NextResponse.json(template);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du template:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du template' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un template
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
    
    // Vérifier si le template est utilisé
    const inspectionCount = await prisma.equipmentDetailedInspection.count({
      where: { templateId: id },
    });

    if (inspectionCount > 0) {
      return NextResponse.json(
        { error: `Ce template est utilisé par ${inspectionCount} inspection(s). Impossible de le supprimer.` },
        { status: 400 }
      );
    }

    await prisma.equipmentTemplate.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la suppression du template:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du template' },
      { status: 500 }
    );
  }
}

