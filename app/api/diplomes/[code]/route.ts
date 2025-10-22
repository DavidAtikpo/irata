import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    // TODO: Exécuter la migration Prisma avant d'utiliser
    // Récupérer le diplôme par le code QR
    const diplome = await (prisma as any).diplome.findUnique({
      where: { qrCode: code },
      include: {
        stagiaire: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true
          }
        },
        generePar: {
          select: {
            id: true,
            nom: true,
            prenom: true
          }
        }
      }
    });

    if (!diplome) {
      return NextResponse.json({ error: 'Diplôme non trouvé' }, { status: 404 });
    }

    return NextResponse.json({
      id: diplome.id,
      qrCode: diplome.qrCode,
      stagiaire: diplome.stagiaire,
      nom: diplome.nom,
      prenom: diplome.prenom,
      formation: diplome.formation,
      session: diplome.session,
      dateObtention: diplome.dateObtention,
      photoUrl: diplome.photoUrl,
      pdfUrl: diplome.pdfUrl,
      generePar: diplome.generePar,
      createdAt: diplome.createdAt
    });

  } catch (error) {
    console.error('Erreur lors de la récupération du diplôme:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' }, 
      { status: 500 }
    );
  }
}

