import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Route pour mettre à jour le QR code d'une inspection
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const resolvedParams = await params;
    const inspectionId = resolvedParams.id;
    const { qrCodeImageUrl } = await request.json();

    if (!qrCodeImageUrl) {
      return NextResponse.json(
        { error: 'URL du QR code requise' },
        { status: 400 }
      );
    }

    // Vérifier que l'inspection existe
    const existingInspection = await prisma.equipmentDetailedInspection.findUnique({
      where: { id: inspectionId },
    });

    if (!existingInspection) {
      return NextResponse.json(
        { error: 'Inspection non trouvée' },
        { status: 404 }
      );
    }

    // Mettre à jour l'inspection avec l'URL du QR code
    const updatedInspection = await prisma.equipmentDetailedInspection.update({
      where: { id: inspectionId },
      data: { qrCode: qrCodeImageUrl },
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

    return NextResponse.json({
      success: true,
      inspection: updatedInspection,
      message: 'QR code mis à jour avec succès',
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du QR code:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du QR code' },
      { status: 500 }
    );
  }
}

