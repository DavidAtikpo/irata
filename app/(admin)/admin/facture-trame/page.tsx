"use client";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import InvoiceTemplate, { InvoiceData } from '@/components/InvoiceTemplate';

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
      designation: 'Formation Cordiste IRATA sur 5 jours\nDu 31/03/2025 au 04/04/2025\nSoit 40 heures',
      quantity: 1,
      unitPrice: 1350,
      tva: 0,
    },
  ],
  footerRight: 'Page 1 sur 1',
  showQr: true,
};

export default function FactureTramePage() {
  const { data: session } = useSession();
  const [data, setData] = useState<InvoiceData>(defaultData);
  const [loading, setLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<string>('');
  const [showEditor, setShowEditor] = useState<boolean>(false);
  const [userInvoices, setUserInvoices] = useState<any[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [showPartialPaymentModal, setShowPartialPaymentModal] = useState<boolean>(false);
  const [partialAmount, setPartialAmount] = useState<number>(0);
  const [invoiceToMarkPartial, setInvoiceToMarkPartial] = useState<any>(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    fullyPaid: 0,
    partiallyPaid: 0,
    pendingPayment: 0
  });
  const [sessions, setSessions] = useState<string[]>([]);
  const [selectedSession, setSelectedSession] = useState<string>('all');
  const [availableSessions, setAvailableSessions] = useState<any[]>([]);
  const [selectedStatType, setSelectedStatType] = useState<string | null>(null);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [sessionStats, setSessionStats] = useState<{[key: string]: number}>({});

  // Chargement initial des données
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        console.log('Chargement des données...');
        
        // Charger les sessions
        const sessionResponse = await fetch('/api/admin/training-sessions');
        if (sessionResponse.ok) {
          const sessionsData = await sessionResponse.json();
          console.log('Sessions chargées:', sessionsData.length);
          setAvailableSessions(sessionsData);
          
          const sessionNames = sessionsData.map((session: any) => session.name);
          setSessions(sessionNames);
        } else {
          console.error('Erreur lors du chargement des sessions');
        }
        
        // Charger les factures
        await loadUserInvoices();
        
      } catch (error) {
        console.error('Erreur lors du chargement:', error);
        setMessage('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.role === 'ADMIN') {
      loadData();
    }
  }, [session]);

  const loadUserInvoices = async () => {
    try {
      console.log('Chargement des factures...');
      const response = await fetch('/api/admin/invoices');
      
      if (response.ok) {
        const data = await response.json();
        console.log('Factures chargées:', data.invoices.length);
        console.log('Statistiques de session:', data.sessionStats);
        
        setUserInvoices(data.invoices);
        setSessionStats(data.sessionStats);
        calculateStats(data.invoices);
      } else {
        console.error('Erreur lors du chargement des factures');
        const errorData = await response.json();
        console.error('Détails de l\'erreur:', errorData);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des factures:', error);
    }
  };

  const calculateStats = (invoices: any[]) => {
    console.log('Calcul des statistiques pour', invoices.length, 'factures');
    
    const filteredInvoices = selectedSession === 'all' 
      ? invoices 
      : invoices.filter((invoice: any) => invoice.session === selectedSession);
    
    console.log('Factures filtrées par session:', filteredInvoices.length);
    
    const userPaymentStatus = new Map();
    
    filteredInvoices.forEach((invoice: any) => {
      const userId = invoice.userId;
      const status = invoice.paymentStatus;
      
      if (!userPaymentStatus.has(userId)) {
        userPaymentStatus.set(userId, status);
      } else {
        const currentStatus = userPaymentStatus.get(userId);
        // Priorité: PAID > PARTIAL > PENDING
        if (currentStatus === 'PENDING' && status !== 'PENDING') {
          userPaymentStatus.set(userId, status);
        } else if (currentStatus === 'PARTIAL' && status === 'PAID') {
          userPaymentStatus.set(userId, status);
        }
      }
    });
    
    const statusCounts = {
      PAID: 0,
      PARTIAL: 0,
      PENDING: 0
    };
    
    userPaymentStatus.forEach(status => {
      statusCounts[status as keyof typeof statusCounts]++;
    });
    
    const newStats = {
      totalUsers: userPaymentStatus.size,
      fullyPaid: statusCounts.PAID,
      partiallyPaid: statusCounts.PARTIAL,
      pendingPayment: statusCounts.PENDING
    };
    
    console.log('Nouvelles statistiques:', newStats);
    setStats(newStats);
  };

  const handleStatClick = (statType: string) => {
    console.log('Clic sur statistique:', statType);
    setSelectedStatType(statType);
    
    const filteredInvoices = selectedSession === 'all' 
      ? userInvoices 
      : userInvoices.filter((invoice: any) => invoice.session === selectedSession);
    
    let targetStatus: string;
    switch (statType) {
      case 'total':
        targetStatus = 'all';
        break;
      case 'fullyPaid':
        targetStatus = 'PAID';
        break;
      case 'partiallyPaid':
        targetStatus = 'PARTIAL';
        break;
      case 'pendingPayment':
        targetStatus = 'PENDING';
        break;
      default:
        targetStatus = 'all';
    }
    
    if (targetStatus === 'all') {
      const uniqueUsers = new Map();
      filteredInvoices.forEach((invoice: any) => {
        if (!uniqueUsers.has(invoice.userId)) {
          uniqueUsers.set(invoice.userId, invoice);
        }
      });
      setFilteredUsers(Array.from(uniqueUsers.values()));
    } else {
      const userPaymentStatus = new Map();
          filteredInvoices.forEach((invoice: any) => {
      const userId = invoice.userId;
      const status = invoice.paymentStatus;
      
      if (!userPaymentStatus.has(userId)) {
        userPaymentStatus.set(userId, status);
      } else {
        const currentStatus = userPaymentStatus.get(userId);
        // Priorité: PAID > PARTIAL > PENDING (même logique que calculateStats)
        if (currentStatus === 'PENDING' && status !== 'PENDING') {
          userPaymentStatus.set(userId, status);
        } else if (currentStatus === 'PARTIAL' && status === 'PAID') {
          userPaymentStatus.set(userId, status);
        }
      }
    });
      
      const matchingUsers = filteredInvoices.filter((invoice: any) => {
        const userStatus = userPaymentStatus.get(invoice.userId);
        return userStatus === targetStatus;
      });
      
      const uniqueMatchingUsers = new Map();
      matchingUsers.forEach((invoice: any) => {
        if (!uniqueMatchingUsers.has(invoice.userId)) {
          uniqueMatchingUsers.set(invoice.userId, invoice);
        }
      });
      
      setFilteredUsers(Array.from(uniqueMatchingUsers.values()));
    }
  };

  const selectInvoice = (invoice: any) => {
    console.log('Sélection de la facture:', invoice);
    setSelectedInvoice(invoice);
    
    // Mettre à jour les données de la facture pour l'affichage
    setData({
      ...defaultData,
      company: {
        ...defaultData.company,
        invoiceNumber: invoice.invoiceNumber,
        invoiceDate: new Date(invoice.createdAt).toLocaleDateString('fr-FR'),
      },
      recipient: {
        name: invoice.userName,
        addressLines: [invoice.userAddress || 'Adresse non disponible'],
        phone: '',
        email: invoice.userEmail,
      },
      items: [
        {
          reference: 'CI.IFF',
          designation: `Formation Cordiste IRATA\nDevis #${invoice.devisNumber}\nSession: ${invoice.session || 'Non spécifiée'}`,
          quantity: 1,
          unitPrice: invoice.paymentStatus === 'PARTIAL' ? invoice.paidAmount : invoice.amount,
          tva: 0,
        },
      ],
    });
  };

  const markAsPaid = async (invoiceId: string, paymentType: 'full' | 'partial') => {
    try {
      const amount = paymentType === 'partial' ? partialAmount : undefined;
      
      const response = await fetch(`/api/admin/invoices/${invoiceId}/mark-paid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentType,
          amount,
        }),
      });

      if (response.ok) {
        setMessage('Paiement enregistré avec succès');
        setShowPartialPaymentModal(false);
        setPartialAmount(0);
        setInvoiceToMarkPartial(null);
        await loadUserInvoices(); // Recharger les données
      } else {
        setMessage('Erreur lors de l\'enregistrement du paiement');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setMessage('Erreur lors de l\'enregistrement du paiement');
    }
  };

  const downloadUserInvoicePdf = async (invoice: any) => {
    try {
      const response = await fetch('/api/admin/invoice/user-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoiceId: invoice.id,
          userId: invoice.userId,
        }),
      });

      const contentType = response.headers.get('Content-Type');
      
      if (contentType === 'application/pdf') {
        // PDF généré côté serveur
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `facture_${invoice.invoiceNumber.replace(/\s+/g, '_')}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else if (contentType === 'application/json') {
        // Fallback client-side
        const data = await response.json();
        if (data.fallbackToClientSide) {
          // Générer le PDF côté client
          await generatePDFClientSide(data.htmlContent, data.fileName);
        } else {
          setMessage('Erreur lors du téléchargement du PDF');
        }
      } else {
        setMessage('Erreur lors du téléchargement du PDF');
      }
    } catch (error) {
      console.error('Erreur:', error);
      // Essayer la génération client-side en cas d'erreur
      try {
        const response = await fetch('/api/admin/invoice/user-pdf', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            invoiceId: invoice.id,
            userId: invoice.userId,
          }),
        });
        
        const data = await response.json();
        if (data.fallbackToClientSide) {
          await generatePDFClientSide(data.htmlContent, data.fileName);
        } else {
          setMessage('Erreur lors du téléchargement du PDF');
        }
      } catch (fallbackError) {
        console.error('Erreur fallback:', fallbackError);
        setMessage('Erreur lors du téléchargement du PDF');
      }
    }
  };

  const generatePDFClientSide = async (htmlContent: string, fileName: string) => {
    try {
      // Importer dynamiquement les bibliothèques
      const [jsPDF, html2canvas] = await Promise.all([
        import('jspdf'),
        import('html2canvas')
      ]);

      // Créer un élément temporaire pour le contenu HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '0';
      document.body.appendChild(tempDiv);

      // Capturer le contenu
      const canvas = await html2canvas.default(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      // Nettoyer l'élément temporaire
      document.body.removeChild(tempDiv);

      // Générer le PDF
      const pdf = new jsPDF.default('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(fileName);

    } catch (error) {
      console.error('Erreur lors de la génération client-side:', error);
      setMessage('Erreur lors de la génération du PDF côté client');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des factures</h1>
        {!selectedInvoice && (
        <div className="flex items-center gap-2">
          <button
              onClick={() => setShowEditor(!showEditor)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-sm"
            >
              {showEditor ? 'Masquer l\'éditeur' : 'Afficher l\'éditeur'}
          </button>
        </div>
        )}
      </div>

      {message && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {message}
        </div>
      )}

      {/* Filtre par session */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Filtrer par session :</label>
          <select
            value={selectedSession}
            onChange={(e) => {
              setSelectedSession(e.target.value);
              calculateStats(userInvoices);
            }}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Toutes les sessions</option>
            {sessions.map((session) => (
              <option key={session} value={session}>
                {session} ({sessionStats[session] || 0} inscrits)
              </option>
            ))}
          </select>
                </div>
        
                 {/* Résumé de la session sélectionnée */}
         <div className="mt-4">
           <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
             <div className="flex items-center justify-between">
                <div>
                 <h3 className="text-sm font-medium text-blue-800">
                   {selectedSession === 'all' ? 'Toutes les sessions' : `Session: ${selectedSession}`}
                 </h3>
                 <p className="text-xs text-blue-600 mt-1">
                   {selectedSession === 'all' ? 'Nombre total d\'utilisateurs inscrits' : 'Nombre d\'utilisateurs inscrits'}
                 </p>
                </div>
               <div className="text-right">
                 <span className="text-2xl font-bold text-blue-600">
                   {selectedSession === 'all' 
                     ? Object.values(sessionStats).reduce((sum: number, count: number) => sum + count, 0)
                     : sessionStats[selectedSession] || 0
                   }
                 </span>
                 <p className="text-xs text-blue-600">utilisateurs</p>
                </div>
                </div>
              </div>
                </div>
              </div>

      {/* Statistiques - Comptage par utilisateur unique avec priorité PAID > PARTIAL > PENDING */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div 
          className="bg-white rounded-lg border p-4 text-center cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => handleStatClick('total')}
        >
          <div className="text-2xl font-bold text-blue-600">{stats.totalUsers}</div>
          <div className="text-sm text-gray-600">Total utilisateurs</div>
          <div className="text-xs text-blue-500 mt-1">Cliquez pour voir</div>
        </div>
        <div 
          className="bg-white rounded-lg border p-4 text-center cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => handleStatClick('fullyPaid')}
        >
          <div className="text-2xl font-bold text-green-600">{stats.fullyPaid}</div>
          <div className="text-sm text-gray-600">Paiement total</div>
          <div className="text-xs text-green-500 mt-1">Cliquez pour voir</div>
        </div>
        <div 
          className="bg-white rounded-lg border p-4 text-center cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => handleStatClick('partiallyPaid')}
        >
          <div className="text-2xl font-bold text-yellow-600">{stats.partiallyPaid}</div>
          <div className="text-sm text-gray-600">Paiement partiel</div>
          <div className="text-xs text-yellow-500 mt-1">Cliquez pour voir</div>
        </div>
        <div 
          className="bg-white rounded-lg border p-4 text-center cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => handleStatClick('pendingPayment')}
        >
          <div className="text-2xl font-bold text-red-600">{stats.pendingPayment}</div>
          <div className="text-sm text-gray-600">En attente</div>
          <div className="text-xs text-red-500 mt-1">Cliquez pour voir</div>
        </div>
      </div>

      {/* Liste des utilisateurs filtrés */}
      {selectedStatType && (
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              {selectedStatType === 'total' && 'Tous les utilisateurs'}
              {selectedStatType === 'fullyPaid' && 'Utilisateurs avec paiement total'}
              {selectedStatType === 'partiallyPaid' && 'Utilisateurs avec paiement partiel'}
              {selectedStatType === 'pendingPayment' && 'Utilisateurs en attente'}
              <span className="text-sm text-gray-500 ml-2">({filteredUsers.length})</span>
            </h2>
            <button
              onClick={() => setSelectedStatType(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕ Fermer
            </button>
          </div>
          {filteredUsers.length === 0 ? (
            <p className="text-gray-500">Aucun utilisateur trouvé</p>
          ) : (
            <div className="space-y-3">
              {filteredUsers.map((invoice) => (
                <div key={invoice.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium">{invoice.userName}</h3>
                      <p className="text-sm text-gray-600">{invoice.userEmail}</p>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div>
                          <p className="text-xs text-gray-500">Facture</p>
                          <p className="text-sm font-medium text-blue-600">{invoice.invoiceNumber}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Montant</p>
                          <p className="text-sm font-medium">{invoice.amount}€</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Statut</p>
                          <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                            invoice.paymentStatus === 'PAID' 
                              ? 'bg-green-100 text-green-800' 
                              : invoice.paymentStatus === 'PARTIAL'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {invoice.paymentStatus === 'PAID' ? 'Payée' : 
                             invoice.paymentStatus === 'PARTIAL' ? 'Partiel' : 'En attente'}
                          </span>
                        </div>
                </div>
              </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => selectInvoice(invoice)}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                      >
                        Voir détails
                      </button>
                      <button
                        onClick={() => downloadUserInvoicePdf(invoice)}
                        className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                      >
                        Télécharger PDF
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              </div>
          )}
          </div>
        )}

      {/* Détails de la facture sélectionnée */}
      {selectedInvoice && (
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Détails de la facture</h2>
            <button
              onClick={() => setSelectedInvoice(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕ Fermer
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <h3 className="font-medium mb-2">Informations utilisateur</h3>
              <p><strong>Nom:</strong> {selectedInvoice.userName}</p>
              <p><strong>Email:</strong> {selectedInvoice.userEmail}</p>
              <p><strong>Facture:</strong> {selectedInvoice.invoiceNumber}</p>
              <p><strong>Montant:</strong> {selectedInvoice.amount}€</p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Statut de paiement</h3>
              <p><strong>Statut:</strong> 
                <span className={`ml-2 inline-flex px-2 py-1 rounded text-xs font-medium ${
                  selectedInvoice.paymentStatus === 'PAID' 
                    ? 'bg-green-100 text-green-800' 
                    : selectedInvoice.paymentStatus === 'PARTIAL'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {selectedInvoice.paymentStatus === 'PAID' ? 'Payée' : 
                   selectedInvoice.paymentStatus === 'PARTIAL' ? 'Paiement partiel' : 'En attente'}
                </span>
              </p>
              {selectedInvoice.paymentStatus === 'PARTIAL' && (
                <p><strong>Montant payé:</strong> {selectedInvoice.paidAmount}€</p>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => markAsPaid(selectedInvoice.id, 'full')}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Marquer comme payée
            </button>
            <button
              onClick={() => {
                setInvoiceToMarkPartial(selectedInvoice);
                setShowPartialPaymentModal(true);
              }}
              className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
            >
              Paiement partiel
            </button>
            <button
              onClick={() => downloadUserInvoicePdf(selectedInvoice)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Télécharger PDF
            </button>
          </div>
        </div>
      )}

      {/* Modal pour paiement partiel */}
      {showPartialPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Paiement partiel</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Montant payé (€)
              </label>
              <input
                type="number"
                value={partialAmount}
                onChange={(e) => setPartialAmount(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Montant"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => markAsPaid(invoiceToMarkPartial.id, 'partial')}
                className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
              >
                Confirmer
              </button>
              <button
                onClick={() => {
                  setShowPartialPaymentModal(false);
                  setPartialAmount(0);
                  setInvoiceToMarkPartial(null);
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Éditeur - seulement si demandé */}
      {showEditor && (
        <div className="bg-white rounded-lg border p-4">
          <h2 className="text-lg font-semibold mb-4">Éditeur de facture</h2>
          <div className="text-gray-500">Éditeur en cours de développement...</div>
        </div>
      )}

      {/* Aperçu de la facture - toujours visible comme sur la page utilisateur */}
      <div className="bg-white rounded-lg border p-4">
        <h2 className="text-lg font-semibold mb-4">
          {selectedInvoice ? 'Aperçu de la facture sélectionnée' : 'Aperçu de la facture'}
        </h2>
      </div>
    </div>
  );
}
