import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
});

export const getStripe = () => {
  return stripe;
};

// Configuration spécifique pour les investissements de financement participatif
export const createCrowdfundingPaymentIntent = async (
  amount: number, 
  contributionType: string,
  contributorEmail: string,
  contributorName: string
) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // Stripe utilise les centimes, mais ici on assume FCFA entiers
      currency: 'xof', // Franc CFA Ouest Africain
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        type: 'crowdfunding_contribution',
        contribution_type: contributionType,
        contributor_email: contributorEmail,
        contributor_name: contributorName,
      },
      description: `Contribution financement participatif - ${contributionType}`,
    });

    return paymentIntent;
  } catch (error) {
    console.error('Erreur création PaymentIntent:', error);
    throw error;
  }
};

export const confirmCrowdfundingPayment = async (paymentIntentId: string) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    console.error('Erreur confirmation paiement:', error);
    throw error;
  }
};

export const createCrowdfundingCustomer = async (
  email: string, 
  name: string, 
  phone?: string
) => {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
      phone,
      metadata: {
        type: 'crowdfunding_contributor',
      },
    });

    return customer;
  } catch (error) {
    console.error('Erreur création customer:', error);
    throw error;
  }
};

// Webhooks pour gérer les événements Stripe
export const handleStripeWebhook = async (event: Stripe.Event) => {
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      if (paymentIntent.metadata.type === 'crowdfunding_contribution') {
        // Traiter le paiement réussi
        console.log('Paiement réussi:', paymentIntent.id);
        // Ici on mettrait à jour la base de données
      }
      break;
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object as Stripe.PaymentIntent;
      if (failedPayment.metadata.type === 'crowdfunding_contribution') {
        console.log('Paiement échoué:', failedPayment.id);
      }
      break;
    default:
      console.log(`Événement non géré: ${event.type}`);
  }
};
