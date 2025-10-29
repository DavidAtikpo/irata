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
    const { certificateUrl } = await req.json();

    if (!certificateUrl) {
      return NextResponse.json(
        { message: 'URL du certificat requise' },
        { status: 400 }
      );
    }

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

    // Mettre à jour TOUS les équipements dans la base de données
    // peu importe leur référence interne, type d'équipement ou ID
    // Condition where vide = tous les enregistrements
    const result = await prisma.equipmentDetailedInspection.updateMany({
      where: {},
      data: {
        verificateurSignaturePdf: certificateUrl,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(
      { 
        message: 'Tous les certificats mis à jour avec succès',
        filesUpdated: result.count 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Erreur lors de la mise à jour des certificats:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la mise à jour des certificats' },
      { status: 500 }
    );
  }
}

