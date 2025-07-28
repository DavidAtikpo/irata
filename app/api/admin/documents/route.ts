import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import cloudinary from '@/lib/cloudinary';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const documents = await prisma.document.findMany({
      select: {
        id: true,
        nom: true,
        description: true,
        url: true,
        type: true,
        public: true,
        createdAt: true,
        user: {
          select: {
            nom: true,
            prenom: true,
            email: true,
          },
        },
        devis: {
          select: {
            numero: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(documents);
  } catch (error) {
    console.error('Erreur lors de la récupération des documents:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des documents' },
      { status: 500 }
    );
  }
}



export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const documentId = searchParams.get('id');

    if (!documentId) {
      return NextResponse.json(
        { message: 'ID du document requis' },
        { status: 400 }
      );
    }

    // Vérifier que le document existe
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      return NextResponse.json(
        { message: 'Document non trouvé' },
        { status: 404 }
      );
    }

    // Supprimer le document
    await prisma.document.delete({
      where: { id: documentId },
    });

    return NextResponse.json({ message: 'Document supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du document:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la suppression du document' },
      { status: 500 }
    );
  }
} 