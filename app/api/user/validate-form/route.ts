import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { traineeId } = await request.json();

    // Marquer le formulaire comme validé
    const updatedSignature = await prisma.traineeSignature.upsert({
      where: {
        traineeId
      },
      update: {
        isValidated: true,
        validatedAt: new Date()
      },
      create: {
        traineeId,
        signature: '',
        adminSignature: '',
        isValidated: true,
        validatedAt: new Date()
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Formulaire validé avec succès',
      validatedAt: updatedSignature.validatedAt
    });
  } catch (error) {
    console.error('Erreur lors de la validation du formulaire:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
} 