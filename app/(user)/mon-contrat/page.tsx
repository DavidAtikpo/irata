'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  DocumentTextIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  ArrowDownTrayIcon,
  UserIcon,
  CalendarIcon,
  MapPinIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

interface Contrat {
  id: string;
  statut: string;
  createdAt: string;
  dateSignature: string;
  nom: string;
  prenom: string;
  adresse: string;
  profession?: string;
  adminSignature?: string | null;
  entrepriseNom?: string | null;
  devis: {
    numero: string;
    montant: number;
    dateFormation?: string;
    statutPaiement?: string;
    demande: {
      session: string;
      entreprise?: string | null;
      typeInscription?: string | null;
    };
  };
}

export default function MonContratPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [contrats, setContrats] = useState<Contrat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInvoicePopup, setShowInvoicePopup] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchContrats();
    }
  }, [status, session, router]);

  const fetchContrats = async () => {
    try {
      const response = await fetch('/api/user/contrats');
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des contrats');
      }
      const data = await response.json();
      // Ne garder que les contrats/conventions validés ET signés par l'admin
      const validated = (data || []).filter((c: Contrat) => c.statut === 'VALIDE' && c.adminSignature);
      setContrats(validated);
      
      // Vérifier le statut de paiement des factures associées
      const hasValidatedUnpaidContract = await checkPaymentStatus(data);
      if (hasValidatedUnpaidContract) {
        setShowInvoicePopup(true);
      }
    } catch (error) {
      setError('Erreur lors de la récupération des contrats');
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async (contrats: Contrat[]) => {
    try {
      // Récupérer les factures pour vérifier leur statut de paiement
      const invoiceResponse = await fetch('/api/user/invoice');
      if (!invoiceResponse.ok) {
        console.log('Impossible de récupérer les factures, on considère comme non payé');
        return true; // Si on ne peut pas vérifier, on affiche la popup par sécurité
      }
      
      const invoiceData = await invoiceResponse.json();
      const invoices = invoiceData.invoices || [];
      
      // Vérifier si tous les contrats validés ont des factures payées
      const validatedContrats = contrats.filter(c => c.statut === 'VALIDE');
      
      for (const contrat of validatedContrats) {
        // Chercher une facture associée à ce contrat
        const associatedInvoice = invoices.find((inv: any) => 
          inv.devisNumber === contrat.devis.numero || 
          inv.devisNumber === contrat.devis.numero
        );
        
        // Si pas de facture trouvée ou facture non payée, afficher la popup
        if (!associatedInvoice || 
            (associatedInvoice.paymentStatus !== 'PAID' && associatedInvoice.paymentStatus !== 'PARTIAL')) {
          console.log(`Contrat ${contrat.id} - Facture non payée ou inexistante`);
          return true;
        }
      }
      
      console.log('Tous les contrats validés ont des factures payées');
      return false;
    } catch (error) {
      console.error('Erreur lors de la vérification du statut de paiement:', error);
      return true; // En cas d'erreur, on affiche la popup par sécurité
    }
  };

  const getStatusConfig = (statut: string) => {
    switch (statut) {
      case 'VALIDE':
        return {
          color: 'bg-green-100 text-green-800',
          label: 'Validé',
          description: 'Votre contrat a été validé par l\'administrateur'
        };
      case 'SIGNE':
        return {
          color: 'bg-blue-100 text-blue-800',
          label: 'Signé',
          description: 'Votre contrat a été signé et est en attente de validation'
        };
      case 'EN_ATTENTE':
        return {
          color: 'bg-yellow-100 text-yellow-800',
          label: 'En attente',
          description: 'Votre contrat est en cours de traitement'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800',
          label: statut,
          description: 'Statut inconnu'
        };
    }
  };

  const downloadContrat = async (contratId: string, numero: string) => {
    try {
      const response = await fetch(`/api/user/contrats/${contratId}/pdf`);
      if (!response.ok) {
        throw new Error('Erreur lors du téléchargement du contrat');
      }
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `contrat_${numero}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur lors du téléchargement du contrat');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-4 px-2 sm:px-3">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <h2 className="mt-2 text-sm font-semibold text-gray-900">Chargement...</h2>
                  </div>
      </div>

      {/* Popup de notification de facture générée */}
      {showInvoicePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
          <div className="bg-white rounded shadow-xl max-w-md w-full p-4">
            <div className="flex items-center justify-center w-10 h-10 mx-auto bg-green-100 rounded-full mb-3">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-900 mb-2">
                Facture générée !
              </h3>
              <p className="text-[10px] text-gray-600 mb-4">
                Votre contrat a été validé et votre facture a été générée. 
                Vous pouvez maintenant procéder au paiement pour accéder à tous les documents et activités de formation.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => {
                    setShowInvoicePopup(false);
                    router.push('/invoice');
                  }}
                  className="flex-1 bg-green-600 text-white px-3 py-1 rounded text-[10px] font-medium hover:bg-green-700"
                >
                  Passer au paiement
                </button>
                <button
                  onClick={() => setShowInvoicePopup(false)}
                  className="flex-1 bg-gray-200 text-gray-800 px-3 py-1 rounded text-[10px] font-medium hover:bg-gray-300"
                >
                  Plus tard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

  return (
    <div className="py-2 sm:py-3 px-2 sm:px-3" suppressHydrationWarning>
      <div className="max-w-4xl mx-auto">
        {/* En-tête */}
        <div className="mb-2 sm:mb-3">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-[10px] font-medium text-indigo-600 hover:text-indigo-500"
          >
            <ArrowLeftIcon className="h-3 w-3 mr-0.5" />
            Retour
          </button>
          <div className="mt-2 text-center sm:text-left">
            <h1 className="text-sm sm:text-base font-bold text-gray-900">Mes contrats / conventions</h1>
            <p className="text-[10px] text-gray-600">Vos contrats validés par l'administration</p>
          </div>
        </div>

        {error && (
          <div className="mb-2 rounded bg-red-50 p-2">
            <div className="text-[10px] text-red-800">{error}</div>
          </div>
        )}

        {/* Contenu principal */}
        {contrats.length === 0 ? (
          <div className="bg-white shadow-sm rounded p-4 text-center">
            <DocumentTextIcon className="mx-auto h-8 w-8 text-gray-400" />
            <h3 className="mt-2 text-[11px] font-medium text-gray-900">Aucun contrat</h3>
            <p className="mt-1 text-[10px] text-gray-500">
              Vous n'avez pas encore de contrat de formation.
            </p>
            <div className="mt-3">
              <button
                onClick={() => router.push('/mes-devis')}
                className="inline-flex items-center px-3 py-1 border border-transparent text-[10px] font-medium rounded text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Voir mes devis
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {contrats.map((contrat) => {
              const statusConfig = getStatusConfig(contrat.statut);
              const isConvention = Boolean(
                contrat.entrepriseNom ||
                contrat.devis?.demande?.entreprise ||
                (contrat.devis?.demande?.typeInscription || '').toLowerCase() === 'entreprise'
              );
              
              return (
                <div key={contrat.id} className="bg-white shadow-sm rounded overflow-hidden">
                  <div className="p-3">
                    {/* En-tête du contrat */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                          <DocumentTextIcon className="h-3 w-3 text-indigo-600" />
                        </div>
                        <div>
                          <h3 className="text-[11px] font-medium text-gray-900">
                            {isConvention ? 'Convention' : 'Contrat'} #{contrat.id.slice(-6)}
                          </h3>
                          <p className="text-[10px] text-gray-500">
                            Devis #{contrat.devis.numero} - {contrat.devis.demande.session}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium ${statusConfig.color}`}>
                          {contrat.statut === 'VALIDE' && <CheckCircleIcon className="h-3 w-3 mr-0.5" />}
                          {contrat.statut === 'SIGNE' && <DocumentTextIcon className="h-3 w-3 mr-0.5" />}
                          {contrat.statut === 'EN_ATTENTE' && <ClockIcon className="h-3 w-3 mr-0.5" />}
                          {!['VALIDE', 'SIGNE', 'EN_ATTENTE'].includes(contrat.statut) && <ExclamationTriangleIcon className="h-3 w-3 mr-0.5" />}
                          {statusConfig.label}
                        </span>
                        {contrat.statut === 'VALIDE' && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => router.push(`/admin/contrats/${contrat.id}`)}
                              className="inline-flex items-center px-2 py-0.5 border border-transparent text-[9px] font-medium rounded text-white bg-indigo-600 hover:bg-indigo-700"
                            >
                              <DocumentTextIcon className="h-3 w-3 mr-0.5" />
                              Voir
                            </button>
                            <button
                              onClick={() => downloadContrat(contrat.id, contrat.devis.numero)}
                              className="inline-flex items-center px-2 py-0.5 border border-transparent text-[9px] font-medium rounded text-white bg-green-600 hover:bg-green-700"
                            >
                              <ArrowDownTrayIcon className="h-3 w-3 mr-0.5" />
                              DL
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Description du statut */}
                    <div className="mb-2">
                      <p className="text-[10px] text-gray-600">{statusConfig.description}</p>
                    </div>

                    {/* Informations du contrat */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-2">
                      <div className="bg-gray-50 rounded p-1.5">
                        <div className="flex items-center text-[9px] text-gray-500 mb-0.5">
                          <UserIcon className="h-3 w-3 mr-0.5" />
                          Stagiaire
                        </div>
                        <p className="text-[10px] font-medium text-gray-900">
                          {contrat.prenom} {contrat.nom}
                        </p>
                      </div>

                      <div className="bg-gray-50 rounded p-1.5">
                        <div className="flex items-center text-[9px] text-gray-500 mb-0.5">
                          <CalendarIcon className="h-3 w-3 mr-0.5" />
                          Date signature
                        </div>
                        <p className="text-[10px] font-medium text-gray-900">
                          {new Date(contrat.dateSignature).toLocaleDateString('fr-FR', {day: '2-digit', month: '2-digit', year: '2-digit'})}
                        </p>
                      </div>

                      <div className="bg-gray-50 rounded p-1.5">
                        <div className="flex items-center text-[9px] text-gray-500 mb-0.5">
                          <BuildingOfficeIcon className="h-3 w-3 mr-0.5" />
                          Formation
                        </div>
                        <p className="text-[10px] font-medium text-gray-900 truncate" title={contrat.devis.demande.session}>
                          {contrat.devis.demande.session}
                        </p>
                      </div>

                      <div className="bg-gray-50 rounded p-1.5">
                        <div className="flex items-center text-[9px] text-gray-500 mb-0.5">
                          <DocumentTextIcon className="h-3 w-3 mr-0.5" />
                          Montant
                        </div>
                        <p className="text-[10px] font-medium text-gray-900">
                          {contrat.devis.montant.toLocaleString('fr-FR')}€
                        </p>
                      </div>

                      {contrat.devis.dateFormation && (
                        <div className="bg-gray-50 rounded p-1.5">
                          <div className="flex items-center text-[9px] text-gray-500 mb-0.5">
                            <CalendarIcon className="h-3 w-3 mr-0.5" />
                            Date formation
                          </div>
                          <p className="text-[10px] font-medium text-gray-900">
                            {new Date(contrat.devis.dateFormation).toLocaleDateString('fr-FR', {day: '2-digit', month: '2-digit', year: '2-digit'})}
                          </p>
                        </div>
                      )}

                      <div className="bg-gray-50 rounded p-1.5">
                        <div className="flex items-center text-[9px] text-gray-500 mb-0.5">
                          <MapPinIcon className="h-3 w-3 mr-0.5" />
                          Adresse
                        </div>
                        <p className="text-[10px] font-medium text-gray-900 truncate" title={contrat.adresse}>
                          {contrat.adresse}
                        </p>
                      </div>
                    </div>

                    {/* Informations supplémentaires */}
                    {contrat.profession && (
                      <div className="bg-blue-50 border border-blue-200 rounded p-2">
                        <div className="flex items-start">
                          <BuildingOfficeIcon className="h-3 w-3 text-blue-400 mt-0.5 mr-1.5 flex-shrink-0" />
                          <div>
                            <p className="text-[10px] font-medium text-blue-900">Profession</p>
                            <p className="text-[10px] text-blue-800">{contrat.profession}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    {contrat.statut === 'SIGNE' && (
                      <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                        <div className="flex items-start">
                          <ClockIcon className="h-3 w-3 text-yellow-400 mt-0.5 mr-1.5 flex-shrink-0" />
                          <div>
                            <p className="text-[10px] font-medium text-yellow-900">En attente de validation</p>
                            <p className="text-[9px] text-yellow-800">
                              Votre contrat a été signé et est en cours de validation par l'admin. Notification par email une fois validé.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {contrat.statut === 'VALIDE' && (
                      <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                        <div className="flex items-start">
                          <CheckCircleIcon className="h-3 w-3 text-green-400 mt-0.5 mr-1.5 flex-shrink-0" />
                          <div>
                            <p className="text-[10px] font-medium text-green-900">Contrat validé</p>
                            <p className="text-[9px] text-green-800">
                              Votre contrat a été validé. Facture générée et envoyée par email.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Information */}
        <div className="mt-3 bg-blue-50 rounded p-3">
          <h3 className="text-[11px] font-semibold text-blue-900 mb-1">Information</h3>
          <p className="text-[10px] text-blue-800">
            Cette page affiche tous vos contrats de formation. Après validation par l'admin, 
            une facture vous sera générée et envoyée par email. L'accès aux documents de formation sera disponible après paiement.
          </p>
        </div>
      </div>

      {/* Popup de notification de facture générée */}
      {showInvoicePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
          <div className="bg-white rounded shadow-xl max-w-md w-full p-4">
            <div className="flex items-center justify-center w-10 h-10 mx-auto bg-green-100 rounded-full mb-3">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-900 mb-2">
                Facture générée !
              </h3>
              <p className="text-[10px] text-gray-600 mb-4">
                Votre contrat a été validé et votre facture a été générée. 
                Vous pouvez maintenant procéder au paiement pour accéder à tous les documents et activités de formation.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => {
                    setShowInvoicePopup(false);
                    router.push('/invoice');
                  }}
                  className="flex-1 bg-green-600 text-white px-3 py-1 rounded text-[10px] font-medium hover:bg-green-700"
                >
                  Passer au paiement
                </button>
                <button
                  onClick={() => setShowInvoicePopup(false)}
                  className="flex-1 bg-gray-200 text-gray-800 px-3 py-1 rounded text-[10px] font-medium hover:bg-gray-300"
                >
                  Plus tard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 