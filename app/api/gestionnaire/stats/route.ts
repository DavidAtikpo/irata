import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'GESTIONNAIRE') {
      return new NextResponse('Non autorisé', { status: 401 });
    }

    // Récupérer les statistiques du gestionnaire
    const [demandesEnAttente, devisEnCours, formationsEnCours, contratsEnAttente] = await Promise.all([
      // Demandes en attente
      prisma.demande.count({
        where: {
          statut: 'EN_ATTENTE'
        }
      }),
      // Devis en cours
      prisma.devis.count({
        where: {
          statut: 'EN_ATTENTE'
        }
      }),
      // Formations en cours
      prisma.formation.count({
        where: {}
      }),
      // Contrats en attente
      prisma.contrat.count({
        where: {
          statut: 'EN_ATTENTE'
        }
      })
    ]);

    return NextResponse.json({
      demandesEnAttente,
      devisEnCours,
      formationsEnCours,
      contratsEnAttente
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    return new NextResponse('Erreur serveur', { status: 500 });
  }
} 