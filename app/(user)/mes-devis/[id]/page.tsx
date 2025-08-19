'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import { 
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowLeftIcon,
  DocumentArrowDownIcon,
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline';
import { Button } from '../../../components/ui/button';
import HeaderInfoTable from '@/app/components/HeaderInfoTable';
import Image from 'next/image';

interface Devis {
  id: string;
  numero: string;
  client: string;
  mail: string;
  adresseLivraison: string | null;
  dateLivraison: string | null;
  dateExamen: string | null;
  adresse: string | null;
  siret: string | null;
  numNDA: string | null;
  dateFormation: string | null;
  suiviPar: string | null;
  designation: string;
  quantite: number;
  unite: string;
  prixUnitaire: number;
  tva: number;
  exoneration: string | null;
  datePriseEffet: string | null;
  montant: number;
  iban: string | null;
  bic: string | null;
  banque: string | null;
  intituleCompte: string | null;
  signature: string | null;
  statut: 'EN_ATTENTE' | 'VALIDE' | 'REFUSE';
  createdAt: string;
  demande: {
    session: string;
    message?: string;
    user: {
      nom: string;
      prenom: string;
      email: string;
    };
  };
}

export default function DevisDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [devis, setDevis] = useState<Devis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [hasContract, setHasContract] = useState(false);
  const resolvedParams = use(params);

  // Fonctions de formatage des dates
  const formatISOToFr = (iso: string) => {
    if (!iso) return '';
    const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return iso;
    const [, y, mo, d] = m;
    return `${d}/${mo}/${y}`;
  };

  // Formateur d'affichage pour les sessions de type "2025 septembre 01 au 06"
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

  // Affichage convivial de la session: du ... au ... (basé sur les dates ISO saisies)
  const sessionRangeFr = (dateFormation: string, dateExamen: string) => {
    if (!dateFormation || !dateExamen) return '';
    return `du ${formatDateToFr(dateFormation)} au ${formatDateToFr(dateExamen)}`;
  };

  // Fonction pour formater une date ISO en français
  const formatDateToFr = (dateString: string | null) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR');
    } catch {
      return formatISOToFr(dateString);
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchDevis();
    }
  }, [status, session, router, resolvedParams.id]);

  const fetchDevis = async () => {
    try {
      const response = await fetch(`/api/user/devis/${resolvedParams.id}`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération du devis');
      }
      const data = await response.json();
      setDevis(data);
      
      // Vérifier si un contrat existe déjà pour ce devis
      if (data.statut === 'VALIDE') {
        try {
          const contractResponse = await fetch(`/api/user/devis/${resolvedParams.id}/contrat/check`);
          if (contractResponse.ok) {
            const contractData = await contractResponse.json();
            setHasContract(contractData.hasContract);
          }
        } catch (error) {
          console.error('Erreur lors de la vérification du contrat:', error);
        }
      }
    } catch (error) {
      setError('Erreur lors de la récupération du devis');
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleValidation = async () => {
    if (!isChecked) {
      setError('Vous devez accepter les conditions pour valider le devis');
      return;
    }

    setIsValidating(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/user/devis/${resolvedParams.id}/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la validation du devis');
      }

      setSuccess('Le devis a été validé avec succès');
      
      // Déclencher une notification pour l'admin
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('devisValidated', {
          detail: {
            type: 'DEVIS_VALIDATED',
            message: `Devis ${devis?.numero} accepté par ${devis?.client} - Montant: ${devis?.montant}€`,
            link: `/admin/devis/${resolvedParams.id}`
          }
        });
        window.dispatchEvent(event);
      }
      
      fetchDevis(); // Rafraîchir les données du devis
    } catch (error) {
      setError('Erreur lors de la validation du devis');
      console.error('Erreur:', error);
    } finally {
      setIsValidating(false);
    }
  };

  const downloadDevis = async () => {
    if (!devis) return;
    
    try {
      const response = await fetch(`/api/user/devis/${resolvedParams.id}/pdf`);
      if (!response.ok) {
        throw new Error('Erreur lors du téléchargement du devis');
      }
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `devis_${devis.numero}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur lors du téléchargement du devis');
    }
  };

  const downloadContract = async () => {
    if (!devis) return;
    
    try {
      const response = await fetch(`/api/user/devis/${resolvedParams.id}/contrat/pdf`);
      if (!response.ok) {
        throw new Error('Erreur lors du téléchargement du contrat');
      }
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `contrat_${devis.numero}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur lors du téléchargement du contrat');
    }
  };

  // Aucune pastille de statut sur cette page (cachée selon demande)

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

  if (!devis) {
    return null;
  }

  // Statut non affiché sur cette page

  return (
    <div className="min-h-screen bg-gray-100 py-4 sm:py-8 px-2 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white shadow rounded-lg p-4 sm:p-6">
        <div className="mb-4">
          <HeaderInfoTable
            title="TRAME BDC DEVIS FACTURE"
            codeNumberLabel="Numéro de code"
            codeNumber="ENR-CIFRA-COMP 00X"
            revisionLabel="Révision"
            revision="00"
            creationDateLabel="Création date"
            creationDate={new Date().toLocaleDateString('fr-FR')}
          />
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

        <div className="space-y-8">
          {/* En-tête remplacée par HeaderInfoTable ci-dessus */}

          {/* Section Informations principales */}
          <fieldset className="border p-4 sm:p-6 rounded mb-4 sm:mb-6 bg-gray-50">
            <legend className="text-lg sm:text-xl font-bold text-gray-900 px-2">Informations principales</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm sm:text-base font-semibold text-gray-900 mb-1">Numéro de facture</label>
                <input type="text" className="input text-sm sm:text-base text-gray-900" value={devis.numero} readOnly />
              </div>
              <div>
                <label className="block text-sm sm:text-base font-semibold text-gray-900 mb-1">Notre référence Affaire</label>
                <input type="text" className="input text-sm sm:text-base text-gray-900" value="CI.DES" readOnly />
              </div>
              <div>
                <label className="block text-sm sm:text-base font-semibold text-gray-900 mb-1">Client</label>
                <input type="text" className="input text-sm sm:text-base text-gray-900" value={devis.client} readOnly />
              </div>
              <div>
                <label className="block text-sm sm:text-base font-semibold text-gray-900 mb-1">Email</label>
                <input type="email" className="input text-sm sm:text-base text-gray-900" value={devis.mail} readOnly />
              </div>
            </div>
          </fieldset>

          {/* Section Adresses */}
          <fieldset className="border p-4 sm:p-6 rounded mb-4 sm:mb-6 bg-gray-50">
            <legend className="text-lg sm:text-xl font-bold text-gray-900 px-2">Adresses</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-1">Adresse de facturation</label>
                <input type="text" className="input text-gray-900" value="CI.DES BP212 Votokondji TOGO" readOnly />
              </div>
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-1">Adresse de livraison</label>
                <input type="text" className="input text-gray-900" value={devis.adresseLivraison || ''} readOnly />
              </div>
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-1">Date de formation</label>
                <div className="input text-gray-900 bg-gray-100">
                  {sessionRangeFr(devis.dateFormation || '', devis.dateExamen || '') || 
                   formatSessionFr(devis.demande?.session || '') || 
                   (devis.dateFormation ? formatDateToFr(devis.dateFormation) : '-')}
                </div>
              </div>
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-1">Date examen</label>
                <div className="input text-gray-900 bg-gray-100">
                  {devis.dateExamen ? formatDateToFr(devis.dateExamen) : '-'}
                </div>
              </div>
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-1">SIRET / NIF</label>
                <input type="text" className="input text-gray-900" value={devis.siret || ''} readOnly />
              </div>
            </div>
          </fieldset>

          {/* Section Intervention */}
          <fieldset className="border p-4 sm:p-6 rounded mb-4 sm:mb-6 bg-gray-50">
            <legend className="text-lg sm:text-xl font-bold text-gray-900 px-2">Informations administratives</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-1">Numéro NDA</label>
                <input type="text" className="input text-gray-900" value={devis.numNDA || ''} readOnly />
              </div>
              {/* <div>
                <label className="block text-base font-semibold text-gray-900 mb-1">Date formation</label>
                <div className="input text-gray-900 bg-gray-100">{devis.dateFormation ? new Date(devis.dateFormation).toLocaleDateString() : '-'}</div>

              </div> */}
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-1">Suivi par</label>
                <input type="text" className="input text-gray-900" value={devis.suiviPar || ''} readOnly />
              </div>
            </div>
            <fieldset className="p-4 sm:p-6 mb-4 sm:mb-6 bg-gray-50">
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-1">TVA (%)</label>
                <input type="number" className="input text-gray-900" value={devis.tva} readOnly />
              </div>
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-1">Exonération</label>
                <input type="text" className="input text-gray-900" value={devis.exoneration || ''} readOnly />
              </div>
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-1">Date de prise d'effet</label>
                <div className="input text-gray-900 bg-gray-100">{devis.datePriseEffet ? new Date(devis.datePriseEffet).toLocaleDateString() : '-'}</div>
              </div>
            </div>
          </fieldset>

          </fieldset>

          {/* Section Désignation (tableau) */}
          <fieldset className="border p-4 sm:p-6 rounded mb-4 sm:mb-6 bg-gray-50">
            <legend className="text-lg sm:text-xl font-bold text-gray-900 px-2">Désignation</legend>
            
            {/* Version mobile - Cards */}
            <div className="block sm:hidden">
              <div className="bg-white rounded border p-3 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-700">Désignation:</span>
                  <span className="text-gray-900 text-right">{devis.designation}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-700">Quantité:</span>
                  <span className="text-gray-900">{devis.quantite}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-700">Unité:</span>
                  <span className="text-gray-900">{devis.unite}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-700">Prix unitaire HT:</span>
                  <span className="text-gray-900">{devis.prixUnitaire} €</span>
                </div>
                <div className="flex justify-between items-center border-t pt-2">
                  <span className="font-bold text-gray-900">Prix total HT:</span>
                  <span className="font-bold text-gray-900 text-lg">{devis.montant} €</span>
                </div>
              </div>
            </div>

            {/* Version desktop - Tableau */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="min-w-full border text-sm sm:text-base text-gray-900">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border px-2 py-1">Désignation</th>
                    <th className="border px-2 py-1">Quantité</th>
                    <th className="border px-2 py-1">Unité</th>
                    <th className="border px-2 py-1">Prix unitaire HT</th>
                    <th className="border px-2 py-1">Prix total HT</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border px-2 py-1">
                      <input type="text" className="input w-full" value={devis.designation} readOnly />
                    </td>
                    <td className="border px-2 py-1">
                      <input type="number" className="input w-full" value={devis.quantite} readOnly />
                    </td>
                    <td className="border px-2 py-1">
                      <input type="text" className="input w-full" value={devis.unite} readOnly />
                    </td>
                    <td className="border px-2 py-1">
                      <input type="number" className="input w-full" value={devis.prixUnitaire} readOnly />
                    </td>
                    <td className="border px-2 py-1">
                      <input type="number" className="input w-full" value={devis.montant} readOnly />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </fieldset>



          {/* Section Informations bancaires */}
          <fieldset className="border p-4 sm:p-6 rounded mb-4 sm:mb-6 bg-gray-50">
            <legend className="text-lg sm:text-xl font-bold text-gray-900 px-2">Informations bancaires</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-1">IBAN</label>
                <input type="text" className="input text-gray-900" value={devis.iban || ''} readOnly />
              </div>
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-1">BIC</label>
                <input type="text" className="input text-gray-900" value={devis.bic || ''} readOnly />
              </div>
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-1">Banque</label>
                <input type="text" className="input text-gray-900" value={devis.banque || ''} readOnly />
              </div>
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-1">Intitulé du compte</label>
                <input type="text" className="input text-gray-900" value={devis.intituleCompte || ''} readOnly />
              </div>
            </div>
          </fieldset>

          {/* Section Signature */}
          <fieldset className="mb-4 sm:mb-6 bg-gray-50">
            {/* <legend className="text-lg sm:text-xl font-bold text-gray-900 px-2">Signature</legend> */}
            <div className="grid grid-cols-1 gap-4 sm:gap-6">
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-2">Signature: Administration</label>
                {devis.signature && devis.signature.startsWith('data:image/') ? (
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <img 
                      src={devis.signature} 
                      alt="Signature" 
                      className="bg-white max-h-16 sm:max-h-20 object-contain" 
                    />
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-32 h-16 border-2 border-dashed border-gray-300 rounded bg-gray-50 flex items-center justify-center">
                      <span className="text-gray-400 text-sm">Aucune signature</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>Aucune signature capturée</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </fieldset>

          {/* Section Documents */}
          <fieldset className="p-4 sm:p-6 mb-4 sm:mb-6 bg-gray-50">
            <legend className="text-lg sm:text-xl font-bold text-gray-900 px-2">Documents</legend>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={downloadDevis}
                  variant="outline"
                  className="flex items-center"
                >
                  <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                  Télécharger le devis
                </Button>
                {devis.statut === 'VALIDE' && !hasContract && (
                  <Button
                    onClick={() => router.push(`/mes-devis/${devis.id}/contrat`)}
                    className="bg-green-600 hover:bg-green-700 text-white flex items-center"
                  >
                    <DocumentDuplicateIcon className="h-4 w-4 mr-2" />
                    Remplir le contrat
                  </Button>
                )}
                {devis.statut === 'VALIDE' && hasContract && (
                  <Button
                    onClick={downloadContract}
                    variant="outline"
                    className="flex items-center"
                  >
                    <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                    Télécharger le contrat
                  </Button>
                )}
              </div>

            </div>
          </fieldset>

          {/* Section Validation */}
          {devis.statut === 'EN_ATTENTE' && (
            <fieldset className="p-4 sm:p-6 mb-4 sm:mb-6 bg-gray-50">
              <legend className="text-lg sm:text-xl font-bold text-gray-900 px-2">Validation du devis</legend>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="validation-checkbox"
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => setIsChecked(e.target.checked)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="validation-checkbox" className="font-medium text-gray-700">
                      Je confirme avoir lu et accepté les conditions du devis
                    </label>
                    <p className="text-gray-500">
                      En cochant cette case, vous acceptez les termes et conditions du devis présenté.
                    </p>
                  </div>
                </div>

                {error && (
                  <div className="rounded-md bg-red-50 p-4">
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

                {success && (
                  <div className="rounded-md bg-green-50 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <CheckCircleIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-green-800">{success}</h3>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleValidation}
                    disabled={isValidating || !isChecked}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isValidating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Validation en cours...
                      </>
                    ) : (
                      'Valider le devis'
                    )}
                  </button>
                </div>
              </div>
            </fieldset>
          )}
        </div>
                 <footer className="mt-4 sm:mt-6 p-4 bg-white">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center text-xs text-gray-600 gap-2 sm:gap-0">
          <div>
            {devis.numero} Trame
          </div>
          <div className="text-center">
            <div>CI.DES sasu  Capital 2 500 Euros</div>
            <div>SIRET : 87840789900011  VAT : FR71878407899</div>
            <div>Page 1 sur 2</div>
          </div>
          <div>
            <Image src="/logo.png" alt="CI.DES" width={32} height={32} />
          </div>
        </div>
      </footer>
      </div>
      {/* Pied de page */}

    </div>
  );
} 