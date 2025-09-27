import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from '../../../../../lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session as any).user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'ID de session requis' },
        { status: 400 }
      );
    }

    // Vérifier que l'induction existe et est signée par l'admin
    const induction = await prisma.$queryRaw`
      SELECT * FROM "webirata"."TraineeInduction" 
      WHERE "sessionId" = ${sessionId}
    `;

    if (!Array.isArray(induction) || induction.length === 0) {
      return NextResponse.json(
        { error: 'Document non trouvé pour cette session' },
        { status: 404 }
      );
    }

    const inductionData = induction[0];

    // Vérifier que le document est signé par l'admin
    if (!inductionData.adminSignature) {
      return NextResponse.json(
        { error: 'Le document doit être signé par l\'admin avant publication' },
        { status: 400 }
      );
    }

    // Mettre à jour le statut en base de données
    const updateResult = await prisma.$queryRaw`
      UPDATE "webirata"."TraineeInduction" 
      SET status = 'published_to_trainees',
          "publishedAt" = NOW(),
          "updatedAt" = NOW()
      WHERE "sessionId" = ${sessionId}
      RETURNING *
    `;

    if (!Array.isArray(updateResult) || updateResult.length === 0) {
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour du statut' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: 'Document publié aux stagiaires avec succès',
      induction: updateResult[0]
    });

  } catch (error) {
    console.error('Erreur lors de la publication:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

