'use client';

import { useState, useEffect } from 'react';
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

export default function ActionsCorrectivesPage() {
  const [actionsCorrectives, setActionsCorrectives] = useState<ActionCorrective[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchActionsCorrectives();
  }, []);

  const fetchActionsCorrectives = async () => {
    try {
      const response = await fetch('/api/admin/actions-correctives');
      if (response.ok) {
        const data = await response.json();
        setActionsCorrectives(data.actionsCorrectives || []);
      } else {
        setError('Erreur lors du chargement des actions correctives');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur lors du chargement des actions correctives');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-2">
        <div className="max-w-7xl mx-auto px-2">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-2">
        <div className="max-w-7xl mx-auto px-2">
          <div className="text-center py-6">
            <h1 className="text-sm font-bold text-gray-900 mb-2">Erreur</h1>
            <p className="text-[10px] text-gray-600 mb-3">{error}</p>
            <button
              onClick={fetchActionsCorrectives}
              className="bg-indigo-600 text-white px-2 py-1 rounded text-[10px] hover:bg-indigo-700 transition-colors"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-2">
      <div className="max-w-7xl mx-auto px-2">
        {/* Header */}
        <div className="mb-2">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <h1 className="text-sm font-bold text-gray-900">Actions Correctives</h1>
              <p className="mt-0.5 text-[10px] text-gray-600">
                Gestion des actions
              </p>
            </div>
            <Link
              href="/admin/non-conformites"
              className="bg-indigo-600 text-white px-2 py-1 rounded text-[10px] hover:bg-indigo-700 transition-colors"
            >
              Non-conformités
            </Link>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mb-2">
          <div className="bg-white rounded shadow p-2">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-[9px] text-gray-500">Total</p>
                <p className="text-xs font-semibold text-gray-900">{actionsCorrectives.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded shadow p-2">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-[9px] text-gray-500">En cours</p>
                <p className="text-xs font-semibold text-gray-900">
                  {actionsCorrectives.filter(ac => ac.statut === 'EN_COURS').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded shadow p-2">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-[9px] text-gray-500">Terminées</p>
                <p className="text-xs font-semibold text-gray-900">
                  {actionsCorrectives.filter(ac => ac.statut === 'TERMINEE').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded shadow p-2">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <p className="text-[9px] text-gray-500">Critiques</p>
                <p className="text-xs font-semibold text-gray-900">
                  {actionsCorrectives.filter(ac => ac.priorite === 'CRITIQUE').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Liste des actions correctives */}
        <div className="bg-white shadow rounded">
          <div className="px-2 py-1.5 border-b border-gray-200">
            <h2 className="text-[10px] font-medium text-gray-900">Liste des actions</h2>
          </div>
          
          {actionsCorrectives.length === 0 ? (
            <div className="text-center py-6">
              <svg className="mx-auto h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-1 text-[10px] font-medium text-gray-900">Aucune action</h3>
              <p className="mt-0.5 text-[9px] text-gray-500">
                Créer depuis une non-conformité.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 py-1 text-left text-[9px] font-medium text-gray-500 uppercase">
                      Action
                    </th>
                    <th className="px-2 py-1 text-left text-[9px] font-medium text-gray-500 uppercase">
                      NC
                    </th>
                    <th className="px-2 py-1 text-left text-[9px] font-medium text-gray-500 uppercase">
                      Type
                    </th>
                    <th className="px-2 py-1 text-left text-[9px] font-medium text-gray-500 uppercase">
                      Priorité
                    </th>
                    <th className="px-2 py-1 text-left text-[9px] font-medium text-gray-500 uppercase">
                      Statut
                    </th>
                    <th className="px-2 py-1 text-left text-[9px] font-medium text-gray-500 uppercase">
                      Responsable
                    </th>
                    <th className="px-2 py-1 text-left text-[9px] font-medium text-gray-500 uppercase">
                      Date
                    </th>
                    <th className="px-2 py-1 text-left text-[9px] font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {actionsCorrectives.map((actionCorrective) => (
                    <tr key={actionCorrective.id} className="hover:bg-gray-50">
                      <td className="px-2 py-1.5">
                        <div>
                          <div className="text-[10px] font-medium text-gray-900 truncate max-w-[150px]">
                            {actionCorrective.titre}
                          </div>
                          <div className="text-[9px] text-gray-500 truncate max-w-[150px]">
                            {actionCorrective.description.substring(0, 50)}...
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-1.5">
                        <div>
                          <div className="text-[10px] font-medium text-gray-900">
                            {actionCorrective.nonConformite.numero}
                          </div>
                          <div className="text-[9px] text-gray-500 truncate max-w-[100px]">
                            {actionCorrective.nonConformite.titre}
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-1.5 text-[9px] text-gray-900">
                        {typeLabels[actionCorrective.type as keyof typeof typeLabels]?.substring(0, 15) || actionCorrective.type}
                      </td>
                      <td className="px-2 py-1.5">
                        <span className={`inline-flex px-1 py-0.5 text-[9px] font-semibold rounded ${prioriteColors[actionCorrective.priorite as keyof typeof prioriteColors]}`}>
                          {prioriteLabels[actionCorrective.priorite as keyof typeof prioriteLabels] || actionCorrective.priorite}
                        </span>
                      </td>
                      <td className="px-2 py-1.5">
                        <span className={`inline-flex px-1 py-0.5 text-[9px] font-semibold rounded ${statutColors[actionCorrective.statut as keyof typeof statutColors]}`}>
                          {statutLabels[actionCorrective.statut as keyof typeof statutLabels] || actionCorrective.statut}
                        </span>
                      </td>
                      <td className="px-2 py-1.5 text-[9px] text-gray-900">
                        {actionCorrective.responsable ? (
                          <div>
                            <div className="truncate max-w-[100px]">{actionCorrective.responsable.prenom} {actionCorrective.responsable.nom}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </td>
                      <td className="px-2 py-1.5 text-[9px] text-gray-900">
                        {new Date(actionCorrective.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                      </td>
                      <td className="px-2 py-1.5 text-[9px]">
                        <div className="flex flex-col gap-0.5">
                          <Link
                            href={`/admin/actions-correctives/${actionCorrective.id}`}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Détail
                          </Link>
                          <Link
                            href={`/admin/non-conformites/${actionCorrective.nonConformite.id}`}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            NC
                          </Link>
                        </div>
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
  );
}