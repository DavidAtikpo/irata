'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface Stats {
  general: {
    total: number;
    ouvertes: number;
    enCours: number;
    fermees: number;
    recentes: number;
    enRetard: number;
  };
  actionsCorrectives: {
    enCours: number;
    terminees: number;
    enRetard: number;
  };
  repartition: {
    parType: Array<{ type: string; count: number }>;
    parGravite: Array<{ gravite: string; count: number }>;
    parStatut: Array<{ statut: string; count: number }>;
  };
  topDetecteurs: Array<{
    _count: { detecteurId: number };
    user: {
      id: string;
      nom?: string;
      prenom?: string;
      email: string;
    };
  }>;
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

export default function AdminNonConformitesStatsPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [periode, setPeriode] = useState('30');

  useEffect(() => {
    fetchStats();
  }, [periode]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/non-conformites/stats?periode=${periode}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      setLoading(false);
    }
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

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Erreur de chargement</h1>
            <p className="text-gray-600">Impossible de charger les statistiques.</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Statistiques des non-conformités</h1>
              <p className="mt-2 text-gray-600">
                Vue d'ensemble des non-conformités et actions correctives
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={periode}
                onChange={(e) => setPeriode(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="7">7 derniers jours</option>
                <option value="30">30 derniers jours</option>
                <option value="90">90 derniers jours</option>
                <option value="365">1 an</option>
              </select>
            </div>
          </div>
        </div>

        {/* Statistiques générales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total des non-conformités</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.general.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Non-conformités ouvertes</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.general.ouvertes}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">En cours de traitement</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.general.enCours}</p>
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
                <p className="text-sm font-medium text-gray-500">Fermées</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.general.fermees}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Récentes ({periode}j)</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.general.recentes}</p>
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
                <p className="text-2xl font-semibold text-gray-900">{stats.general.enRetard}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Répartition par type */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Répartition par type</h3>
            <div className="space-y-3">
              {stats.repartition.parType.map((item) => (
                <div key={item.type} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {typeLabels[item.type as keyof typeof typeLabels]}
                  </span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full"
                        style={{ width: `${(item.count / stats.general.total) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-8 text-right">
                      {item.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Répartition par gravité */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Répartition par gravité</h3>
            <div className="space-y-3">
              {stats.repartition.parGravite.map((item) => (
                <div key={item.gravite} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {graviteLabels[item.gravite as keyof typeof graviteLabels]}
                  </span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          item.gravite === 'CRITIQUE' ? 'bg-red-600' :
                          item.gravite === 'MAJEURE' ? 'bg-orange-600' : 'bg-yellow-600'
                        }`}
                        style={{ width: `${(item.count / stats.general.total) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-8 text-right">
                      {item.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Répartition par statut */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Répartition par statut</h3>
            <div className="space-y-3">
              {stats.repartition.parStatut.map((item) => (
                <div key={item.statut} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {statutLabels[item.statut as keyof typeof statutLabels]}
                  </span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          item.statut === 'FERMEE' ? 'bg-green-600' :
                          item.statut === 'EN_COURS' ? 'bg-yellow-600' :
                          item.statut === 'OUVERTE' ? 'bg-blue-600' : 'bg-gray-600'
                        }`}
                        style={{ width: `${(item.count / stats.general.total) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-8 text-right">
                      {item.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top détecteurs */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Top détecteurs</h3>
            <div className="space-y-3">
              {stats.topDetecteurs.map((item, index) => (
                <div key={item.user.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-indigo-600">{index + 1}</span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {item.user.nom || item.user.email}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {item._count.detecteurId} non-conformité(s)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions correctives */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Actions correctives</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-semibold text-gray-900">{stats.actionsCorrectives.enCours}</div>
              <div className="text-sm text-gray-500">En cours</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-gray-900">{stats.actionsCorrectives.terminees}</div>
              <div className="text-sm text-gray-500">Terminées</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-gray-900">{stats.actionsCorrectives.enRetard}</div>
              <div className="text-sm text-gray-500">En retard</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
