import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const documentId = params.id;

    if (!documentId) {
      return NextResponse.json(
        { message: 'ID du document requis' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { nom, description, type, public: isPublic, userId, devisId } = body;

    // Validation des données
    if (!nom || !type) {
      return NextResponse.json(
        { message: 'Nom et type du document requis' },
        { status: 400 }
      );
    }

    // Vérifier que le document existe
    const existingDocument = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!existingDocument) {
      return NextResponse.json(
        { message: 'Document non trouvé' },
        { status: 404 }
      );
    }

    // Préparer les données de mise à jour
    const updateData: any = {
      nom,
      description: description || null,
      type,
      public: isPublic,
    };

    // Gérer les relations
    if (isPublic) {
      // Si le document est public, supprimer les associations spécifiques
      updateData.userId = null;
      updateData.devisId = null;
    } else {
      // Si le document n'est pas public, gérer les associations
      if (userId) {
        // Vérifier que l'utilisateur existe
        const user = await prisma.user.findUnique({
          where: { id: userId },
        });
        if (!user) {
          return NextResponse.json(
            { message: 'Utilisateur non trouvé' },
            { status: 400 }
          );
        }
        updateData.userId = userId;
      } else {
        updateData.userId = null;
      }

      if (devisId) {
        // Vérifier que le devis existe
        const devis = await prisma.devis.findUnique({
          where: { id: devisId },
        });
        if (!devis) {
          return NextResponse.json(
            { message: 'Devis non trouvé' },
            { status: 400 }
          );
        }
        updateData.devisId = devisId;
      } else {
        updateData.devisId = null;
      }
    }

    // Mettre à jour le document
    const updatedDocument = await prisma.document.update({
      where: { id: documentId },
      data: updateData,
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
    });

    return NextResponse.json(updatedDocument);
  } catch (error) {
    console.error('Erreur lors de la modification du document:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la modification du document' },
      { status: 500 }
    );
  }
} 