import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Récupérer les sessions uniques avec le nombre d'inscrits
    const sessions = await prisma.$queryRaw`
      SELECT 
        session,
        COUNT(*) as inscrits,
        MIN("createdAt") as "createdAt",
        MAX("updatedAt") as "updatedAt"
      FROM "webirata"."Demande"
      GROUP BY session
      ORDER BY "createdAt" DESC
    `;

    // Formater les résultats pour correspondre à l'interface attendue
    const formattedSessions = Array.isArray(sessions) ? sessions.map((session: any, index: number) => ({
      id: session.session, // Utiliser le nom de session comme ID
      session: session.session,
      statut: 'ACTIVE', // Statut par défaut pour les sessions
      message: null,
      commentaire: null,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      inscrits: parseInt(session.inscrits)
    })) : [];

    return NextResponse.json(formattedSessions);

  } catch (error) {
    console.error('Erreur lors de la récupération des sessions:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
