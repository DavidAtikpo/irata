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

    let whereCondition: any = {
      OR: [
        { public: true }, // Documents publics
        { userId: session.user.id }, // Documents spécifiques à l'utilisateur
      ],
    };

    // Si un devis ID est spécifié, inclure les documents liés à ce devis
    if (devisId) {
      // Vérifier que le devis appartient à l'utilisateur
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