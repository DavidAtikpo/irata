import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from 'lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Vérifier que l'enregistrement existe
    const record = await prisma.toolboxTalkRecord.findUnique({
      where: { id }
    });

    if (!record) {
      return NextResponse.json(
        { message: 'Enregistrement non trouvé' },
        { status: 404 }
      );
    }

    // Publier l'enregistrement
    const updatedRecord = await prisma.toolboxTalkRecord.update({
      where: { id },
      data: {
        isPublished: true,
        publishedAt: new Date()
      }
    });

    return NextResponse.json(
      {
        message: 'Toolbox Talk publié avec succès',
        record: updatedRecord
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Erreur lors de la publication du Toolbox Talk:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la publication' },
      { status: 500 }
    );
  }
}
