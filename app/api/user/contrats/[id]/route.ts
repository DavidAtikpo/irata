import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from 'lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session?.user?.role !== 'USER') {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const contrat = await prisma.contrat.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            nom: true,
            prenom: true,
          },
        },
        devis: {
          include: {
            demande: {
              select: {
                session: true,
                message: true,
                entreprise: true,
                typeInscription: true,
              },
            },
          },
        },
      },
    });

    if (!contrat) {
      return NextResponse.json(
        { message: 'Contrat non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier que le contrat appartient à l'utilisateur connecté
    if (contrat.userId !== session.user.id) {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 403 }
      );
    }

    return NextResponse.json(contrat);
  } catch (error) {
    console.error('Erreur lors de la récupération du contrat:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération du contrat' },
      { status: 500 }
    );
  }
}

