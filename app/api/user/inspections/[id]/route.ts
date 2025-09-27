import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from 'lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id } = await params;

    const inspection = await prisma.equipmentInspection.findFirst({
      where: {
        id,
        technicianId: session?.user?.id // Seulement les inspections du technicien connecté
      },
      include: {
        technician: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
          }
        },
        assessor: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
          }
        }
      }
    });

    if (!inspection) {
      return NextResponse.json(
        { error: 'Inspection non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json(inspection);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'inspection:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
