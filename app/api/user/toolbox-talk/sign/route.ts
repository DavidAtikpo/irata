import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from 'lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { recordId, userName, signature } = body;

    // Validation des champs requis
    if (!recordId || !userName || !signature) {
      return NextResponse.json(
        { message: 'Tous les champs requis doivent être remplis' },
        { status: 400 }
      );
    }

    // Vérifier que l'enregistrement existe et est publié
    const record = await prisma.toolboxTalkRecord.findUnique({
      where: { id: recordId }
    });

    if (!record) {
      return NextResponse.json(
        { message: 'Enregistrement non trouvé' },
        { status: 404 }
      );
    }

    if (!record.isPublished) {
      return NextResponse.json(
        { message: 'Cet enregistrement n\'est pas encore publié' },
        { status: 403 }
      );
    }

    // Vérifier si l'utilisateur a déjà signé
    const existingSignature = await prisma.toolboxTalkRecordSignature.findFirst({
      where: {
        recordId,
        userId: session.user.id
      }
    });

    if (existingSignature) {
      return NextResponse.json(
        { message: 'Vous avez déjà signé cet enregistrement' },
        { status: 400 }
      );
    }

    // Créer la signature
    const signatureRecord = await prisma.toolboxTalkRecordSignature.create({
      data: {
        recordId,
        userId: session.user.id,
        userName,
        signature
      }
    });

    return NextResponse.json(
      {
        message: 'Signature enregistrée avec succès',
        id: signatureRecord.id
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Erreur lors de l\'enregistrement de la signature:', error);
    return NextResponse.json(
      { message: 'Erreur lors de l\'enregistrement de la signature' },
      { status: 500 }
    );
  }
}
