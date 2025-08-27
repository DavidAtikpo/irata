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
  devis: {
    numero: string;
    montant: number;
    dateFormation?: string;
    demande: {
      session: string;
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
      setContrats(data);
      
      // Vérifier si un contrat est validé pour afficher le popup
      const hasValidatedContract = data.some((contrat: Contrat) => contrat.statut === 'VALIDE');
      if (hasValidatedContract) {
        setShowInvoicePopup(true);
      }
    } catch (error) {
      setError('Erreur lors de la récupération des contrats');
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
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
      <div className="min-h-screen bg-gray-50 py-8 px-2 sm:px-4 lg:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <h2 className="mt-2 sm:mt-4 text-lg sm:text-xl font-semibold text-gray-900">Chargement...</h2>
                  </div>
      </div>

      {/* Popup de notification de facture générée */}
      {showInvoicePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-green-100 rounded-full mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Facture générée !
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Votre contrat a été validé et votre facture a été générée. 
                Vous pouvez maintenant procéder au paiement pour accéder à tous les documents et activités de formation.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setShowInvoicePopup(false);
                    router.push('/invoice');
                  }}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  Passer au paiement
                </button>
                <button
                  onClick={() => setShowInvoicePopup(false)}
                  className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
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
    <div className="py-2 sm:py-4 lg:py-6 px-2 sm:px-4 lg:px-6" suppressHydrationWarning>
      <div className="max-w-4xl mx-auto">
        {/* En-tête */}
        <div className="mb-3 sm:mb-4">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-xs sm:text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200"
          >
            <ArrowLeftIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            Retour
          </button>
          <div className="mt-2 sm:mt-4 text-center sm:text-left">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Mon contrat</h1>
            <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-600">
              Consultez votre contrat de formation validé
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-3 sm:mb-4 rounded-md bg-red-50 p-3 sm:p-4">
            <div className="text-xs sm:text-sm text-red-800">{error}</div>
          </div>
        )}

        {/* Contenu principal */}
        {contrats.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-6 sm:p-8 text-center">
            <DocumentTextIcon className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
            <h3 className="mt-2 text-sm sm:text-base font-medium text-gray-900">Aucun contrat</h3>
            <p className="mt-1 text-xs sm:text-sm text-gray-500">
              Vous n'avez pas encore de contrat de formation.
            </p>
            <div className="mt-4">
              <button
                onClick={() => router.push('/mes-devis')}
                className="inline-flex items-center px-3 sm:px-4 py-1 sm:py-2 border border-transparent text-xs sm:text-sm font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Voir mes devis
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {contrats.map((contrat) => {
              const statusConfig = getStatusConfig(contrat.statut);
              
              return (
                <div key={contrat.id} className="bg-white shadow rounded-lg overflow-hidden">
                  <div className="p-3 sm:p-4 lg:p-6">
                    {/* En-tête du contrat */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 space-y-2 sm:space-y-0">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                          <DocumentTextIcon className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600" />
                        </div>
                        <div>
                          <h3 className="text-sm sm:text-base lg:text-lg font-medium text-gray-900">
                            Contrat #{contrat.id.slice(-6)}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-500">
                            Devis #{contrat.devis.numero} - {contrat.devis.demande.session}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                          {contrat.statut === 'VALIDE' && <CheckCircleIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />}
                          {contrat.statut === 'SIGNE' && <DocumentTextIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />}
                          {contrat.statut === 'EN_ATTENTE' && <ClockIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />}
                          {!['VALIDE', 'SIGNE', 'EN_ATTENTE'].includes(contrat.statut) && <ExclamationTriangleIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />}
                          {statusConfig.label}
                        </span>
                        {contrat.statut === 'VALIDE' && (
                          <button
                            onClick={() => downloadContrat(contrat.id, contrat.devis.numero)}
                            className="inline-flex items-center px-2 sm:px-3 py-1 sm:py-2 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            <ArrowDownTrayIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            Télécharger
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Description du statut */}
                    <div className="mb-3 sm:mb-4">
                      <p className="text-xs sm:text-sm text-gray-600">{statusConfig.description}</p>
                    </div>

                    {/* Informations du contrat */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-3 sm:mb-4">
                      <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
                        <div className="flex items-center text-xs sm:text-sm text-gray-500 mb-1">
                          <UserIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          Stagiaire
                        </div>
                        <p className="text-xs sm:text-sm font-medium text-gray-900">
                          {contrat.prenom} {contrat.nom}
                        </p>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
                        <div className="flex items-center text-xs sm:text-sm text-gray-500 mb-1">
                          <CalendarIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          Date de signature
                        </div>
                        <p className="text-xs sm:text-sm font-medium text-gray-900">
                          {new Date(contrat.dateSignature).toLocaleDateString('fr-FR')}
                        </p>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
                        <div className="flex items-center text-xs sm:text-sm text-gray-500 mb-1">
                          <BuildingOfficeIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          Formation
                        </div>
                        <p className="text-xs sm:text-sm font-medium text-gray-900">
                          {contrat.devis.demande.session}
                        </p>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
                        <div className="flex items-center text-xs sm:text-sm text-gray-500 mb-1">
                          <DocumentTextIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          Montant
                        </div>
                        <p className="text-xs sm:text-sm font-medium text-gray-900">
                          {contrat.devis.montant.toLocaleString('fr-FR')} €
                        </p>
                      </div>

                      {contrat.devis.dateFormation && (
                        <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
                          <div className="flex items-center text-xs sm:text-sm text-gray-500 mb-1">
                            <CalendarIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            Date de formation
                          </div>
                          <p className="text-xs sm:text-sm font-medium text-gray-900">
                            {new Date(contrat.devis.dateFormation).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      )}

                      <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
                        <div className="flex items-center text-xs sm:text-sm text-gray-500 mb-1">
                          <MapPinIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          Adresse
                        </div>
                        <p className="text-xs sm:text-sm font-medium text-gray-900 truncate" title={contrat.adresse}>
                          {contrat.adresse}
                        </p>
                      </div>
                    </div>

                    {/* Informations supplémentaires */}
                    {contrat.profession && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 sm:p-3">
                        <div className="flex items-start">
                          <BuildingOfficeIcon className="h-4 w-4 text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
                          <div>
                            <p className="text-xs sm:text-sm font-medium text-blue-900">Profession</p>
                            <p className="text-xs sm:text-sm text-blue-800">{contrat.profession}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    {contrat.statut === 'SIGNE' && (
                      <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-start">
                          <ClockIcon className="h-4 w-4 text-yellow-400 mt-0.5 mr-2 flex-shrink-0" />
                          <div>
                            <p className="text-xs sm:text-sm font-medium text-yellow-900">En attente de validation</p>
                            <p className="text-xs sm:text-sm text-yellow-800">
                              Votre contrat a été signé et est en cours de validation par l'administrateur. 
                              Vous recevrez une notification par email une fois validé.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {contrat.statut === 'VALIDE' && (
                      <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-start">
                          <CheckCircleIcon className="h-4 w-4 text-green-400 mt-0.5 mr-2 flex-shrink-0" />
                          <div>
                            <p className="text-xs sm:text-sm font-medium text-green-900">Contrat validé</p>
                            <p className="text-xs sm:text-sm text-green-800">
                              Votre contrat a été validé par l'administrateur. 
                              Une facture vous sera générée et envoyée par email dans les plus brefs délais.
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
        <div className="mt-6 sm:mt-8 bg-blue-50 rounded-lg p-3 sm:p-4 lg:p-6">
          <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-blue-900 mb-2">Information</h3>
          <p className="text-xs sm:text-sm text-blue-800">
            Cette page affiche tous vos contrats de formation. Après validation de votre contrat par l'administration, 
            une facture vous sera générée et envoyée par email. L'accès à tous les documents de formation et activités 
            sera disponible après le paiement de cette facture.
          </p>
        </div>
      </div>

      {/* Popup de notification de facture générée */}
      {showInvoicePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-green-100 rounded-full mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Facture générée !
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Votre contrat a été validé et votre facture a été générée. 
                Vous pouvez maintenant procéder au paiement pour accéder à tous les documents et activités de formation.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setShowInvoicePopup(false);
                    router.push('/invoice');
                  }}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  Passer au paiement
                </button>
                <button
                  onClick={() => setShowInvoicePopup(false)}
                  className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
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