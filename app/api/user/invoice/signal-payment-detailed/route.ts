import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { amount, notes } = await request.json();

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

    // Vérifier s'il y a des factures en attente pour cet utilisateur
    const pendingInvoices = await prisma.invoice.findMany({
      where: {
        userId: user.id,
        paymentStatus: 'PENDING',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    let updatedInvoice = null;

    if (pendingInvoices.length > 0) {
      // Mettre à jour la facture la plus récente
      const invoice = pendingInvoices[0];
      const newStatus = amount >= invoice.amount ? 'PAID' : 'PARTIAL';
      
      updatedInvoice = await prisma.invoice.update({
        where: {
          id: invoice.id,
        },
        data: {
          paymentStatus: newStatus,
          paidAmount: amount,
          notes: notes ? `${invoice.notes || ''}\nPaiement signalé: ${amount}€ - ${notes}` : `${invoice.notes || ''}\nPaiement signalé: ${amount}€`,
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
