"use client";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import InvoiceTemplate, { InvoiceData, InvoiceLineItem } from '@/components/InvoiceTemplate';

const defaultData: InvoiceData = {
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
    name: 'Monsieur Prénom NOM',
    addressLines: ['16 rue des Mésanges', '56330 CAMORS'],
    phone: '+33 6 24 67 13 65',
  },
  items: [
    {
      reference: 'CI.IFF',
      designation:
        'Formation Cordiste IRATA sur 5 jours\nDu 31/03/2025 au 04/04/2025\nSoit 40 heures',
      quantity: 1,
      unitPrice: 1350,
      tva: 0,
    },
  ],
  footerRight: 'Page 1 sur 2',
  showQr: true,
};

export default function FactureTramePage() {
  const { data: session } = useSession();
  const [data, setData] = useState<InvoiceData>(defaultData);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [showEditor, setShowEditor] = useState<boolean>(false);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [userContrat, setUserContrat] = useState<any>(null);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'paid' | 'processing'>('pending');
  const [userInvoice, setUserInvoice] = useState<any>(null);
  const [contractValidated, setContractValidated] = useState<boolean>(false);
  const [showPaymentPopup, setShowPaymentPopup] = useState<boolean>(false);
  const [paymentType, setPaymentType] = useState<'initial' | 'remaining'>('initial');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        
        // Charger le template de facture
        const res = await fetch('/api/admin/settings/invoice');
        if (res.ok) {
          const json = await res.json();
          if (json.invoiceTemplate) {
            setData(json.invoiceTemplate as InvoiceData);
          }
        }
        
        // Charger les données du contrat de l'utilisateur
        const contratRes = await fetch('/api/user/contrats');
        if (contratRes.ok) {
          const contrats = await contratRes.json();
          if (contrats.length > 0) {
            const contrat = contrats[0]; // Prendre le premier contrat
            setUserContrat(contrat);
            
            // Vérifier si le contrat est validé
            const isContractValidated = contrat.statut === 'VALIDE';
            setContractValidated(isContractValidated);
            
            // Pré-remplir les informations du destinataire
            setData(prev => ({
              ...prev,
              recipient: {
                ...prev.recipient,
                name: `Monsieur ${contrat.prenom} ${contrat.nom}`,
                addressLines: [contrat.adresse],
                email: session?.user?.email || ''
              }
            }));
          }
        }

        // Charger le statut des factures de l'utilisateur
        const invoiceStatusRes = await fetch('/api/user/invoice/status');
        if (invoiceStatusRes.ok) {
          const invoices = await invoiceStatusRes.json();
          if (invoices.length > 0) {
            const latestInvoice = invoices[0];
            setUserInvoice(latestInvoice);
            
            // Mettre à jour les données de la facture avec les vraies données depuis la DB
            if (latestInvoice) {
              const sessionInfo = userContrat?.devis?.demande?.session || '';
              
              setData(prev => ({
                ...prev,
                company: {
                  ...prev.company,
                  invoiceNumber: latestInvoice.invoiceNumber,
                  invoiceDate: new Date(latestInvoice.createdAt).toLocaleDateString('fr-FR'),
                },
                items: [
                  {
                    reference: 'CI.IFF',
                    designation: `Formation Cordiste IRATA\nDevis #${latestInvoice.devisNumber}\nSession: ${sessionInfo}${latestInvoice.paymentStatus === 'PARTIAL' ? '\n(Paiement partiel)' : ''}`,
                    quantity: 1,
                    unitPrice: latestInvoice.paidAmount || latestInvoice.amount,
                    tva: 0,
                  }
                ]
              }));
            }
            
            if (latestInvoice.paymentStatus === 'PAID') {
              setPaymentStatus('paid');
            } else if (latestInvoice.paymentStatus === 'PARTIAL') {
              setPaymentStatus('processing');
            } else {
              setPaymentStatus('pending');
            }
          } else {
            // Aucune facture trouvée, générer un numéro temporaire pour l'affichage
            if (userContrat) {
              const currentYear = new Date().getFullYear();
              const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
              const currentDay = String(new Date().getDate()).padStart(2, '0');
              const timestamp = Date.now();
              const tempInvoiceNumber = `CI.FF ${currentYear}${currentMonth}${currentDay} ${String(timestamp).slice(-3).padStart(3, '0')}`;
              
              setData(prev => ({
                ...prev,
                company: {
                  ...prev.company,
                  invoiceNumber: tempInvoiceNumber,
                  invoiceDate: new Date().toLocaleDateString('fr-FR'),
                },
                items: [
                  {
                    reference: 'CI.IFF',
                    designation: `Formation Cordiste IRATA\nDevis #${userContrat.devis?.numero || 'N/A'}\nSession: ${userContrat.devis?.demande?.session || ''}`,
                    quantity: 1,
                    unitPrice: userContrat.devis?.montant || 0,
                    tva: 0,
                  }
                ]
              }));
            }
          }
        }
      } catch (e) {
        console.error('Erreur lors du chargement:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [session]);

  const handlePrint = () => window.print();

  const updateCompany = (field: keyof InvoiceData['company'], value: any) => {
    setData(prev => ({ ...prev, company: { ...prev.company, [field]: value } }));
  };
  const updateCustomer = (field: keyof InvoiceData['customer'], value: any) => {
    setData(prev => ({ ...prev, customer: { ...prev.customer, [field]: value } }));
  };
  const updateRecipient = (field: keyof InvoiceData['recipient'], value: any) => {
    setData(prev => ({ ...prev, recipient: { ...prev.recipient, [field]: value } }));
  };

  const updateItem = (index: number, patch: Partial<InvoiceLineItem>) => {
    setData(prev => ({
      ...prev,
      items: prev.items.map((it, i) => (i === index ? { ...it, ...patch } : it)),
    }));
  };

  const addItem = () => {
    setData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        { reference: '', designation: '', quantity: 1, unitPrice: 0, tva: 0 },
      ],
    }));
  };

  const removeItem = (index: number) => {
    setData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const loadUserContratData = async () => {
    try {
      const contratRes = await fetch('/api/user/contrats');
      if (contratRes.ok) {
        const contrats = await contratRes.json();
        if (contrats.length > 0) {
          const contrat = contrats[0];
          setUserContrat(contrat);
          
          // Pré-remplir les informations du destinataire
          setData(prev => ({
            ...prev,
            recipient: {
              ...prev.recipient,
              name: `Monsieur ${contrat.prenom} ${contrat.nom}`,
              addressLines: [contrat.adresse],
              email: session?.user?.email || ''
            }
          }));
          
          // Recharger le statut des factures pour avoir le bon numéro
          await reloadInvoiceStatus();
          
          setMessage('Informations du contrat et de la facture chargées avec succès');
          setTimeout(() => setMessage(''), 2500);
        } else {
          setMessage('Aucun contrat trouvé');
          setTimeout(() => setMessage(''), 2500);
        }
      }
    } catch (e) {
      setMessage('Erreur lors du chargement des données du contrat');
      setTimeout(() => setMessage(''), 2500);
    }
  };

  const markAsPaid = async () => {
    try {
      setPaymentStatus('processing');
      // Ici vous pouvez ajouter l'appel API pour marquer la facture comme payée
      // await fetch('/api/user/invoice/mark-paid', { method: 'POST' });
      
      setPaymentStatus('paid');
      setMessage('Facture marquée comme payée');
      setTimeout(() => setMessage(''), 2500);
    } catch (e) {
      setPaymentStatus('pending');
      setMessage('Erreur lors du marquage de la facture');
      setTimeout(() => setMessage(''), 2500);
    }
  };

  const proceedToPayment = () => {
    // Générer immédiatement le numéro de facture et afficher les données
    if (userContrat) {
      const currentYear = new Date().getFullYear();
      const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
      const currentDay = String(new Date().getDate()).padStart(2, '0');
      const timestamp = Date.now();
      const invoiceNumber = `CI.FF ${currentYear}${currentMonth}${currentDay} ${String(timestamp).slice(-3).padStart(3, '0')}`;
      
      // Créer une facture temporaire avec les données du contrat
      const tempInvoice = {
        id: timestamp,
        invoiceNumber: invoiceNumber,
        devisNumber: userContrat.devis?.numero || 'N/A',
        amount: userContrat.devis?.montant || 0,
        paidAmount: 0,
        paymentStatus: 'PENDING',
        createdAt: new Date().toISOString(),
        session: userContrat.devis?.demande?.session || '',
        paymentMethod: 'EN_LIGNE',
        notes: 'Paiement en ligne'
      };
      
      setUserInvoice(tempInvoice);
      
      // Mettre à jour les données de la facture
      setData(prev => ({
        ...prev,
        company: {
          ...prev.company,
          invoiceNumber: invoiceNumber,
          invoiceDate: new Date().toLocaleDateString('fr-FR'),
        },
        items: [
          {
            reference: 'CI.IFF',
            designation: `Formation Cordiste IRATA\nDevis #${userContrat.devis?.numero || 'N/A'}\nSession: ${userContrat.devis?.demande?.session || ''}`,
            quantity: 1,
            unitPrice: userContrat.devis?.montant || 0,
            tva: 0,
          }
        ]
      }));
    }
    
    setPaymentType('initial');
    setShowPaymentPopup(true);
  };

  const payRemainingAmount = () => {
    setPaymentType('remaining');
    setShowPaymentPopup(true);
  };

  const signalPaymentToAdmin = async () => {
    try {
      if (!userContrat) {
        setMessage('Aucun contrat trouvé. Veuillez d\'abord charger vos données.');
        setTimeout(() => setMessage(''), 3000);
        return;
      }

      const response = await fetch('/api/user/invoice/signal-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contratId: userContrat.id,
          paymentMethod: 'VIREMENT',
          notes: 'Paiement signalé par l\'utilisateur',
          invoiceNumber: userInvoice?.invoiceNumber || data.company.invoiceNumber
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMessage('Signalement envoyé à l\'administration. Vous recevrez une confirmation par email.');
        
        // Mettre à jour le statut local
        setPaymentStatus('processing');
        
        // Générer immédiatement le numéro de facture et afficher les données
        const currentYear = new Date().getFullYear();
        const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
        const currentDay = String(new Date().getDate()).padStart(2, '0');
        const timestamp = Date.now();
        const invoiceNumber = `CI.FF ${currentYear}${currentMonth}${currentDay} ${String(timestamp).slice(-3).padStart(3, '0')}`;
        
        // Créer une facture temporaire avec les données du contrat
        const tempInvoice = {
          id: timestamp,
          invoiceNumber: invoiceNumber,
          devisNumber: userContrat.devis?.numero || 'N/A',
          amount: userContrat.devis?.montant || 0,
          paidAmount: 0,
          paymentStatus: 'PENDING',
          createdAt: new Date().toISOString(),
          session: userContrat.devis?.demande?.session || '',
          paymentMethod: 'VIREMENT',
          notes: 'Paiement signalé par l\'utilisateur'
        };
        
        setUserInvoice(tempInvoice);
        
        // Mettre à jour les données de la facture
        setData(prev => ({
          ...prev,
          company: {
            ...prev.company,
            invoiceNumber: invoiceNumber,
            invoiceDate: new Date().toLocaleDateString('fr-FR'),
          },
          items: [
            {
              reference: 'CI.IFF',
              designation: `Formation Cordiste IRATA\nDevis #${userContrat.devis?.numero || 'N/A'}\nSession: ${userContrat.devis?.demande?.session || ''}`,
              quantity: 1,
              unitPrice: userContrat.devis?.montant || 0,
              tva: 0,
            }
          ]
        }));
        
      } else {
        setMessage('Erreur lors de l\'envoi du signalement');
      }
    } catch (error) {
      setMessage('Erreur lors de l\'envoi du signalement');
    } finally {
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const reloadInvoiceStatus = async () => {
    try {
      // Récupérer les données du contrat pour avoir la session
      const contratRes = await fetch('/api/user/contrats');
      let sessionInfo = '';
      if (contratRes.ok) {
        const contrats = await contratRes.json();
        if (contrats.length > 0) {
          const contrat = contrats[0];
          sessionInfo = contrat.devis?.demande?.session || '';
        }
      }

      const invoiceStatusRes = await fetch('/api/user/invoice/status');
      if (invoiceStatusRes.ok) {
        const invoices = await invoiceStatusRes.json();
        if (invoices.length > 0) {
          const latestInvoice = invoices[0];
          setUserInvoice(latestInvoice);
          
          // Mettre à jour les données de la facture avec les nouvelles données
          if (latestInvoice) {
            const currentYear = new Date().getFullYear();
            const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
            const invoiceNumber = `CI.FF ${currentYear}${currentMonth} ${String(latestInvoice.id).slice(-3).padStart(3, '0')}`;
            
            setData(prev => ({
              ...prev,
              company: {
                ...prev.company,
                invoiceNumber: invoiceNumber,
                invoiceDate: new Date(latestInvoice.createdAt).toLocaleDateString('fr-FR'),
              },
              items: [
                {
                  reference: 'CI.IFF',
                  designation: `Formation Cordiste IRATA\nDevis #${latestInvoice.devisNumber}\nSession: ${sessionInfo}${latestInvoice.paymentStatus === 'PARTIAL' ? '\n(Paiement partiel)' : ''}`,
                  quantity: 1,
                  unitPrice: latestInvoice.paidAmount || latestInvoice.amount,
                  tva: 0,
                }
              ]
            }));
          }
          
          if (latestInvoice.paymentStatus === 'PAID') {
            setPaymentStatus('paid');
          } else if (latestInvoice.paymentStatus === 'PARTIAL') {
            setPaymentStatus('processing');
          } else {
            setPaymentStatus('pending');
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors du rechargement du statut:', error);
    }
  };

  const save = async () => {
    try {
      setSaving(true);
      setMessage('');
      const res = await fetch('/api/admin/settings/invoice', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Erreur de sauvegarde');
      setMessage('Modèle de facture enregistré');
    } catch (e) {
      setMessage("Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(''), 2500);
    }
  };

  const downloadPdf = async () => {
    try {
      setDownloading(true);
      
      // Utiliser l'API utilisateur pour générer le PDF
      const res = await fetch('/api/user/invoice/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!res.ok) {
        throw new Error('Erreur génération PDF');
      }
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const num = userInvoice ? userInvoice.invoiceNumber : 'facture';
      a.download = `facture_${num}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      setMessage('Erreur lors du téléchargement du PDF');
    } finally {
      setDownloading(false);
      setTimeout(() => setMessage(''), 2500);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Ma facture</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={loadUserContratData}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 print:hidden"
          >
            Charger mes données
          </button>
          <button
            onClick={reloadInvoiceStatus}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 print:hidden"
          >
            Actualiser facture
          </button>
        </div>
      </div>

      {/* Statut de paiement en haut - seulement si contrat validé */}
      {contractValidated && (paymentStatus === 'paid' || paymentStatus === 'processing') && userInvoice && (
        <div className={`border rounded-lg p-4 print:hidden ${
          paymentStatus === 'paid' ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className={`mr-2 ${paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                {paymentStatus === 'paid' ? '✅' : '⏳'}
              </span>
              <div>
                <h3 className={`text-sm font-medium ${
                  paymentStatus === 'paid' ? 'text-green-900' : 'text-yellow-900'
                }`}>
                  {paymentStatus === 'paid' ? 'Votre facture est payée' : 'Paiement partiel reçu'}
                </h3>
                <p className={`text-xs ${
                  paymentStatus === 'paid' ? 'text-green-800' : 'text-yellow-800'
                }`}>
                  {paymentStatus === 'paid' 
                    ? 'Accès aux documents et activités activé' 
                    : `Montant payé: ${userInvoice.paidAmount}€ sur ${userInvoice.amount}€`
                  }
                </p>
                {paymentStatus === 'processing' && (
                  <p className="text-xs text-yellow-800 mt-1">
                    Montant restant: {(userInvoice.amount - userInvoice.paidAmount).toFixed(2)}€
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={downloadPdf}
                disabled={downloading}
                className={`px-3 py-1 rounded text-sm disabled:opacity-60 ${
                  paymentStatus === 'paid' 
                    ? 'bg-green-600 text-white hover:bg-green-700' 
                    : 'bg-yellow-600 text-white hover:bg-yellow-700'
                }`}
              >
                {downloading ? 'Génération...' : 'Télécharger la facture'}
              </button>
              {paymentStatus === 'processing' && (
                <button
                  onClick={payRemainingAmount}
                  className="px-3 py-1 rounded text-sm bg-orange-600 text-white hover:bg-orange-700"
                >
                  Payer le reste
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Boutons de paiement en bas - seulement si contrat validé */}
      {contractValidated && (
        <div className="flex items-center gap-3 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Statut du paiement :</span>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              paymentStatus === 'paid' 
                ? 'bg-green-100 text-green-800' 
                : paymentStatus === 'processing'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {paymentStatus === 'paid' ? 'Payé' : paymentStatus === 'processing' ? 'Paiement partiel' : 'En attente'}
            </span>
          </div>
          
          {paymentStatus === 'pending' && (
            <>
          <button
                onClick={signalPaymentToAdmin}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
                Déjà payé - Signaler l'administration
          </button>
            </>
          )}
        </div>
      )}

      {/* Informations de la facture - seulement si contrat validé */}
      {contractValidated && userInvoice && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 print:hidden">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Détails de votre facture</h3>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <p><strong>Numéro de facture:</strong> {userInvoice.invoiceNumber}</p>
              <p><strong>Numéro de devis:</strong> {userInvoice.devisNumber}</p>
              <p><strong>Montant total:</strong> {userInvoice.amount}€</p>
              {paymentStatus === 'processing' && (
                <p><strong>Montant restant:</strong> <span className="text-orange-600 font-semibold">{(userInvoice.amount - userInvoice.paidAmount).toFixed(2)}€</span></p>
              )}
            </div>
            <div>
              <p><strong>Date de création:</strong> {new Date(userInvoice.createdAt).toLocaleDateString('fr-FR')}</p>
              <p><strong>Méthode de paiement:</strong> {userInvoice.paymentMethod || 'Non spécifiée'}</p>
              {paymentStatus === 'processing' && (
                <p><strong>Montant payé:</strong> <span className="text-green-600 font-semibold">{userInvoice.paidAmount}€</span></p>
              )}
              {userInvoice.notes && (
                <p><strong>Notes:</strong> {userInvoice.notes}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bouton passer au paiement en bas - seulement si contrat validé */}
      {contractValidated && paymentStatus === 'pending' && (
        <div className="flex justify-center print:hidden">
          <button
            onClick={proceedToPayment}
            className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium"
          >
            Passer au paiement
          </button>
        </div>
      )}

      {message && (
        <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded p-2 print:hidden">{message}</div>
      )}

      {/* Message si le contrat n'est pas validé */}
      {!contractValidated && userContrat && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 print:hidden">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
                </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Contrat en cours de traitement</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Votre contrat de formation est actuellement en cours de validation par l'administration. 
                Une fois validé, votre facture sera générée automatiquement et vous pourrez la consulter ici.
              </p>
                </div>
                </div>
              </div>
      )}

      {/* Information sur le chargement des données */}
      {contractValidated && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 print:hidden">
          <h3 className="text-sm font-medium text-blue-900 mb-1">Information</h3>
          <p className="text-xs text-blue-800">
            Cliquez sur "Charger mes données" pour récupérer automatiquement votre nom complet et votre adresse 
            depuis votre contrat de formation. Ces informations seront pré-remplies dans la section "Destinataire".
          </p>
                </div>
      )}

      {/* Information sur le paiement - seulement si contrat validé */}
      {contractValidated && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 print:hidden">
          <h3 className="text-sm font-medium text-yellow-900 mb-1">Processus de paiement</h3>
          <div className="text-xs text-yellow-800 space-y-1">
            <p>• <strong>Passer au paiement</strong> : En cours de développement - Contactez l'administration</p>
            <p>• <strong>Payer le reste</strong> : En cours de développement - Contactez l'administration</p>
            <p>• <strong>Déjà payé - Signaler l'administration</strong> : Pour informer d'un paiement par virement ou chèque</p>
            <p>• L'administrateur validera votre paiement et vous recevrez une notification</p>
            <p>• Une fois validée, la facture débloque l'accès à tous les documents et activités de formation</p>
            <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
              <p className="text-blue-800 font-medium">💡 <strong>Information importante :</strong></p>
              <p className="text-blue-700">Pour toute question concernant les modalités de paiement, contactez directement l'administration. Vous recevrez une réponse personnalisée avec les instructions détaillées.</p>
                </div>
              </div>
          </div>
        )}

      {/* Editor + Preview - seulement si contrat validé */}
      {contractValidated && (
        <div className="grid grid-cols-1 gap-4">
        {/* Preview */}
        <div className="overflow-auto">
          <InvoiceTemplate data={data} />
        </div>
      </div>
      )}

      {/* Popup de paiement */}
      {showPaymentPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-orange-100 rounded-full mb-4">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Paiement en cours de développement
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Le système de paiement en ligne est actuellement en cours de développement.
              </p>
              <p className="text-sm text-gray-600 mb-6">
                {paymentType === 'remaining' ? (
                  <>
                    Pour procéder au paiement du montant restant de <strong className="text-orange-600">{(userInvoice?.amount - userInvoice?.paidAmount).toFixed(2)}€</strong>, 
                    veuillez contacter directement l'administration. Vous recevrez une réponse personnalisée avec les instructions détaillées.
                  </>
                ) : (
                  <>
                    Pour procéder au paiement de votre facture de <strong className="text-orange-600">{userInvoice?.amount}€</strong>, 
                    veuillez contacter directement l'administration. Vous recevrez une réponse personnalisée avec les instructions détaillées.
                  </>
                )}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowPaymentPopup(false)}
                  className="flex-1 bg-orange-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                >
                  Compris
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


