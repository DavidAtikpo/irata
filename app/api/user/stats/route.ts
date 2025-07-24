import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'USER') {
      return new NextResponse('Non autorisé', { status: 401 });
    }

    const userId = session.user.id;

    // Récupérer les statistiques de l'utilisateur
    const [demandesEnCours, demandesAcceptees, demandesRefusees, formationsSuivies] = await Promise.all([
      // Demandes en cours
      prisma.demande.count({
        where: {
          userId,
          statut: 'EN_ATTENTE'
        }
      }),
      // Demandes acceptées
      prisma.demande.count({
        where: {
          userId,
          statut: 'VALIDE'
        }
      }),
      // Demandes refusées
      prisma.demande.count({
        where: {
          userId,
          statut: 'REFUSE'
        }
      }),
      // Formations suivies (même que demandes acceptées)
      prisma.demande.count({
        where: {
          userId,
          statut: 'VALIDE'
        }
      })
    ]);

    return NextResponse.json({
      demandesEnCours,
      demandesAcceptees,
      demandesRefusees,
      formationsSuivies
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    return new NextResponse('Erreur serveur', { status: 500 });
  }
} 