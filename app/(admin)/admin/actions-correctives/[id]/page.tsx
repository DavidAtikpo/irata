'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface ActionCorrective {
  id: string;
  titre: string;
  description: string;
  type: string;
  priorite: string;
  statut: string;
  dateEcheance: string | null;
  createdAt: string;
  updatedAt: string;
  // Champs CI.DES Action Corrective
  issuerName?: string;
  recipientName?: string;
  date?: string;
  number?: string;
  department?: string;
  originCustomer?: boolean;
  originProduction?: boolean;
  originAdministration?: boolean;
  originOther?: boolean;
  categoryOfAnomaly?: string;
  issuerDescription?: string;
  immediateCurativeAction?: boolean;
  actionPlanned?: string;
  correctiveDescribed?: boolean;
  preventiveDescribed?: boolean;
  recipientSignature?: string;
  issuerSignature?: string;
  collaboratorInCharge?: string;
  analysis?: string;
  limitTime?: string;
  collaboratorAppointed?: string;
  closingDate?: string;
  effectiveness?: string;
  effectivenessType?: string;
  signatureReception?: string;
  observation?: string;
  conclusion?: string;
  conclusionSignature?: string;
  nonConformite: {
    id: string;
    numero: string;
    titre: string;
    statut: string;
  };
  responsable: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
  } | null;
}

const typeLabels = {
  CORRECTION_IMMEDIATE: 'Correction immédiate',
  ACTION_CORRECTIVE: 'Action corrective',
  ACTION_PREVENTIVE: 'Action préventive',
  AMELIORATION_CONTINUE: 'Amélioration continue'
};

const prioriteLabels = {
  BASSE: 'Basse',
  MOYENNE: 'Moyenne',
  HAUTE: 'Haute',
  CRITIQUE: 'Critique'
};

const statutLabels = {
  EN_COURS: 'En cours',
  TERMINEE: 'Terminée',
  ANNULEE: 'Annulée'
};

const statutColors = {
  EN_COURS: 'bg-yellow-100 text-yellow-800',
  TERMINEE: 'bg-green-100 text-green-800',
  ANNULEE: 'bg-red-100 text-red-800'
};

const prioriteColors = {
  BASSE: 'bg-gray-100 text-gray-800',
  MOYENNE: 'bg-blue-100 text-blue-800',
  HAUTE: 'bg-orange-100 text-orange-800',
  CRITIQUE: 'bg-red-100 text-red-800'
};

export default function ActionCorrectiveDetailPage() {
  const params = useParams();
  const router = useRouter();
  const actionCorrectiveId = params.id as string;

  const [actionCorrective, setActionCorrective] = useState<ActionCorrective | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('useEffect triggered, actionCorrectiveId:', actionCorrectiveId);
    if (actionCorrectiveId) {
      fetchActionCorrective();
    }
  }, [actionCorrectiveId]);

  const fetchActionCorrective = async () => {
    
    try {
      const response = await fetch(`/api/admin/actions-correctives/${actionCorrectiveId}`);
      console.log('Response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Données reçues de l\'API:', data.actionCorrective);
        console.log('issuerSignature:', data.actionCorrective.issuerSignature);
        console.log('effectivenessType:', data.actionCorrective.effectivenessType);
        setActionCorrective(data.actionCorrective);
      } else if (response.status === 404) {
        console.log('Action corrective non trouvée (404)');
        setError('Action corrective non trouvée');
      } else {
        console.log('Erreur de réponse:', response.status);
        setError('Erreur lors du chargement de l\'action corrective');
      }
    } catch (error) {
      console.error('Erreur dans fetchActionCorrective:', error);
      setError('Erreur lors du chargement de l\'action corrective');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-2">
        <div className="max-w-4xl mx-auto px-2">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !actionCorrective) {
    return (
      <div className="min-h-screen bg-gray-50 py-2">
        <div className="max-w-4xl mx-auto px-2">
          <div className="text-center py-6">
            <h1 className="text-sm font-bold text-gray-900 mb-2">Erreur</h1>
            <p className="text-gray-600 text-[10px] mb-3">{error || 'Action corrective non trouvée'}</p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => router.back()}
                className="bg-gray-600 text-white px-2 py-1 rounded text-[10px] hover:bg-gray-700 transition-colors"
              >
                Retour
              </button>
            <Link
              href="/admin/actions-correctives"
              className="bg-indigo-600 text-white px-2 py-1 rounded text-[10px] hover:bg-indigo-700 transition-colors"
            >
                Voir toutes
            </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

    // Utiliser directement les champs du modèle au lieu de parser la description
    const formData = {
      issuer: actionCorrective.issuerName || '',
      recipient: actionCorrective.recipientName || '',
      date: actionCorrective.date || '',
      number: actionCorrective.number || '',
      department: actionCorrective.department || '',
      origin: [
        actionCorrective.originCustomer && 'Customer',
        actionCorrective.originProduction && 'Production',
        actionCorrective.originAdministration && 'Administration',
        actionCorrective.originOther && 'Other'
      ].filter(Boolean).join(', ') || '',
      category: actionCorrective.categoryOfAnomaly || '',
      issuerDescription: actionCorrective.issuerDescription || '',
      immediateCurative: actionCorrective.immediateCurativeAction || false,
      planned: actionCorrective.actionPlanned || '',
      correctiveDescribed: actionCorrective.correctiveDescribed || false,
      preventiveDescribed: actionCorrective.preventiveDescribed || false,
      recipientSignature: actionCorrective.recipientSignature || null,
      issuerSignature: actionCorrective.issuerSignature || null,
      collaboratorInCharge: actionCorrective.collaboratorInCharge || '',
      analysis: actionCorrective.analysis || '',
      limitTime: actionCorrective.limitTime || '',
      collaboratorAppointed: actionCorrective.collaboratorAppointed || '',
      closingDate: actionCorrective.closingDate || '',
      effectiveness: actionCorrective.effectiveness || '',
      effectivenessType: actionCorrective.effectivenessType || '',
      signatureReception: actionCorrective.signatureReception || null,
      observation: actionCorrective.observation || '',
      conclusion: actionCorrective.conclusion || '',
      conclusionSignature: actionCorrective.conclusionSignature || null
    };

  return (
    <div className="min-h-screen bg-gray-50 py-2">
      <div className="max-w-6xl mx-auto px-2">
        {/* Header */}
        <div className="mb-2">
          <div className="flex items-center gap-2 mb-2">
            <Link
              href="/admin/actions-correctives"
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-sm font-bold text-gray-900">Détail Action Corrective</h1>
          </div>
        </div>


        {/* Non-conformité associée */}
        <div className="bg-white shadow rounded mb-2">
          <div className="px-2 py-1.5 border-b border-gray-200">
            <h2 className="text-[10px] font-medium text-gray-900">NC associée</h2>
          </div>
          <div className="px-2 py-1.5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <p className="text-[10px] font-medium text-gray-900">
                  {actionCorrective.nonConformite.numero} - {actionCorrective.nonConformite.titre}
                </p>
                <p className="text-[9px] text-gray-500">Statut: {actionCorrective.nonConformite.statut}</p>
              </div>
              <div className="flex gap-1.5">
                <Link
                  href={`/admin/non-conformites/${actionCorrective.nonConformite.id}`}
                  className="bg-indigo-600 text-white px-1.5 py-0.5 rounded text-[9px] hover:bg-indigo-700 transition-colors"
                >
                  Voir NC
                </Link>
                <a
                  href={`/api/admin/non-conformites/${actionCorrective.nonConformite.id}/pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-red-600 text-white px-1.5 py-0.5 rounded text-[9px] hover:bg-red-700 transition-colors flex items-center gap-1"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>PDF</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Fiche CI.DES Action Corrective - Mode lecture seule */}
        <div className="bg-white shadow rounded">
          <div className="px-2 py-1.5 border-b border-gray-200">
            <h2 className="text-[10px] font-medium text-gray-900">Fiche CI.DES</h2>
          </div>
          <div className="p-2">
            {/* Header de la fiche */}
            <header className="p-1.5 border-b border-gray-200 mb-2">
              <div className="flex items-center gap-2">
                <div className="flex-shrink-0">
                  <img src="/logo.png" alt="CI.DES Logo" className="w-8 h-10 object-contain" />
                </div>
                <div className="flex-1">
                  <table className="w-full border-collapse text-[8px]">
                    <tbody>
                      <tr>
                        <td className="border p-0.5 font-bold">Titre</td>
                        <td className="border p-0.5 font-bold">Code</td>
                        <td className="border p-0.5 font-bold">Révision</td>
                        <td className="border p-0.5 font-bold">Date</td>
                      </tr>
                      <tr>
                        <td className="border p-0.5">CI.DES ACTION CORRECTIVE</td>
                        <td className="border p-0.5">ENR-CIFRA-QHSE 002</td>
                        <td className="border p-0.5">00</td>
                        <td className="border p-0.5">{new Date(actionCorrective.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </header>

            {/* Header avec informations de base */}
            <section className="grid grid-cols-3 sm:grid-cols-6 gap-1 mb-2">
              <div>
                <div className="text-[9px] font-medium text-gray-700">Émetteur</div>
                <div className="text-[9px] text-gray-900 border rounded px-1 py-0.5 bg-gray-50">
                  {formData.issuer || '—'}
                </div>
              </div>
              <div>
                <div className="text-[9px] font-medium text-gray-700">Destinataire</div>
                <div className="text-[9px] text-gray-900 border rounded px-1 py-0.5 bg-gray-50">
                  {formData.recipient || '—'}
                </div>
              </div>
              <div>
                <div className="text-[9px] font-medium text-gray-700">Date</div>
                <div className="text-[9px] text-gray-900 border rounded px-1 py-0.5 bg-gray-50">
                  {formData.date || '—'}
                </div>
              </div>
              <div>
                <div className="text-[9px] font-medium text-gray-700">N°</div>
                <div className="text-[9px] text-gray-900 border rounded px-1 py-0.5 bg-gray-50">
                  {formData.number || '—'}
                </div>
              </div>
              <div className="col-span-2">
                <div className="text-[9px] font-medium text-gray-700">Département</div>
                <div className="text-[9px] text-gray-900 border rounded px-1 py-0.5 bg-gray-50">
                  {formData.department || '—'}
                </div>
              </div>
            </section>

            {/* Partie réservée à l'émetteur */}
            <section className="border border-gray-300 rounded p-2 space-y-1.5 mb-2">
              <h2 className="font-medium text-[9px] mb-1">PARTIE RÉSERVÉE À L'ÉMETTEUR</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  <div>
                  <div className="text-[9px] mb-0.5 font-medium text-gray-700">Origine</div>
                  <div className="text-[9px] text-gray-900 bg-gray-50 border rounded px-1 py-0.5">
                    {formData.origin || '—'}
                  </div>
                </div>
                  <div>
                  <div className="text-[9px] mb-0.5 font-medium text-gray-700">Catégorie d'anomalie</div>
                  <div className="text-[9px] text-gray-900 bg-gray-50 border rounded px-1 py-0.5">
                    {formData.category || '—'}
                  </div>
                </div>
                    </div>

                    <div>
                <div className="text-[9px] mb-0.5 font-medium text-gray-700">Description</div>
                <div className="text-[9px] text-gray-900 bg-gray-50 border rounded p-1 min-h-12">
                  {formData.issuerDescription || '—'}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 items-center">
                <div className="text-[9px] flex items-center gap-1">
                  <input type="checkbox" checked={formData.immediateCurative || false} disabled className="rounded w-3 h-3" />
                  Action curative immédiate
                </div>
                <div className="flex items-center gap-1 text-[9px]">
                  Action planifiée ?
                  <span className="font-medium">
                    {formData.planned === 'yes' ? 'Oui' : formData.planned === 'no' ? 'Non' : '—'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                <div className="text-[9px] flex items-center gap-1">
                  <input type="checkbox" checked={formData.correctiveDescribed || false} disabled className="rounded w-3 h-3" />
                  Corrective (décrite)
                </div>
                <div className="text-[9px] flex items-center gap-1">
                  <input type="checkbox" checked={formData.preventiveDescribed || false} disabled className="rounded w-3 h-3" />
                  Préventive (décrite)
                </div>
                    </div>

                    <div>
                <div className="text-[9px] font-medium text-gray-700">Collaborateur responsable</div>
                <div className="text-[9px] text-gray-900 bg-gray-50 border rounded px-1 py-0.5">
                  {formData.collaboratorInCharge || '—'}
                </div>
                    </div>

              <div className="flex justify-end">
                <div className="w-32">
                  <div className="text-[9px] font-medium text-gray-700">Signature émetteur</div>
                  {formData.issuerSignature && formData.issuerSignature !== '—' ? (
                    <div className="border rounded p-1 bg-gray-50">
                      <img src={formData.issuerSignature} alt="Signature Émetteur" className="max-w-full h-6 object-contain" />
                    </div>
                  ) : (
                    <div className="border rounded p-1 bg-gray-50 text-gray-400 text-[8px]">
                      Aucune signature
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Partie réservée au responsable qualité */}
            <section className="border border-gray-300 rounded p-2 space-y-1.5">
              <h2 className="font-medium text-[9px] mb-1">PARTIE RÉSERVÉE AU RESPONSABLE QUALITÉ / AUTORITÉ TECHNIQUE / PDG</h2>

                    <div>
                <div className="text-[9px] mb-0.5 font-medium text-gray-700">Analyse de la cause / Proposition d'action</div>
                <div className="text-[9px] text-gray-900 bg-gray-50 border rounded p-1 min-h-12">
                  {formData.analysis || '—'}
                </div>
                    </div>

                    <div>
                <div className="text-[9px] font-medium text-gray-700">Délai limite :</div>
                <div className="text-[9px] text-gray-900 bg-gray-50 border rounded px-1 py-0.5">
                  {formData.limitTime || '—'}
                    </div>
                  </div>

                  <div>
                <div className="text-[9px] font-medium text-gray-700">Collaborateur responsable (PDG)</div>
                <div className="text-[9px] text-gray-900 bg-gray-50 border rounded px-1 py-0.5">
                  {formData.collaboratorAppointed || '—'}
                </div>
                  </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                <div>
                  <div className="text-[9px] font-medium text-gray-700">Clôture des actions</div>
                  <div className="text-[9px] text-gray-900 bg-gray-50 border rounded px-1 py-0.5">
                    {formData.closingDate || '—'}
                  </div>
                    </div>
                    <div>
                  <div className="text-[9px] font-medium text-gray-700">Efficacité des actions ?</div>
                  <div className="text-[9px] text-gray-900 bg-gray-50 border rounded px-1 py-0.5">
                    {formData.effectiveness || '—'}
                  </div>
                  {formData.effectivenessType && (
                    <div className="text-[9px] font-medium text-gray-700 mt-0.5">Type d'efficacité :</div>
                  )}
                  {formData.effectivenessType && (
                    <div className="text-[9px] text-gray-900 bg-gray-50 border rounded px-1 py-0.5">
                      {formData.effectivenessType || '—'}
                    </div>
                  )}
                </div>
            </div>
              
              <div className="flex justify-end">
                <div>
                  <div className="text-[9px] font-medium text-gray-700">Signature / Réception</div>
                  {formData.signatureReception && formData.signatureReception !== '—' ? (
                    <div className="p-1">
                      <img src={formData.signatureReception} alt="Signature Réception" className="max-w-full h-6 object-contain" />
                    </div>
                  ) : (
                    <div className="border rounded p-1 bg-gray-50 text-gray-400 text-[8px]">
                      Aucune signature
                </div>
              )}
          </div>
          </div>

                <div>
                <div className="text-[9px] font-medium text-gray-700">Observation Responsable Qualité</div>
                <div className="text-[9px] text-gray-900 bg-gray-50 border rounded p-1 min-h-12">
                  {formData.observation || '—'}
              </div>
            </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                <div>
                  <div className="text-[9px] font-medium mb-0.5 text-gray-700">Conclusion Responsable Qualité</div>
                  <div className="text-[9px] text-gray-900 bg-gray-50 border rounded p-1">
                    {formData.conclusion || '—'}
                  </div>
                </div>
                <div className="flex justify-end">
                  <div>
                    <div className="text-[9px] font-medium text-gray-700">Signature</div>
                    {formData.conclusionSignature && formData.conclusionSignature !== '—' ? (
                      <div className="p-1">
                        <img src={formData.conclusionSignature} alt="Signature" className="max-w-full h-6 object-contain" />
                      </div>
                    ) : (
                      <div className="border rounded p-1 bg-gray-50 text-gray-400 text-[8px]">
                        Aucune signature
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
              </div>
            </div>

        {/* Actions */}
        <div className="mt-2 flex flex-col sm:flex-row justify-between gap-2">
          <Link
            href="/admin/actions-correctives"
            className="bg-gray-600 text-white px-2 py-1 rounded text-[10px] hover:bg-gray-700 transition-colors"
          >
            Retour
          </Link>
          <div className="flex gap-2">
            <Link
              href={`/admin/non-conformites/${actionCorrective.nonConformite.id}`}
              className="bg-indigo-600 text-white px-2 py-1 rounded text-[10px] hover:bg-indigo-700 transition-colors"
            >
              Voir NC
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}