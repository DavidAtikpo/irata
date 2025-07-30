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

    const { levelData, signatures, adminSignature } = await request.json();

    // Pour l'instant, simuler la sauvegarde
    // En réalité, ces données seraient sauvegardées dans des tables dédiées
    console.log('Soumission du formulaire de suivi:', {
      levelData,
      signatures,
      adminSignature,
      submittedBy: session.user.email,
      submittedAt: new Date().toISOString(),
    });

    // Ici, vous pourriez sauvegarder les données dans la base de données
    // Par exemple :
    // - Sauvegarder les niveaux requis dans une table TraineeLevels
    // - Sauvegarder les signatures dans une table TraineeSignatures
    // - Créer un enregistrement de soumission dans une table TraineeFollowUpSubmissions

    return NextResponse.json({ 
      success: true,
      message: 'Formulaire soumis avec succès',
      submittedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Erreur lors de la soumission du formulaire:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la soumission du formulaire' },
      { status: 500 }
    );
  }
} 