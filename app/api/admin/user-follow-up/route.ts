import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from 'lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Optional filters
    const searchParams = req.nextUrl.searchParams;
    const onlyPending = searchParams.get('onlyPending') === 'true';
    const invoiceFilter = searchParams.get('invoiceFilter'); // 'total_manuel', 'partiel_manuel', 'total_stripe', 'partiel_stripe', 'partiel_virement', 'no_invoice'

    // Fetch users with key follow-up signals
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        nom: true,
        prenom: true,
        phone: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    const userIds = users.map(u => u.id);
    if (userIds.length === 0) {
      return NextResponse.json([]);
    }

    // Batch fetch related entities
    const [devisByUser, contratsByUser, contratsDetails, invoices, demandesByUser] = await Promise.all([
      prisma.devis.groupBy({
        by: ['userId', 'statut'],
        where: { userId: { in: userIds } },
        _count: { _all: true }
      }),
      prisma.contrat.groupBy({
        by: ['userId', 'statut'],
        where: { userId: { in: userIds } },
        _count: { _all: true }
      }),
      // Récupérer les détails des contrats pour vérifier les signatures
      prisma.contrat.findMany({
        where: { userId: { in: userIds } },
        select: {
          id: true,
          userId: true,
          statut: true,
          signature: true,
          adminSignature: true,
        }
      }),
      // Récupérer les factures avec tous les détails nécessaires
      prisma.invoice.findMany({
        where: { userId: { in: userIds } },
        select: {
          userId: true,
          contratId: true,
          invoiceNumber: true,
          amount: true,
          paymentStatus: true,
          paidAmount: true,
          paymentMethod: true,
          notes: true,
        }
      }),
      prisma.demande.groupBy({
        by: ['userId', 'statut'],
        where: { userId: { in: userIds } },
        _count: { _all: true }
      })
    ]);

    const buildIndex = <T extends { userId: string }>(rows: T[]) => {
      const idx: Record<string, T[]> = {} as any;
      for (const r of rows) {
        (idx[r.userId] ||= []).push(r);
      }
      return idx;
    };

    const devisIdx = buildIndex(devisByUser as any);
    const contratsIdx = buildIndex(contratsByUser as any);
    const contratsDetailsByUserId: Record<string, typeof contratsDetails> = {};
    for (const c of contratsDetails) {
      (contratsDetailsByUserId[c.userId] ||= []).push(c);
    }
    const invoicesByUserId: Record<string, typeof invoices> = {};
    for (const inv of invoices) {
      (invoicesByUserId[inv.userId] ||= []).push(inv);
    }
    const demandesIdx = buildIndex(demandesByUser as any);

    const results = users.map(u => {
      const devis = (devisIdx[u.id] || []) as Array<{ userId: string; statut: string; _count: { _all: number } }>;
      const contrats = (contratsIdx[u.id] || []) as Array<{ userId: string; statut: string; _count: { _all: number } }>;
      const userInvoices = invoicesByUserId[u.id] || [];
      const demandes = (demandesIdx[u.id] || []) as Array<{ userId: string; statut: string; _count: { _all: number } }>;

      const devisPending = devis.find(d => d.statut === 'EN_ATTENTE')?._count._all || 0;
      const devisValides = devis.find(d => d.statut === 'VALIDE')?._count._all || 0;

      const contratsPending = contrats.find(c => c.statut === 'EN_ATTENTE')?._count._all || 0;
      const contratsSignes = contrats.find(c => c.statut === 'SIGNE')?._count._all || 0;
      const contratsValides = contrats.find(c => c.statut === 'VALIDE')?._count._all || 0;

      // Traitement des factures selon les nouvelles règles
      // PAID = tout payé, PARTIAL = payé partiellement
      const invoicesPaid = userInvoices.filter(inv => inv.paymentStatus === 'PAID').length;
      const invoicesPartial = userInvoices.filter(inv => inv.paymentStatus === 'PARTIAL').length;
      const invoicesUnpaid = userInvoices.filter(inv => 
        inv.paymentStatus !== 'PAID' && inv.paymentStatus !== 'PARTIAL'
      ).length;
      
      // Factures PAYÉES validées manuellement par admin (paymentMethod null et status PAID)
      const invoicesPaidManualValidated = userInvoices.filter(inv => 
        inv.paymentMethod === null && inv.paymentStatus === 'PAID'
      ).length;
      
      // Factures PAYÉES via Stripe (paymentMethod = BANK_TRANSFER et status PAID)
      const invoicesPaidStripe = userInvoices.filter(inv => 
        inv.paymentMethod === 'BANK_TRANSFER' && inv.paymentStatus === 'PAID'
      ).length;
      
      // Factures PARTIELLES validées manuellement par admin (paymentMethod null et status PARTIAL)
      const invoicesPartialManualValidated = userInvoices.filter(inv => 
        inv.paymentMethod === null && inv.paymentStatus === 'PARTIAL'
      ).length;
      
      // Factures PARTIELLES via Stripe (paymentMethod = BANK_TRANSFER et status PARTIAL)
      const invoicesPartialStripe = userInvoices.filter(inv => 
        inv.paymentMethod === 'BANK_TRANSFER' && inv.paymentStatus === 'PARTIAL'
      ).length;
      
      // Factures PARTIELLES via Virement (paymentMethod = VIREMENT et status PARTIAL)
      const invoicesPartialVirement = userInvoices.filter(inv => 
        inv.paymentMethod === 'VIREMENT' && inv.paymentStatus === 'PARTIAL'
      ).length;
      
      // Vérifier si l'utilisateur a un contrat VALIDE, signé par l'utilisateur ET par l'admin, sans facture
      const userContratsDetails = contratsDetailsByUserId[u.id] || [];
      
      // Créer un Set des IDs de contrats qui ont déjà une facture
      const contratIdsWithInvoices = new Set<string>();
      for (const inv of userInvoices) {
        if (inv.contratId) {
          contratIdsWithInvoices.add(inv.contratId);
        }
      }
      
      // Trouver les contrats complètement signés qui n'ont pas de facture
      const fullySignedContratsWithoutInvoice = userContratsDetails.filter(contrat => {
        const isValide = contrat.statut === 'VALIDE';
        const hasUserSignature = contrat.signature && contrat.signature.trim() !== '';
        const hasAdminSignature = contrat.adminSignature && contrat.adminSignature.trim() !== '';
        const hasNoInvoiceForThisContract = !contratIdsWithInvoices.has(contrat.id);
        
        return isValide && hasUserSignature && hasAdminSignature && hasNoInvoiceForThisContract;
      });
      
      const hasNoInvoice = fullySignedContratsWithoutInvoice.length > 0;

      const demandesEnAttente = demandes.find(d => d.statut === 'EN_ATTENTE')?._count._all || 0;
      const demandesValidees = demandes.find(d => d.statut === 'VALIDE')?._count._all || 0;

      const pendingFlags = {
        devisNonValides: devisPending > 0,
        contratNonSigne: contratsPending > 0 && contratsSignes === 0,
        contratNonValide: contratsValides === 0 && (contratsPending > 0 || contratsSignes > 0),
        facturesImpayees: invoicesUnpaid > 0,
        demandeEnAttente: demandesEnAttente > 0,
        factureNonGeneree: hasNoInvoice,
      };

      const hasPending = Object.values(pendingFlags).some(Boolean);

      // Vérifier si l'utilisateur correspond au filtre de facture
      let matchesInvoiceFilter = true;
      if (invoiceFilter) {
        switch (invoiceFilter) {
          case 'total_manuel':
            matchesInvoiceFilter = invoicesPaidManualValidated > 0;
            break;
          case 'partiel_manuel':
            matchesInvoiceFilter = invoicesPartialManualValidated > 0;
            break;
          case 'total_stripe':
            matchesInvoiceFilter = invoicesPaidStripe > 0;
            break;
          case 'partiel_stripe':
            matchesInvoiceFilter = invoicesPartialStripe > 0;
            break;
          case 'partiel_virement':
            matchesInvoiceFilter = invoicesPartialVirement > 0;
            break;
          case 'no_invoice':
            matchesInvoiceFilter = hasNoInvoice;
            break;
          default:
            matchesInvoiceFilter = true;
        }
      }

      return {
        user: { id: u.id, email: u.email, nom: u.nom, prenom: u.prenom, phone: u.phone },
        stats: {
          devisPending,
          devisValides,
          contratsPending,
          contratsSignes,
          contratsValides,
          invoicesUnpaid,
          invoicesPaid,
          invoicesPartial,
          invoicesPaidManualValidated,
          invoicesPaidStripe,
          invoicesPartialManualValidated,
          invoicesPartialStripe,
          invoicesPartialVirement,
          hasNoInvoice,
          demandesEnAttente,
          demandesValidees,
        },
        invoices: userInvoices.map(inv => ({
          invoiceNumber: inv.invoiceNumber,
          amount: inv.amount,
          paymentStatus: inv.paymentStatus,
          paidAmount: inv.paidAmount,
          paymentMethod: inv.paymentMethod,
          notes: inv.notes,
        })),
        pending: pendingFlags,
        hasPending,
        matchesInvoiceFilter,
      };
    }).filter(row => {
      // Filtre seulement les actions en attente
      if (onlyPending && !row.hasPending) return false;
      // Filtre par type de facture
      if (invoiceFilter && !row.matchesInvoiceFilter) return false;
      return true;
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error('Erreur agrégation suivi utilisateurs:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}


