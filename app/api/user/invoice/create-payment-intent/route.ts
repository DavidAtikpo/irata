import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { stripe } from 'lib/stripe';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Récupérer les informations complètes de l'utilisateur depuis la base de données
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        prenom: true,
        nom: true,
        phone: true,
        address: true,
        city: true,
        zipCode: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    const { amount, invoiceId, description } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Montant requis et doit être positif' }, { status: 400 });
    }

    // Créer ou récupérer un customer Stripe avec toutes les informations
    let customer;
    try {
      const fullName = `${user.prenom || ''} ${user.nom || ''}`.trim();
      
      // Chercher un customer existant par email
      const existingCustomers = await stripe.customers.list({
        email: user.email,
        limit: 1,
      });

      if (existingCustomers.data.length > 0) {
        customer = existingCustomers.data[0];
        // Mettre à jour les informations si nécessaire
        customer = await stripe.customers.update(customer.id, {
          name: fullName,
          phone: user.phone || undefined,
          address: {
            line1: user.address || undefined,
            city: user.city || undefined,
            postal_code: user.zipCode || undefined,
            country: 'FR',
          },
          metadata: {
            userEmail: user.email,
            userId: user.id,
            userPrenom: user.prenom || '',
            userNom: user.nom || '',
            userPhone: user.phone || '',
            userAddress: user.address || '',
            userCity: user.city || '',
            userZipCode: user.zipCode || '',
          },
        });
      } else {
        // Créer un nouveau customer
        customer = await stripe.customers.create({
          email: user.email,
          name: fullName,
          phone: user.phone || undefined,
          address: {
            line1: user.address || undefined,
            city: user.city || undefined,
            postal_code: user.zipCode || undefined,
            country: 'FR',
          },
          metadata: {
            userEmail: user.email,
            userId: user.id,
            userPrenom: user.prenom || '',
            userNom: user.nom || '',
            userPhone: user.phone || '',
            userAddress: user.address || '',
            userCity: user.city || '',
            userZipCode: user.zipCode || '',
          },
        });
      }
    } catch (customerError) {
      console.error('Erreur création customer:', customerError);
      // Continuer sans customer si erreur
    }

    // Créer un PaymentIntent avec Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe utilise les centimes
      currency: 'eur',
      description: description || `Paiement facture ${invoiceId}`,
      customer: customer?.id, // Associer le customer
      metadata: {
        invoiceId: invoiceId,
        userEmail: user.email,
        userName: `${user.prenom || ''} ${user.nom || ''}`.trim(),
        userId: user.id,
        userPrenom: user.prenom || '',
        userNom: user.nom || '',
        userPhone: user.phone || '',
        userAddress: user.address || '',
        userCity: user.city || '',
        userZipCode: user.zipCode || '',
      },
      // Désactiver la validation automatique du téléphone
      payment_method_options: {
        card: {
          request_three_d_secure: 'automatic',
        },
      },
      // Options pour éviter les problèmes de validation
      setup_future_usage: 'off_session',
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Erreur lors de la création du PaymentIntent:', error);
    
    // Log plus détaillé pour Stripe
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    return NextResponse.json(
      { 
        error: 'Erreur lors de la création du paiement',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}
