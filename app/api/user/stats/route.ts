import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from 'lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session?.user?.role !== 'USER') {
      return new NextResponse('Non autorisé', { status: 401 });
    }

    const userId = session.user.id;

    // Récupérer les statistiques de l'utilisateur
    const [demandesEnCours, demandesAcceptees, demandesRefusees, formationsSuivies, recentesDemandes, devis, contrats] = await Promise.all([
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
      }),
      // Demandes récentes (5 dernières)
      prisma.demande.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          session: true,
          statut: true,
          createdAt: true
        }
      }),
      // Devis de l'utilisateur
      prisma.devis.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          numero: true,
          statut: true,
          montant: true,
          createdAt: true
        }
      }),
      // Contrats de l'utilisateur
      prisma.contrat.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          statut: true,
          createdAt: true,
          devis: {
            select: {
              numero: true,
              montant: true,
              dateFormation: true
            }
          }
        }
      })
    ]);

    // Calculer le montant total investi (somme des montants des devis validés)
    const totalMontant = devis
      .filter(devis => devis.statut === 'VALIDE')
      .reduce((total, devis) => total + devis.montant, 0);

    return NextResponse.json({
      demandesEnCours,
      demandesAcceptees,
      demandesRefusees,
      formationsSuivies,
      recentesDemandes,
      devis,
      contrats,
      totalMontant
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    return new NextResponse('Erreur serveur', { status: 500 });
  }
} 