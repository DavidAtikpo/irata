import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Helper function pour construire les filtres de session
function buildSessionFilters(sessionFilter: string | null) {
  if (!sessionFilter) return {};
  
  return {
    // Filtres pour les modèles avec champ session direct
    session: sessionFilter,
    // Filtres pour les modèles avec sessionId
    sessionId: sessionFilter,
    // Filtres pour les modèles liés via relations
    demande: { session: sessionFilter },
    formulaire: { session: sessionFilter },
    induction: { sessionId: sessionFilter },
    nonConformite: { sessionId: sessionFilter }
  };
}

// GET /api/admin/rapports - Récupérer les statistiques et rapports (admin)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'GESTIONNAIRE')) {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Récupérer le paramètre de session depuis l'URL
    const { searchParams } = new URL(req.url);
    const sessionFilter = searchParams.get('session');

    // Récupérer les statistiques générales de tous les modèles
    const [
      // Utilisateurs
      totalUsers,
      totalAdmins,
      totalGestionnaires,
      usersParRole,
      
      // Formations et demandes
      totalFormations,
      totalDemandes,
      totalDevis,
      totalContrats,
      demandesParStatut,
      devisParStatut,
      contratsParStatut,
      
      // Formulaires et inspections
      totalFormulaires,
      totalReponses,
      totalInspections,
      inspectionsParStatut,
      
      // Suivi des stagiaires
      totalTrainees,
      totalSessions,
      totalFollowUps,
      totalProgress,
      totalSignatures,
      
      // Satisfaction et contributions
      totalContributions,
      totalSatisfaction,
      satisfactionMoyenne,
      
      // Non-conformités et actions correctives
      totalNonConformites,
      totalActionsCorrectives,
      nonConformitesParType,
      nonConformitesParGravite,
      nonConformitesParStatut,
      actionsCorrectivesParStatut,
      actionsCorrectivesParPriorite,
      nonConformitesParMois,
      actionsCorrectivesParMois,
      topDetecteurs,
      topResponsables,
      tauxResolution,
      delaiMoyenResolution,
      
      // Documents et notifications
      totalDocuments,
      totalNotifications,
      notificationsParType,
      
      // Sessions et inscriptions
      sessionsPopulaires,
      inscriptionsParMois,
      
      // Factures
      totalInvoices,
      invoicesParStatut,
      chiffreAffairesTotal
    ] = await Promise.all([
      // === UTILISATEURS ===
      // Total utilisateurs
      prisma.user.count({
        where: { role: 'USER' }
      }),
      
      // Total admins
      prisma.user.count({
        where: { role: 'ADMIN' }
      }),
      
      // Total gestionnaires
      prisma.user.count({
        where: { role: 'GESTIONNAIRE' }
      }),
      
      // Utilisateurs par rôle
      prisma.user.groupBy({
        by: ['role'],
        _count: { role: true }
      }),

      // === FORMATIONS ET DEMANDES ===
      // Total formations
      prisma.formation.count(),
      
      // Total demandes (filtré par session si spécifié)
      prisma.demande.count({
        where: sessionFilter ? { session: sessionFilter } : {}
      }),
      
      // Total devis (filtré par session via demande)
      prisma.devis.count({
        where: sessionFilter ? { demande: { session: sessionFilter } } : {}
      }),
      
      // Total contrats (filtré par session via devis -> demande)
      prisma.contrat.count({
        where: sessionFilter ? { devis: { demande: { session: sessionFilter } } } : {}
      }),
      
      // Demandes par statut (filtré par session)
      prisma.demande.groupBy({
        by: ['statut'],
        _count: { statut: true },
        where: sessionFilter ? { session: sessionFilter } : {}
      }),
      
      // Devis par statut (filtré par session via demande)
      prisma.devis.groupBy({
        by: ['statut'],
        _count: { statut: true },
        where: sessionFilter ? { demande: { session: sessionFilter } } : {}
      }),
      
      // Contrats (pas de statut dans le modèle)
      prisma.contrat.count(),

      // === FORMULAIRES ET INSPECTIONS ===
      // Total formulaires (filtré par session)
      prisma.formulairesQuotidiens.count({
        where: sessionFilter ? { session: sessionFilter } : {}
      }),
      
      // Total réponses (filtré par session via formulaire)
      prisma.reponseFormulaire.count({
        where: sessionFilter ? { formulaire: { session: sessionFilter } } : {}
      }),
      
      // Total inspections
      prisma.equipmentInspection.count(),
      
      // Inspections par statut
      prisma.equipmentInspection.groupBy({
        by: ['status'],
        _count: { status: true }
      }),

      // === SUIVI DES STAGIAIRES ===
      // Total stagiaires (utilisateurs avec des sessions de formation)
      prisma.user.count({
        where: {
          trainingSessions: {
            some: sessionFilter ? { id: sessionFilter } : {}
          }
        }
      }),
      
      // Total sessions (filtré par session si spécifié)
      prisma.trainingSession.count({
        where: sessionFilter ? { id: sessionFilter } : {}
      }),
      
      // Total follow-ups (filtré par session via signatures)
      prisma.traineeFollowUp.count({
        where: sessionFilter ? { signatures: { some: { sessionId: sessionFilter } } } : {}
      }),
      
      // Total progress (filtré par session via follow-up -> signatures)
      prisma.traineeProgress.count({
        where: sessionFilter ? { followUp: { signatures: { some: { sessionId: sessionFilter } } } } : {}
      }),
      
      // Total signatures (filtré par session)
      prisma.traineeSignature.count({
        where: sessionFilter ? { sessionId: sessionFilter } : {}
      }),

      // === SATISFACTION ET CONTRIBUTIONS ===
      // Total contributions
      prisma.contribution.count(),
      
      // Total satisfaction (filtré par session)
      prisma.customerSatisfactionResponse.count({
        where: sessionFilter ? { session: sessionFilter } : {}
      }),
      
      // Satisfaction moyenne (calculée depuis le JSON items, filtré par session)
      sessionFilter 
        ? prisma.$queryRaw`
            SELECT AVG(
              CAST(items->>'score' AS DECIMAL)
            ) as moyenne
            FROM "webirata"."CustomerSatisfactionResponse"
            WHERE items->>'score' IS NOT NULL AND session = ${sessionFilter}
          `
        : prisma.$queryRaw`
            SELECT AVG(
              CAST(items->>'score' AS DECIMAL)
            ) as moyenne
            FROM "webirata"."CustomerSatisfactionResponse"
            WHERE items->>'score' IS NOT NULL
          `,

      // === NON-CONFORMITÉS ET ACTIONS CORRECTIVES ===
      // Total non-conformités (filtré par session)
      prisma.nonConformite.count({
        where: sessionFilter ? { sessionId: sessionFilter } : {}
      }),
      
      // Total actions correctives (filtré par session via non-conformité)
      prisma.actionCorrective.count({
        where: sessionFilter ? { nonConformite: { sessionId: sessionFilter } } : {}
      }),

      // Non-conformités par type (filtré par session)
      prisma.nonConformite.groupBy({
        by: ['type'],
        _count: { type: true },
        where: sessionFilter ? { sessionId: sessionFilter } : {}
      }),
      
      // Non-conformités par gravité (filtré par session)
      prisma.nonConformite.groupBy({
        by: ['gravite'],
        _count: { gravite: true },
        where: sessionFilter ? { sessionId: sessionFilter } : {}
      }),
      
      // Non-conformités par statut (filtré par session)
      prisma.nonConformite.groupBy({
        by: ['statut'],
        _count: { statut: true },
        where: sessionFilter ? { sessionId: sessionFilter } : {}
      }),
      
      // Actions correctives par statut (filtré par session via non-conformité)
      prisma.actionCorrective.groupBy({
        by: ['statut'],
        _count: { statut: true },
        where: sessionFilter ? { nonConformite: { sessionId: sessionFilter } } : {}
      }),
      
      // Actions correctives par priorité (filtré par session via non-conformité)
      prisma.actionCorrective.groupBy({
        by: ['priorite'],
        _count: { priorite: true },
        where: sessionFilter ? { nonConformite: { sessionId: sessionFilter } } : {}
      }),

      // Non-conformités par mois (6 derniers mois, filtré par session)
      sessionFilter 
        ? prisma.$queryRaw`
            SELECT 
              DATE_TRUNC('month', "createdAt") as mois,
              COUNT(*) as count
            FROM "webirata"."NonConformite"
            WHERE "createdAt" >= NOW() - INTERVAL '6 months' AND "sessionId" = ${sessionFilter}
            GROUP BY DATE_TRUNC('month', "createdAt")
            ORDER BY mois DESC
          `
        : prisma.$queryRaw`
            SELECT 
              DATE_TRUNC('month', "createdAt") as mois,
              COUNT(*) as count
            FROM "webirata"."NonConformite"
            WHERE "createdAt" >= NOW() - INTERVAL '6 months'
            GROUP BY DATE_TRUNC('month', "createdAt")
            ORDER BY mois DESC
          `,
      
      // Actions correctives par mois (6 derniers mois, filtré par session)
      sessionFilter 
        ? prisma.$queryRaw`
            SELECT 
              DATE_TRUNC('month', ac."createdAt") as mois,
              COUNT(*) as count
            FROM "webirata"."ActionCorrective" ac
            JOIN "webirata"."NonConformite" nc ON ac."nonConformiteId" = nc.id
            WHERE ac."createdAt" >= NOW() - INTERVAL '6 months' AND nc."sessionId" = ${sessionFilter}
            GROUP BY DATE_TRUNC('month', ac."createdAt")
            ORDER BY mois DESC
          `
        : prisma.$queryRaw`
            SELECT 
              DATE_TRUNC('month', "createdAt") as mois,
              COUNT(*) as count
            FROM "webirata"."ActionCorrective"
            WHERE "createdAt" >= NOW() - INTERVAL '6 months'
            GROUP BY DATE_TRUNC('month', "createdAt")
            ORDER BY mois DESC
          `,

      // Top 5 détecteurs de non-conformités (filtré par session)
      prisma.user.findMany({
        where: {
          nonConformitesDetectees: {
            some: sessionFilter ? { sessionId: sessionFilter } : {}
          }
        },
        select: {
          id: true,
          nom: true,
          prenom: true,
          email: true,
          _count: {
            select: {
              nonConformitesDetectees: sessionFilter ? { where: { sessionId: sessionFilter } } : true
            }
          }
        },
        orderBy: {
          nonConformitesDetectees: {
            _count: 'desc'
          }
        },
        take: 5
      }),
      
      // Top 5 responsables d'actions correctives (filtré par session)
      prisma.user.findMany({
        where: {
          actionsCorrectivesResponsable: {
            some: sessionFilter ? { nonConformite: { sessionId: sessionFilter } } : {}
          }
        },
        select: {
          id: true,
          nom: true,
          prenom: true,
          email: true,
          _count: {
            select: {
              actionsCorrectivesResponsable: sessionFilter ? { where: { nonConformite: { sessionId: sessionFilter } } } : true
            }
          }
        },
        orderBy: {
          actionsCorrectivesResponsable: {
            _count: 'desc'
          }
        },
        take: 5
      }),

      // Taux de résolution (non-conformités avec actions correctives terminées, filtré par session)
      prisma.nonConformite.count({
        where: {
          ...(sessionFilter ? { sessionId: sessionFilter } : {}),
          actionsCorrectives: {
            some: {
              statut: 'TERMINEE'
            }
          }
        }
      }),
      
      // Délai moyen de résolution (filtré par session)
      sessionFilter 
        ? prisma.$queryRaw`
            SELECT AVG(
              EXTRACT(EPOCH FROM (ac."dateRealisation" - nc."createdAt")) / 86400
            ) as delai_moyen_jours
            FROM "webirata"."NonConformite" nc
            JOIN "webirata"."ActionCorrective" ac ON nc.id = ac."nonConformiteId"
            WHERE ac."dateRealisation" IS NOT NULL 
              AND ac.statut = 'TERMINEE'
              AND nc."sessionId" = ${sessionFilter}
          `
        : prisma.$queryRaw`
            SELECT AVG(
              EXTRACT(EPOCH FROM (ac."dateRealisation" - nc."createdAt")) / 86400
            ) as delai_moyen_jours
            FROM "webirata"."NonConformite" nc
            JOIN "webirata"."ActionCorrective" ac ON nc.id = ac."nonConformiteId"
            WHERE ac."dateRealisation" IS NOT NULL 
              AND ac.statut = 'TERMINEE'
          `,

      // === DOCUMENTS ET NOTIFICATIONS ===
      // Total documents
      prisma.document.count(),
      
      // Total notifications
      prisma.notification.count(),
      
      // Notifications par type
      prisma.notification.groupBy({
        by: ['type'],
        _count: { type: true }
      }),

      // === SESSIONS ET INSCRIPTIONS ===
      // Sessions les plus demandées (par nombre de demandes)
      prisma.demande.groupBy({
        by: ['session'],
        _count: { session: true },
        orderBy: { _count: { session: 'desc' } },
        take: 10
      }),
      
      // Évolution des inscriptions par mois (6 derniers mois)
      prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('month', "createdAt") as mois,
          session,
          COUNT(*) as count
        FROM "webirata"."Demande"
        WHERE "createdAt" >= NOW() - INTERVAL '6 months'
        GROUP BY DATE_TRUNC('month', "createdAt"), session
        ORDER BY mois DESC, count DESC
      `,

      // === FACTURES ===
      // Total factures (filtré par session via contrat -> devis -> demande)
      prisma.invoice.count({
        where: sessionFilter ? { contrat: { devis: { demande: { session: sessionFilter } } } } : {}
      }),
      
      // Factures par statut (filtré par session via contrat -> devis -> demande)
      prisma.invoice.groupBy({
        by: ['paymentStatus'],
        _count: { paymentStatus: true },
        where: sessionFilter ? { contrat: { devis: { demande: { session: sessionFilter } } } } : {}
      }),
      
      // Chiffre d'affaires total (filtré par session)
      sessionFilter 
        ? prisma.$queryRaw`
            SELECT SUM(i.amount) as total
            FROM "webirata"."Invoice" i
            JOIN "webirata"."Contrat" c ON i."contratId" = c.id
            JOIN "webirata"."Devis" d ON c."devisId" = d.id
            JOIN "webirata"."Demande" dem ON d."demandeId" = dem.id
            WHERE i."paymentStatus" = 'PAID' AND dem.session = ${sessionFilter}
          `
        : prisma.$queryRaw`
            SELECT SUM(amount) as total
            FROM "webirata"."Invoice"
            WHERE "paymentStatus" = 'PAID'
          `
    ]);

    // Calculer le taux de résolution
    const tauxResolutionCalcule = totalNonConformites > 0 
      ? Math.round((tauxResolution / totalNonConformites) * 100) 
      : 0;

    // Calculer le délai moyen de résolution
    const delaiMoyen = delaiMoyenResolution && (delaiMoyenResolution as any)[0] && (delaiMoyenResolution as any)[0].delai_moyen_jours
      ? Math.round(parseFloat((delaiMoyenResolution as any)[0].delai_moyen_jours))
      : 0;

    // Calculer la satisfaction moyenne
    const satisfactionMoyenneCalculee = satisfactionMoyenne && (satisfactionMoyenne as any)[0] && (satisfactionMoyenne as any)[0].moyenne
      ? Math.round(parseFloat((satisfactionMoyenne as any)[0].moyenne) * 10) / 10
      : 0;

    // Calculer le chiffre d'affaires total
    const chiffreAffairesTotalCalcule = chiffreAffairesTotal && (chiffreAffairesTotal as any)[0] && (chiffreAffairesTotal as any)[0].total
      ? parseFloat((chiffreAffairesTotal as any)[0].total)
      : 0;

    return NextResponse.json({
      // === MÉTRIQUES PRINCIPALES ===
      metriques: {
        // Utilisateurs
        totalUsers,
        totalAdmins,
        totalGestionnaires,
        
        // Formations et demandes
        totalFormations,
        totalDemandes,
        totalDevis,
        totalContrats,
        
        // Formulaires et inspections
        totalFormulaires,
        totalReponses,
        totalInspections,
        
        // Suivi des stagiaires
        totalTrainees,
        totalSessions,
        totalFollowUps,
        totalProgress,
        totalSignatures,
        
        // Satisfaction et contributions
        totalContributions,
        totalSatisfaction,
        satisfactionMoyenne: satisfactionMoyenneCalculee,
        
        // Non-conformités et actions correctives
        totalNonConformites,
        totalActionsCorrectives,
        tauxResolution: tauxResolutionCalcule,
        delaiMoyenResolution: delaiMoyen,
        
        // Documents et notifications
        totalDocuments,
        totalNotifications,
        
        // Factures
        totalInvoices,
        chiffreAffairesTotal: chiffreAffairesTotalCalcule
      },

      // === RÉPARTITIONS ===
      repartitions: {
        // Utilisateurs
        usersParRole: (usersParRole || []).map(item => ({
          role: item.role,
          count: item._count?.role || 0
        })),
        
        // Formations et demandes
        demandesParStatut: (demandesParStatut || []).map(item => ({
          statut: item.statut,
          count: item._count?.statut || 0
        })),
        devisParStatut: (devisParStatut || []).map(item => ({
          statut: item.statut,
          count: item._count?.statut || 0
        })),
        
        // Inspections
        inspectionsParStatut: (inspectionsParStatut || []).map(item => ({
          statut: item.status,
          count: item._count?.status || 0
        })),
        
        // Non-conformités
        nonConformitesParType: (nonConformitesParType || []).map(item => ({
          type: item.type,
          count: item._count?.type || 0
        })),
        nonConformitesParGravite: (nonConformitesParGravite || []).map(item => ({
          gravite: item.gravite,
          count: item._count?.gravite || 0
        })),
        nonConformitesParStatut: (nonConformitesParStatut || []).map(item => ({
          statut: item.statut,
          count: item._count?.statut || 0
        })),
        
        // Actions correctives
        actionsCorrectivesParStatut: (actionsCorrectivesParStatut || []).map(item => ({
          statut: item.statut,
          count: item._count?.statut || 0
        })),
        actionsCorrectivesParPriorite: (actionsCorrectivesParPriorite || []).map(item => ({
          priorite: item.priorite,
          count: item._count?.priorite || 0
        })),
        
        // Notifications
        notificationsParType: (notificationsParType || []).map(item => ({
          type: item.type,
          count: item._count?.type || 0
        })),
        
        // Factures
        invoicesParStatut: (invoicesParStatut || []).map(item => ({
          statut: item.paymentStatus,
          count: item._count?.paymentStatus || 0
        }))
      },

      // === ÉVOLUTIONS TEMPORELLES ===
      evolutions: {
        nonConformitesParMois: ((nonConformitesParMois as any) || []).map((item: any) => ({
          mois: item.mois,
          count: parseInt(item.count)
        })),
        actionsCorrectivesParMois: ((actionsCorrectivesParMois as any) || []).map((item: any) => ({
          mois: item.mois,
          count: parseInt(item.count)
        })),
        inscriptionsParMois: ((inscriptionsParMois as any) || []).map((item: any) => ({
          mois: item.mois,
          session: item.session,
          count: parseInt(item.count)
        }))
      },

      // === TOP UTILISATEURS ===
      topUtilisateurs: {
        detecteurs: (topDetecteurs || []).map(user => ({
          id: user.id,
          nom: user.nom || user.email,
          prenom: user.prenom,
          email: user.email,
          count: user._count?.nonConformitesDetectees || 0
        })),
        responsables: (topResponsables || []).map(user => ({
          id: user.id,
          nom: user.nom || user.email,
          prenom: user.prenom,
          email: user.email,
          count: user._count?.actionsCorrectivesResponsable || 0
        }))
      },

      // === SESSIONS POPULAIRES ===
      sessionsPopulaires: (sessionsPopulaires || []).map(item => ({
        session: item.session,
        count: item._count?.session || 0
      }))
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des rapports:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des rapports' },
      { status: 500 }
    );
  }
}
