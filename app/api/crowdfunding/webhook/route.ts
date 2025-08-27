import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';
import { sendContributionConfirmationEmail, sendPaymentFailureEmail } from '@/lib/email';
import { createContributionNotification, createPaymentNotification } from '@/lib/notification';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({
      success: false,
      error: 'Signature manquante'
    }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Erreur webhook Stripe:', err);
    return NextResponse.json({
      success: false,
      error: 'Signature invalide'
    }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
        break;
      
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      
      case 'payment_intent.canceled':
        await handlePaymentCanceled(event.data.object as Stripe.PaymentIntent);
        break;
      
      default:
        console.log(`Événement webhook non géré: ${event.type}`);
    }

    return NextResponse.json({ success: true, received: true });

  } catch (error) {
    console.error('Erreur traitement webhook:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur interne'
    }, { status: 500 });
  }
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  console.log('Paiement réussi:', paymentIntent.id);
  
  // Vérifier si c'est un paiement de financement participatif
  if (paymentIntent.metadata.type !== 'crowdfunding_contribution') {
    return;
  }

  try {
    // Mettre à jour la contribution dans la base de données
    const updatedContribution = await prisma.contribution.updateMany({
      where: {
        notes: {
          contains: paymentIntent.id
        }
      },
      data: {
        status: 'CONFIRMED',
        notes: `Paiement confirmé via Stripe - ${paymentIntent.id}`
      }
    });

    // Extraire les métadonnées pour l'email
    const { contributor_email, contributor_name, contribution_type } = paymentIntent.metadata;
    const amount = paymentIntent.amount;

    // Calculer le montant de retour
    let returnAmount = amount;
    let returnDescription = '';
    
    switch (contribution_type) {
      case 'preformation':
        returnAmount = amount + (amount * 0.10);
        returnDescription = `Remise de 10% sur votre formation`;
        break;
      case 'financial':
        returnAmount = amount + (amount * 0.08);
        returnDescription = `Rendement de 8% en maximum 4 mois`;
        break;
      case 'material':
        returnDescription = 'Récompenses matérielles selon le montant';
        break;
    }

    // Envoyer email de confirmation
    if (contributor_email && contributor_name) {
      await sendContributionConfirmationEmail(
        contributor_email,
        contributor_name,
        amount,
        contribution_type,
        returnAmount,
        returnDescription
      );
    }

    // Créer notification pour l'admin
    await createContributionNotification(
      contributor_name || 'Anonyme',
      amount,
      contribution_type,
      'SUCCESS'
    );

    // Créer notification de paiement
    await createPaymentNotification(
      paymentIntent.id,
      amount,
      'SUCCESS'
    );

    console.log(`Contribution mise à jour pour PaymentIntent: ${paymentIntent.id}`);
    
  } catch (error) {
    console.error('Erreur mise à jour contribution:', error);
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log('Paiement échoué:', paymentIntent.id);
  
  if (paymentIntent.metadata.type !== 'crowdfunding_contribution') {
    return;
  }

  try {
    // Marquer la contribution comme échouée
    await prisma.contribution.updateMany({
      where: {
        notes: {
          contains: paymentIntent.id
        }
      },
      data: {
        status: 'CANCELLED',
        notes: `Paiement échoué - ${paymentIntent.last_payment_error?.message || 'Erreur inconnue'}`
      }
    });

    // Extraire les métadonnées pour l'email
    const { contributor_email, contributor_name, contribution_type } = paymentIntent.metadata;
    const amount = paymentIntent.amount;
    const errorMessage = paymentIntent.last_payment_error?.message || 'Erreur inconnue';

    // Envoyer email d'information sur l'échec
    if (contributor_email && contributor_name) {
      await sendPaymentFailureEmail(
        contributor_email,
        contributor_name,
        amount,
        errorMessage
      );
    }

    // Créer notification pour l'admin
    await createContributionNotification(
      contributor_name || 'Anonyme',
      amount,
      contribution_type,
      'FAILED'
    );

    // Créer notification de paiement
    await createPaymentNotification(
      paymentIntent.id,
      amount,
      'FAILED',
      errorMessage
    );
    
  } catch (error) {
    console.error('Erreur gestion paiement échoué:', error);
  }
}

async function handlePaymentCanceled(paymentIntent: Stripe.PaymentIntent) {
  console.log('Paiement annulé:', paymentIntent.id);
  
  if (paymentIntent.metadata.type !== 'crowdfunding_contribution') {
    return;
  }

  try {
    // Marquer la contribution comme annulée
    await prisma.contribution.updateMany({
      where: {
        notes: {
          contains: paymentIntent.id
        }
      },
      data: {
        status: 'CANCELLED',
        notes: `Paiement annulé par l'utilisateur`
      }
    });

    // Extraire les métadonnées pour la notification
    const { contributor_name, contribution_type } = paymentIntent.metadata;
    const amount = paymentIntent.amount;

    // Créer notification pour l'admin
    await createContributionNotification(
      contributor_name || 'Anonyme',
      amount,
      contribution_type,
      'CANCELLED'
    );

    // Créer notification de paiement
    await createPaymentNotification(
      paymentIntent.id,
      amount,
      'CANCELLED'
    );
    
  } catch (error) {
    console.error('Erreur gestion paiement annulé:', error);
  }
}