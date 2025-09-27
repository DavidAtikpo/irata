import { NextRequest, NextResponse } from 'next/server';
import { confirmCrowdfundingPayment } from 'lib/stripe';
import { PrismaClient } from '@prisma/client';
import { sendContributionConfirmationEmail } from 'lib/email';
import { createContributionNotification, createPaymentNotification } from 'lib/notification';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { 
      paymentIntentId, 
      contributorData 
    } = await request.json();

    if (!paymentIntentId || !contributorData) {
      return NextResponse.json({
        success: false,
        error: 'Données manquantes'
      }, { status: 400 });
    }

    // Confirmer le paiement avec Stripe
    const paymentIntent = await confirmCrowdfundingPayment(paymentIntentId);
    
    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json({
        success: false,
        error: 'Le paiement n\'a pas été confirmé'
      }, { status: 400 });
    }

    // Extraire les métadonnées
    const { 
      contribution_type, 
      contributor_email, 
      contributor_name 
    } = paymentIntent.metadata;

    // Calculer le montant de retour
    const amount = paymentIntent.amount;
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

    // Enregistrer la contribution dans la base de données
    const contribution = await prisma.contribution.create({
      data: {
        donorName: contributor_name,
        donorEmail: contributor_email,
        donorPhone: contributorData.phone || null,
        amount: amount,
        type: contribution_type.toUpperCase() as 'PREFORMATION' | 'FINANCIAL' | 'MATERIAL',
        returnAmount,
        returnDescription,
        paymentMethod: 'BANK_TRANSFER',
        status: 'CONFIRMED',
        userId: contributorData.userId || null,
        notes: `Paiement confirmé via Stripe - ${paymentIntentId}`
      }
    });

    // Envoyer email de confirmation
    await sendContributionConfirmationEmail(
      contributor_email,
      contributor_name,
      amount,
      contribution_type,
      returnAmount,
      returnDescription
    );

    // Créer notification pour l'admin
    await createContributionNotification(
      contributor_name,
      amount,
      contribution_type,
      'SUCCESS'
    );

    // Créer notification de paiement
    await createPaymentNotification(
      paymentIntentId,
      amount,
      'SUCCESS'
    );
    
    return NextResponse.json({
      success: true,
      data: {
        contributionId: contribution.id,
        amount,
        returnAmount,
        returnDescription,
        status: 'confirmed',
        paymentIntentId,
        message: 'Contribution confirmée avec succès! Vous recevrez bientôt un email de confirmation.'
      }
    });

  } catch (error) {
    console.error('Erreur confirmation paiement:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la confirmation du paiement'
    }, { status: 500 });
  }
}