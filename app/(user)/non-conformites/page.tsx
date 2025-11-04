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

export default function NonConformitesPage() {
  const { data: session } = useSession();
  const [nonConformites, setNonConformites] = useState<NonConformite[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    statut: '',
    type: '',
    gravite: ''
  });

  useEffect(() => {
    fetchNonConformites();
  }, [filters]);

  const fetchNonConformites = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.statut) params.append('statut', filters.statut);
      if (filters.type) params.append('type', filters.type);
      if (filters.gravite) params.append('gravite', filters.gravite);

      const response = await fetch(`/api/user/non-conformites?${params}`);
      if (response.ok) {
        const data = await response.json();
        setNonConformites(data);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-4 px-2">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-2 sm:py-3">
      <div className="max-w-7xl mx-auto px-2 sm:px-3">
        {/* Header */}
        <div className="mb-3">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <div>
              <h1 className="text-sm sm:text-base font-bold text-gray-900">Non-conformités</h1>
              <p className="text-[10px] text-gray-600">
                Gérez vos non-conformités
              </p>
            </div>
            <Link
              href="/non-conformites/nouvelle"
              className="w-full sm:w-auto bg-indigo-600 text-white px-3 py-1 rounded text-[10px] hover:bg-indigo-700 text-center"
            >
              + Nouvelle
            </Link>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded shadow-sm p-3 mb-3">
          <h3 className="text-[11px] font-medium text-gray-900 mb-2">Filtres</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <label className="block text-[10px] font-medium text-gray-700 mb-1">
                Statut
              </label>
              <select
                value={filters.statut}
                onChange={(e) => setFilters({ ...filters, statut: e.target.value })}
                className="w-full border border-gray-300 rounded px-2 py-1 text-[10px] focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">Tous</option>
                {Object.entries(statutLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="w-full border border-gray-300 rounded px-2 py-1 text-[10px] focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">Tous</option>
                {Object.entries(typeLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-medium text-gray-700 mb-1">
                Gravité
              </label>
              <select
                value={filters.gravite}
                onChange={(e) => setFilters({ ...filters, gravite: e.target.value })}
                className="w-full border border-gray-300 rounded px-2 py-1 text-[10px] focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">Toutes</option>
                {Object.entries(graviteLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Liste des non-conformités */}
        <div className="bg-white rounded shadow-sm">
          {nonConformites.length === 0 ? (
            <div className="text-center py-8">
              <svg
                className="mx-auto h-8 w-8 text-gray-400"
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
              <h3 className="mt-2 text-[11px] font-medium text-gray-900">Aucune non-conformité</h3>
              <p className="mt-1 text-[10px] text-gray-500">
                Déclarez-en une nouvelle.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {nonConformites.map((nonConformite) => (
                <div key={nonConformite.id} className="p-3 hover:bg-gray-50">
                  <div className="flex flex-col gap-2">
                    {/* Header avec badges */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <h3 className="text-[11px] font-medium text-gray-900">
                          {nonConformite.numero}
                        </h3>
                        <div className="flex flex-wrap gap-1">
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium ${graviteColors[nonConformite.gravite as keyof typeof graviteColors]}`}>
                            {graviteLabels[nonConformite.gravite as keyof typeof graviteLabels]}
                          </span>
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium ${statutColors[nonConformite.statut as keyof typeof statutColors]}`}>
                            {statutLabels[nonConformite.statut as keyof typeof statutLabels]}
                          </span>
                          {isOverdue(nonConformite.dateEcheance) && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-red-100 text-red-800">
                              Retard
                            </span>
                          )}
                        </div>
                      </div>
                      <Link
                        href={`/non-conformites/${nonConformite.id}`}
                        className="w-full sm:w-auto bg-indigo-600 text-white px-2 py-1 rounded text-[10px] hover:bg-indigo-700 text-center"
                      >
                        Détails
                      </Link>
                    </div>

                    {/* Titre et description */}
                    <div>
                      <h4 className="text-[11px] font-semibold text-gray-900 mb-1">
                        {nonConformite.titre}
                      </h4>
                      <p className="text-[10px] text-gray-600 line-clamp-2">
                        {nonConformite.description}
                      </p>
                    </div>

                    {/* Informations détaillées */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[9px] text-gray-500">
                      <div className="flex items-center">
                        <svg className="w-3 h-3 mr-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        <span className="truncate">{typeLabels[nonConformite.type as keyof typeof typeLabels]}</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="w-3 h-3 mr-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="truncate">{nonConformite.lieu || 'N/A'}</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="w-3 h-3 mr-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="truncate">{formatDate(nonConformite.dateDetection).slice(0, 5)}</span>
                      </div>
                      {nonConformite.dateEcheance && (
                        <div className="flex items-center">
                          <svg className="w-3 h-3 mr-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="truncate">Éch: {formatDate(nonConformite.dateEcheance).slice(0, 5)}</span>
                        </div>
                      )}
                    </div>

                    {/* Statistiques */}
                    <div className="flex items-center justify-between text-[9px] text-gray-500 pt-1 border-t border-gray-100">
                      <div className="flex items-center">
                        <svg className="w-3 h-3 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        {nonConformite._count.actionsCorrectives} action(s)
                      </div>
                      <div className="flex items-center">
                        <svg className="w-3 h-3 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        {nonConformite._count.commentaires} comm.
                      </div>
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
