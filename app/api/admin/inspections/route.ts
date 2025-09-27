import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from 'lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const technicianId = searchParams.get('technicianId');

    const where: any = {};
    
    if (status) {
      where.status = status;
    }
    
    if (technicianId) {
      where.technicianId = technicianId;
    }

    const inspections = await prisma.equipmentInspection.findMany({
      where,
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
      },
      orderBy: {
        createdAt: 'desc'
      }
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

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    
    const {
      inspectionDate,
      technicianName,
      technicianIrataNo,
      makeOfItem,
      modelOfItem,
      itemIdNumber,
      standardsConformance,
      suitabilityOfItem,
      ageOfItem,
      historyOfItem,
      metalPartsCondition,
      textilePartsCondition,
      plasticPartsCondition,
      movingPartsFunction,
      operationalCheck,
      compatibilityCheck,
      overallComments,
      technicianVerdict
    } = body;

    const inspection = await prisma.equipmentInspection.create({
      data: {
        inspectionDate: new Date(inspectionDate),
        technicianName,
        technicianIrataNo,
        makeOfItem,
        modelOfItem,
        itemIdNumber,
        standardsConformance,
        suitabilityOfItem,
        ageOfItem,
        historyOfItem,
        metalPartsCondition,
        textilePartsCondition,
        plasticPartsCondition,
        movingPartsFunction,
        operationalCheck,
        compatibilityCheck,
        overallComments,
        technicianVerdict,
        technicianId: body.technicianId || session?.user?.id,
        status: 'SUBMITTED' // Changé de DRAFT à SUBMITTED
      },
      include: {
        technician: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
          }
        }
      }
    });

    // Envoyer une notification au technicien
    if (body.technicianId && body.technicianId !== session?.user?.id) {
      try {
        // Créer une notification pour le technicien
        await prisma.notification.create({
          data: {
            userId: body.technicianId,
            title: 'Nouvelle inspection d\'équipement',
            message: `Une nouvelle inspection d'équipement vous a été assignée (${inspection.docNumber}).`,
            type: 'INSPECTION',
            relatedId: inspection.id,
            read: false
          }
        });

        console.log(`Notification envoyée au technicien ${body.technicianId} pour l'inspection ${inspection.id}`);

        // Optionnel : Envoyer un email au technicien
        // await sendEmail({
        //   to: inspection.technician.email,
        //   subject: 'Nouvelle inspection d\'équipement assignée',
        //   template: 'inspection-assigned',
        //   data: { inspection }
        // });
      } catch (error) {
        console.error('Erreur lors de l\'envoi de la notification:', error);
        // Ne pas faire échouer la création de l'inspection si la notification échoue
      }
    } else {
      console.log('Aucune notification envoyée - inspection créée pour l\'admin lui-même');
    }

    return NextResponse.json(inspection, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de l\'inspection:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 