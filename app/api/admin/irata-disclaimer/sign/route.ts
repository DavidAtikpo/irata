import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Vérifier l'authentification admin
    if (!session || (session as any).user?.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    const { submissionId, adminSignature, adminName } = await request.json();

    if (!submissionId || !adminSignature) {
      return NextResponse.json({ message: 'Données manquantes' }, { status: 400 });
    }

    const updatedSubmission = await prisma.irataDisclaimerSubmission.update({
      where: { id: submissionId },
      data: {
        adminSignature,
        adminName,
        adminSignedAt: new Date(),
        status: 'SIGNED'
      }
    });

    return NextResponse.json({ 
      message: 'Document signé avec succès',
      submission: updatedSubmission
    });

  } catch (error) {
    console.error('Erreur lors de la signature admin:', error);
    return NextResponse.json({ message: 'Erreur interne du serveur' }, { status: 500 });
  }
}