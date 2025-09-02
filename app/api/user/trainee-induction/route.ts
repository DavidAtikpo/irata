import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      console.log('Session non trouvée ou email manquant');
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    console.log('Session trouvée pour:', session.user.email);

    // Récupérer l'utilisateur par email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      console.log('Utilisateur non trouvé pour email:', session.user.email);
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    console.log('Utilisateur trouvé, ID:', user.id);

    // Récupérer la session de formation de l'utilisateur
    const userSession = await prisma.$queryRaw`
      SELECT dm.session
      FROM "webirata"."Demande" dm
      WHERE dm."userId" = ${user.id}
      ORDER BY dm."createdAt" DESC
      LIMIT 1
    `;

    console.log('Demande trouvée:', userSession);

    if (!Array.isArray(userSession) || userSession.length === 0) {
      console.log('Aucune demande trouvée pour utilisateur:', user.id);
      return NextResponse.json({ 
        error: 'Aucune session de formation trouvée pour cet utilisateur',
        message: 'Vous devez d\'abord être inscrit à une session de formation'
      }, { status: 404 });
    }

    const sessionData = userSession[0];
    console.log('Session de formation:', sessionData.session);

    // Récupérer les données d'induction pour cette session
    const inductionData = await prisma.$queryRaw`
      SELECT * FROM "webirata"."TraineeInduction" 
      WHERE "sessionId" = ${sessionData.session}
      ORDER BY "createdAt" DESC
      LIMIT 1
    `;

    console.log('Induction trouvée:', inductionData);

    if (!Array.isArray(inductionData) || inductionData.length === 0) {
      console.log('Aucune induction trouvée pour session:', sessionData.session);
      return NextResponse.json({ 
        error: 'Aucune induction trouvée pour cette session',
        sessionName: sessionData.session,
        message: 'L\'induction pour cette session n\'a pas encore été créée par l\'administrateur'
      }, { status: 404 });
    }

    const induction = inductionData[0];

    // Vérifier si l'induction est publiée
    if (induction.status !== 'published_to_trainees') {
      console.log('Induction non publiée, statut:', induction.status);
      return NextResponse.json({ 
        error: 'L\'induction n\'est pas encore disponible',
        sessionName: sessionData.session,
        message: 'L\'induction est en cours de préparation par l\'administrateur'
      }, { status: 403 });
    }

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
        status: induction.status,
        publishedAt: induction.publishedAt,
        createdAt: induction.createdAt,
        updatedAt: induction.updatedAt
      },
      sessionName: sessionData.session
    });

  } catch (error) {
    console.error('Erreur lors de la récupération de l\'induction:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors de la récupération de l\'induction',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}
