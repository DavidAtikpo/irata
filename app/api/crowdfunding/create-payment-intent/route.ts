import { NextRequest, NextResponse } from 'next/server';
import { createCrowdfundingPaymentIntent } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const { 
      amount, 
      contributionType, 
      contributorEmail, 
      contributorName,
      contributorPhone 
    } = await request.json();

    // Type pour contributionType
    type ContributionType = 'preformation' | 'financial' | 'material';
    const typedContributionType = contributionType as ContributionType;

    // Validation des données
    if (!amount || !contributionType || !contributorEmail || !contributorName) {
      return NextResponse.json({
        success: false,
        error: 'Données manquantes'
      }, { status: 400 });
    }

    // Validation du montant selon le type de contribution
    const minAmounts = {
      preformation: 50000,   // 50K FCFA minimum pour pré-formation
      financial: 100000,     // 100K FCFA minimum pour don financier
      material: 25000        // 25K FCFA minimum pour récompenses matérielles
    };

    const maxAmounts = {
      preformation: 500000,  // 500K FCFA maximum
      financial: 1000000,    // 1M FCFA maximum
      material: 200000       // 200K FCFA maximum
    };

    if (amount < minAmounts[typedContributionType] || amount > maxAmounts[typedContributionType]) {
      return NextResponse.json({
        success: false,
        error: `Montant invalide. Pour ${typedContributionType}, le montant doit être entre ${minAmounts[typedContributionType]} et ${maxAmounts[typedContributionType]} FCFA`
      }, { status: 400 });
    }

    // Créer l'intention de paiement Stripe
    const paymentIntent = await createCrowdfundingPaymentIntent(
      amount,
      contributionType,
      contributorEmail,
      contributorName
    );

    // Calculer les détails du retour
    let returnAmount = amount;
    let returnDescription = '';
    
    switch (contributionType) {
      case 'preformation':
        returnAmount = amount + (amount * 0.10);
        returnDescription = `Remise de 10% sur votre formation (valeur: ${returnAmount.toLocaleString()} FCFA)`;
        break;
      case 'financial':
        returnAmount = amount + (amount * 0.08);
        returnDescription = `Rendement de 8% en maximum 4 mois (remboursement: ${returnAmount.toLocaleString()} FCFA)`;
        break;
      case 'material':
        returnDescription = 'Récompenses matérielles exclusives selon le montant de votre contribution';
        if (amount >= 25000 && amount < 50000) {
          returnDescription += ' - Mug + Stylos de marque';
        } else if (amount >= 50000 && amount < 100000) {
          returnDescription += ' - T-shirt + Sac à dos de marque';
        } else if (amount >= 100000) {
          returnDescription += ' - Kit complet + Casquette premium';
        }
        break;
    }

    return NextResponse.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount,
        contributionType,
        returnAmount,
        returnDescription,
        contributorName,
        contributorEmail
      }
    });

  } catch (error) {
    console.error('Erreur création intention de paiement:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la création de l\'intention de paiement'
    }, { status: 500 });
  }
}