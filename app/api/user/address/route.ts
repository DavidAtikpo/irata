import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from 'lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Récupérer l'adresse depuis la table contrat
    const contrat = await prisma.contrat.findFirst({
      where: {
        userId: session.user.id,
      },
      select: {
        adresse: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      address: contrat?.adresse || '',
    });

  } catch (error) {
    console.error('Erreur lors de la récupération de l\'adresse:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'adresse' },
      { status: 500 }
    );
  }
}
