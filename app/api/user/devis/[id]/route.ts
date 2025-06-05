import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const devis = await prisma.devis.findUnique({
      where: { id: params.id },
      include: {
        demande: {
          include: {
            formation: true
          }
        }
      }
    });

    if (!devis) {
      return NextResponse.json(
        { message: 'Devis non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier que le devis appartient bien à l'utilisateur connecté
    if (devis.userId !== session.user.id) {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    return NextResponse.json(devis);
  } catch (error) {
    console.error('Erreur lors de la récupération du devis:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération du devis' },
      { status: 500 }
    );
  }
} 