import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const { dateInspectionDetaillee } = await req.json();

    if (!dateInspectionDetaillee) {
      return NextResponse.json(
        { message: 'Date d\'inspection détaillée requise' },
        { status: 400 }
      );
    }

    // Récupérer l'équipement pour trouver les autres fichiers associés
    const inspection = await prisma.equipmentDetailedInspection.findUnique({
      where: { id },
      select: {
        referenceInterne: true,
        numeroSerie: true,
        typeEquipement: true,
      },
    });

    if (!inspection) {
      return NextResponse.json(
        { message: 'Inspection introuvable' },
        { status: 404 }
      );
    }

    // Mettre à jour tous les fichiers de cet équipement avec la nouvelle date
    const result = await prisma.equipmentDetailedInspection.updateMany({
      where: {
        referenceInterne: inspection.referenceInterne,
        numeroSerie: inspection.numeroSerie,
        typeEquipement: inspection.typeEquipement,
      },
      data: {
        dateInspectionDetaillee,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(
      { 
        message: 'Date d\'inspection mise à jour avec succès',
        filesUpdated: result.count 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Erreur lors de la mise à jour de la date d\'inspection:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la mise à jour' },
      { status: 500 }
    );
  }
}

