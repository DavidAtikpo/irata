import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { signature } = await request.json();

    // Pour l'instant, on va sauvegarder la signature admin dans une table de paramètres
    // ou créer une table dédiée. Pour simplifier, on va utiliser une approche simple
    console.log('Signature admin sauvegardée:', signature);

    // TODO: Implémenter la sauvegarde de la signature admin
    // Options possibles :
    // 1. Créer une table AdminSignature
    // 2. Ajouter un champ adminSignature global dans TraineeFollowUp
    // 3. Utiliser la table Settings existante

    return NextResponse.json({ success: true, signature });
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de la signature admin:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la sauvegarde de la signature admin' },
      { status: 500 }
    );
  }
} 