import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const devisId = searchParams.get('devisId');

    // Vérifier si l'utilisateur a un contrat validé
    const validatedContract = await prisma.contrat.findFirst({
      where: {
        userId: session.user.id,
        statut: 'VALIDE',
      },
      include: {
        devis: true,
      },
    });

    // Si l'utilisateur n'a pas de contrat validé, retourner seulement les documents publics
    if (!validatedContract) {
      const publicDocuments = await prisma.document.findMany({
        where: {
          public: true,
        },
        select: {
          id: true,
          nom: true,
          description: true,
          url: true,
          type: true,
          public: true,
          createdAt: true,
          devis: { select: { numero: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json(publicDocuments);
    }

    // Si l'utilisateur a un contrat validé, récupérer tous les documents accessibles
    let whereCondition: any = {
      OR: [
        { public: true }, // Documents publics
        { userId: session.user.id }, // Documents spécifiques à l'utilisateur
      ],
    };

    // Inclure les documents liés au devis du contrat validé
    if (validatedContract.devisId) {
      whereCondition.OR.push({ devisId: validatedContract.devisId });
    }

    // Si un devis ID spécifique est demandé, vérifier qu'il appartient à l'utilisateur
    if (devisId) {
      const devis = await prisma.devis.findFirst({
        where: {
          id: devisId,
          userId: session.user.id,
        },
      });

      if (devis) {
        whereCondition.OR.push({ devisId });
      }
    }

    const documents = await prisma.document.findMany({
      where: whereCondition,
      select: {
        id: true,
        nom: true,
        description: true,
        url: true,
        type: true,
        public: true,
        createdAt: true,
        devis: { select: { numero: true } },
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