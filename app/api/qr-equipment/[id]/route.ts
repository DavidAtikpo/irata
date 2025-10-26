import { NextRequest, NextResponse } from 'next/server';
import { prisma } from 'lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const qrCode = resolvedParams.id;
    
    console.log('Recherche de l\'équipement avec le QR Code:', qrCode);

    const equipment = await prisma.equipment.findUnique({
      where: {
        qrCode: qrCode
      }
    });

    console.log('Équipement trouvé:', equipment ? 'Oui' : 'Non');

    if (!equipment) {
      console.log('Aucun équipement trouvé pour le QR Code:', qrCode);
      return NextResponse.json(
        { error: 'Équipement non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json(equipment);

  } catch (error) {
    console.error('Erreur lors de la récupération de l\'équipement:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
