import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from 'lib/prisma';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session?.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const statut = searchParams.get('statut');

    // Si on demande seulement le comptage pour les notifications
    if (statut === 'EN_ATTENTE') {
      const count = await prisma.demande.count({
        where: {
          statut: 'EN_ATTENTE'
        }
      });
      return NextResponse.json(count);
    }

    const demandes = await prisma.demande.findMany({
      include: {
        user: {
          select: {
            nom: true,
            prenom: true,
            email: true,
          },
        },
        devis: {
          select: {
            id: true,
            numero: true,
            statut: true,
          }
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Ajouter l'information hasDevis à chaque demande (relation 1-1)
    const demandesWithDevisInfo = demandes.map(demande => ({
      ...demande,
      hasDevis: Boolean(demande.devis),
      devisId: demande.devis?.id || null,
      devisNumero: demande.devis?.numero || null,
      devisStatut: demande.devis?.statut || null,
      devis: undefined // Supprimer l'objet devis complet pour ne renvoyer que les champs utiles ci-dessus
    }));

    return NextResponse.json(demandesWithDevisInfo);
  } catch (error) {
    console.error('Erreur lors de la récupération des demandes:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des demandes' },
      { status: 500 }
    );
  }
} 