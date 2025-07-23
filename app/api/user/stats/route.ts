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

    const demandesEnCours = prisma.demande.count({
      where: { userId, statut: 'EN_ATTENTE' },
    });

    const demandesAcceptees = prisma.demande.count({
      where: { userId, statut: 'VALIDE' },
    });

    const demandesRefusees = prisma.demande.count({
      where: { userId, statut: 'REFUSE' },
    });
    
    const formationsSuivies = prisma.contrat.count({
        where: { userId, statut: 'VALIDE' },
    });

    const recentesDemandes = prisma.demande.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    const [
      statsEnCours,
      statsAcceptees,
      statsRefusees,
      statsFormations,
      demandes,
    ] = await Promise.all([
      demandesEnCours,
      demandesAcceptees,
      demandesRefusees,
      formationsSuivies,
      recentesDemandes,
    ]);

    return NextResponse.json({
      demandesEnCours: statsEnCours,
      demandesAcceptees: statsAcceptees,
      demandesRefusees: statsRefusees,
      formationsSuivies: statsFormations,
      recentesDemandes: demandes,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques de l'utilisateur:", error);
    return new NextResponse('Erreur serveur interne', { status: 500 });
  }
} 