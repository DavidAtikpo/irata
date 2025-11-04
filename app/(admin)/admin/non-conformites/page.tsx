'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface NonConformite {
  id: string;
  numero: string;
  titre: string;
  description: string;
  type: string;
  gravite: string;
  statut: string;
  dateDetection: string;
  dateEcheance?: string;
  lieu?: string;
  detecteur: {
    id: string;
    nom?: string;
    prenom?: string;
    email: string;
  };
  responsable?: {
    id: string;
    nom?: string;
    prenom?: string;
    email: string;
  };
  actionsCorrectives: any[];
  _count: {
    actionsCorrectives: number;
    commentaires: number;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const typeLabels = {
  SECURITE: 'Sécurité',
  QUALITE: 'Qualité',
  PROCEDURE: 'Procédure',
  EQUIPEMENT: 'Équipement',
  FORMATION: 'Formation',
  DOCUMENTATION: 'Documentation',
  ENVIRONNEMENT: 'Environnement',
  AUTRE: 'Autre'
};

const graviteLabels = {
  MINEURE: 'Mineure',
  MAJEURE: 'Majeure',
  CRITIQUE: 'Critique'
};

const statutLabels = {
  OUVERTE: 'Ouverte',
  EN_COURS: 'En cours',
  FERMEE: 'Fermée',
  ANNULEE: 'Annulée'
};

const graviteColors = {
  MINEURE: 'bg-yellow-100 text-yellow-800',
  MAJEURE: 'bg-orange-100 text-orange-800',
  CRITIQUE: 'bg-red-100 text-red-800'
};

const statutColors = {
  OUVERTE: 'bg-blue-100 text-blue-800',
  EN_COURS: 'bg-yellow-100 text-yellow-800',
  FERMEE: 'bg-green-100 text-green-800',
  ANNULEE: 'bg-gray-100 text-gray-800'
};

export default function AdminNonConformitesPage() {
  const { data: session } = useSession();
  const [nonConformites, setNonConformites] = useState<NonConformite[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    statut: '',
    type: '',
    gravite: '',
    detecteurId: '',
    responsableId: '',
    search: ''
  });

  useEffect(() => {
    fetchNonConformites();
  }, [filters, pagination.page]);

  const fetchNonConformites = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.statut) params.append('statut', filters.statut);
      if (filters.type) params.append('type', filters.type);
      if (filters.gravite) params.append('gravite', filters.gravite);
      if (filters.detecteurId) params.append('detecteurId', filters.detecteurId);
      if (filters.responsableId) params.append('responsableId', filters.responsableId);
      if (filters.search) params.append('search', filters.search);
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());

      const response = await fetch(`/api/admin/non-conformites?${params}`);
      if (response.ok) {
        const data = await response.json();
        setNonConformites(data.nonConformites);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des non-conformités:', error);
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

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
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

  return (
    <div className="min-h-screen bg-gray-50 py-2">
      <div className="max-w-7xl mx-auto px-2">
        {/* Header */}
        <div className="mb-2">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h1 className="text-sm font-bold text-gray-900">Non-conformités</h1>
              <p className="mt-0.5 text-[10px] text-gray-600">
                Vue d'ensemble
              </p>
            </div>
            <div className="flex gap-1.5">
              <Link
                href="/admin/non-conformites/statistiques"
                className="bg-gray-600 text-white px-2 py-1 rounded text-[10px] hover:bg-gray-700 transition-colors"
              >
                Stats
              </Link>
              <Link
                href="/admin/non-conformites/nouvelle"
                className="bg-indigo-600 text-white px-2 py-1 rounded text-[10px] hover:bg-indigo-700 transition-colors"
              >
                Nouvelle
              </Link>
            </div>
          </div>
        </div>

        {/* Filtres avancés */}
        <div className="bg-white rounded shadow p-2 mb-2">
          <h3 className="text-[10px] font-medium text-gray-900 mb-1.5">Filtres</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
            <div>
              <label className="block text-[9px] font-medium text-gray-700 mb-0.5">
                Recherche
              </label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Titre, description..."
                className="w-full border border-gray-300 rounded px-1.5 py-0.5 text-[10px] focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-[9px] font-medium text-gray-700 mb-0.5">
                Statut
              </label>
              <select
                value={filters.statut}
                onChange={(e) => setFilters({ ...filters, statut: e.target.value })}
                className="w-full border border-gray-300 rounded px-1.5 py-0.5 text-[10px] focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">Tous</option>
                {Object.entries(statutLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[9px] font-medium text-gray-700 mb-0.5">
                Type
              </label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="w-full border border-gray-300 rounded px-1.5 py-0.5 text-[10px] focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">Tous</option>
                {Object.entries(typeLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[9px] font-medium text-gray-700 mb-0.5">
                Gravité
              </label>
              <select
                value={filters.gravite}
                onChange={(e) => setFilters({ ...filters, gravite: e.target.value })}
                className="w-full border border-gray-300 rounded px-1.5 py-0.5 text-[10px] focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">Toutes</option>
                {Object.entries(graviteLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[9px] font-medium text-gray-700 mb-0.5">
                Détecteur
              </label>
              <input
                type="text"
                value={filters.detecteurId}
                onChange={(e) => setFilters({ ...filters, detecteurId: e.target.value })}
                placeholder="ID détecteur"
                className="w-full border border-gray-300 rounded px-1.5 py-0.5 text-[10px] focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-[9px] font-medium text-gray-700 mb-0.5">
                Responsable
              </label>
              <input
                type="text"
                value={filters.responsableId}
                onChange={(e) => setFilters({ ...filters, responsableId: e.target.value })}
                placeholder="ID responsable"
                className="w-full border border-gray-300 rounded px-1.5 py-0.5 text-[10px] focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mb-2">
          <div className="bg-white rounded shadow p-2">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-[9px] text-gray-500">Total</p>
                <p className="text-xs font-semibold text-gray-900">{pagination.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded shadow p-2">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <p className="text-[9px] text-gray-500">Ouvertes</p>
                <p className="text-xs font-semibold text-gray-900">
                  {nonConformites.filter(nc => nc.statut === 'OUVERTE').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded shadow p-2">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-[9px] text-gray-500">En cours</p>
                <p className="text-xs font-semibold text-gray-900">
                  {nonConformites.filter(nc => nc.statut === 'EN_COURS').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded shadow p-2">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <p className="text-[9px] text-gray-500">Critiques</p>
                <p className="text-xs font-semibold text-gray-900">
                  {nonConformites.filter(nc => nc.gravite === 'CRITIQUE').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Liste des non-conformités */}
        <div className="bg-white rounded shadow">
          {nonConformites.length === 0 ? (
            <div className="text-center py-6">
              <svg
                className="mx-auto h-6 w-6 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="mt-1 text-[10px] font-medium text-gray-900">Aucune NC</h3>
              <p className="mt-0.5 text-[9px] text-gray-500">
                Aucune non-conformité trouvée.
              </p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-200">
                {nonConformites.map((nonConformite) => (
                  <div key={nonConformite.id} className="p-2 hover:bg-gray-50">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1 mb-1">
                          <h3 className="text-[10px] font-medium text-gray-900">
                            {nonConformite.numero}
                          </h3>
                          <span className={`inline-flex items-center px-1 py-0.5 rounded text-[9px] font-medium ${graviteColors[nonConformite.gravite as keyof typeof graviteColors]}`}>
                            {graviteLabels[nonConformite.gravite as keyof typeof graviteLabels]}
                          </span>
                          <span className={`inline-flex items-center px-1 py-0.5 rounded text-[9px] font-medium ${statutColors[nonConformite.statut as keyof typeof statutColors]}`}>
                            {statutLabels[nonConformite.statut as keyof typeof statutLabels]}
                          </span>
                          {isOverdue(nonConformite.dateEcheance) && (
                            <span className="inline-flex items-center px-1 py-0.5 rounded text-[9px] font-medium bg-red-100 text-red-800">
                              Retard
                            </span>
                          )}
                        </div>
                        <h4 className="text-[10px] font-semibold text-gray-900 mb-1 truncate">
                          {nonConformite.titre}
                        </h4>
                        <p className="text-gray-600 mb-1.5 line-clamp-2 text-[9px]">
                          {nonConformite.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-[9px] text-gray-500">
                          <div className="flex items-center gap-0.5">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            {typeLabels[nonConformite.type as keyof typeof typeLabels]}
                          </div>
                          <div className="flex items-center gap-0.5">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            {nonConformite.detecteur.nom || nonConformite.detecteur.email}
                          </div>
                          <div className="flex items-center gap-0.5">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {new Date(nonConformite.dateDetection).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:ml-2">
                        <div className="text-right text-[9px] text-gray-500">
                          <div className="flex items-center gap-0.5 mb-0.5">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            {nonConformite._count.actionsCorrectives} action(s)
                          </div>
                          <div className="flex items-center gap-0.5">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            {nonConformite._count.commentaires} comm.
                          </div>
                        </div>
                        <Link
                          href={`/admin/non-conformites/${nonConformite.id}`}
                          className="bg-indigo-600 text-white px-2 py-1 rounded text-[9px] hover:bg-indigo-700 transition-colors whitespace-nowrap"
                        >
                          Gérer
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="bg-white px-2 py-1.5 flex items-center justify-between border-t border-gray-200">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="relative inline-flex items-center px-2 py-1 border border-gray-300 text-[9px] font-medium rounded text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ←
                    </button>
                    <span className="text-[9px] text-gray-700 py-1">{pagination.page}/{pagination.pages}</span>
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.pages}
                      className="relative inline-flex items-center px-2 py-1 border border-gray-300 text-[9px] font-medium rounded text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      →
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-[9px] text-gray-700">
                        <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span>-{' '}
                        <span className="font-medium">
                          {Math.min(pagination.page * pagination.limit, pagination.total)}
                        </span>{' '}
                        / <span className="font-medium">{pagination.total}</span>
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded shadow-sm -space-x-px">
                        <button
                          onClick={() => handlePageChange(pagination.page - 1)}
                          disabled={pagination.page === 1}
                          className="relative inline-flex items-center px-1.5 py-0.5 rounded-l border border-gray-300 bg-white text-[9px] font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          ←
                        </button>
                        {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                          const page = i + 1;
                          return (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              className={`relative inline-flex items-center px-2 py-0.5 border text-[9px] font-medium ${
                                page === pagination.page
                                  ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                              }`}
                            >
                              {page}
                            </button>
                          );
                        })}
                        <button
                          onClick={() => handlePageChange(pagination.page + 1)}
                          disabled={pagination.page === pagination.pages}
                          className="relative inline-flex items-center px-1.5 py-0.5 rounded-r border border-gray-300 bg-white text-[9px] font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          →
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
