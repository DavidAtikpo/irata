import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const inspection = await prisma.equipmentInspection.findUnique({
      where: { id },
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
      return NextResponse.json({ error: 'Inspection non trouvée' }, { status: 404 });
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    
    // Vérifier si l'inspection existe
    const existingInspection = await prisma.equipmentInspection.findUnique({
      where: { id }
    });

    if (!existingInspection) {
      return NextResponse.json({ error: 'Inspection non trouvée' }, { status: 404 });
    }

    // Si c'est un assesseur qui met à jour
    if (session.user.role === 'ADMIN' && body.assessorVerdict !== undefined) {
      const updatedInspection = await prisma.equipmentInspection.update({
        where: { id },
        data: {
          assessorVerdict: body.assessorVerdict,
          assessorComments: body.assessorComments,
          candidateCorrectlyIdentified: body.candidateCorrectlyIdentified,
          assessorId: session.user.id,
          status: body.assessorVerdict === 'PASS' ? 'APPROVED' : 'REJECTED'
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

      return NextResponse.json(updatedInspection);
    }

    // Si c'est le technicien qui met à jour
    if (existingInspection.technicianId === session.user.id) {
      const updatedInspection = await prisma.equipmentInspection.update({
        where: { id },
        data: {
          inspectionDate: body.inspectionDate ? new Date(body.inspectionDate) : undefined,
          technicianName: body.technicianName,
          technicianIrataNo: body.technicianIrataNo,
          makeOfItem: body.makeOfItem,
          modelOfItem: body.modelOfItem,
          itemIdNumber: body.itemIdNumber,
          standardsConformance: body.standardsConformance,
          suitabilityOfItem: body.suitabilityOfItem,
          ageOfItem: body.ageOfItem,
          historyOfItem: body.historyOfItem,
          metalPartsCondition: body.metalPartsCondition,
          textilePartsCondition: body.textilePartsCondition,
          plasticPartsCondition: body.plasticPartsCondition,
          movingPartsFunction: body.movingPartsFunction,
          operationalCheck: body.operationalCheck,
          compatibilityCheck: body.compatibilityCheck,
          overallComments: body.overallComments,
          technicianVerdict: body.technicianVerdict,
          status: body.status || 'DRAFT'
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

      return NextResponse.json(updatedInspection);
    }

    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'inspection:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    await prisma.equipmentInspection.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Inspection supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'inspection:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 