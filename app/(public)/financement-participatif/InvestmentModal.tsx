'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';

// Vérifier que la clé Stripe est définie
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
if (!stripePublishableKey) {
  console.error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not defined');
}

const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

interface InvestmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  option: {
    id: string;
    title: string;
    minAmount: number;
    maxAmount: number;
    baseReturn: number;
    returnType: string;
  } | null;
  selectedAmount: number;
  selectedCurrency: string;
  selectedCountry: {
    code: string;
    name: string;
    currency: string;
    symbol: string;
  };
}

interface InvestorFormData {
  name: string;
  email: string;
  phone?: string;
  amount: number;
  acceptTerms: boolean;
  marketingConsent: boolean;
}

// Fonction de conversion de devise
const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string): number => {
  if (fromCurrency === toCurrency) return amount;
  
  const EXCHANGE_RATES = {
    FCFA: 1,
    EUR: 0.00152,
    USD: 0.00167,
    XOF: 1,
  };
  
  // Convertir d'abord en FCFA
  const inFCFA = fromCurrency === 'FCFA' ? amount : amount / EXCHANGE_RATES[fromCurrency as keyof typeof EXCHANGE_RATES];
  
  // Puis convertir vers la devise cible
  return toCurrency === 'FCFA' ? inFCFA : inFCFA * EXCHANGE_RATES[toCurrency as keyof typeof EXCHANGE_RATES];
};

// Fonction de formatage de devise
const formatCurrency = (amount: number, currency: string, symbol: string): string => {
  if (currency === 'EUR') {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
  } else if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  } else {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' ' + symbol;
  }
};

function PaymentForm({ 
  formData, 
  option, 
  selectedCurrency,
  selectedCountry,
  onSuccess, 
  onError 
}: {
  formData: InvestorFormData;
  option: InvestmentModalProps['option'];
  selectedCurrency: string;
  selectedCountry: InvestmentModalProps['selectedCountry'];
  onSuccess: (result: any) => void;
  onError: (error: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const calculateReturn = () => {
    if (!option) return formData.amount;
    
    if (option.returnType === 'discount') {
      return formData.amount + (formData.amount * option.baseReturn / 100);
    } else if (option.returnType === 'interest') {
      return formData.amount + (formData.amount * option.baseReturn / 100);
    }
    return formData.amount;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !option) {
      onError('Erreur: Stripe ou éléments non disponibles');
      return;
    }

    setIsProcessing(true);

    try {
      // Convertir le montant en FCFA pour l'API
      const amountInFCFA = convertCurrency(formData.amount, selectedCurrency, 'FCFA');
      
      // Créer l'intention de paiement
      const response = await fetch('/api/crowdfunding/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amountInFCFA, // Toujours envoyer en FCFA à l'API
          contributionType: option.id,
          contributorEmail: formData.email,
          contributorName: formData.name,
          contributorPhone: formData.phone
        }),
      });

      const { success, data, error } = await response.json();

      if (!success) {
        onError(error || 'Erreur lors de la création du paiement');
        return;
      }

      const { clientSecret } = data;

      // Confirmer le paiement avec Stripe
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        onError('Erreur avec l\'élément de carte');
        return;
      }

      const { paymentIntent, error: stripeError } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
          },
        },
      });

      if (stripeError) {
        onError(stripeError.message || 'Erreur de paiement');
        return;
      }

      if (paymentIntent?.status === 'succeeded') {
        // Confirmer la contribution dans notre base de données
        const confirmResponse = await fetch('/api/crowdfunding/confirm-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentIntentId: paymentIntent.id,
            contributorData: {
              name: formData.name,
              email: formData.email,
              phone: formData.phone
            }
          }),
        });

        const confirmData = await confirmResponse.json();
        
        if (confirmData.success) {
          onSuccess(confirmData.data);
        } else {
          onError(confirmData.error || 'Erreur lors de la confirmation');
        }
      }

    } catch (error) {
      console.error('Erreur paiement:', error);
      onError('Erreur lors du traitement du paiement');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* Récapitulatif */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-2">Récapitulatif de votre contribution</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Montant de la contribution:</span>
            <span className="font-semibold">{formatCurrency(formData.amount, selectedCurrency, selectedCountry.symbol)}</span>
          </div>
          <div className="flex justify-between">
            <span>Valeur du retour:</span>
            <span className="font-semibold text-green-600">
              {formatCurrency(calculateReturn(), selectedCurrency, selectedCountry.symbol)}
            </span>
          </div>
          <div className="flex justify-between text-blue-600">
            <span>Bénéfice:</span>
            <span className="font-semibold">
              +{formatCurrency(calculateReturn() - formData.amount, selectedCurrency, selectedCountry.symbol)}
            </span>
          </div>
        </div>
      </div>

      {/* Informations de carte */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Informations de paiement
        </label>
        <div className="border rounded-lg p-4 bg-white">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
              hidePostalCode: true,
            }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          🔒 Paiement sécurisé par Stripe. Vos données sont chiffrées.
        </p>
      </div>

      {/* Conditions */}
      <div className="text-xs text-gray-600 bg-blue-50 p-3 rounded-lg">
        <h4 className="font-semibold mb-2">Conditions importantes:</h4>
        <ul className="space-y-1">
          <li>• Cette contribution n'est pas un investissement au sens financier</li>
          <li>• Les retours dépendent de la réalisation du projet</li>
          <li>• Délai de réalisation: maximum 6 mois pour les retours</li>
          <li>• Possibilité d'annulation sous 7 jours (hors frais de transaction)</li>
        </ul>
      </div>

      {/* Boutons */}
      <div className="flex space-x-4 pt-4">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="flex-1 bg-gray-200 text-gray-800 px-4 py-3 rounded-lg font-medium hover:bg-gray-300 transition duration-200"
          disabled={isProcessing}
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className="flex-1 bg-indigo-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-indigo-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <span className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Traitement...
            </span>
          ) : (
            `Confirmer ${formatCurrency(formData.amount, selectedCurrency, selectedCountry.symbol)}`
          )}
        </button>
      </div>
    </form>
  );
}

export default function InvestmentModal({ 
  isOpen, 
  onClose, 
  option, 
  selectedAmount, 
  selectedCurrency, 
  selectedCountry 
}: InvestmentModalProps) {
  const [step, setStep] = useState<'form' | 'payment' | 'success' | 'error'>('form');
  const [formData, setFormData] = useState<InvestorFormData>({
    name: '',
    email: '',
    phone: '',
    amount: convertCurrency(selectedAmount, 'FCFA', selectedCurrency),
    acceptTerms: false,
    marketingConsent: false
  });
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState<any>(null);

  if (!isOpen || !option) return null;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.acceptTerms) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const convertedMinAmount = convertCurrency(option.minAmount, 'FCFA', selectedCurrency);
    const convertedMaxAmount = convertCurrency(option.maxAmount, 'FCFA', selectedCurrency);

    if (formData.amount < convertedMinAmount || formData.amount > convertedMaxAmount) {
      setError(`Le montant doit être entre ${formatCurrency(convertedMinAmount, selectedCurrency, selectedCountry.symbol)} et ${formatCurrency(convertedMaxAmount, selectedCurrency, selectedCountry.symbol)}`);
      return;
    }

    setError('');
    setStep('payment');
  };

  const handlePaymentSuccess = (result: any) => {
    setSuccessData(result);
    setStep('success');
  };

  const handlePaymentError = (errorMsg: string) => {
    setError(errorMsg);
    setStep('error');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">
              {option.title}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6">
          
          {/* Step 1: Form */}
          {step === 'form' && (
            <form onSubmit={handleFormSubmit} className="space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom complet *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Votre nom complet"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="votre@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone (optionnel)
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="+228 90 00 00 00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Montant de la contribution ({selectedCountry.symbol}) *
                </label>
                <input
                  type="number"
                  required
                  min={convertCurrency(option.minAmount, 'FCFA', selectedCurrency)}
                  max={convertCurrency(option.maxAmount, 'FCFA', selectedCurrency)}
                  step={selectedCurrency === 'EUR' ? 1 : 1000}
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Min: {formatCurrency(convertCurrency(option.minAmount, 'FCFA', selectedCurrency), selectedCurrency, selectedCountry.symbol)} - 
                  Max: {formatCurrency(convertCurrency(option.maxAmount, 'FCFA', selectedCurrency), selectedCurrency, selectedCountry.symbol)}
                </p>
              </div>

              <div className="space-y-3">
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    required
                    checked={formData.acceptTerms}
                    onChange={(e) => setFormData({...formData, acceptTerms: e.target.checked})}
                    className="mt-1 mr-3"
                  />
                  <span className="text-sm text-gray-700">
                    J'accepte les <a href="/conditions" className="text-indigo-600 underline">conditions générales</a> et 
                    reconnais que cette contribution n'est pas un investissement financier traditionnel *
                  </span>
                </label>
                
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    checked={formData.marketingConsent}
                    onChange={(e) => setFormData({...formData, marketingConsent: e.target.checked})}
                    className="mt-1 mr-3"
                  />
                  <span className="text-sm text-gray-700">
                    J'accepte de recevoir des actualités du projet par email (optionnel)
                  </span>
                </label>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 bg-gray-200 text-gray-800 px-4 py-3 rounded-lg font-medium hover:bg-gray-300 transition duration-200"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-indigo-700 transition duration-200"
                >
                  Continuer vers le paiement
                </button>
              </div>
            </form>
          )}

          {/* Step 2: Payment */}
          {step === 'payment' && (
            <Elements stripe={stripePromise}>
              <PaymentForm
                formData={formData}
                option={option}
                selectedCurrency={selectedCurrency}
                selectedCountry={selectedCountry}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            </Elements>
          )}

          {/* Step 3: Success */}
          {step === 'success' && (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold text-green-600 mb-4">
                Contribution Confirmée !
              </h3>
              <p className="text-gray-700 mb-6">
                Merci {formData.name} pour votre contribution de {formatCurrency(formData.amount, selectedCurrency, selectedCountry.symbol)}.
                Vous recevrez bientôt un email de confirmation avec tous les détails.
              </p>
              <div className="bg-green-50 p-4 rounded-lg mb-6">
                <p className="text-green-800 font-semibold">
                  Votre retour estimé: {formatCurrency(successData?.returnAmount || 0, selectedCurrency, selectedCountry.symbol)}
                </p>
                <p className="text-sm text-green-700 mt-1">
                  {successData?.returnDescription}
                </p>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={onClose}
                  className="flex-1 bg-gray-200 text-gray-800 px-4 py-3 rounded-lg font-medium hover:bg-gray-300 transition duration-200"
                >
                  Fermer
                </button>
                <Link
                  href="/user/investissements/dashboard"
                  className="flex-1 bg-indigo-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-indigo-700 transition duration-200 text-center"
                >
                  Voir mon Dashboard
                </Link>
              </div>
            </div>
          )}

          {/* Step 4: Error */}
          {step === 'error' && (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">❌</div>
              <h3 className="text-2xl font-bold text-red-600 mb-4">
                Erreur de Paiement
              </h3>
              <p className="text-gray-700 mb-6">{error}</p>
              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    setError('');
                    setStep('payment');
                  }}
                  className="flex-1 bg-indigo-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-indigo-700 transition duration-200"
                >
                  Réessayer
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 bg-gray-200 text-gray-800 px-4 py-3 rounded-lg font-medium hover:bg-gray-300 transition duration-200"
                >
                  Fermer
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}