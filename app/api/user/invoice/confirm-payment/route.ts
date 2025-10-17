import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { PrismaClient } from '@prisma/client';
import { sendInvoicePaymentConfirmationEmail, sendAdminPaymentNotificationEmail } from 'lib/email';

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
        newPaidAmount, // Utiliser le montant total payé, pas seulement le dernier paiement
        updatedInvoice.amount,
        updatedInvoice.paymentStatus,
        new Date().toISOString()
      );
      console.log('Email de confirmation de paiement envoyé à:', user.email);
    } catch (emailError) {
      console.error('Erreur lors de l\'envoi de l\'email de confirmation:', emailError);
      // Ne pas faire échouer le paiement si l'email échoue
    }

    // Envoyer un email de notification aux admins
    try {
      // Récupérer les emails admin (support de plusieurs emails séparés par des virgules)
      const adminEmails = process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || process.env.SMTP_FROM_EMAIL;
      
      if (adminEmails) {
        const emailList = adminEmails.split(',').map(email => email.trim()).filter(email => email);
        
        // Envoyer l'email à tous les admins
        const emailPromises = emailList.map(async (adminEmail) => {
          try {
            await sendAdminPaymentNotificationEmail(
              adminEmail,
              `${user.prenom} ${user.nom}`,
              user.email,
              updatedInvoice.invoiceNumber,
              newPaidAmount, // Utiliser le montant total payé, pas seulement le dernier paiement
              updatedInvoice.amount,
              updatedInvoice.paymentStatus,
              new Date().toISOString(),
              'Stripe'
            );
            console.log('Email de notification de paiement envoyé à l\'admin:', adminEmail);
          } catch (emailError) {
            console.error(`Erreur envoi email à ${adminEmail}:`, emailError);
          }
        });
        
        await Promise.all(emailPromises);
        console.log(`Emails de notification envoyés à ${emailList.length} admin(s)`);
      } else {
        console.warn('Aucun email admin configuré pour les notifications de paiement');
      }
    } catch (emailError) {
      console.error('Erreur lors de l\'envoi des emails de notification admin:', emailError);
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
