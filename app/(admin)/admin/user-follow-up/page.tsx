'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ExclamationTriangleIcon, CheckCircleIcon, EnvelopeIcon, PhoneIcon, ChevronDownIcon, ChevronUpIcon, DocumentTextIcon, LinkIcon, ClipboardIcon, BugAntIcon } from '@heroicons/react/24/outline';

interface Invoice {
  invoiceNumber: string;
  amount: number;
  paymentStatus: string;
  paidAmount: number | null;
  paymentMethod: string | null;
  notes: string | null;
}

interface FollowRow {
  user: { id: string; email: string; nom?: string; prenom?: string; phone?: string };
  stats: {
    devisPending: number;
    devisValides: number;
    contratsPending: number;
    contratsSignes: number;
    contratsValides: number;
    invoicesUnpaid: number;
    invoicesPaid: number;
    invoicesPartial: number;
    invoicesPaidManualValidated: number;
    invoicesPaidStripe: number;
    invoicesPartialManualValidated: number;
    invoicesPartialStripe: number;
    invoicesPartialVirement: number;
    hasNoInvoice: boolean;
    demandesEnAttente: number;
    demandesValidees: number;
  };
  invoices: Invoice[];
  pending: {
    devisNonValides: boolean;
    contratNonSigne: boolean;
    contratNonValide: boolean;
    facturesImpayees: boolean;
    factureNonGeneree: boolean;
    demandeEnAttente: boolean;
  };
  hasPending: boolean;
}

export default function UserFollowUpPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [rows, setRows] = useState<FollowRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [onlyPending, setOnlyPending] = useState(true);
  const [invoiceFilter, setInvoiceFilter] = useState<string>('');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [generatingInvoice, setGeneratingInvoice] = useState<Set<string>>(new Set());
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedUserForEmail, setSelectedUserForEmail] = useState<{ id: string; nom?: string; prenom?: string; email?: string } | null>(null);
  const [emailSubject, setEmailSubject] = useState('Action requise sur votre dossier');
  const [emailMessage, setEmailMessage] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [showLinksModal, setShowLinksModal] = useState(false);
  const [selectedUserLinks, setSelectedUserLinks] = useState<{
    userId: string;
    userName: string;
    links: any;
  } | null>(null);
  const [loadingLinks, setLoadingLinks] = useState<Set<string>>(new Set());
  const [showDebugModal, setShowDebugModal] = useState(false);
  const [debugData, setDebugData] = useState<any>(null);
  const [debuggingUser, setDebuggingUser] = useState<string>('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/');
      return;
    }
    if (status === 'authenticated') {
      load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, onlyPending, invoiceFilter]);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      params.append('onlyPending', onlyPending.toString());
      if (invoiceFilter) {
        params.append('invoiceFilter', invoiceFilter);
      }
      const res = await fetch(`/api/admin/user-follow-up?${params.toString()}`);
      if (!res.ok) throw new Error('Erreur lors du chargement');
      const data = await res.json();
      setRows(data);
    } catch (e) {
      setError('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const openEmailModal = (userId: string, userData: { nom?: string; prenom?: string; email?: string }) => {
    const row = rows.find(r => r.user.id === userId);
    // Générer un message par défaut basé sur les actions en attente
    let defaultMessage = `Bonjour ${userData.prenom || ''} ${userData.nom || ''},\n\n`;
    
    if (row) {
      const pendingActions = [];
      if (row.pending.devisNonValides) pendingActions.push('validation de votre devis');
      if (row.pending.contratNonSigne) pendingActions.push('signature de votre contrat');
      if (row.pending.contratNonValide) pendingActions.push('validation de votre contrat');
      if (row.pending.facturesImpayees) pendingActions.push('paiement de votre facture');
      if (row.pending.factureNonGeneree) pendingActions.push('génération de votre facture');
      if (row.pending.demandeEnAttente) pendingActions.push('traitement de votre demande');
      
      if (pendingActions.length > 0) {
        defaultMessage += `Merci de compléter les étapes suivantes :\n`;
        pendingActions.forEach((action, index) => {
          defaultMessage += `${index + 1}. ${action}\n`;
        });
        defaultMessage += `\nMerci de votre compréhension.\n\nCordialement.`;
      } else {
        defaultMessage += `Merci de compléter les étapes en attente sur votre dossier.\n\nCordialement.`;
      }
    } else {
      defaultMessage += `Merci de compléter les étapes en attente (validation du devis, signature du contrat, ou paiement).\n\nCordialement.`;
    }
    
    setEmailMessage(defaultMessage);
    setSelectedUserForEmail({ id: userId, ...userData });
    setShowEmailModal(true);
  };

  const sendEmail = async () => {
    if (!selectedUserForEmail) return;
    
    setSendingEmail(true);
    try {
      const response = await fetch('/api/admin/notify/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUserForEmail.id,
          subject: emailSubject,
          message: emailMessage,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi');
      }

      alert('Email envoyé avec succès !');
      setShowEmailModal(false);
      setSelectedUserForEmail(null);
      setEmailSubject('Action requise sur votre dossier');
      setEmailMessage('');
    } catch (e: any) {
      alert('Erreur lors de l\'envoi de l\'email: ' + (e.message || 'Erreur inconnue'));
    } finally {
      setSendingEmail(false);
    }
  };

  const sendWhatsApp = async (userId: string) => {
    try {
      await fetch('/api/admin/notify/whatsapp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId }) });
      alert('WhatsApp envoyé (placeholder)');
    } catch (e) {
      alert('Erreur envoi WhatsApp');
    }
  };

  const toggleExpand = (userId: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const getPaymentStatusLabel = (status: string) => {
    switch (status) {
      case 'PAID': return 'Payé';
      case 'PARTIAL': return 'Partiel';
      case 'PENDING': return 'En attente';
      case 'CANCELLED': return 'Annulé';
      default: return status;
    }
  };

  const getPaymentMethodLabel = (method: string | null) => {
    if (!method) return 'Validé manuellement';
    switch (method) {
      case 'BANK_TRANSFER': return 'Virement bancaire (Stripe)';
      case 'MOBILE_MONEY': return 'Mobile Money';
      case 'CASH': return 'Espèces';
      case 'CRYPTO': return 'Crypto-monnaie';
      case 'VIREMENT': return 'Virement';
      default: return method;
    }
  };

  const openUserPages = async (userId: string, userName: string) => {
    setLoadingLinks(prev => new Set(prev).add(userId));
    try {
      const response = await fetch(`/api/admin/user-pages?userId=${userId}`);
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des liens');
      }
      const links = await response.json();
      setSelectedUserLinks({ userId, userName, links });
      setShowLinksModal(true);
    } catch (e: any) {
      alert('Erreur lors du chargement des liens: ' + (e.message || 'Erreur inconnue'));
    } finally {
      setLoadingLinks(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Lien copié dans le presse-papiers !');
    }).catch(() => {
      alert('Erreur lors de la copie');
    });
  };

  const openLink = (url: string) => {
    window.open(url, '_blank');
  };

  const debugUser = async (email: string) => {
    setDebuggingUser(email);
    try {
      const response = await fetch(`/api/admin/user-follow-up/debug?email=${encodeURIComponent(email)}`);
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des données de debug');
      }
      const data = await response.json();
      setDebugData(data);
      setShowDebugModal(true);
    } catch (e: any) {
      alert('Erreur lors du chargement des données de debug: ' + (e.message || 'Erreur inconnue'));
    } finally {
      setDebuggingUser('');
    }
  };

  const generateInvoice = async (userId: string) => {
    setGeneratingInvoice(prev => new Set(prev).add(userId));
    try {
      const response = await fetch('/api/admin/invoice/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la génération');
      }

      const data = await response.json();
      alert(data.message || `${data.invoices.length} facture(s) générée(s) avec succès`);
      
      // Recharger les données
      await load();
    } catch (e: any) {
      alert('Erreur lors de la génération de la facture: ' + (e.message || 'Erreur inconnue'));
    } finally {
      setGeneratingInvoice(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900">Suivi des Utilisateurs</h1>
              <label className="text-sm text-gray-700 flex items-center gap-2">
                <input type="checkbox" checked={onlyPending} onChange={(e) => setOnlyPending(e.target.checked)} />
                Afficher seulement les actions en attente
              </label>
            </div>
            
            {/* Filtres de factures */}
            <div className="flex flex-wrap gap-2">
              <label className="text-sm font-medium text-gray-700">Filtre factures:</label>
              <select
                value={invoiceFilter}
                onChange={(e) => setInvoiceFilter(e.target.value)}
                className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Toutes les factures</option>
                <option value="total_manuel">Total manuel</option>
                <option value="partiel_manuel">Partiel manuel</option>
                <option value="total_stripe">Total Stripe</option>
                <option value="partiel_stripe">Partiel Stripe</option>
                <option value="partiel_virement">Partiel virement</option>
                <option value="no_invoice">Sans facture</option>
              </select>
            </div>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>
            )}
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Chargement...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilisateur</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Devis</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contrat</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Factures</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Demandes</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {rows.map((row) => (
                      <tr key={row.user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{row.user.prenom || ''} {row.user.nom || ''}</div>
                          <div className="text-xs text-gray-500">{row.user.email}</div>
                          {row.user.phone && <div className="text-xs text-gray-500">{row.user.phone}</div>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm">
                            {row.pending.devisNonValides ? (
                              <span className="inline-flex items-center gap-1 text-yellow-700 bg-yellow-100 px-2 py-1 rounded">
                                <ExclamationTriangleIcon className="h-4 w-4" /> {row.stats.devisPending} en attente
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-green-700 bg-green-100 px-2 py-1 rounded">
                                <CheckCircleIcon className="h-4 w-4" /> {row.stats.devisValides} validés
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1 text-sm">
                            {row.pending.contratNonSigne && (
                              <div className="text-yellow-700 bg-yellow-100 px-2 py-1 rounded inline-flex items-center gap-1">
                                <ExclamationTriangleIcon className="h-4 w-4" /> Non signé
                              </div>
                            )}
                            {row.pending.contratNonValide && (
                              <div className="text-orange-700 bg-orange-100 px-2 py-1 rounded inline-flex items-center gap-1">
                                <ExclamationTriangleIcon className="h-4 w-4" /> En attente validation
                              </div>
                            )}
                            {!row.pending.contratNonSigne && !row.pending.contratNonValide && (
                              <div className="text-green-700 bg-green-100 px-2 py-1 rounded inline-flex items-center gap-1">
                                <CheckCircleIcon className="h-4 w-4" /> OK
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="space-y-1 text-sm flex-1">
                                {row.pending.facturesImpayees && (
                                  <div className="text-red-700 bg-red-100 px-2 py-1 rounded inline-flex items-center gap-1">
                                    <ExclamationTriangleIcon className="h-4 w-4" /> {row.stats.invoicesUnpaid} impayée(s)
                                  </div>
                                )}
                                {row.stats.invoicesPaid > 0 && (
                                  <div className="text-green-700 bg-green-100 px-2 py-1 rounded inline-flex items-center gap-1">
                                    <CheckCircleIcon className="h-4 w-4" /> {row.stats.invoicesPaid} payée(s) total
                                    {row.stats.invoicesPaidStripe > 0 && (
                                      <span className="text-xs ml-1">({row.stats.invoicesPaidStripe} Stripe)</span>
                                    )}
                                    {row.stats.invoicesPaidManualValidated > 0 && (
                                      <span className="text-xs ml-1">({row.stats.invoicesPaidManualValidated} manuel)</span>
                                    )}
                                  </div>
                                )}
                                {row.stats.invoicesPartial > 0 && (
                                  <div className="text-orange-700 bg-orange-100 px-2 py-1 rounded inline-flex items-center gap-1">
                                    <ExclamationTriangleIcon className="h-4 w-4" /> {row.stats.invoicesPartial} partiel(le)
                                    {row.stats.invoicesPartialStripe > 0 && (
                                      <span className="text-xs ml-1">({row.stats.invoicesPartialStripe} Stripe)</span>
                                    )}
                                    {row.stats.invoicesPartialVirement > 0 && (
                                      <span className="text-xs ml-1">({row.stats.invoicesPartialVirement} virement)</span>
                                    )}
                                    {row.stats.invoicesPartialManualValidated > 0 && (
                                      <span className="text-xs ml-1">({row.stats.invoicesPartialManualValidated} manuel)</span>
                                    )}
                                  </div>
                                )}
                                {row.pending.factureNonGeneree && (
                                  <div className="text-red-700 bg-red-100 px-2 py-1 rounded inline-flex items-center gap-1">
                                    <ExclamationTriangleIcon className="h-4 w-4" /> Facture non générée
                                  </div>
                                )}
                                {!row.pending.facturesImpayees && !row.pending.factureNonGeneree && row.stats.invoicesPaid === 0 && row.stats.invoicesPartial === 0 && (
                                  <span className="text-gray-500 text-xs">Aucune facture</span>
                                )}
                              </div>
                              {row.invoices.length > 0 && (
                                <button
                                  onClick={() => toggleExpand(row.user.id)}
                                  className="text-indigo-600 hover:text-indigo-900"
                                  title="Voir les détails des factures"
                                >
                                  {expandedRows.has(row.user.id) ? (
                                    <ChevronUpIcon className="h-5 w-5" />
                                  ) : (
                                    <ChevronDownIcon className="h-5 w-5" />
                                  )}
                                </button>
                              )}
                            </div>
                            {expandedRows.has(row.user.id) && row.invoices.length > 0 && (
                              <div className="mt-2 bg-gray-50 rounded-lg p-3 border border-gray-200">
                                <div className="text-xs font-semibold text-gray-700 mb-2">Détails des factures ({row.invoices.length})</div>
                                <div className="space-y-2">
                                  {row.invoices.map((invoice, idx) => (
                                    <div key={idx} className="bg-white rounded p-2 border border-gray-200 text-xs">
                                      <div className="mb-2 pb-2 border-b border-gray-200">
                                        <span className="font-semibold text-gray-900">Facture #{invoice.invoiceNumber}</span>
                                      </div>
                                      <div className="grid grid-cols-2 gap-2">
                                        <div>
                                          <span className="font-medium text-gray-700">Montant total:</span>
                                          <span className="ml-1">{invoice.amount.toFixed(2)} €</span>
                                        </div>
                                        <div>
                                          <span className="font-medium text-gray-700">Statut:</span>
                                          <span className={`ml-1 px-2 py-0.5 rounded ${
                                            invoice.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' :
                                            invoice.paymentStatus === 'PARTIAL' ? 'bg-orange-100 text-orange-800' :
                                            invoice.paymentStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                          }`}>
                                            {getPaymentStatusLabel(invoice.paymentStatus)}
                                          </span>
                                        </div>
                                        <div>
                                          <span className="font-medium text-gray-700">Montant payé:</span>
                                          <span className="ml-1">{invoice.paidAmount !== null ? `${invoice.paidAmount.toFixed(2)} €` : '-'}</span>
                                        </div>
                                        <div>
                                          <span className="font-medium text-gray-700">Moyen de paiement:</span>
                                          <span className="ml-1 text-gray-600">{getPaymentMethodLabel(invoice.paymentMethod)}</span>
                                        </div>
                                        {invoice.notes && (
                                          <div className="col-span-2">
                                            <span className="font-medium text-gray-700">Notes:</span>
                                            <span className="ml-1 text-gray-600">{invoice.notes}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {row.pending.demandeEnAttente ? (
                            <span className="inline-flex items-center gap-1 text-yellow-700 bg-yellow-100 px-2 py-1 rounded text-sm">
                              <ExclamationTriangleIcon className="h-4 w-4" /> {row.stats.demandesEnAttente} en attente
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-green-700 bg-green-100 px-2 py-1 rounded text-sm">
                              <CheckCircleIcon className="h-4 w-4" /> {row.stats.demandesValidees} validée(s)
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                          <button
                            onClick={() => debugUser(row.user.email)}
                            disabled={debuggingUser === row.user.email}
                            className="inline-flex items-center px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                            title="Debug - Voir l'état des contrats"
                          >
                            {debuggingUser === row.user.email ? (
                              <>
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                                ...
                              </>
                            ) : (
                              <>
                                <BugAntIcon className="h-3 w-3 mr-1" /> Debug
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => openUserPages(row.user.id, `${row.user.prenom} ${row.user.nom}`)}
                            disabled={loadingLinks.has(row.user.id)}
                            className="inline-flex items-center px-2 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Voir les pages de devis/contrat pour cet utilisateur"
                          >
                            {loadingLinks.has(row.user.id) ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                                Chargement...
                              </>
                            ) : (
                              <>
                                <LinkIcon className="h-4 w-4 mr-1" /> Pages
                              </>
                            )}
                          </button>
                          {row.pending.factureNonGeneree && (
                            <button
                              onClick={() => generateInvoice(row.user.id)}
                              disabled={generatingInvoice.has(row.user.id)}
                              className="inline-flex items-center px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Générer la facture pour cet utilisateur"
                            >
                              {generatingInvoice.has(row.user.id) ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                                  Génération...
                                </>
                              ) : (
                                <>
                                  <DocumentTextIcon className="h-4 w-4 mr-1" /> Générer facture
                                </>
                              )}
                            </button>
                          )}
                          <button onClick={() => openEmailModal(row.user.id, { nom: row.user.nom, prenom: row.user.prenom, email: row.user.email })} className="inline-flex items-center px-2 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700">
                            <EnvelopeIcon className="h-4 w-4 mr-1" /> Email
                          </button>
                          {row.user.phone && (
                            <a href={`https://wa.me/${row.user.phone}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700">
                              <PhoneIcon className="h-4 w-4 mr-1" /> WhatsApp
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal d'envoi d'email */}
      {showEmailModal && selectedUserForEmail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[85vh] my-8 flex flex-col shadow-2xl">
            <div className="p-4 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl z-10">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Envoyer un email</h2>
                  <p className="text-gray-600 text-sm mt-1">
                    À : {selectedUserForEmail.prenom} {selectedUserForEmail.nom} ({selectedUserForEmail.email})
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowEmailModal(false);
                    setSelectedUserForEmail(null);
                    setEmailSubject('Action requise sur votre dossier');
                    setEmailMessage('');
                  }}
                  className="text-gray-500 hover:text-gray-700 p-1"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-4 overflow-y-auto flex-1">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Objet
                  </label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Objet de l'email"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Message
                  </label>
                  <textarea
                    value={emailMessage}
                    onChange={(e) => setEmailMessage(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows={10}
                    placeholder="Tapez votre message ici..."
                  />
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={sendEmail}
                  disabled={sendingEmail}
                  className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendingEmail ? (
                    <>
                      <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white mr-2"></div>
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <EnvelopeIcon className="h-3.5 w-3.5 mr-2" />
                      Envoyer l'email
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowEmailModal(false);
                    setSelectedUserForEmail(null);
                    setEmailSubject('Action requise sur votre dossier');
                    setEmailMessage('');
                  }}
                  className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm bg-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal des liens vers les pages utilisateur */}
      {showLinksModal && selectedUserLinks && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[85vh] my-8 flex flex-col shadow-2xl">
            <div className="p-4 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl z-10">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Pages pour {selectedUserLinks.userName}</h2>
                  <p className="text-gray-600 text-sm mt-1">
                    Liens directs vers les pages de devis, contrat et facture
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowLinksModal(false);
                    setSelectedUserLinks(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 p-1"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-4 overflow-y-auto flex-1">
              <div className="space-y-3">
                {/* Pages principales */}
                <div>
                  <h3 className="text-xs font-semibold text-gray-700 mb-2">Pages principales</h3>
                  <div className="space-y-2">
                    <LinkItem
                      label="Mes devis"
                      link={selectedUserLinks.links.mesDevis}
                      onCopy={copyToClipboard}
                      onOpen={openLink}
                    />
                    <LinkItem
                      label="Mon contrat"
                      link={selectedUserLinks.links.monContrat}
                      onCopy={copyToClipboard}
                      onOpen={openLink}
                    />
                    <LinkItem
                      label="Mes factures"
                      link={selectedUserLinks.links.invoice}
                      onCopy={copyToClipboard}
                      onOpen={openLink}
                    />
                  </div>
                </div>

                {/* Détails des devis */}
                {selectedUserLinks.links.devisDetails && selectedUserLinks.links.devisDetails.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-gray-700 mb-2">Détails des devis</h3>
                    <div className="space-y-2">
                      {selectedUserLinks.links.devisDetails.map((devis: any) => (
                        <div key={devis.id} className="border border-gray-200 rounded-lg p-2">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-medium text-gray-900">
                              Devis {devis.numero}
                            </span>
                            <span className={`text-xs px-1.5 py-0.5 rounded ${
                              devis.statut === 'VALIDE' ? 'bg-green-100 text-green-800' :
                              devis.statut === 'EN_ATTENTE' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {devis.statut}
                            </span>
                          </div>
                          <LinkItem
                            label="Voir le devis"
                            link={devis.link}
                            onCopy={copyToClipboard}
                            onOpen={openLink}
                            small
                          />
                          {devis.contratLink && (
                            <LinkItem
                              label="Accéder au contrat"
                              link={devis.contratLink}
                              onCopy={copyToClipboard}
                              onOpen={openLink}
                              small
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-800">
                  <strong>Note :</strong> Ces liens peuvent être copiés et envoyés à l'utilisateur. 
                  L'utilisateur devra être connecté à son compte pour accéder à ces pages.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de debug */}
      {showDebugModal && debugData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] my-8 flex flex-col shadow-2xl">
            <div className="p-4 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl z-10">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Debug - {debugData.user.prenom} {debugData.user.nom}</h2>
                  <p className="text-gray-600 text-sm mt-1">{debugData.user.email}</p>
                </div>
                <button
                  onClick={() => {
                    setShowDebugModal(false);
                    setDebugData(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 p-1"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-4 overflow-y-auto flex-1">
              {/* Résumé */}
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">Résumé</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                  <div>Total contrats: <strong>{debugData.summary.totalContrats}</strong></div>
                  <div>Contrats VALIDES: <strong>{debugData.summary.contratsValides}</strong></div>
                  <div>Contrats avec signature user: <strong>{debugData.summary.contratsWithUserSignature}</strong></div>
                  <div>Contrats avec signature admin: <strong>{debugData.summary.contratsWithAdminSignature}</strong></div>
                  <div>Contrats complètement signés: <strong>{debugData.summary.contratsFullySigned}</strong></div>
                  <div className="text-red-700 font-bold">Contrats sans facture: <strong>{debugData.summary.contratsWithoutInvoice}</strong></div>
                  <div className="border-t border-blue-300 pt-2 mt-2 col-span-2 md:col-span-3">
                    <strong>Demandes:</strong>
                  </div>
                  <div>Total demandes: <strong>{debugData.summary.totalDemandes}</strong></div>
                  <div>Demandes en attente: <strong className="text-yellow-700">{debugData.summary.demandesEnAttente}</strong></div>
                  <div>Demandes validées: <strong className="text-green-700">{debugData.summary.demandesValidees}</strong></div>
                  <div>Demandes avec devis: <strong>{debugData.summary.demandesWithDevis}</strong></div>
                </div>
              </div>

              {/* Détails des contrats */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Détails des contrats</h3>
                <div className="space-y-2">
                  {debugData.contrats.map((contrat: any, idx: number) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div><strong>Contrat ID:</strong> {contrat.contratId}</div>
                        <div><strong>Statut:</strong> 
                          <span className={`ml-1 px-2 py-0.5 rounded ${
                            contrat.statut === 'VALIDE' ? 'bg-green-100 text-green-800' :
                            contrat.statut === 'SIGNE' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {contrat.statut}
                          </span>
                        </div>
                        <div><strong>Signature user:</strong> 
                          <span className={contrat.hasUserSignature ? 'text-green-700 font-bold' : 'text-red-700'}>
                            {contrat.hasUserSignature ? '✓ Oui' : '✗ Non'} ({contrat.signatureLength} chars)
                          </span>
                        </div>
                        <div><strong>Signature admin:</strong> 
                          <span className={contrat.hasAdminSignature ? 'text-green-700 font-bold' : 'text-red-700'}>
                            {contrat.hasAdminSignature ? '✓ Oui' : '✗ Non'} ({contrat.adminSignatureLength} chars)
                          </span>
                        </div>
                        <div><strong>Factures:</strong> {contrat.invoiceCount} facture(s)</div>
                        <div><strong>Devrait avoir facture:</strong> 
                          <span className={contrat.shouldHaveInvoice ? 'text-red-700 font-bold' : 'text-gray-600'}>
                            {contrat.shouldHaveInvoice ? '✓ OUI' : '✗ Non'}
                          </span>
                        </div>
                        {contrat.devis && (
                          <div className="col-span-2 text-xs text-gray-600">
                            Devis: {contrat.devis.numero} (Statut: {contrat.devis.statut})
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {debugData.contrats.length === 0 && (
                    <div className="text-center py-4 text-gray-500 text-sm">Aucun contrat trouvé</div>
                  )}
                </div>
              </div>

              {/* Détails des demandes */}
              {debugData.demandes && debugData.demandes.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Détails des demandes</h3>
                  <div className="space-y-2">
                    {debugData.demandes.map((demande: any, idx: number) => (
                      <div key={idx} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div><strong>Demande ID:</strong> {demande.id}</div>
                          <div><strong>Statut:</strong> 
                            <span className={`ml-1 px-2 py-0.5 rounded ${
                              demande.statut === 'VALIDE' ? 'bg-green-100 text-green-800' :
                              demande.statut === 'EN_ATTENTE' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {demande.statut}
                            </span>
                          </div>
                          <div className="col-span-2"><strong>Session:</strong> {demande.session || '-'}</div>
                          {demande.message && (
                            <div className="col-span-2"><strong>Message:</strong> <span className="text-gray-600">{demande.message}</span></div>
                          )}
                          <div><strong>Date création:</strong> {new Date(demande.createdAt).toLocaleDateString('fr-FR')}</div>
                          <div><strong>A un devis:</strong> 
                            <span className={demande.hasDevis ? 'text-green-700 font-bold' : 'text-red-700'}>
                              {demande.hasDevis ? '✓ Oui' : '✗ Non'}
                            </span>
                          </div>
                          {demande.devis && (
                            <div className="col-span-2 text-xs text-gray-600 border-t border-gray-300 pt-2 mt-2">
                              <strong>Devis associé:</strong> {demande.devis.numero} (Statut: {demande.devis.statut})
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {(!debugData.demandes || debugData.demandes.length === 0) && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Détails des demandes</h3>
                  <div className="text-center py-4 text-gray-500 text-sm">Aucune demande trouvée</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Composant pour afficher un lien avec boutons copier/ouvrir
function LinkItem({ label, link, onCopy, onOpen, small = false }: {
  label: string;
  link: string;
  onCopy: (text: string) => void;
  onOpen: (url: string) => void;
  small?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between ${small ? 'p-1.5 bg-gray-50 rounded' : 'p-2 border border-gray-200 rounded-lg'}`}>
      <div className="flex-1 min-w-0 mr-2">
        <p className={`${small ? 'text-xs' : 'text-xs'} font-medium text-gray-700`}>{label}</p>
        <p className={`${small ? 'text-xs' : 'text-xs'} text-gray-500 truncate`} title={link}>
          {link}
        </p>
      </div>
      <div className="flex gap-1">
        <button
          onClick={() => onCopy(link)}
          className={`${small ? 'p-1' : 'p-1.5'} text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors`}
          title="Copier le lien"
        >
          <ClipboardIcon className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => onOpen(link)}
          className={`${small ? 'p-1' : 'p-1.5'} text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded transition-colors`}
          title="Ouvrir dans un nouvel onglet"
        >
          <LinkIcon className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}


