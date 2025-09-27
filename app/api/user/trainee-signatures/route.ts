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

    console.log('Récupération des signatures pour l\'utilisateur:', session?.user?.id);

    // Récupérer les vraies signatures depuis la base de données
    const signatures = await prisma.traineeSignature.findMany({
      where: {
        traineeId: session?.user?.id
      },
      select: {
        traineeId: true,
        signature: true,
        adminSignature: true,
        currentDay: true,
      } as any
    });

    console.log('Signatures trouvées:', signatures);

    // Si aucune signature trouvée, créer un enregistrement par défaut
    if (signatures.length === 0) {
      console.log('Aucune signature trouvée, création d\'un enregistrement par défaut');
      const defaultSignature = await prisma.traineeSignature.create({
        data: {
          traineeId: session?.user?.id,
          signature: '',
          adminSignature: '',
          currentDay: 1,
        } as any
      });
      console.log('Enregistrement par défaut créé:', defaultSignature);
      return NextResponse.json([defaultSignature]);
    }

    return NextResponse.json(signatures);
  } catch (error) {
    console.error('Erreur lors de la récupération des signatures:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { traineeId, signature } = await request.json();
    
    console.log('Mise à jour de la signature stagiaire:', { 
      traineeId, 
      signature,
      updatedBy: session?.user?.email 
    });

    // Sauvegarder dans la base de données avec Prisma
    const updatedSignature = await prisma.traineeSignature.upsert({
      where: {
        traineeId
      },
      update: { signature },
      create: { traineeId, signature, adminSignature: '' },
    });

    return NextResponse.json(updatedSignature);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la signature:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
} 