import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from 'lib/prisma';

export async function POST(request: NextRequest) {
  try {
    console.log('Début de la signature d\'induction');
    
    const session = await getServerSession(authOptions);
    
    if (!session) {
      console.log('Session non trouvée');
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    console.log('Session trouvée:', { userId: session?.user?.id, email: session?.user?.email });

    const body = await request.json();
    const { inductionId, userSignature } = body;

    console.log('Données reçues:', {
      inductionId,
      hasSignature: !!userSignature,
      signatureLength: userSignature?.length
    });

    if (!inductionId || !userSignature) {
      console.log('Données manquantes:', { inductionId, hasSignature: !!userSignature });
      return NextResponse.json({ 
        error: 'ID d\'induction et signature requis',
        received: { inductionId, hasSignature: !!userSignature }
      }, { status: 400 });
    }

    // Vérifier si l'induction existe
    const induction = await prisma.$queryRaw`
      SELECT * FROM "webirata"."TraineeInduction" 
      WHERE id = ${inductionId}
    `;

    if (!Array.isArray(induction) || induction.length === 0) {
      console.log('Induction non trouvée:', inductionId);
      return NextResponse.json({ 
        error: 'Induction non trouvée',
        inductionId 
      }, { status: 404 });
    }

    console.log('Induction trouvée:', induction[0]);

    // Vérifier si l'utilisateur a déjà signé cette induction
    const existingSignature = await prisma.$queryRaw`
      SELECT * FROM "webirata"."TraineeInductionSignature" 
      WHERE "inductionId" = ${inductionId} AND "userId" = ${session?.user?.id}
    `;

    console.log('Vérification signature existante:', existingSignature);

    if (Array.isArray(existingSignature) && existingSignature.length > 0) {
      console.log('Signature déjà existante');
      return NextResponse.json({ 
        success: true,
        message: 'Vous avez déjà signé cette induction',
        signature: existingSignature[0],
        alreadySigned: true
      }, { status: 200 });
    }

    // Créer la signature
    console.log('Création de la signature...');
    const result = await prisma.$queryRaw`
      INSERT INTO "webirata"."TraineeInductionSignature" (
        id, "inductionId", "userId", "userSignature", "createdAt", "updatedAt"
      ) VALUES (
        gen_random_uuid()::text, ${inductionId}, ${session?.user?.id}, ${userSignature}, NOW(), NOW()
      )
      RETURNING *
    `;

    console.log('Résultat de l\'insertion:', result);

    const signature = Array.isArray(result) ? result[0] : null;

    if (!signature) {
      console.log('Aucune signature retournée après insertion');
      return NextResponse.json({ error: 'Erreur lors de la création de la signature' }, { status: 500 });
    }

    console.log('Signature créée avec succès:', signature);

    return NextResponse.json({
      success: true,
      message: 'Induction signée avec succès',
      signature
    });

  } catch (error) {
    console.error('Erreur lors de la signature de l\'induction:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'Pas de stack trace');
    return NextResponse.json(
      { 
        error: 'Erreur lors de la signature de l\'induction',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

