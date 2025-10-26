import { NextRequest, NextResponse } from 'next/server';
import { prisma } from 'lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const equipments = await prisma.equipment.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      take: 10 // Limiter à 10 derniers équipements
    });

    return NextResponse.json({
      count: equipments.length,
      equipments: equipments.map(eq => ({
        id: eq.id,
        qrCode: eq.qrCode,
        produit: eq.produit,
        createdAt: eq.createdAt,
        pdfUrl: eq.pdfUrl
      }))
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des équipements:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
