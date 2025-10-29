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
    const { pdfUrl, documentsReference, normesCertificat } = await req.json();

    // Vérifier que l'inspection existe
    const inspection = await prisma.equipmentDetailedInspection.findUnique({
      where: { id },
      select: {
        id: true,
      },
    });

    if (!inspection) {
      return NextResponse.json(
        { message: 'Inspection introuvable' },
        { status: 404 }
      );
    }

    // Préparer les données à mettre à jour (seulement les champs fournis)
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (pdfUrl !== undefined) {
      updateData.pdfUrl = pdfUrl;
    }
    if (documentsReference !== undefined) {
      updateData.documentsReference = documentsReference;
    }
    if (normesCertificat !== undefined) {
      updateData.normesCertificat = normesCertificat;
    }

    // Mettre à jour TOUS les équipements dans la base de données
    // peu importe leur référence interne, type d'équipement ou ID
    // Condition where vide = tous les enregistrements
    const result = await prisma.equipmentDetailedInspection.updateMany({
      where: {},
      data: updateData,
    });

    return NextResponse.json(
      { 
        message: 'Tous les documents PDF et références mis à jour avec succès',
        filesUpdated: result.count 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Erreur lors de la mise à jour des documents PDF:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la mise à jour des documents PDF' },
      { status: 500 }
    );
  }
}

