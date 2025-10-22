import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    // TODO: Exécuter la migration Prisma avant d'utiliser
    // Récupérer l'équipement par le code QR
    const equipment = await (prisma as any).equipmentQR.findUnique({
      where: { qrCode: code },
      include: {
        createdBy: {
          select: {
            id: true,
            nom: true,
            prenom: true
          }
        }
      }
    });

    if (!equipment) {
      return NextResponse.json({ error: 'Équipement non trouvé' }, { status: 404 });
    }

    return NextResponse.json({
      id: equipment.id,
      qrCode: equipment.qrCode,
      produit: equipment.produit,
      referenceInterne: equipment.referenceInterne,
      numeroSerie: equipment.numeroSerie,
      normes: equipment.normes,
      fabricant: equipment.fabricant,
      dateControle: equipment.dateControle,
      signataire: equipment.signataire,
      pdfUrl: equipment.pdfUrl,
      cloudinaryPublicId: equipment.cloudinaryPublicId,
      createdBy: equipment.createdBy,
      createdAt: equipment.createdAt
    });

  } catch (error) {
    console.error('Erreur lors de la récupération de l\'équipement:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' }, 
      { status: 500 }
    );
  }
}

