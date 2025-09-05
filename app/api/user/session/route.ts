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

    // Récupérer l'utilisateur pour obtenir son ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Récupérer la session depuis le modèle Demande
    const demande = await prisma.demande.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        session: true
      }
    });

    console.log('User ID:', user.id);
    console.log('Demande found:', demande);

    if (!demande || !demande.session) {
      return NextResponse.json({ 
        session: null,
        message: 'Aucune session trouvée pour cet utilisateur'
      });
    }

    return NextResponse.json({
      session: demande.session,
      success: true
    });

  } catch (error) {
    console.error('Erreur lors de la récupération de la session:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la session' },
      { status: 500 }
    );
  }
}






