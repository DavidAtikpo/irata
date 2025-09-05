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

    // Vérifier si l'utilisateur a déjà soumis les formulaires
    // Vous devrez adapter cette logique selon votre modèle de données
    const hasSubmitted = false; // À remplacer par votre logique de vérification

    return NextResponse.json({
      success: true,
      submitted: hasSubmitted,
      message: hasSubmitted 
        ? 'Formulaires déjà soumis' 
        : 'Formulaires non encore soumis'
    });

  } catch (error) {
    console.error('Erreur lors de la vérification du statut:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors de la vérification du statut',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}







