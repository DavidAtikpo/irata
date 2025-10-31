import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const inspections = await prisma.equipmentDetailedInspection.findMany({
      include: {
        createdBy: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(inspections);
  } catch (error) {
    console.error('Erreur lors de la récupération des inspections:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des inspections' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    
    // Extraire les champs qui ne doivent pas être directement sauvegardés
    const { 
      inspectionData, 
      nature, 
      reference, 
      type, 
      normes, 
      date, 
      signataire, 
      crossedOutWords, 
      crossedOutItems,
      // Extraire les champs spécifiques au harnais pour les sauvegarder
      etatSangles,
      pointsAttache,
      etatBouclesReglages,
      etatElementsConfort,
      etatConnecteurTorseCuissard,
      bloqueurCroll,
      ...inspectionDataWithoutNested 
    } = body;
    
    const inspection = await prisma.equipmentDetailedInspection.create({
      data: {
        ...inspectionDataWithoutNested,
        // Inclure les champs spécifiques au harnais s'ils existent
        ...(etatSangles && { etatSangles }),
        ...(pointsAttache && { pointsAttache }),
        ...(etatBouclesReglages && { etatBouclesReglages }),
        ...(etatElementsConfort && { etatElementsConfort }),
        ...(etatConnecteurTorseCuissard && { etatConnecteurTorseCuissard }),
        ...(bloqueurCroll && { bloqueurCroll }),
        // Inclure les données de mots barrés
        ...(crossedOutWords && { crossedOutWords }),
        ...(crossedOutItems && { crossedOutItems }),
        createdById: session.user.id,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(inspection, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de l\'inspection:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'inspection' },
      { status: 500 }
    );
  }
}
