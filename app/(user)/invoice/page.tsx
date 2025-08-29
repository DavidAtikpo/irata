'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  DocumentTextIcon,
  CreditCardIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import InvoiceTemplate, { InvoiceData } from '@/components/InvoiceTemplate';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Charger Stripe avec la clé publique
const stripePromise = loadStripe('pk_test_51S0KtgGOlwWHVuTebej5X9UXmlWZWYvwjEfOFXNotDT7rrYR0vhVAKQaRRRZiLuajzA2Igq5Ps6da8G2RrcVyOxK00KsBBNMR8');

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
}

export default function InvoicePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
     const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
   const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<Invoice | null>(null);
   const [showPaymentSignalModal, setShowPaymentSignalModal] = useState<boolean>(false);
   const [paymentSignalAmount, setPaymentSignalAmount] = useState<number>(0);
   const [paymentSignalNotes, setPaymentSignalNotes] = useState<string>('');
   const [showPaymentOptionsModal, setShowPaymentOptionsModal] = useState<boolean>(false);
   const [selectedInvoiceForOptions, setSelectedInvoiceForOptions] = useState<Invoice | null>(null);
  
       // Données pour l'aperçu de facture
  const [invoicePreviewData, setInvoicePreviewData] = useState<InvoiceData>({
    title: 'TRAME BDC DEVIS FACTURE',
    codeNumberLabel: 'Numéro de code',
    codeNumber: 'ENR-CIDFA-COMP 002',
    revisionLabel: 'Révision',
    revision: '00',
    creationDateLabel: 'Création date',
    creationDate: new Date().toLocaleDateString('fr-FR'),
    company: {
      name: 'CI.DES',
      contactName: 'CHEZ CHAGNEAU',
      addressLines: ['17270 BORESSE-ET-MARTRON', 'admin38@cides.fr'],
      siret: '87840789900011',
      invoiceNumberLabel: 'FACTURE N°',
      invoiceNumber: 'CI.FF 2508 000',
      invoiceDateLabel: 'Le',
      invoiceDate: new Date().toLocaleDateString('fr-FR'),
    },
    customer: {
      companyTitle: 'FRANCE TRAVAIL DR BRETAGNE',
      addressLines: ['Adresses :'],
      siretLabel: 'N°SIRET :',
      siret: '13000548108070',
      convLabel: 'N°Convention (Enregistrement)',
      conv: '41C27G263296',
      name: '',
      email: '',
      phone: '',
    },
    recipient: {
      name: `Monsieur ${session?.user?.name || 'Utilisateur'}`,
      addressLines: ['Adresse de l\'utilisateur', 'Ville, Code postal'],
      phone: '+33 6 24 67 13 65',
    },
    items: [
      {
        reference: 'CI.IFF',
        designation: 'Formation Cordiste IRATA sur 5 jours\nDu 31/03/2025 au 04/04/2025\nSoit 40 heures',
        quantity: 1,
        unitPrice: 1350,
        tva: 0,
      },
    ],
    footerRight: 'Page 1 sur 1',
    showQr: true,
  });

  // Fonction pour générer un numéro de facture unique
  const generateInvoiceNumber = () => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `CI.FF ${year}${month} ${random}`;
  };

  // Fonction pour initialiser les données de facture avec les informations utilisateur
  const initializeInvoiceData = () => {
    setInvoicePreviewData(prev => ({
      ...prev,
      company: {
        ...prev.company,
        invoiceNumber: generateInvoiceNumber(),
        invoiceDate: new Date().toLocaleDateString('fr-FR'),
      },
      recipient: {
        name: `Monsieur ${session?.user?.name || 'Utilisateur'}`,
        addressLines: [
          session?.user?.email ? `${session.user.email}` : 'Adresse de l\'utilisateur',
          'Ville, Code postal'
        ],
        phone: '+33 6 24 67 13 65',
        email: session?.user?.email || '',
      },
    }));
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      initializeInvoiceData();
      fetchInvoices();
    }
  }, [status, session, router]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/invoice');
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des factures');
      }
      const data = await response.json();
      const fetchedInvoices = data.invoices || [];
      setInvoices(fetchedInvoices);
      
      // Debug: afficher les statuts des factures
      console.log('Factures récupérées:', fetchedInvoices.map((inv: any) => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        amount: inv.amount,
        paymentStatus: inv.paymentStatus
      })));

      
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur lors de la récupération des factures');
    } finally {
      setLoading(false);
    }
  };



  const downloadInvoicePDF = async (invoice: Invoice) => {
    try {
      const response = await fetch('/api/user/invoice/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoiceId: invoice.id,
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `facture_${invoice.invoiceNumber.replace(/\s+/g, '_')}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        throw new Error('Erreur lors du téléchargement');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors du téléchargement du PDF');
    }
  };

  const signalPayment = async (invoiceId: string) => {
    try {
      const response = await fetch('/api/user/invoice/signal-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoiceId,
        }),
      });

      if (response.ok) {
        alert('Paiement signalé avec succès !');
        fetchInvoices(); // Recharger les factures
      } else {
        throw new Error('Erreur lors du signalement');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors du signalement du paiement');
    }
  };

     const handlePayment = (invoice: Invoice) => {
     setSelectedInvoiceForOptions(invoice);
     setShowPaymentOptionsModal(true);
   };

  const signalPaymentWithDetails = async () => {
    try {
      const response = await fetch('/api/user/invoice/signal-payment-detailed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: paymentSignalAmount,
          notes: paymentSignalNotes,
        }),
      });

      if (response.ok) {
        alert('Paiement signalé avec succès ! L\'administration sera notifiée.');
        setShowPaymentSignalModal(false);
        setPaymentSignalAmount(0);
        setPaymentSignalNotes('');
        fetchInvoices(); // Recharger les factures
      } else {
        throw new Error('Erreur lors du signalement');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors du signalement du paiement');
    }
  };

       const updateInvoicePreview = (invoice: Invoice) => {
    // Calculer le montant restant à payer
    let remainingAmount = invoice.amount;
    
    if (invoice.paymentStatus === 'PARTIAL' && invoice.paidAmount) {
      remainingAmount = invoice.amount - invoice.paidAmount;
    } else if (invoice.paymentStatus === 'PAID') {
      remainingAmount = 0; // Si la facture est payée, le montant restant est 0
    }

    // Mettre à jour les données de l'aperçu de facture
    setInvoicePreviewData({
      ...invoicePreviewData,
      company: {
        ...invoicePreviewData.company,
        invoiceNumber: invoice.invoiceNumber,
        invoiceDate: new Date(invoice.createdAt).toLocaleDateString('fr-FR'),
      },
      recipient: {
        name: `Monsieur ${session?.user?.name || 'Utilisateur'}`,
        addressLines: [
          session?.user?.email ? `${session.user.email}` : 'Adresse de l\'utilisateur',
          'Ville, Code postal'
        ],
        phone: '+33 6 24 67 13 65',
        email: session?.user?.email || '',
      },
      items: [
        {
          reference: 'CI.IFF',
          designation: `Formation Cordiste IRATA\n${invoice.devisNumber ? `Devis #${invoice.devisNumber}` : ''}`,
          quantity: 1,
          unitPrice: remainingAmount, // Montant restant à payer
          tva: 0,
        },
      ],
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'PARTIAL':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'PENDING':
        return <ClockIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'Payée';
      case 'PARTIAL':
        return 'Paiement partiel';
      case 'PENDING':
        return 'En attente';
      default:
        return 'Inconnu';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'PARTIAL':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'PENDING':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

     // Composant de paiement Stripe
   const PaymentForm = ({ invoice, customAmount }: { invoice: Invoice; customAmount?: number }) => {
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
          throw new Error('Erreur lors de la création du paiement');
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
              amount: amountToPay, // Envoyer le montant réel payé
            }),
          });

          if (confirmResponse.ok) {
            alert('Paiement effectué avec succès !');
            setShowPaymentModal(false);
            fetchInvoices();
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Informations de carte
          </label>
                     <div className="border border-gray-300 rounded-lg p-3">
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
                 hidePostalCode: true, // Masquer le champ code postal
               }}
             />
           </div>
        </div>

        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={!stripe || loading}
            className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Traitement...' : `Payer ${amountToPay}€`}
          </button>
          <button
            type="button"
            onClick={() => setShowPaymentModal(false)}
            className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-400 transition-colors"
          >
            Annuler
          </button>
        </div>
      </form>
    );
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <h2 className="text-2xl font-semibold text-gray-900 mt-4">Chargement de vos factures...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-red-600">{error}</h2>
            <button 
              onClick={fetchInvoices}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
                 {/* En-tête */}
         <div className="text-center mb-12">
           <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-6">
             <DocumentTextIcon className="h-8 w-8 text-white" />
           </div>
           <h1 className="text-4xl font-bold text-gray-900 mb-2">Mes Factures</h1>
           <p className="text-xl text-gray-600">Gérez et consultez vos factures de formation</p>
           
           {/* Bouton temporaire pour créer une facture de test */}
           {invoices.length === 0 && (
             <div className="mt-6">
               <button
                 onClick={async () => {
                   try {
                     const response = await fetch('/api/user/invoice/create-test', {
                       method: 'POST',
                       headers: {
                         'Content-Type': 'application/json',
                       },
                     });
                     if (response.ok) {
                       alert('Facture de test créée ! Rechargez la page pour la voir.');
                       fetchInvoices();
                     } else {
                       alert('Erreur lors de la création de la facture de test');
                     }
                   } catch (error) {
                     console.error('Erreur:', error);
                     alert('Erreur lors de la création de la facture de test');
                   }
                 }}
                 className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
               >
                 <DocumentTextIcon className="h-4 w-4 mr-2" />
                 Créer une facture de test
               </button>
             </div>
           )}
         </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-r from-gray-500 to-gray-600 rounded-lg flex items-center justify-center">
                  <DocumentTextIcon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Factures</p>
                <p className="text-2xl font-bold text-gray-900">{invoices.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <CheckCircleIcon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Payées</p>
                <p className="text-2xl font-bold text-gray-900">
                  {invoices.filter(inv => inv.paymentStatus === 'PAID').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                  <ClockIcon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">En Attente</p>
                <p className="text-2xl font-bold text-gray-900">
                  {invoices.filter(inv => inv.paymentStatus === 'PENDING').length}
                </p>
              </div>
            </div>
          </div>
        </div>

                 

        {/* Liste des factures */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Vos Factures</h2>
          </div>

                                           {invoices.length === 0 ? (
              <div className="text-center py-12">
                <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune facture trouvée</h3>
                <p className="text-gray-600 mb-4">Vous n'avez pas encore de factures dans votre compte.</p>
              </div>
            ) : (
            <div className="divide-y divide-gray-200">
              {invoices.map((invoice) => (
                <div key={invoice.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          {getStatusIcon(invoice.paymentStatus)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Facture {invoice.invoiceNumber}
                          </h3>
                          <div className="mt-1 flex items-center space-x-4 text-sm text-gray-600">
                            <span>Montant: {invoice.amount}€</span>
                            {invoice.paymentStatus === 'PARTIAL' && invoice.paidAmount && (
                              <span>Payé: {invoice.paidAmount}€</span>
                            )}
                                                         <span>Créée le: {new Date(invoice.createdAt).toLocaleDateString('fr-FR')}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      {/* Statut */}
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(invoice.paymentStatus)}`}>
                        {getStatusText(invoice.paymentStatus)}
                      </span>

                      {/* Actions */}
                      <div className="flex items-center space-x-2">
                                                 <button
                           onClick={() => {
                             setSelectedInvoice(invoice);
                             updateInvoicePreview(invoice);
                           }}
                           className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                         >
                           <EyeIcon className="h-4 w-4 mr-1" />
                           Voir
                         </button>
                        
                        <button
                          onClick={() => downloadInvoicePDF(invoice)}
                          className="inline-flex items-center px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                          PDF
                        </button>

                        {(invoice.paymentStatus === 'PENDING' || invoice.paymentStatus === 'PARTIAL') && (
                          <>
                            <button
                              onClick={() => handlePayment(invoice)}
                              className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              <CreditCardIcon className="h-4 w-4 mr-1" />
                              Payer
                            </button>
                            <button
                              onClick={() => signalPayment(invoice.id)}
                              className="inline-flex items-center px-3 py-2 bg-yellow-600 text-white text-sm font-medium rounded-lg hover:bg-yellow-700 transition-colors"
                            >
                              <CreditCardIcon className="h-4 w-4 mr-1" />
                              Signaler Paiement
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal de détails de facture */}
        {selectedInvoice && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-90vh overflow-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Détails de la Facture</h2>
                    <p className="text-gray-600">Facture {selectedInvoice.invoiceNumber}</p>
                  </div>
                  <button
                    onClick={() => setSelectedInvoice(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium mb-2">Informations Générales</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Numéro:</strong> {selectedInvoice.invoiceNumber}</p>
                      <p><strong>Montant:</strong> {selectedInvoice.amount}€</p>
                      <p><strong>Statut:</strong> 
                        <span className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedInvoice.paymentStatus)}`}>
                          {getStatusText(selectedInvoice.paymentStatus)}
                        </span>
                      </p>
                                             <p><strong>Date de création:</strong> {new Date(selectedInvoice.createdAt).toLocaleDateString('fr-FR')}</p>
                       {selectedInvoice.devisNumber && <p><strong>Devis:</strong> {selectedInvoice.devisNumber}</p>}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Informations de Paiement</h3>
                    <div className="space-y-2 text-sm">
                      {selectedInvoice.paymentStatus === 'PARTIAL' && selectedInvoice.paidAmount && (
                        <p><strong>Montant payé:</strong> <span className="text-green-600">{selectedInvoice.paidAmount}€</span></p>
                      )}
                      {selectedInvoice.paymentStatus === 'PAID' && (
                        <p><strong>Montant payé:</strong> <span className="text-green-600">{selectedInvoice.amount}€</span></p>
                      )}
                      {(selectedInvoice.paymentStatus === 'PENDING' || selectedInvoice.paymentStatus === 'PARTIAL') && (
                        <p><strong>Reste à payer:</strong> <span className="text-red-600 font-semibold">
                          {selectedInvoice.paymentStatus === 'PARTIAL' && selectedInvoice.paidAmount 
                            ? `${selectedInvoice.amount - selectedInvoice.paidAmount}€`
                            : `${selectedInvoice.amount}€`
                          }
                        </span></p>
                      )}
                      {selectedInvoice.paymentMethod && (
                        <p><strong>Méthode de paiement:</strong> {selectedInvoice.paymentMethod}</p>
                      )}
                      {selectedInvoice.notes && (
                        <p><strong>Notes:</strong> {selectedInvoice.notes}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => downloadInvoicePDF(selectedInvoice)}
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                    Télécharger PDF
                  </button>
                  
                                     {(selectedInvoice.paymentStatus === 'PENDING' || selectedInvoice.paymentStatus === 'PARTIAL') && (
                     <>
                       <button
                         onClick={() => {
                           handlePayment(selectedInvoice);
                           setSelectedInvoice(null);
                         }}
                         className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                       >
                         <CreditCardIcon className="h-4 w-4 mr-2" />
                         Options de paiement
                       </button>
                       <button
                         onClick={() => {
                           signalPayment(selectedInvoice.id);
                           setSelectedInvoice(null);
                         }}
                         className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-yellow-600 text-white font-medium rounded-lg hover:bg-yellow-700 transition-colors"
                       >
                         <CreditCardIcon className="h-4 w-4 mr-2" />
                         Signaler Paiement
                       </button>
                     </>
                   )}
                </div>
              </div>
            </div>
          </div>
        )}

                 {/* Modal des options de paiement */}
         {showPaymentOptionsModal && selectedInvoiceForOptions && (
           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
             <div className="bg-white rounded-xl max-w-md w-full">
               <div className="p-6 border-b border-gray-200">
                 <div className="flex justify-between items-start">
                   <div>
                     <h2 className="text-xl font-bold text-gray-900">Options de paiement</h2>
                     <p className="text-gray-600">Facture {selectedInvoiceForOptions.invoiceNumber}</p>
                   </div>
                   <button
                     onClick={() => setShowPaymentOptionsModal(false)}
                     className="text-gray-500 hover:text-gray-700"
                   >
                     ✕
                   </button>
                 </div>
               </div>

               <div className="p-6">
                 <div className="space-y-4">
                   <div className="text-center mb-6">
                     <p className="text-lg font-semibold text-gray-900">
                       Montant total: {selectedInvoiceForOptions.amount}€
                     </p>
                     {selectedInvoiceForOptions.paymentStatus === 'PARTIAL' && selectedInvoiceForOptions.paidAmount && (
                       <p className="text-sm text-gray-600">
                         Déjà payé: {selectedInvoiceForOptions.paidAmount}€
                       </p>
                     )}
                   </div>

                   {/* Option 1: Payer la totalité */}
                   <button
                     onClick={() => {
                       setSelectedInvoiceForPayment(selectedInvoiceForOptions);
                       setShowPaymentOptionsModal(false);
                       setShowPaymentModal(true);
                     }}
                     className="w-full p-4 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-left"
                   >
                     <div className="flex items-center justify-between">
                       <div>
                         <h3 className="font-semibold text-blue-600">Payer la totalité</h3>
                         <p className="text-sm text-gray-600">
                           {selectedInvoiceForOptions.paymentStatus === 'PARTIAL' && selectedInvoiceForOptions.paidAmount 
                             ? `Reste à payer: ${selectedInvoiceForOptions.amount - selectedInvoiceForOptions.paidAmount}€`
                             : `Montant: ${selectedInvoiceForOptions.amount}€`
                           }
                         </p>
                       </div>
                       <div className="text-blue-600">
                         <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                         </svg>
                       </div>
                     </div>
                   </button>

                   {/* Option 2: Payer la moitié */}
                   <button
                     onClick={() => {
                       const halfAmount = Math.ceil(selectedInvoiceForOptions.amount / 2);
                       setSelectedInvoiceForPayment(selectedInvoiceForOptions);
                       setShowPaymentOptionsModal(false);
                       setShowPaymentModal(true);
                       // Passer le montant personnalisé via une variable temporaire
                       (window as any).customPaymentAmount = halfAmount;
                     }}
                     className="w-full p-4 border-2 border-green-600 rounded-lg hover:bg-green-50 transition-colors text-left"
                   >
                     <div className="flex items-center justify-between">
                       <div>
                         <h3 className="font-semibold text-green-600">Payer la moitié</h3>
                         <p className="text-sm text-gray-600">
                           Montant: {Math.ceil(selectedInvoiceForOptions.amount / 2)}€
                         </p>
                       </div>
                       <div className="text-green-600">
                         <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                         </svg>
                       </div>
                     </div>
                   </button>

                   {/* Option 3: Montant personnalisé */}
                   <div className="p-4 border-2 border-gray-300 rounded-lg">
                     <h3 className="font-semibold text-gray-700 mb-2">Montant personnalisé</h3>
                     <div className="flex gap-2">
                       <input
                         type="number"
                         id="customAmount"
                         placeholder="Montant en €"
                         className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                         min="1"
                         max={selectedInvoiceForOptions.amount}
                       />
                       <button
                         onClick={() => {
                           const customAmount = Number((document.getElementById('customAmount') as HTMLInputElement).value);
                           if (customAmount > 0 && customAmount <= selectedInvoiceForOptions.amount) {
                             setSelectedInvoiceForPayment(selectedInvoiceForOptions);
                             setShowPaymentOptionsModal(false);
                             setShowPaymentModal(true);
                             (window as any).customPaymentAmount = customAmount;
                           } else {
                             alert('Veuillez entrer un montant valide entre 1€ et ' + selectedInvoiceForOptions.amount + '€');
                           }
                         }}
                         className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                       >
                         Payer
                       </button>
                     </div>
                   </div>
                 </div>
               </div>
             </div>
           </div>
         )}

         {/* Modal de paiement Stripe */}
         {showPaymentModal && selectedInvoiceForPayment && (
           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
             <div className="bg-white rounded-xl max-w-md w-full">
               <div className="p-6 border-b border-gray-200">
                 <div className="flex justify-between items-start">
                   <div>
                     <h2 className="text-xl font-bold text-gray-900">Payer la facture</h2>
                     <p className="text-gray-600">
                       Facture {selectedInvoiceForPayment.invoiceNumber} - 
                       {(window as any).customPaymentAmount || 
                         (selectedInvoiceForPayment.paymentStatus === 'PARTIAL' && selectedInvoiceForPayment.paidAmount 
                           ? selectedInvoiceForPayment.amount - selectedInvoiceForPayment.paidAmount 
                           : selectedInvoiceForPayment.amount)
                       }€
                     </p>
                   </div>
                   <button
                     onClick={() => {
                       setShowPaymentModal(false);
                       (window as any).customPaymentAmount = undefined;
                     }}
                     className="text-gray-500 hover:text-gray-700"
                   >
                     ✕
                   </button>
                 </div>
               </div>

               <div className="p-6">
                 <Elements stripe={stripePromise}>
                   <PaymentForm 
                     invoice={selectedInvoiceForPayment} 
                     customAmount={(window as any).customPaymentAmount}
                   />
                 </Elements>
               </div>
             </div>
           </div>
         )}

        {/* Modal pour signaler un paiement */}
        {showPaymentSignalModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Signaler un paiement</h2>
                    <p className="text-gray-600">Informez l'administration d'un paiement effectué</p>
                  </div>
                  <button
                    onClick={() => setShowPaymentSignalModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Montant payé (€)
                    </label>
                    <input
                      type="number"
                      value={paymentSignalAmount}
                      onChange={(e) => setPaymentSignalAmount(Number(e.target.value))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Montant"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes (optionnel)
                    </label>
                    <textarea
                      value={paymentSignalNotes}
                      onChange={(e) => setPaymentSignalNotes(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Méthode de paiement, référence, etc."
                    />
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={signalPaymentWithDetails}
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Signaler le paiement
                  </button>
                  <button
                    onClick={() => setShowPaymentSignalModal(false)}
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          </div>
                 )}

                 {/* Aperçu de la facture - toujours visible comme sur la page admin */}
         <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mt-6">
           <h2 className="text-xl font-semibold text-gray-900 mb-4">
             {selectedInvoice ? 'Aperçu de la facture sélectionnée' : 'Aperçu de la facture'}
           </h2>
           
           {!selectedInvoice && invoices.length > 0 && (
             <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
               <p className="text-blue-800 text-sm">
                 Sélectionnez une facture dans la liste ci-dessus pour voir son aperçu et effectuer un paiement.
               </p>
             </div>
           )}
           
           <div className="overflow-auto">
              <InvoiceTemplate 
                data={invoicePreviewData}
                showPaymentButton={!!selectedInvoice}
                                 onPaymentClick={() => {
                   if (selectedInvoice) {
                     handlePayment(selectedInvoice);
                   }
                 }}
                paymentStatus={selectedInvoice?.paymentStatus || 'PENDING'}
                paidAmount={selectedInvoice?.paidAmount || 0}
                hasSelectedInvoice={!!selectedInvoice}
              />
            </div>
         </div>
      </div>
    </div>
  );
}
