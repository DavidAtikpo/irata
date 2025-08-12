'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Stats {
  totalDemandes: number;
  demandesEnAttente: number;
  demandesAcceptees: number;
  demandesRefusees: number;
  totalFormations: number;
  formationsPopulaires: {
    id: string;
    titre: string;
    count: number;
  }[];
  demandesParMois: {
    mois: string;
    count: number;
  }[];
  crowdfunding?: {
    totalRaised: number;
    goal: number;
    contributorCount: number;
    progressPercentage: number;
  };
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/');
    } else if (status === 'authenticated') {
      fetchStats();
    }
  }, [status, session, router]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des statistiques');
      }
      const data = await response.json();
      setStats(data);
    } catch (error) {
      setError('Erreur lors de la récupération des statistiques');
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900">Chargement...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-red-600">{error}</h2>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Tableau de bord</h2>
          <p className="mt-2 text-gray-600">Statistiques des demandes de formation</p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Carte des demandes totales */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total des demandes</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.totalDemandes}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Carte des demandes en attente */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">En attente</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.demandesEnAttente}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Carte des demandes acceptées */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Acceptées</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.demandesAcceptees}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Carte des demandes refusées */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Refusées</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.demandesRefusees}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Financement Participatif */}
        {stats.crowdfunding && (
          <div className="mt-8">
            <div className="bg-gradient-to-r from-green-500 to-teal-400 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">🎯 Financement Participatif - Centre Togo</h3>
                <a 
                  href="/admin/financement-participatif" 
                  className="bg-white text-green-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-100 transition duration-300"
                >
                  Gérer
                </a>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {new Intl.NumberFormat('fr-FR').format(stats.crowdfunding.totalRaised)} FCFA
                  </div>
                  <div className="text-sm opacity-90">Montant collecté</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{stats.crowdfunding.contributorCount}</div>
                  <div className="text-sm opacity-90">Contributeurs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{stats.crowdfunding.progressPercentage}%</div>
                  <div className="text-sm opacity-90">Progression</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="bg-white/20 rounded-full h-3 mb-2">
                <div 
                  className="bg-yellow-400 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(stats.crowdfunding.progressPercentage, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs opacity-90">
                <span>Objectif: {new Intl.NumberFormat('fr-FR').format(stats.crowdfunding.goal)} FCFA</span>
                <span>{100 - stats.crowdfunding.progressPercentage}% restant</span>
              </div>
            </div>
          </div>
        )}

        {/* Formations populaires */}
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Formations les plus demandées</h3>
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {stats.formationsPopulaires.map((formation) => (
                <li key={formation.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-gray-900">{formation.titre}</div>
                    <div className="text-sm text-gray-500">{formation.count} demandes</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Évolution des demandes */}
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Évolution des demandes</h3>
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {stats.demandesParMois.map((item) => (
                <li key={item.mois} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-gray-900">{item.mois}</div>
                    <div className="text-sm text-gray-500">{item.count} demandes</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Lien vers la trame de facture déplacé dans la sidebar */}
      </div>
    </div>
  );
} 