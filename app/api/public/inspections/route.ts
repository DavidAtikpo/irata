import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Route publique pour lister toutes les inspections (sans authentification)
export async function GET() {
  try {
    const inspections = await prisma.equipmentDetailedInspection.findMany({
      select: {
        id: true,
        referenceInterne: true,
        typeEquipement: true,
        numeroSerie: true,
        etat: true,
        photo: true,
        qrCode: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(inspections);
  } catch (error) {
    console.error('Erreur lors de la récupération des inspections:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

