'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import {
  CreditCardIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClipboardIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Charger Stripe avec la clé publique (live)
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_51S0KtgGOlwWHVuTebej5X9UXmlWZWYvwjEfOFXNotDT7rrYR0vhVAKQaRRRZiLuajzA2Igq5Ps6da8G2RrcVyOxK00KsBBNMR8');

interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  paymentStatus: 'PENDING' | 'PARTIAL' | 'PAID';
  paidAmount?: number;
  paymentMethod?: string;
  notes?: string;
  createdAt: string;
  devisNumber?: string;
  contratId?: string;
}

interface BankDetails {
  iban?: string;
  bic?: string;
  banque?: string;
  intituleCompte?: string;
}

// Composant de paiement Stripe
const PaymentForm = ({ invoice, customAmount, onSuccess }: { invoice: Invoice; customAmount?: number; onSuccess: () => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculer le montant à payer (reste, total, ou montant personnalisé)
  const amountToPay = customAmount || (invoice.paymentStatus === 'PARTIAL' && invoice.paidAmount 
    ? invoice.amount - invoice.paidAmount 
    : invoice.amount);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Créer le PaymentIntent
      const response = await fetch('/api/user/invoice/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amountToPay,
          invoiceId: invoice.id,
          description: `Paiement facture ${invoice.invoiceNumber}`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erreur serveur:', errorData);
        throw new Error(errorData.details || errorData.error || 'Erreur lors de la création du paiement');
      }

      const { clientSecret, paymentIntentId } = await response.json();

      // Confirmer le paiement
      const { error: stripeError } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
        },
      });

      if (stripeError) {
        setError(stripeError.message || 'Erreur lors du paiement');
      } else {
        // Confirmer le paiement côté serveur
        const confirmResponse = await fetch('/api/user/invoice/confirm-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentIntentId,
            invoiceId: invoice.id,
            amount: amountToPay,
          }),
        });

        if (confirmResponse.ok) {
          alert('Paiement effectué avec succès !');
          onSuccess();
        } else {
          setError('Erreur lors de la confirmation du paiement');
        }
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur lors du paiement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Informations de carte bancaire
        </label>
        <div className="border-2 border-gray-300 rounded-lg p-3 bg-gray-50 hover:border-blue-400 focus-within:border-blue-500 transition-colors">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '14px',
                  color: '#1f2937',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  '::placeholder': {
                    color: '#9ca3af',
                  },
                },
                invalid: {
                  color: '#dc2626',
                  iconColor: '#dc2626',
                },
              },
              hidePostalCode: true,
            }}
          />
        </div>
        <p className="mt-1.5 text-xs text-gray-500">
          Les cartes acceptées : Visa, Mastercard, American Express
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <ExclamationTriangleIcon className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-800">{error}</p>
          </div>
        </div>
      )}

      <div className="pt-3 border-t border-gray-200">
        <div className="flex items-center justify-between mb-3 p-3 bg-gray-50 rounded-lg">
          <span className="text-sm font-medium text-gray-700">Montant total</span>
          <span className="text-xl font-bold text-gray-900">{amountToPay.toFixed(2)}€</span>
        </div>
        
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={!stripe || loading}
            className="flex-1 inline-flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg text-sm"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Traitement...
              </>
            ) : (
              <>
                <CreditCardIcon className="h-4 w-4 mr-1.5" />
                Payer {amountToPay.toFixed(2)}€
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

export default function PaymentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const invoiceId = params?.id as string;
  const paymentMethodParam = searchParams?.get('method') || 'options';
  const customAmount = searchParams?.get('amount') ? Number(searchParams.get('amount')) : undefined;
  
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'card' | 'bank_transfer' | null>(
    paymentMethodParam === 'card' ? 'card' : paymentMethodParam === 'bank_transfer' ? 'bank_transfer' : null
  );

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentSignalAmount, setPaymentSignalAmount] = useState<number>(0);
  const [paymentSignalNotes, setPaymentSignalNotes] = useState<string>('');
  const [showPaymentSignalModal, setShowPaymentSignalModal] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && invoiceId) {
      fetchInvoice();
    }
  }, [status, invoiceId, router]);

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/invoice');
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des factures');
      }
      const data = await response.json();
      const invoices = data.invoices || [];
      const foundInvoice = invoices.find((inv: Invoice) => inv.id === invoiceId);
      
      if (!foundInvoice) {
        setError('Facture non trouvée');
        return;
      }

      setInvoice(foundInvoice);

      // Récupérer les informations bancaires si disponible
      if (foundInvoice.contratId) {
        await fetchBankDetails(foundInvoice.contratId);
      }

      // Pré-remplir le montant pour le signalement de paiement
      const amountToPay = foundInvoice.paymentStatus === 'PARTIAL' && foundInvoice.paidAmount
        ? foundInvoice.amount - foundInvoice.paidAmount
        : foundInvoice.amount;
      setPaymentSignalAmount(amountToPay);
      setPaymentSignalNotes(`Virement bancaire - Facture ${foundInvoice.invoiceNumber}`);
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur lors de la récupération de la facture');
    } finally {
      setLoading(false);
    }
  };

  const fetchBankDetails = async (contratId: string) => {
    try {
      const response = await fetch(`/api/user/invoice/bank-details?contratId=${contratId}`);
      if (response.ok) {
        const data = await response.json();
        setBankDetails(data);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des informations bancaires:', error);
    }
  };

  const signalPaymentWithDetails = async () => {
    if (!invoice) return;
    
    try {
      const response = await fetch('/api/user/invoice/signal-payment-detailed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoiceId: invoice.id,
          amount: paymentSignalAmount,
          notes: paymentSignalNotes,
        }),
      });

      if (response.ok) {
        alert('Paiement signalé avec succès ! L\'administration sera notifiée.');
        router.push('/invoice');
      } else {
        throw new Error('Erreur lors du signalement');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors du signalement du paiement');
    }
  };

  const handlePaymentSuccess = () => {
    router.push('/invoice');
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <h2 className="text-2xl font-semibold text-gray-900 mt-4">Chargement...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-red-600">{error || 'Facture non trouvée'}</h2>
            <button 
              onClick={() => router.push('/invoice')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retour aux factures
            </button>
          </div>
        </div>
      </div>
    );
  }

  const amountToPay = customAmount || (invoice.paymentStatus === 'PARTIAL' && invoice.paidAmount 
    ? invoice.amount - invoice.paidAmount 
    : invoice.amount);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header avec bouton retour */}
        <div className="mb-4">
          <button
            onClick={() => router.push('/invoice')}
            className="inline-flex items-center gap-1.5 text-gray-600 hover:text-gray-900 mb-2 text-sm"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Retour aux factures
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Paiement de la facture</h1>
          <p className="text-sm text-gray-600 mt-1">Facture {invoice.invoiceNumber}</p>
        </div>

        {/* Résumé du montant */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200 mb-4">
          <div className="text-center">
            <p className="text-xs font-medium text-gray-600 mb-1">Montant total de la facture</p>
            <p className="text-2xl font-bold text-gray-900">
              {invoice.amount}€
            </p>
            {invoice.paymentStatus === 'PARTIAL' && invoice.paidAmount && (
              <div className="mt-2 pt-2 border-t border-blue-200">
                <p className="text-xs text-gray-600">Déjà payé: <span className="font-semibold text-green-600">{invoice.paidAmount}€</span></p>
                <p className="text-base font-semibold text-gray-900 mt-1">
                  Reste à payer: {invoice.amount - invoice.paidAmount}€
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sélection du moyen de paiement */}
        {!selectedPaymentMethod && (
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 mb-4">
            <h2 className="text-xl font-bold text-gray-900 mb-3">Choisissez votre moyen de paiement</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Carte bancaire */}
              <button
                onClick={() => setSelectedPaymentMethod('card')}
                className="p-4 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition-all hover:shadow-md text-left group"
              >
                <div className="flex items-center justify-between mb-2">
                  <CreditCardIcon className="h-6 w-6 text-blue-600" />
                  <svg className="w-4 h-4 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <h4 className="text-base font-semibold text-gray-900 mb-1">Paiement par carte</h4>
                <p className="text-xs text-gray-600">Paiement sécurisé via Stripe</p>
              </button>

              {/* Virement bancaire */}
              <button
                onClick={() => setSelectedPaymentMethod('bank_transfer')}
                className="p-4 border-2 border-green-600 rounded-lg hover:bg-green-50 transition-all hover:shadow-md text-left group"
              >
                <div className="flex items-center justify-between mb-2">
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <svg className="w-4 h-4 text-green-600 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <h4 className="text-base font-semibold text-gray-900 mb-1">Virement bancaire</h4>
                <p className="text-xs text-gray-600">Effectuez un virement depuis votre banque</p>
              </button>
            </div>
          </div>
        )}

        {/* Options de montant pour carte */}
        {selectedPaymentMethod === 'card' && !customAmount && (
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <button
                onClick={() => setSelectedPaymentMethod(null)}
                className="text-gray-600 hover:text-gray-900 text-sm"
              >
                ← Retour
              </button>
              <h3 className="text-base font-semibold text-gray-900">Montant à payer</h3>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => router.push(`/invoice/${invoice.id}/payment?method=card`)}
                className="w-full p-3 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-left"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-blue-600">Payer la totalité</h4>
                    <p className="text-xs text-gray-600">
                      {invoice.paymentStatus === 'PARTIAL' && invoice.paidAmount 
                        ? `${invoice.amount - invoice.paidAmount}€`
                        : `${invoice.amount}€`
                      }
                    </p>
                  </div>
                  <CreditCardIcon className="h-4 w-4 text-blue-600" />
                </div>
              </button>

              <button
                onClick={() => {
                  const halfAmount = Math.ceil(invoice.amount / 2);
                  router.push(`/invoice/${invoice.id}/payment?method=card&amount=${halfAmount}`);
                }}
                className="w-full p-3 border-2 border-green-600 rounded-lg hover:bg-green-50 transition-colors text-left"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-green-600">Payer la moitié</h4>
                    <p className="text-xs text-gray-600">
                      {Math.ceil(invoice.amount / 2)}€
                    </p>
                  </div>
                  <CreditCardIcon className="h-4 w-4 text-green-600" />
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Paiement par carte */}
        {selectedPaymentMethod === 'card' && (
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
            <h2 className="text-xl font-bold text-gray-900 mb-3">Paiement par carte</h2>
            <p className="text-sm text-gray-600 mb-4">Montant: {amountToPay.toFixed(2)}€</p>
            
            <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <svg className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <p className="text-xs text-blue-800">
                  Votre paiement est sécurisé et traité par Stripe. Vos informations bancaires ne sont jamais stockées sur nos serveurs.
                </p>
              </div>
            </div>
            
            <Elements stripe={stripePromise}>
              <PaymentForm 
                invoice={invoice} 
                customAmount={customAmount}
                onSuccess={handlePaymentSuccess}
              />
            </Elements>
          </div>
        )}

        {/* Virement bancaire */}
        {selectedPaymentMethod === 'bank_transfer' && (
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
            <h2 className="text-xl font-bold text-gray-900 mb-3">Virement bancaire</h2>
            
            {bankDetails && (bankDetails.iban || bankDetails.bic) ? (
              <div className="space-y-3">
                <div className="bg-green-50 border border-green-200 rounded-lg p-2.5">
                  <p className="text-xs text-green-800 flex items-center gap-1.5">
                    <CheckCircleIcon className="h-4 w-4" />
                    <strong>Informations bancaires disponibles</strong>
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <label className="block text-xs font-medium text-gray-600 mb-1">IBAN</label>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-mono text-gray-900 break-all pr-2">{bankDetails.iban || 'Non disponible'}</p>
                    {bankDetails.iban && (
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(bankDetails.iban!);
                          alert('IBAN copié dans le presse-papiers !');
                        }}
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-medium whitespace-nowrap"
                        title="Copier l'IBAN"
                      >
                        <ClipboardIcon className="h-3.5 w-3.5" />
                        Copier
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <label className="block text-xs font-medium text-gray-600 mb-1">BIC</label>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-mono text-gray-900">{bankDetails.bic || 'Non disponible'}</p>
                    {bankDetails.bic && (
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(bankDetails.bic!);
                          alert('BIC copié dans le presse-papiers !');
                        }}
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-medium"
                        title="Copier le BIC"
                      >
                        <ClipboardIcon className="h-3.5 w-3.5" />
                        Copier
                      </button>
                    )}
                  </div>
                </div>
                
                {bankDetails.banque && (
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Banque</label>
                    <p className="text-sm text-gray-900">{bankDetails.banque}</p>
                  </div>
                )}
                
                {bankDetails.intituleCompte && (
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Intitulé du compte</label>
                    <p className="text-sm text-gray-900">{bankDetails.intituleCompte}</p>
                  </div>
                )}
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-800">
                    <strong>Important :</strong> Indiquez le numéro de facture <strong>{invoice.invoiceNumber}</strong> dans la référence du virement pour faciliter le traitement.
                  </p>
                </div>
                
                <div className="pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-600 mb-3">
                    Après avoir effectué le virement, cliquez sur le bouton ci-dessous pour signaler le paiement à l'administration.
                  </p>
                  <button
                    onClick={() => setShowPaymentSignalModal(true)}
                    className="w-full px-4 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    J'ai effectué le virement
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <ExclamationTriangleIcon className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-yellow-800 mb-1">
                      Informations bancaires non disponibles
                    </p>
                    <p className="text-xs text-yellow-700">
                      Les informations bancaires ne sont pas encore disponibles pour cette facture. Veuillez contacter l'administration pour obtenir les coordonnées bancaires.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal pour signaler un paiement */}
        {showPaymentSignalModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Signaler un paiement</h2>
                    <p className="text-xs text-gray-600 mt-0.5">Informez l'administration d'un paiement effectué</p>
                  </div>
                  <button
                    onClick={() => setShowPaymentSignalModal(false)}
                    className="text-gray-500 hover:text-gray-700 text-xl"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="p-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Montant payé (€)
                    </label>
                    <input
                      type="number"
                      value={paymentSignalAmount}
                      onChange={(e) => setPaymentSignalAmount(Number(e.target.value))}
                      className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Montant"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Notes (optionnel)
                    </label>
                    <textarea
                      value={paymentSignalNotes}
                      onChange={(e) => setPaymentSignalNotes(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Méthode de paiement, référence, etc."
                    />
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={signalPaymentWithDetails}
                    className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    Signaler le paiement
                  </button>
                  <button
                    onClick={() => setShowPaymentSignalModal(false)}
                    className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-400 transition-colors text-sm"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

