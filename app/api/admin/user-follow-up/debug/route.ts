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

    const searchParams = req.nextUrl.searchParams;
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'email requis' }, { status: 400 });
    }

    // Trouver l'utilisateur par email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        nom: true,
        prenom: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Récupérer tous les contrats de l'utilisateur avec leurs détails
    const contrats = await prisma.contrat.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        statut: true,
        signature: true,
        adminSignature: true,
        devis: {
          select: {
            id: true,
            numero: true,
            statut: true,
          }
        },
        invoices: {
          select: {
            id: true,
            invoiceNumber: true,
          }
        }
      }
    });

    // Récupérer toutes les demandes de l'utilisateur avec leurs devis associés
    const demandes = await prisma.demande.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        statut: true,
        session: true,
        message: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Récupérer les devis associés à ces demandes
    const demandeIds = demandes.map(d => d.id);
    const devisForDemandes = demandeIds.length > 0
      ? await prisma.devis.findMany({
          where: { demandeId: { in: demandeIds } },
          select: {
            demandeId: true,
            id: true,
            numero: true,
            statut: true,
          }
        })
      : [];

    // Créer un index des devis par demandeId
    const devisByDemandeId: Record<string, typeof devisForDemandes[0]> = {};
    for (const devis of devisForDemandes) {
      devisByDemandeId[devis.demandeId] = devis;
    }

    // Analyser chaque contrat
    const contratAnalysis = contrats.map(contrat => {
      const isValide = contrat.statut === 'VALIDE';
      const hasUserSignature = contrat.signature && contrat.signature.trim() !== '';
      const hasAdminSignature = contrat.adminSignature && contrat.adminSignature.trim() !== '';
      const hasInvoice = contrat.invoices.length > 0;
      const shouldHaveInvoice = isValide && hasUserSignature && hasAdminSignature && !hasInvoice;

      return {
        contratId: contrat.id,
        statut: contrat.statut,
        hasUserSignature,
        hasAdminSignature,
        signatureLength: contrat.signature?.length || 0,
        adminSignatureLength: contrat.adminSignature?.length || 0,
        hasInvoice,
        invoiceCount: contrat.invoices.length,
        shouldHaveInvoice,
        devis: contrat.devis,
      };
    });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
      },
      contrats: contratAnalysis,
      demandes: demandes.map(d => {
        const devis = devisByDemandeId[d.id];
        return {
          id: d.id,
          statut: d.statut,
          session: d.session,
          message: d.message,
          createdAt: d.createdAt.toISOString(),
          hasDevis: !!devis,
          devis: devis ? {
            id: devis.id,
            numero: devis.numero,
            statut: devis.statut,
          } : null,
        };
      }),
      summary: {
        totalContrats: contrats.length,
        contratsValides: contrats.filter(c => c.statut === 'VALIDE').length,
        contratsWithUserSignature: contrats.filter(c => c.signature && c.signature.trim() !== '').length,
        contratsWithAdminSignature: contrats.filter(c => c.adminSignature && c.adminSignature.trim() !== '').length,
        contratsFullySigned: contrats.filter(c => 
          c.statut === 'VALIDE' && 
          c.signature && c.signature.trim() !== '' && 
          c.adminSignature && c.adminSignature.trim() !== ''
        ).length,
        contratsWithoutInvoice: contrats.filter(c => 
          c.statut === 'VALIDE' && 
          c.signature && c.signature.trim() !== '' && 
          c.adminSignature && c.adminSignature.trim() !== '' &&
          c.invoices.length === 0
        ).length,
        totalDemandes: demandes.length,
        demandesEnAttente: demandes.filter(d => d.statut === 'EN_ATTENTE').length,
        demandesValidees: demandes.filter(d => d.statut === 'VALIDE').length,
        demandesWithDevis: demandes.filter(d => !!devisByDemandeId[d.id]).length,
      }
    });
  } catch (error) {
    console.error('Erreur debug:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

