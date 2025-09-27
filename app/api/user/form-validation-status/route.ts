import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Vérifier si le formulaire est validé pour cet utilisateur
    const validationStatus = await prisma.traineeSignature.findUnique({
      where: {
        traineeId: session?.user?.id
      },
      select: {
        isValidated: true
      }
    });

    return NextResponse.json({
      isValidated: validationStatus?.isValidated || false
    });
  } catch (error) {
    console.error('Erreur lors de la vérification du statut de validation:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
} 