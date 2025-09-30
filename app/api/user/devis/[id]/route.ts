import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from 'lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const devis = await prisma.devis.findUnique({
      where: { id },
      include: {
        demande: {
          include: {
            user: true
          }
        }
      }
    });

    // Fetch referenceAffaire using raw SQL since it's not in the Prisma schema yet
    const referenceAffaireResult = await prisma.$queryRaw`
      SELECT "referenceAffaire" FROM "webirata"."Devis" WHERE id = ${id}
    `;
    const referenceAffaire = (referenceAffaireResult as any[])[0]?.referenceAffaire || null;

    if (!devis) {
      return NextResponse.json(
        { message: 'Devis non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier que le devis appartient bien à l'utilisateur connecté
    if (devis.userId !== session?.user?.id) {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Add referenceAffaire to the response
    const devisWithReference = {
      ...devis,
      referenceAffaire
    };

    return NextResponse.json(devisWithReference);
  } catch (error) {
    console.error('Erreur lors de la récupération du devis:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération du devis' },
      { status: 500 }
    );
  }
} 