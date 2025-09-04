'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface ActionCorrective {
  id: string;
  titre: string;
  description: string;
  type: string;
  statut: string;
  priorite: string;
  dateDebut: string;
  dateEcheance?: string;
  dateRealisation?: string;
  resultats?: string;
  efficacite?: string;
  nonConformite: {
    id: string;
    numero: string;
    titre: string;
    type: string;
    gravite: string;
    statut: string;
  };
  responsable: {
    id: string;
    nom?: string;
    prenom?: string;
    email: string;
  };
  _count: {
    commentaires: number;
  };
}

const typeLabels = {
  CORRECTION_IMMEDIATE: 'Correction immédiate',
  ACTION_CORRECTIVE: 'Action corrective',
  ACTION_PREVENTIVE: 'Action préventive',
  AMELIORATION_CONTINUE: 'Amélioration continue'
};

const statutLabels = {
  EN_COURS: 'En cours',
  TERMINEE: 'Terminée',
  EN_ATTENTE: 'En attente',
  ANNULEE: 'Annulée'
};

const prioriteLabels = {
  BASSE: 'Basse',
  MOYENNE: 'Moyenne',
  HAUTE: 'Haute',
  CRITIQUE: 'Critique'
};

const statutColors = {
  EN_COURS: 'bg-yellow-100 text-yellow-800',
  TERMINEE: 'bg-green-100 text-green-800',
  EN_ATTENTE: 'bg-blue-100 text-blue-800',
  ANNULEE: 'bg-gray-100 text-gray-800'
};

const prioriteColors = {
  BASSE: 'bg-gray-100 text-gray-800',
  MOYENNE: 'bg-blue-100 text-blue-800',
  HAUTE: 'bg-orange-100 text-orange-800',
  CRITIQUE: 'bg-red-100 text-red-800'
};

export default function AdminActionsCorrectivesPage() {
  const { data: session } = useSession();
  const [actionsCorrectives, setActionsCorrectives] = useState<ActionCorrective[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    statut: '',
    type: '',
    priorite: '',
    responsableId: ''
  });

  useEffect(() => {
    fetchActionsCorrectives();
  }, [filters]);

  const fetchActionsCorrectives = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.statut) params.append('statut', filters.statut);
      if (filters.type) params.append('type', filters.type);
      if (filters.priorite) params.append('priorite', filters.priorite);
      if (filters.responsableId) params.append('responsableId', filters.responsableId);

      const response = await fetch(`/api/admin/actions-correctives?${params}`);
      if (response.ok) {
        const data = await response.json();
        setActionsCorrectives(data.actionsCorrectives || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des actions correctives:', error);
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

  const isOverdue = (dateEcheance?: string) => {
    if (!dateEcheance) return false;
    return new Date(dateEcheance) < new Date();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestion des actions correctives</h1>
              <p className="mt-2 text-gray-600">
                Vue d'ensemble de toutes les actions correctives du système
              </p>
            </div>
            <Link
              href="/admin/actions-correctives/nouvelle"
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
            >
              Créer une action corrective
            </Link>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Filtres</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut
              </label>
              <select
                value={filters.statut}
                onChange={(e) => setFilters({ ...filters, statut: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Tous les statuts</option>
                {Object.entries(statutLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Tous les types</option>
                {Object.entries(typeLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priorité
              </label>
              <select
                value={filters.priorite}
                onChange={(e) => setFilters({ ...filters, priorite: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Toutes les priorités</option>
                {Object.entries(prioriteLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Responsable
              </label>
              <input
                type="text"
                value={filters.responsableId}
                onChange={(e) => setFilters({ ...filters, responsableId: e.target.value })}
                placeholder="ID du responsable"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total</p>
                <p className="text-2xl font-semibold text-gray-900">{actionsCorrectives.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">En cours</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {actionsCorrectives.filter(ac => ac.statut === 'EN_COURS').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Terminées</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {actionsCorrectives.filter(ac => ac.statut === 'TERMINEE').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">En retard</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {actionsCorrectives.filter(ac => isOverdue(ac.dateEcheance)).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Liste des actions correctives */}
        <div className="bg-white rounded-lg shadow">
          {actionsCorrectives.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune action corrective</h3>
              <p className="mt-1 text-sm text-gray-500">
                Aucune action corrective ne correspond aux critères de recherche.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {actionsCorrectives.map((action) => (
                <div key={action.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          {action.titre}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${prioriteColors[action.priorite as keyof typeof prioriteColors]}`}>
                          {prioriteLabels[action.priorite as keyof typeof prioriteLabels]}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statutColors[action.statut as keyof typeof statutColors]}`}>
                          {statutLabels[action.statut as keyof typeof statutLabels]}
                        </span>
                        {isOverdue(action.dateEcheance) && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            En retard
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {action.description}
                      </p>
                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                          {typeLabels[action.type as keyof typeof typeLabels]}
                        </div>
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Responsable: {action.responsable.nom || action.responsable.email}
                        </div>
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Début: {formatDate(action.dateDebut)}
                        </div>
                        {action.dateEcheance && (
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Échéance: {formatDate(action.dateEcheance)}
                          </div>
                        )}
                      </div>
                      <div className="mt-2">
                        <Link
                          href={`/admin/non-conformites/${action.nonConformite.id}`}
                          className="text-indigo-600 hover:text-indigo-800 text-sm"
                        >
                          Non-conformité: {action.nonConformite.numero} - {action.nonConformite.titre}
                        </Link>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 ml-6">
                      <div className="text-right text-sm text-gray-500">
                        <div className="flex items-center mb-1">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          {action._count.commentaires} commentaire(s)
                        </div>
                      </div>
                      <Link
                        href={`/admin/actions-correctives/${action.id}`}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                      >
                        Gérer
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
