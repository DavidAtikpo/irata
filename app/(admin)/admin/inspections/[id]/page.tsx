'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface EquipmentInspection {
  id: string;
  docNumber: string;
  dateOfIssue: string;
  issueNumber: string;
  inspectionDate: string;
  technicianName: string;
  technicianIrataNo: string;
  makeOfItem: string;
  modelOfItem: string;
  itemIdNumber: string;
  standardsConformance: string | null;
  suitabilityOfItem: string | null;
  ageOfItem: string | null;
  historyOfItem: string | null;
  metalPartsCondition: string | null;
  textilePartsCondition: string | null;
  plasticPartsCondition: string | null;
  movingPartsFunction: string | null;
  operationalCheck: string | null;
  compatibilityCheck: string | null;
  overallComments: string | null;
  technicianVerdict: string | null;
  assessorVerdict: string | null;
  assessorComments: string | null;
  candidateCorrectlyIdentified: boolean | null;
  status: string;
  createdAt: string;
  technician: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
  };
  assessor?: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
  };
}

export default function InspectionDetailPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [inspection, setInspection] = useState<EquipmentInspection | null>(null);
  const [loading, setLoading] = useState(true);
  const [assessorForm, setAssessorForm] = useState({
    assessorVerdict: '',
    assessorComments: '',
    candidateCorrectlyIdentified: false
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/');
    }
  }, [status, session, router]);

  useEffect(() => {
    if (session?.user?.role === 'ADMIN') {
      fetchInspection();
    }
  }, [session, params.id]);

  const fetchInspection = async () => {
    try {
      const response = await fetch(`/api/admin/inspections/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setInspection(data);
      } else {
        console.error('Erreur lors de la récupération de l\'inspection');
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssessorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch(`/api/admin/inspections/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assessorForm),
      });

      if (response.ok) {
        await fetchInspection(); // Recharger les données
        setAssessorForm({
          assessorVerdict: '',
          assessorComments: '',
          candidateCorrectlyIdentified: false
        });
      } else {
        console.error('Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      DRAFT: { label: 'Brouillon', color: 'bg-gray-100 text-gray-800' },
      SUBMITTED: { label: 'Soumis', color: 'bg-blue-100 text-blue-800' },
      ASSESSED: { label: 'Évalué', color: 'bg-yellow-100 text-yellow-800' },
      APPROVED: { label: 'Approuvé', color: 'bg-green-100 text-green-800' },
      REJECTED: { label: 'Rejeté', color: 'bg-red-100 text-red-800' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.DRAFT;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getVerdictBadge = (verdict: string | null) => {
    if (!verdict) return null;
    
    const verdictConfig = {
      PASS: { label: 'Pass', color: 'bg-green-100 text-green-800' },
      FAIL: { label: 'Fail', color: 'bg-red-100 text-red-800' },
      DISCREPANCY: { label: 'Discrepancy', color: 'bg-yellow-100 text-yellow-800' }
    };
    
    const config = verdictConfig[verdict as keyof typeof verdictConfig];
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!inspection) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Inspection non trouvée</h1>
          <Link href="/admin/inspections" className="text-indigo-600 hover:text-indigo-900">
            Retour aux inspections
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Inspection d'Équipement</h1>
            <p className="text-gray-600">Document: {inspection.docNumber}</p>
          </div>
          <div className="flex space-x-2">
            <Link
              href={`/admin/inspections/${inspection.id}/edit`}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
            >
              Modifier
            </Link>
            <Link
              href="/admin/inspections"
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
            >
              Retour
            </Link>
          </div>
        </div>
      </div>

      {/* Document Info */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Informations du Technicien</h3>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Date d'inspection</dt>
                <dd className="text-sm text-gray-900">
                  {new Date(inspection.inspectionDate).toLocaleDateString('fr-FR')}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Nom du technicien</dt>
                <dd className="text-sm text-gray-900">{inspection.technicianName}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Numéro IRATA</dt>
                <dd className="text-sm text-gray-900">{inspection.technicianIrataNo}</dd>
              </div>
            </dl>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Informations de l'Équipement</h3>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Marque</dt>
                <dd className="text-sm text-gray-900">{inspection.makeOfItem}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Modèle</dt>
                <dd className="text-sm text-gray-900">{inspection.modelOfItem}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Numéro d'identification</dt>
                <dd className="text-sm text-gray-900">{inspection.itemIdNumber}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Status and Verdict */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Statut</h3>
            <div className="mt-2">{getStatusBadge(inspection.status)}</div>
          </div>
          <div className="text-right">
            <h3 className="text-lg font-medium text-gray-900">Verdicts</h3>
            <div className="mt-2 space-y-1">
              {inspection.technicianVerdict && (
                <div>
                  <span className="text-sm text-gray-500">Technicien:</span>
                  {getVerdictBadge(inspection.technicianVerdict)}
                </div>
              )}
              {inspection.assessorVerdict && (
                <div>
                  <span className="text-sm text-gray-500">Assesseur:</span>
                  {getVerdictBadge(inspection.assessorVerdict)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Inspection Details */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Détails de l'Inspection</h3>
        
        {/* Conformance and History */}
        <div className="mb-6">
          <h4 className="text-md font-medium text-gray-800 mb-3">Conformité et Historique</h4>
          <div className="space-y-3">
            {inspection.standardsConformance && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Normes de conformité</dt>
                <dd className="text-sm text-gray-900 mt-1">{inspection.standardsConformance}</dd>
              </div>
            )}
            {inspection.suitabilityOfItem && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Adéquation de l'article</dt>
                <dd className="text-sm text-gray-900 mt-1">{inspection.suitabilityOfItem}</dd>
              </div>
            )}
            {inspection.ageOfItem && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Âge de l'article</dt>
                <dd className="text-sm text-gray-900 mt-1">{inspection.ageOfItem}</dd>
              </div>
            )}
            {inspection.historyOfItem && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Historique</dt>
                <dd className="text-sm text-gray-900 mt-1">{inspection.historyOfItem}</dd>
              </div>
            )}
          </div>
        </div>

        {/* Visual & Tactile check */}
        <div className="mb-6">
          <h4 className="text-md font-medium text-gray-800 mb-3">Contrôle Visuel et Tactile</h4>
          <div className="space-y-3">
            {inspection.metalPartsCondition && (
              <div>
                <dt className="text-sm font-medium text-gray-500">État des pièces métalliques</dt>
                <dd className="text-sm text-gray-900 mt-1">{inspection.metalPartsCondition}</dd>
              </div>
            )}
            {inspection.textilePartsCondition && (
              <div>
                <dt className="text-sm font-medium text-gray-500">État des pièces textiles</dt>
                <dd className="text-sm text-gray-900 mt-1">{inspection.textilePartsCondition}</dd>
              </div>
            )}
            {inspection.plasticPartsCondition && (
              <div>
                <dt className="text-sm font-medium text-gray-500">État des pièces plastiques</dt>
                <dd className="text-sm text-gray-900 mt-1">{inspection.plasticPartsCondition}</dd>
              </div>
            )}
          </div>
        </div>

        {/* Operational check */}
        <div className="mb-6">
          <h4 className="text-md font-medium text-gray-800 mb-3">Contrôle Opérationnel</h4>
          <div className="space-y-3">
            {inspection.movingPartsFunction && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Fonctionnement des pièces mobiles</dt>
                <dd className="text-sm text-gray-900 mt-1">{inspection.movingPartsFunction}</dd>
              </div>
            )}
            {inspection.operationalCheck && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Contrôle opérationnel</dt>
                <dd className="text-sm text-gray-900 mt-1">{inspection.operationalCheck}</dd>
              </div>
            )}
            {inspection.compatibilityCheck && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Compatibilité des pièces</dt>
                <dd className="text-sm text-gray-900 mt-1">{inspection.compatibilityCheck}</dd>
              </div>
            )}
          </div>
        </div>

        {/* Overall comments */}
        {inspection.overallComments && (
          <div>
            <h4 className="text-md font-medium text-gray-800 mb-3">Commentaires Généraux</h4>
            <p className="text-sm text-gray-900">{inspection.overallComments}</p>
          </div>
        )}
      </div>

      {/* Assessor Section - Only for admins */}
      {session?.user?.role === 'ADMIN' && !inspection.assessorVerdict && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Évaluation par l'Assesseur</h3>
          <form onSubmit={handleAssessorSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verdict de l'assesseur
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="assessorVerdict"
                    value="PASS"
                    checked={assessorForm.assessorVerdict === 'PASS'}
                    onChange={(e) => setAssessorForm(prev => ({ ...prev, assessorVerdict: e.target.value }))}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Pass</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="assessorVerdict"
                    value="DISCREPANCY"
                    checked={assessorForm.assessorVerdict === 'DISCREPANCY'}
                    onChange={(e) => setAssessorForm(prev => ({ ...prev, assessorVerdict: e.target.value }))}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Discrepancy (discrepancy mineure)</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="assessorVerdict"
                    value="FAIL"
                    checked={assessorForm.assessorVerdict === 'FAIL'}
                    onChange={(e) => setAssessorForm(prev => ({ ...prev, assessorVerdict: e.target.value }))}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Fail</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Le candidat a correctement identifié l'état du produit et a fourni un verdict approprié
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={assessorForm.candidateCorrectlyIdentified}
                  onChange={(e) => setAssessorForm(prev => ({ ...prev, candidateCorrectlyIdentified: e.target.checked }))}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Oui</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Commentaires de l'assesseur
              </label>
              <textarea
                value={assessorForm.assessorComments}
                onChange={(e) => setAssessorForm(prev => ({ ...prev, assessorComments: e.target.value }))}
                rows={4}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Commentaires de l'assesseur..."
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting || !assessorForm.assessorVerdict}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {submitting ? 'Enregistrement...' : 'Soumettre l\'Évaluation'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Existing Assessor Comments */}
      {inspection.assessorComments && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Commentaires de l'Assesseur</h3>
          <p className="text-sm text-gray-900">{inspection.assessorComments}</p>
        </div>
      )}
    </div>
  );
} 