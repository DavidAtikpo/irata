import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Récupérer l'utilisateur par email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Récupérer toutes les réponses de satisfaction de l'utilisateur
    const responses = await prisma.$queryRaw`
      SELECT * FROM "webirata"."CustomerSatisfactionResponse" 
      WHERE "userId" = ${user.id}
      ORDER BY "createdAt" DESC
    `;

    console.log('Réponses trouvées:', responses);

    return NextResponse.json({
      success: true,
      responses: Array.isArray(responses) ? responses : []
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des réponses:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors de la récupération des réponses',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}




