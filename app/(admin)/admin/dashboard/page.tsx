'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserGroupIcon,
  AcademicCapIcon,
  ChartBarIcon,
  CalendarIcon,
  DocumentCheckIcon,
  ClipboardDocumentListIcon,
  UsersIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';

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
    session?: string;
  }[];
  demandesParMois: {
    mois: string;
    count: number;
  }[];
  // Nouvelles statistiques pour les formulaires quotidiens
  formulairesQuotidiens?: {
    totalFormulaires: number;
    formulairesActifs: number;
    totalReponses: number;
    reponsesAujourdhui: number;
    moyenneScores: number;
    topPerformers: {
      utilisateurNom: string;
      score: number;
      maxScore: number;
    }[];
  };
  // Nouvelles statistiques complètes
  signaturesInduction?: {
    total: number;
    aujourdhui: number;
  };
  declarationsMedicales?: {
    total: number;
    aujourdhui: number;
  };
  satisfactionClient?: {
    total: number;
    aujourdhui: number;
  };
  attendanceSignatures?: {
    total: number;
    aujourdhui: number;
  };
  factures?: {
    total: number;
    payees: number;
    partielles: number;
    enAttente: number;
  };
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <h2 className="text-2xl font-semibold text-gray-900 mt-4">Chargement du tableau de bord...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <XCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-red-600">{error}</h2>
            <button 
              onClick={fetchStats}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* En-tête amélioré */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-6">
            <ChartBarIcon className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Tableau de Bord Admin</h1>
          <p className="text-xl text-gray-600">Vue d'ensemble de votre plateforme de formation</p>
          <div className="mt-4 text-sm text-gray-500">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>

        {/* Statistiques principales - Demandes de formation */}
        <div className="mb-12">
          <div className="flex items-center mb-6">
            <AcademicCapIcon className="h-6 w-6 text-blue-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Demandes de Formation</h2>
          </div>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Total des demandes */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <DocumentTextIcon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-600">Total des demandes</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalDemandes}</p>
                </div>
              </div>
            </div>

            {/* Demandes en attente */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                    <ClockIcon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-600">En attente</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.demandesEnAttente}</p>
                </div>
              </div>
            </div>

            {/* Demandes acceptées */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                    <CheckCircleIcon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-600">Acceptées</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.demandesAcceptees}</p>
                </div>
              </div>
            </div>

            {/* Demandes refusées */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                    <XCircleIcon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-600">Refusées</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.demandesRefusees}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistiques complètes - Toutes les activités */}
        <div className="mb-12">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mr-4">
              <span className="text-2xl text-white">📊</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Statistiques Complètes</h2>
              <p className="text-gray-600">Vue d'ensemble de toutes les activités de la plateforme</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Signatures d'Induction */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <span className="text-xl text-white">📝</span>
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-600">Signatures Induction</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.signaturesInduction?.total || 0}</p>
                    <p className="text-xs text-green-600">+{stats.signaturesInduction?.aujourdhui || 0} aujourd'hui</p>
                  </div>
                </div>
                <a 
                  href="/admin/trainee-signatures"
                  className="inline-flex items-center px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Gérer
                </a>
              </div>
            </div>

            {/* Déclarations Médicales */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-600 rounded-lg flex items-center justify-center">
                      <span className="text-xl text-white">🏥</span>
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-600">Déclarations Médicales</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.declarationsMedicales?.total || 0}</p>
                    <p className="text-xs text-gray-500">Module en développement</p>
                  </div>
                </div>
                <a 
                  href="/admin/medical-declaration"
                  className="inline-flex items-center px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                >
                  Gérer
                </a>
              </div>
            </div>

            {/* Satisfaction Client */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
                      <span className="text-xl text-white">⭐</span>
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-600">Satisfaction Client</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.satisfactionClient?.total || 0}</p>
                    <p className="text-xs text-green-600">+{stats.satisfactionClient?.aujourdhui || 0} aujourd'hui</p>
                  </div>
                </div>
                <a 
                  href="/admin/customer-satisfaction"
                  className="inline-flex items-center px-3 py-2 bg-yellow-600 text-white text-sm font-medium rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  Gérer
                </a>
              </div>
            </div>

            {/* Signatures d'Attendance */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                      <span className="text-xl text-white">✅</span>
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-600">Présences</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.attendanceSignatures?.total || 0}</p>
                    <p className="text-xs text-gray-500">Module en développement</p>
                  </div>
                </div>
                <a 
                  href="/admin/liste-presence"
                  className="inline-flex items-center px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                >
                  Gérer
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Statistiques des factures */}
        {stats.factures && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-2xl text-white">💰</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Gestion Financière</h2>
                  <p className="text-gray-600">Statut des paiements et factures</p>
                </div>
              </div>
              <a 
                href="/admin/facture-trame"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Gérer les Factures
              </a>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Total Factures */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-r from-gray-500 to-gray-600 rounded-lg flex items-center justify-center">
                      <span className="text-xl text-white">📄</span>
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-600">Total Factures</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.factures.total}</p>
                  </div>
                </div>
              </div>

              {/* Factures Payées */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                      <span className="text-xl text-white">✅</span>
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-600">Payées</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.factures.payees}</p>
                    <p className="text-xs text-green-600">{stats.factures.total > 0 ? Math.round((stats.factures.payees / stats.factures.total) * 100) : 0}%</p>
                  </div>
                </div>
              </div>

              {/* Factures Partielles */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
                      <span className="text-xl text-white">⚠️</span>
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-600">Partielles</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.factures.partielles}</p>
                    <p className="text-xs text-yellow-600">{stats.factures.total > 0 ? Math.round((stats.factures.partielles / stats.factures.total) * 100) : 0}%</p>
                  </div>
                </div>
              </div>

              {/* Factures en Attente */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                      <span className="text-xl text-white">⏳</span>
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-600">En Attente</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.factures.enAttente}</p>
                    <p className="text-xs text-red-600">{stats.factures.total > 0 ? Math.round((stats.factures.enAttente / stats.factures.total) * 100) : 0}%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Statistiques des formulaires quotidiens */}
        {stats.formulairesQuotidiens && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <ClipboardDocumentListIcon className="h-6 w-6 text-emerald-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">Formulaires Quotidiens</h2>
              </div>
              <div className="flex gap-2">
                <a 
                  href="/admin/formulaires-quotidiens"
                  className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  <DocumentCheckIcon className="h-4 w-4 mr-2" />
                  Gérer les formulaires
                </a>
                <a 
                  href="/admin/formulaires-quotidiens/reponses"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Voir les réponses
                </a>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {/* Total des formulaires */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                      <ClipboardDocumentListIcon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-600">Total formulaires</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.formulairesQuotidiens.totalFormulaires}</p>
                  </div>
                </div>
              </div>

              {/* Formulaires actifs */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                      <DocumentCheckIcon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-600">Formulaires actifs</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.formulairesQuotidiens.formulairesActifs}</p>
                  </div>
                </div>
              </div>

              {/* Total des réponses */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-violet-600 rounded-lg flex items-center justify-center">
                      <UsersIcon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-600">Total réponses</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.formulairesQuotidiens.totalReponses}</p>
                  </div>
                </div>
              </div>

              {/* Réponses aujourd'hui */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                      <CalendarIcon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-600">Réponses aujourd'hui</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.formulairesQuotidiens.reponsesAujourdhui}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Score moyen et top performers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              {/* Score moyen */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <TrophyIcon className="h-6 w-6 text-yellow-500 mr-3" />
                  <h3 className="text-lg font-semibold text-gray-900">Score Moyen</h3>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    {stats.formulairesQuotidiens.moyenneScores.toFixed(1)}%
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(stats.formulairesQuotidiens.moyenneScores, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">Performance globale des stagiaires</p>
                </div>
              </div>

              {/* Top performers */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <TrophyIcon className="h-6 w-6 text-yellow-500 mr-3" />
                  <h3 className="text-lg font-semibold text-gray-900">Top Performers</h3>
                </div>
                <div className="space-y-3">
                  {stats.formulairesQuotidiens.topPerformers.slice(0, 3).map((performer, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                          index === 0 ? 'bg-yellow-500' : 
                          index === 1 ? 'bg-gray-400' : 
                          'bg-orange-500'
                        }`}>
                          {index + 1}
                        </div>
                        <span className="ml-3 font-medium text-gray-900">{performer.utilisateurNom}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">{performer.score}/{performer.maxScore}</div>
                        <div className="text-sm text-gray-600">
                          {Math.round((performer.score / performer.maxScore) * 100)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Financement Participatif */}
        {stats.crowdfunding && (
          <div className="mb-12">
            <div className="bg-gradient-to-r from-green-500 to-teal-400 rounded-xl p-8 text-white shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Financement Participatif</h3>
                    <p className="text-green-100">Centre de Formation Togo</p>
                  </div>
                </div>
                <a 
                  href="/admin/financement-participatif" 
                  className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition duration-300 shadow-lg"
                >
                  Gérer
                </a>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
                <div className="text-center bg-white/10 rounded-lg p-4">
                  <div className="text-3xl font-bold mb-1">
                    {new Intl.NumberFormat('fr-FR').format(stats.crowdfunding.totalRaised)} FCFA
                  </div>
                  <div className="text-green-100">Montant collecté</div>
                </div>
                <div className="text-center bg-white/10 rounded-lg p-4">
                  <div className="text-3xl font-bold mb-1">{stats.crowdfunding.contributorCount}</div>
                  <div className="text-green-100">Contributeurs</div>
                </div>
                <div className="text-center bg-white/10 rounded-lg p-4">
                  <div className="text-3xl font-bold mb-1">{stats.crowdfunding.progressPercentage}%</div>
                  <div className="text-green-100">Progression</div>
                </div>
              </div>

              {/* Progress Bar améliorée */}
              <div className="bg-white/20 rounded-full h-4 mb-3">
                <div 
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 h-4 rounded-full transition-all duration-500 shadow-lg"
                  style={{ width: `${Math.min(stats.crowdfunding.progressPercentage, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-sm text-green-100">
                <span>Objectif: {new Intl.NumberFormat('fr-FR').format(stats.crowdfunding.goal)} FCFA</span>
                <span>{Math.max(0, 100 - stats.crowdfunding.progressPercentage).toFixed(1)}% restant</span>
              </div>
            </div>
          </div>
        )}

        {/* Section inférieure avec graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formations populaires */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center mb-6">
              <AcademicCapIcon className="h-6 w-6 text-blue-600 mr-3" />
              <h3 className="text-xl font-bold text-gray-900">Formations les plus demandées</h3>
            </div>
            <div className="space-y-4">
              {stats.formationsPopulaires
                .sort((a, b) => b.count - a.count) // Trier par nombre de demandes décroissant
                .map((formation, index) => (
                <div key={formation.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 ${
                      index === 0 ? 'bg-yellow-500' : 
                      index === 1 ? 'bg-gray-400' : 
                      index === 2 ? 'bg-orange-500' : 
                      'bg-blue-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">{formation.titre}</span>
                      {formation.session && (
                        <div className="text-sm text-gray-500">Session: {formation.session}</div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-blue-600">{formation.count}</div>
                    <div className="text-sm text-gray-500">demandes</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Évolution des demandes */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center mb-6">
              <ChartBarIcon className="h-6 w-6 text-green-600 mr-3" />
              <h3 className="text-xl font-bold text-gray-900">Évolution des demandes</h3>
            </div>
            <div className="space-y-4">
              {(() => {
                // Grouper les demandes par mois
                const demandesGrouped = stats.demandesParMois.reduce((acc, item) => {
                  if (acc[item.mois]) {
                    acc[item.mois] += item.count;
                  } else {
                    acc[item.mois] = item.count;
                  }
                  return acc;
                }, {} as Record<string, number>);

                // Convertir en tableau et trier par mois (du plus récent au plus ancien)
                const demandesGroupedArray = Object.entries(demandesGrouped)
                  .map(([mois, count]) => ({ mois, count }))
                  .sort((a, b) => {
                    // Trier par date (du plus récent au plus ancien)
                    const dateA = new Date(a.mois);
                    const dateB = new Date(b.mois);
                    return dateB.getTime() - dateA.getTime();
                  });

                return demandesGroupedArray.map((item, idx) => (
                  <div key={`${item.mois}-${idx}`} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center">
                      <CalendarIcon className="h-5 w-5 text-green-500 mr-3" />
                      <span className="font-medium text-gray-900">{item.mois}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">{item.count}</div>
                      <div className="text-sm text-gray-500">demandes</div>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 