import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from '../../../../lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session?.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Statistiques générales
    const [
      totalDemandes,
      demandesEnAttente,
      demandesAcceptees,
      demandesRefusees,
      totalFormations,
      totalDevis,
      devisEnAttente,
      devisValides,
      devisRefuses,
      totalContrats,
      contratsEnAttente,
      contratsValides,
      contratsRefuses,
      montantTotalDevis,
      montantTotalContrats
    ] = await Promise.all([
      prisma.demande.count(),
      prisma.demande.count({ where: { statut: 'EN_ATTENTE' } }),
      prisma.demande.count({ where: { statut: 'VALIDE' } }),
      prisma.demande.count({ where: { statut: 'REFUSE' } }),
      prisma.formation.count(),
      prisma.devis.count(),
      prisma.devis.count({ where: { statut: 'EN_ATTENTE' } }),
      prisma.devis.count({ where: { statut: 'VALIDE' } }),
      prisma.devis.count({ where: { statut: 'REFUSE' } }),
      prisma.contrat.count(),
      prisma.contrat.count({ where: { statut: 'EN_ATTENTE' } }),
      prisma.contrat.count({ where: { statut: 'VALIDE' } }),
      prisma.contrat.count({ where: { statut: 'REFUSE' } }),
      prisma.devis.aggregate({
        where: { statut: 'VALIDE' },
        _sum: {
          montant: true
        }
      }),
      prisma.contrat.findMany({
        where: { statut: 'VALIDE' },
        include: {
          devis: {
            select: {
              montant: true
            }
          }
        }
      })
    ]);

    // Formations les plus demandées par session
    const formationsPopulaires = await prisma.demande.groupBy({
      by: ['session'],
      _count: {
        session: true,
      },
      orderBy: {
        _count: {
          session: 'desc',
        },
      },
      take: 10,
    });

    const formationsDetails = await Promise.all(
      formationsPopulaires.map(async (formation) => {
        return {
          id: formation.session, // Utiliser la session comme ID
          titre: `Formation - ${formation.session}`, // Titre basé sur la session
          session: formation.session,
          count: formation._count.session,
        };
      })
    );

    // Évolution des demandes par mois
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const demandesParMois = await prisma.demande.groupBy({
      by: ['createdAt'],
      _count: {
        createdAt: true,
      },
      where: {
        createdAt: {
          gte: sixMonthsAgo,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const demandesParMoisFormatted = demandesParMois.map((item) => ({
      mois: new Date(item.createdAt).toLocaleDateString('fr-FR', {
        month: 'long',
        year: 'numeric',
      }),
      count: item._count.createdAt,
    }));

    // Statistiques des formulaires quotidiens
    const [
      totalFormulaires,
      formulairesActifs,
      totalReponses,
      reponsesAujourdhui,
      // Nouvelles statistiques (seulement les modèles qui existent)
      totalSignaturesInduction,
      signaturesInductionAujourdhui,
      totalSatisfactionClient,
      satisfactionClientAujourdhui,
      totalInvoices,
      invoicesPayees,
      invoicesPartielles,
      invoicesEnAttente
    ] = await Promise.all([
      prisma.formulairesQuotidiens.count(),
      prisma.formulairesQuotidiens.count({ where: { actif: true } }),
      prisma.reponseFormulaire.count(),
      prisma.reponseFormulaire.count({
        where: {
          dateReponse: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999)),
          },
        },
      }),
      // Signatures d'induction
      prisma.traineeInductionSignature.count(),
      prisma.traineeInductionSignature.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999)),
          },
        },
      }),
      // Satisfaction client
      prisma.customerSatisfactionResponse.count(),
      prisma.customerSatisfactionResponse.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999)),
          },
        },
      }),
      // Factures
      prisma.invoice.count(),
      prisma.invoice.count({ where: { paymentStatus: 'PAID' } }),
      prisma.invoice.count({ where: { paymentStatus: 'PARTIAL' } }),
      prisma.invoice.count({ where: { paymentStatus: 'PENDING' } }),
    ]);

    // Statistiques temporaires pour les modèles qui n'existent pas encore
    const totalDeclarationsMedicales = 0;
    const declarationsMedicalesAujourdhui = 0;
    const totalAttendanceSignatures = 0;
    const attendanceSignaturesAujourdhui = 0;

    // Calcul du score moyen et top performers
    const reponsesAvecScores = await prisma.reponseFormulaire.findMany({
      where: {
        score: { not: null },
        maxScore: { not: null },
      },
      select: {
        score: true,
        maxScore: true,
        stagiaire: {
          select: {
            nom: true,
            prenom: true,
          },
        },
      },
    });

    const moyenneScores = reponsesAvecScores.length > 0
      ? (reponsesAvecScores.reduce((sum, reponse) => sum + (reponse.score || 0), 0) / 
         reponsesAvecScores.reduce((sum, reponse) => sum + (reponse.maxScore || 0), 0)) * 100
      : 0;

    // Top performers (meilleurs scores)
    const topPerformers = reponsesAvecScores
      .map(reponse => {
        const nomComplet = `${reponse.stagiaire.prenom || ''} ${reponse.stagiaire.nom || ''}`.trim() || 'Stagiaire anonyme';
        return {
          utilisateurNom: nomComplet,
          score: reponse.score || 0,
          maxScore: reponse.maxScore || 1,
          percentage: ((reponse.score || 0) / (reponse.maxScore || 1)) * 100,
        };
      })
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 5);

    return NextResponse.json({
      totalDemandes,
      demandesEnAttente,
      demandesAcceptees,
      demandesRefusees,
      totalFormations,
      totalDevis,
      devisEnAttente,
      devisValides,
      devisRefuses,
      totalContrats,
      contratsEnAttente,
      contratsValides,
      contratsRefuses,
      montantTotalDevis: montantTotalDevis._sum?.montant || 0,
      montantTotalContrats: montantTotalContrats.reduce((sum, contrat) => sum + (contrat.devis?.montant || 0), 0),
      formationsPopulaires: formationsDetails,
      demandesParMois: demandesParMoisFormatted,
      formulairesQuotidiens: {
        totalFormulaires,
        formulairesActifs,
        totalReponses,
        reponsesAujourdhui,
        moyenneScores,
        topPerformers,
      },
      // Nouvelles statistiques complètes
      signaturesInduction: {
        total: totalSignaturesInduction,
        aujourdhui: signaturesInductionAujourdhui,
      },
      declarationsMedicales: {
        total: totalDeclarationsMedicales,
        aujourdhui: declarationsMedicalesAujourdhui,
      },
      satisfactionClient: {
        total: totalSatisfactionClient,
        aujourdhui: satisfactionClientAujourdhui,
      },
      attendanceSignatures: {
        total: totalAttendanceSignatures,
        aujourdhui: attendanceSignaturesAujourdhui,
      },
      factures: {
        total: totalInvoices,
        payees: invoicesPayees,
        partielles: invoicesPartielles,
        enAttente: invoicesEnAttente,
      },
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des statistiques' },
      { status: 500 }
    );
  }
} 