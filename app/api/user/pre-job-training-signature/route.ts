import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    const { day, signatureData, userId, userName, autoSigned = true } = await request.json();

    if (!day || !signatureData || !userId) {
      return NextResponse.json({ message: 'Données manquantes' }, { status: 400 });
    }

    // Vérifier si une signature existe déjà pour ce jour et cet utilisateur
    const existingSignature = await prisma.preJobTrainingSignature.findFirst({
      where: {
        day: day,
        userId: userId
      }
    });

    let signatureEntry;
    if (existingSignature) {
      // Mettre à jour la signature existante
      signatureEntry = await prisma.preJobTrainingSignature.update({
        where: { id: existingSignature.id },
        data: {
          signatureData: signatureData,
          userName: userName,
          signedAt: new Date(),
          autoSigned: autoSigned
        }
      });
    } else {
      // Créer une nouvelle signature
      signatureEntry = await prisma.preJobTrainingSignature.create({
        data: {
          day: day,
          signatureData: signatureData,
          userId: userId,
          userName: userName,
          autoSigned: autoSigned
        }
      });
    }

    return NextResponse.json({ 
      message: 'Pre-Job Training signé automatiquement',
      signature: signatureEntry
    });

  } catch (error) {
    console.error('Erreur lors de la signature automatique du Pre-Job Training:', error);
    return NextResponse.json({ message: 'Erreur interne du serveur' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    // Récupérer les signatures de l'utilisateur connecté
    const signatures = await prisma.preJobTrainingSignature.findMany({
      where: {
        userId: session.user?.id
      },
      orderBy: {
        signedAt: 'desc'
      }
    });

    return NextResponse.json({ signatures: signatures });
  } catch (error) {
    console.error('Erreur lors de la récupération des signatures Pre-Job Training:', error);
    return NextResponse.json({ message: 'Erreur lors de la récupération' }, { status: 500 });
  }
}
