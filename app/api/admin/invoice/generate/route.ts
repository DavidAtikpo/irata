import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from 'lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification admin
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'userId requis' }, { status: 400 });
    }

    // Vérifier que l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Trouver les devis validés avec contrats validés (et signés par admin) qui n'ont pas encore de facture
    const validDevis = await prisma.devis.findMany({
      where: {
        userId: user.id,
        statut: 'VALIDE', // Devis validés par l'admin
      },
      include: {
        contrat: {
          include: {
            invoices: true, // Vérifier s'il y a déjà des factures
          },
        },
      },
    });

    const generatedInvoices = [];

    // Créer des factures pour les devis validés avec contrats VALIDÉS et signés par l'utilisateur ET l'admin
    for (const devis of validDevis) {
      // REQUIS: Le contrat doit être VALIDE, signé par l'utilisateur ET signé par l'admin
      if (
        devis.contrat &&
        devis.contrat.statut === 'VALIDE' &&
        devis.contrat.signature &&
        devis.contrat.signature.trim() !== '' && // Signature utilisateur présente
        devis.contrat.adminSignature &&
        devis.contrat.adminSignature.trim() !== '' && // Signature admin présente
        devis.contrat.invoices.length === 0
      ) {
        // Créer une facture basée sur le devis
        const currentYear = new Date().getFullYear();
        const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
        const currentDay = String(new Date().getDate()).padStart(2, '0');
        const timestamp = Date.now();
        const invoiceNumber = `CI.FF ${currentYear}${currentMonth}${currentDay} ${String(timestamp).slice(-3).padStart(3, '0')}`;

        const invoice = await prisma.invoice.create({
          data: {
            invoiceNumber,
            amount: devis.montant, // Montant du devis
            paymentStatus: 'PENDING',
            notes: `Facture générée par l'administrateur pour le devis ${devis.numero}`,
            userId: user.id,
            contratId: devis.contrat.id,
          },
        });

        generatedInvoices.push({
          id: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          amount: invoice.amount,
          contratId: devis.contrat.id,
          devisNumber: devis.numero,
        });
      }
    }

    if (generatedInvoices.length === 0) {
      return NextResponse.json({
        message: 'Aucune facture générée. Vérifiez que l\'utilisateur a des contrats validés, signés par l\'utilisateur ET par l\'admin, sans facture.',
        invoices: [],
      });
    }

    return NextResponse.json({
      message: `${generatedInvoices.length} facture(s) générée(s) avec succès`,
      invoices: generatedInvoices,
    });
  } catch (error) {
    console.error('Erreur lors de la génération de facture:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

