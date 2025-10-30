import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const contratId = searchParams.get('contratId');

    if (!contratId) {
      return NextResponse.json({ error: 'contratId requis' }, { status: 400 });
    }

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Récupérer le contrat avec le devis associé
    const contrat = await prisma.contrat.findUnique({
      where: { id: contratId },
      include: {
        devis: {
          select: {
            iban: true,
            bic: true,
            banque: true,
            intituleCompte: true,
          }
        }
      }
    });

    // Vérifier que le contrat appartient à l'utilisateur
    if (!contrat || contrat.userId !== user.id) {
      return NextResponse.json({ error: 'Contrat non trouvé ou accès non autorisé' }, { status: 403 });
    }

    // Si le contrat a un devis avec des informations bancaires, les utiliser
    if (contrat.devis && (contrat.devis.iban || contrat.devis.bic)) {
      return NextResponse.json({
        iban: contrat.devis.iban || null,
        bic: contrat.devis.bic || null,
        banque: contrat.devis.banque || null,
        intituleCompte: contrat.devis.intituleCompte || null,
      });
    }

    // Sinon, chercher dans les autres devis de l'utilisateur
    const devisAvecInfos = await prisma.devis.findFirst({
      where: {
        userId: user.id,
        iban: { not: null },
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        iban: true,
        bic: true,
        banque: true,
        intituleCompte: true,
      }
    });

    if (devisAvecInfos) {
      return NextResponse.json({
        iban: devisAvecInfos.iban || null,
        bic: devisAvecInfos.bic || null,
        banque: devisAvecInfos.banque || null,
        intituleCompte: devisAvecInfos.intituleCompte || null,
      });
    }

    // Si aucune information bancaire n'est trouvée, retourner null pour tous les champs
    return NextResponse.json({
      iban: null,
      bic: null,
      banque: null,
      intituleCompte: null,
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des informations bancaires:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

