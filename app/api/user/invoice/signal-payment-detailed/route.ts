import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { invoiceId, amount, notes } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Montant requis et doit être positif' }, { status: 400 });
    }

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    let updatedInvoice = null;

    // Si invoiceId est fourni, mettre à jour cette facture spécifique
    if (invoiceId) {
      const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
      });

      if (!invoice) {
        return NextResponse.json({ error: 'Facture non trouvée' }, { status: 404 });
      }

      if (invoice.userId !== user.id) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
      }

      // Calculer le nouveau montant payé (ajouter au montant déjà payé si partiel)
      const currentPaidAmount = invoice.paidAmount || 0;
      const newPaidAmount = currentPaidAmount + amount;
      const newStatus = newPaidAmount >= invoice.amount ? 'PAID' : 'PARTIAL';
      
      updatedInvoice = await prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          paymentStatus: newStatus,
          paidAmount: newPaidAmount,
          paymentMethod: 'VIREMENT',
          notes: notes ? `${invoice.notes || ''}\nPaiement virement: ${amount}€ - ${notes}` : `${invoice.notes || ''}\nPaiement virement: ${amount}€`,
        },
      });
    } else {
      // Sinon, chercher les factures en attente
      const pendingInvoices = await prisma.invoice.findMany({
        where: {
          userId: user.id,
          paymentStatus: { in: ['PENDING', 'PARTIAL'] },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (pendingInvoices.length > 0) {
        // Mettre à jour la facture la plus récente
        const invoice = pendingInvoices[0];
        const currentPaidAmount = invoice.paidAmount || 0;
        const newPaidAmount = currentPaidAmount + amount;
        const newStatus = newPaidAmount >= invoice.amount ? 'PAID' : 'PARTIAL';
        
        updatedInvoice = await prisma.invoice.update({
          where: {
            id: invoice.id,
          },
          data: {
            paymentStatus: newStatus,
            paidAmount: newPaidAmount,
            paymentMethod: 'VIREMENT',
            notes: notes ? `${invoice.notes || ''}\nPaiement virement: ${amount}€ - ${notes}` : `${invoice.notes || ''}\nPaiement virement: ${amount}€`,
          },
        });
      } else {
        // Créer une nouvelle facture pour ce paiement signalé
        const currentYear = new Date().getFullYear();
        const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
        const currentDay = String(new Date().getDate()).padStart(2, '0');
        const timestamp = Date.now();
        const invoiceNumber = `CI.FF ${currentYear}${currentMonth}${currentDay} ${String(timestamp).slice(-3).padStart(3, '0')}`;

        updatedInvoice = await prisma.invoice.create({
          data: {
            invoiceNumber,
            amount: amount,
            paymentStatus: 'PAID',
            paidAmount: amount,
            notes: notes ? `Paiement signalé par l'utilisateur: ${amount}€ - ${notes}` : `Paiement signalé par l'utilisateur: ${amount}€`,
            userId: user.id,
            contratId: 'temp', // ID temporaire
          },
        });
      }
    }

    if (!updatedInvoice) {
      return NextResponse.json({ error: 'Aucune facture à mettre à jour' }, { status: 400 });
    }

    // Créer une notification pour l'administrateur
    await prisma.notification.create({
      data: {
        userId: user.id, // L'admin recevra cette notification
        title: 'Paiement signalé par un utilisateur',
        message: `L'utilisateur ${user.nom} ${user.prenom} (${user.email}) a signalé un paiement de ${amount}€. Notes: ${notes || 'Aucune'}`,
        type: 'PAYMENT_SIGNAL',
        relatedId: updatedInvoice.id,
      },
    });

    return NextResponse.json({
      message: 'Paiement signalé avec succès',
      invoice: {
        id: updatedInvoice.id,
        invoiceNumber: updatedInvoice.invoiceNumber,
        amount: updatedInvoice.amount,
        paidAmount: updatedInvoice.paidAmount,
        status: updatedInvoice.paymentStatus,
      },
    });
  } catch (error) {
    console.error('Erreur lors du signalement du paiement:', error);
    return NextResponse.json(
      { error: 'Erreur lors du signalement du paiement' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
