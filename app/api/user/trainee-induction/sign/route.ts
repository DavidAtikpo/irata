import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const { inductionId, userSignature } = body;

    if (!inductionId || !userSignature) {
      return NextResponse.json({ 
        error: 'ID d\'induction et signature requis',
        received: { inductionId, hasSignature: !!userSignature }
      }, { status: 400 });
    }

    // Vérifier si l'utilisateur a déjà signé cette induction
    const existingSignature = await prisma.$queryRaw`
      SELECT * FROM "webirata"."TraineeInductionSignature" 
      WHERE "inductionId" = ${inductionId} AND "userId" = ${session.user.id}
    `;

    if (Array.isArray(existingSignature) && existingSignature.length > 0) {
      return NextResponse.json({ 
        error: 'Vous avez déjà signé cette induction',
        signature: existingSignature[0]
      }, { status: 409 });
    }

    // Créer la signature
    const result = await prisma.$queryRaw`
      INSERT INTO "webirata"."TraineeInductionSignature" (
        id, "inductionId", "userId", "userSignature", "createdAt", "updatedAt"
      ) VALUES (
        gen_random_uuid()::text, ${inductionId}, ${session.user.id}, ${userSignature}, NOW(), NOW()
      )
      RETURNING *
    `;

    const signature = Array.isArray(result) ? result[0] : null;

    if (!signature) {
      return NextResponse.json({ error: 'Erreur lors de la signature' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Induction signée avec succès',
      signature
    });

  } catch (error) {
    console.error('Erreur lors de la signature de l\'induction:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la signature de l\'induction' },
      { status: 500 }
    );
  }
}

