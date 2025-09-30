'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon,
  DocumentDuplicateIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';

interface Devis {
  id: string;
  numero: string;
  montant?: number;
  statut: 'EN_ATTENTE' | 'VALIDE' | 'REFUSE';
  createdAt: string;
  demande?: {
    session?: string;
    message?: string;
  };
  // Champs éventuellement présents sur les devis créés par l'admin
  prixUnitaire?: number;
  quantite?: number;
  tva?: number;
  dateFormation?: string | null;
  dateExamen?: string | null;
  referenceAffaire?: string | null;
  exoneration?: string | null;
  hasContract?: boolean;
}

export default function MesDevisPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [devis, setDevis] = useState<Devis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helpers d'affichage alignés avec la page admin
  const formatISOToFr = (iso: string) => {
    if (!iso) return '';
    const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return iso;
    const [, y, mo, d] = m;
    return `${d}/${mo}/${y}`;
  };

  const formatDateToFr = (dateString: string | null | undefined) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR');
    } catch {
      return formatISOToFr(dateString as string);
    }
  };

  const formatSessionFr = (raw: string) => {
    if (!raw) return '';
    const m = raw.match(/^(\d{4})\s+([a-zA-Zéèêàùîôïûç]+)\s+(\d{2})\s+au\s+(\d{2})$/i);
    if (!m) return raw;
    const [, year, monthFr, dayStart, dayEnd] = m;
    const monthMap: Record<string, string> = {
      janvier: '01', fevrier: '02', février: '02', mars: '03', avril: '04',
      mai: '05', juin: '06', juillet: '07', aout: '08', août: '08',
      septembre: '09', octobre: '10', novembre: '11', decembre: '12', décembre: '12'
    };
    const mm = monthMap[monthFr.toLowerCase()];
    if (!mm) return raw;
    return `${dayStart}/${mm}/${year} au ${dayEnd}/${mm}/${year}`;
  };

  const sessionRangeFr = (dateFormation?: string | null, dateExamen?: string | null) => {
    if (!dateFormation || !dateExamen) return '';
    return `du ${formatDateToFr(dateFormation)} au ${formatDateToFr(dateExamen)}`;
  };

  const computeMontant = (d: Devis) => {
    if (typeof d.montant === 'number') return d.montant;
    if (typeof d.prixUnitaire === 'number' && typeof d.quantite === 'number') {
      return Number((d.prixUnitaire * d.quantite).toFixed(2));
    }
    return 0;
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchDevis();
    }
  }, [status, session, router]);

  const fetchDevis = async () => {
    try {
      const response = await fetch('/api/user/devis');
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des devis');
      }
      const data = await response.json();
      
      // Vérifier les contrats pour chaque devis validé
      const devisWithContracts = await Promise.all(
        data.map(async (devis: Devis) => {
          if (devis.statut === 'VALIDE') {
            try {
              const contractResponse = await fetch(`/api/user/devis/${devis.id}/contrat/check`);
              if (contractResponse.ok) {
                const contractData = await contractResponse.json();
                return { ...devis, hasContract: contractData.hasContract };
              }
            } catch (error) {
              console.error('Erreur lors de la vérification du contrat:', error);
            }
          }
          return { ...devis, hasContract: false };
        })
      );
      
      setDevis(devisWithContracts);
    } catch (error) {
      setError('Erreur lors de la récupération des devis');
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadDevis = async (devisId: string, numero: string) => {
    try {
      const response = await fetch(`/api/user/devis/${devisId}/pdf`);
      if (!response.ok) {
        throw new Error('Erreur lors du téléchargement du devis');
      }
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `devis_${numero}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur lors du téléchargement du devis');
    }
  };

  const downloadContract = async (devisId: string, numero: string) => {
    try {
      const response = await fetch(`/api/user/devis/${devisId}/contrat/pdf`);
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

  const getStatusConfig = (statut: string) => {
    switch (statut) {
      case 'VALIDE':
        return {
          icon: CheckCircleIcon,
          color: 'bg-green-100 text-green-800',
          label: 'Validé'
        };
      case 'REFUSE':
        return {
          icon: XCircleIcon,
          color: 'bg-red-100 text-red-800',
          label: 'Refusé'
        };
      default:
        return {
          icon: ClockIcon,
          color: 'bg-yellow-100 text-yellow-800',
          label: 'En attente'
        };
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <h2 className="mt-4 text-xl font-semibold text-gray-900">Chargement...</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 sm:py-8 lg:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Mes devis</h2>
          <p className="mt-2 text-sm sm:text-base text-gray-600">
            Consultez l'état de vos devis
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        )}

        {devis.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <DocumentTextIcon className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
            <h3 className="mt-2 text-sm sm:text-base font-medium text-gray-900">Aucun devis</h3>
            <p className="mt-1 text-xs sm:text-sm text-gray-500">
              Vous n'avez pas encore de devis.
            </p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden rounded-lg">
            <ul className="divide-y divide-gray-200">
              {devis.map((devis) => {
                const status = getStatusConfig(devis.statut);
                const StatusIcon = status.icon;

                return (
                  <li key={devis.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                        <div className="flex items-center">
                          <DocumentTextIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mr-2" />
                          <p className="text-sm font-medium text-indigo-600 truncate">
                            Numéro: {devis.numero}
                          </p>
                        </div>
                        <div className="flex-shrink-0 flex">
                          <span className={`inline-flex items-center px-2 py-0.5 sm:px-2.5 rounded-full text-xs font-medium ${status.color}`}>
                            <StatusIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            {status.label}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 sm:mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex sm:flex-col gap-1">
                          <p className="flex items-center text-xs sm:text-sm text-gray-500">
                            Formation Cordiste IRATA - {sessionRangeFr(devis.dateFormation || null, devis.dateExamen || null) || formatSessionFr(devis.demande?.session || '') || (devis.dateFormation ? formatDateToFr(devis.dateFormation) : '-')}
                          </p>
                          {devis.referenceAffaire && (
                            <p className="text-xs sm:text-sm text-gray-500">
                              Notre référence Affaire: <span className="text-gray-700">{devis.referenceAffaire}</span>
                            </p>
                          )}
                          {devis.exoneration && (
                            <p className="text-xs sm:text-sm text-gray-500 truncate" title={devis.exoneration || undefined}>
                              Exonération: <span className="text-gray-700">{devis.exoneration}</span>
                            </p>
                          )}
                        </div>
                        <div className="mt-2 flex items-center text-xs sm:text-sm text-gray-500 sm:mt-0">
                          <p>
                            {new Date(devis.createdAt).toLocaleDateString('fr-FR')} - {computeMontant(devis).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 sm:mt-2 flex flex-wrap justify-end gap-2">
                        <button
                          onClick={() => router.push(`/mes-devis/${devis.id}`)}
                          className="inline-flex items-center px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                        >
                          <EyeIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          Voir
                        </button>
                        <button
                          onClick={() => downloadDevis(devis.id, devis.numero)}
                          className="inline-flex items-center px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium rounded-md text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                        >
                          <DocumentArrowDownIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          PDF
                        </button>
                        {devis.statut === 'VALIDE' && !devis.hasContract && (
                          <button
                            onClick={() => router.push(`/mes-devis/${devis.id}/contrat`)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            <DocumentDuplicateIcon className="h-4 w-4 mr-1" />
                            Contrat
                          </button>
                        )}
                        {devis.statut === 'VALIDE' && devis.hasContract && (
                          <button
                            onClick={() => downloadContract(devis.id, devis.numero)}
                            className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            <DocumentArrowDownIcon className="h-4 w-4 mr-1" />
                            PDF Contrat
                          </button>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
} 