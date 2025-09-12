import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session as any).user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Récupérer toutes les inductions avec leurs détails
    const inductions = await prisma.$queryRaw`
      SELECT 
        ti.*,
        COUNT(tis.id) as signature_count
      FROM "webirata"."TraineeInduction" ti
      LEFT JOIN "webirata"."TraineeInductionSignature" tis ON ti.id = tis."inductionId"
      GROUP BY ti.id, ti."sessionId", ti."courseDate", ti."courseLocation", ti."diffusion", ti."copie", ti."adminSignature", ti.status, ti."publishedAt", ti."createdAt", ti."updatedAt"
      ORDER BY ti."createdAt" DESC
    `;

    // Récupérer aussi les sessions disponibles
    const sessions = await prisma.$queryRaw`
      SELECT DISTINCT dm.session, dm."createdAt"
      FROM "webirata"."Demande" dm
      ORDER BY dm."createdAt" DESC
    `;

    return NextResponse.json({
      success: true,
      inductions: inductions,
      sessions: sessions,
      message: 'Données de debug récupérées avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des données de debug:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors de la récupération des données de debug',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}
















