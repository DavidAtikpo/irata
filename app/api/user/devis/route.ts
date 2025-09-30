import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from 'lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const devis = await prisma.devis.findMany({
      where: {
        userId: session?.user?.id
      },
      include: {
        demande: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Add referenceAffaire to each devis using raw SQL
    const devisWithReferences = await Promise.all(
      devis.map(async (devis) => {
        const referenceAffaireResult = await prisma.$queryRaw`
          SELECT "referenceAffaire" FROM "webirata"."Devis" WHERE id = ${devis.id}
        `;
        const referenceAffaire = (referenceAffaireResult as any[])[0]?.referenceAffaire || null;
        
        return {
          ...devis,
          referenceAffaire
        };
      })
    );

    return NextResponse.json(devisWithReferences);
  } catch (error) {
    console.error('Erreur lors de la récupération des devis:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des devis' },
      { status: 500 }
    );
  }
} 