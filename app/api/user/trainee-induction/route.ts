import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Récupérer la session de formation de l'utilisateur
    const userSession = await prisma.$queryRaw`
      SELECT dm.session
      FROM "webirata"."Demande" dm
      WHERE dm."userId" = ${session.user.id}
      ORDER BY dm."createdAt" DESC
      LIMIT 1
    `;

    if (!Array.isArray(userSession) || userSession.length === 0) {
      return NextResponse.json({ error: 'Aucune session trouvée pour cet utilisateur' }, { status: 404 });
    }

    const sessionData = userSession[0];

    // Récupérer les données d'induction pour cette session
    const inductionData = await prisma.$queryRaw`
      SELECT * FROM "webirata"."TraineeInduction" 
      WHERE "sessionId" = ${sessionData.session}
      ORDER BY "createdAt" DESC
      LIMIT 1
    `;

    if (!Array.isArray(inductionData) || inductionData.length === 0) {
      return NextResponse.json({ 
        error: 'Aucune induction trouvée pour cette session',
        sessionName: sessionData.session
      }, { status: 404 });
    }

    const induction = inductionData[0];

    return NextResponse.json({
      success: true,
      induction: {
        id: induction.id,
        sessionId: induction.sessionId,
        courseDate: induction.courseDate,
        courseLocation: induction.courseLocation,
        diffusion: induction.diffusion,
        copie: induction.copie,
        adminSignature: induction.adminSignature,
        createdAt: induction.createdAt,
        updatedAt: induction.updatedAt
      },
      sessionName: sessionData.session
    });

  } catch (error) {
    console.error('Erreur lors de la récupération de l\'induction:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'induction' },
      { status: 500 }
    );
  }
}
