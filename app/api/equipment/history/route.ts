import { NextRequest, NextResponse } from 'next/server';
import { prisma } from 'lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const equipment = await prisma.equipment.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        qrCode: true,
        produit: true,
        referenceInterne: true,
        pdfUrl: true,
        createdAt: true,
      }
    });

    return NextResponse.json(equipment);

  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}