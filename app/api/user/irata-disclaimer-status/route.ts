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

    // Récupérer l'utilisateur pour obtenir son ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Vérifier s'il a déjà soumis un disclaimer dans la base de données
    const existingSubmission = await prisma.irataDisclaimerSubmission.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    });

    console.log('User ID:', user.id);
    console.log('Existing submission:', existingSubmission);

    return NextResponse.json({
      hasSigned: !!existingSubmission,
      submission: existingSubmission || null,
    });

  } catch (error) {
    console.error('Erreur lors de la vérification du statut:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la vérification du statut' },
      { status: 500 }
    );
  }
}
