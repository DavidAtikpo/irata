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
    const { signature, dateSignature } = await req.json();

    if (!signature || !dateSignature) {
      return NextResponse.json(
        { message: 'Signature et date requises' },
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

    // Mettre à jour tous les équipements de même type avec cette signature
    const result = await prisma.equipmentDetailedInspection.updateMany({
      where: {
        referenceInterne: inspection.referenceInterne,
        numeroSerie: inspection.numeroSerie,
        typeEquipement: inspection.typeEquipement,
      },
      data: {
        verificateurSignaturePdf: signature,
        dateSignature: new Date(dateSignature),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(
      { 
        message: 'Toutes les signatures mises à jour avec succès',
        filesUpdated: result.count 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Erreur lors de la mise à jour des signatures:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la mise à jour des signatures' },
      { status: 500 }
    );
  }
}

