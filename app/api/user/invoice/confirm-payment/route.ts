import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { sendInvoicePaymentConfirmationEmail } from '@/lib/email';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { paymentIntentId, invoiceId, amount } = await request.json();

    if (!paymentIntentId || !invoiceId) {
      return NextResponse.json({ error: 'PaymentIntentId et InvoiceId requis' }, { status: 400 });
    }

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Récupérer d'abord la facture pour obtenir le montant
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        userId: user.id, // S'assurer que la facture appartient à l'utilisateur
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Facture non trouvée' }, { status: 404 });
    }

    // Calculer le nouveau montant payé
    const currentPaidAmount = invoice.paidAmount || 0;
    const paymentAmount = amount || invoice.amount; // Utiliser le montant fourni ou le montant de la facture
    const newPaidAmount = currentPaidAmount + paymentAmount;
    
    // Déterminer le nouveau statut
    const newPaymentStatus = newPaidAmount >= invoice.amount ? 'PAID' : 'PARTIAL';

    // Mettre à jour la facture avec le statut de paiement
    const updatedInvoice = await prisma.invoice.update({
      where: {
        id: invoiceId,
        userId: user.id, // S'assurer que la facture appartient à l'utilisateur
      },
      data: {
        paymentStatus: newPaymentStatus,
        paidAmount: newPaidAmount,
        paymentMethod: 'BANK_TRANSFER', // Stripe traite les paiements par carte comme des virements bancaires
        notes: `Paiement confirmé via Stripe - PaymentIntent: ${paymentIntentId}. Montant payé: ${paymentAmount}€`,
      },
    });

    // Créer une notification pour l'administrateur
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: 'Paiement confirmé',
        message: `L'utilisateur ${user.nom} ${user.prenom} (${user.email}) a effectué un paiement de ${updatedInvoice.amount}€ pour la facture ${updatedInvoice.invoiceNumber}. PaymentIntent: ${paymentIntentId}`,
        type: 'PAYMENT_CONFIRMED',
        relatedId: updatedInvoice.id,
      },
    });

    // Envoyer un email de confirmation à l'utilisateur
    try {
      await sendInvoicePaymentConfirmationEmail(
        user.email,
        `${user.prenom} ${user.nom}`,
        updatedInvoice.invoiceNumber,
        paymentAmount,
        updatedInvoice.amount,
        updatedInvoice.paymentStatus,
        new Date().toISOString()
      );
      console.log('Email de confirmation de paiement envoyé à:', user.email);
    } catch (emailError) {
      console.error('Erreur lors de l\'envoi de l\'email de confirmation:', emailError);
      // Ne pas faire échouer le paiement si l'email échoue
    }

    return NextResponse.json({
      message: 'Paiement confirmé avec succès',
      invoice: {
        id: updatedInvoice.id,
        invoiceNumber: updatedInvoice.invoiceNumber,
        amount: updatedInvoice.amount,
        status: updatedInvoice.paymentStatus,
      },
    });
  } catch (error) {
    console.error('Erreur lors de la confirmation du paiement:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la confirmation du paiement' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
