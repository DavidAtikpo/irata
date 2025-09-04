import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Récupérer les signatures depuis la base de données
    const userSignatures = await prisma.attendanceSignature.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Convertir en format object pour l'interface
    const signaturesObject: Record<string, string> = {};
    userSignatures.forEach(sig => {
      signaturesObject[sig.signatureKey] = sig.signatureData;
    });

    return NextResponse.json({ 
      signatures: signaturesObject,
      count: userSignatures.length 
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des signatures d\'attendance:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { signatureKey, signatureData, userId } = await request.json();

    if (!signatureKey || !signatureData) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
    }

    // Vérifier que l'utilisateur ne peut modifier que ses propres signatures
    if (userId !== session.user.id) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // Utiliser upsert pour créer ou mettre à jour la signature
    const signature = await prisma.attendanceSignature.upsert({
      where: {
        userId_signatureKey: {
          userId: session.user.id,
          signatureKey: signatureKey
        }
      },
      update: {
        signatureData: signatureData,
        updatedAt: new Date()
      },
      create: {
        userId: session.user.id,
        signatureKey: signatureKey,
        signatureData: signatureData
      }
    });

    return NextResponse.json({ 
      message: 'Signature d\'attendance sauvegardée avec succès',
      signature: {
        id: signature.id,
        userId: signature.userId,
        signatureKey: signature.signatureKey,
        signatureData: signature.signatureData,
        timestamp: signature.createdAt.toISOString()
      }
    });

  } catch (error) {
    console.error('Erreur lors de la sauvegarde de la signature d\'attendance:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
