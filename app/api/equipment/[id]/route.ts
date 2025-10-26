import { NextRequest, NextResponse } from 'next/server';
import { prisma } from 'lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const qrCode = params.id;

    const equipment = await prisma.equipment.findUnique({
      where: {
        qrCode: qrCode
      }
    });

    if (!equipment) {
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
