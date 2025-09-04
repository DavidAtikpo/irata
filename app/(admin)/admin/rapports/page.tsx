'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  ChartBarIcon,
  UserGroupIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ClockIcon,
  TrophyIcon,
  ExclamationTriangleIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline';

interface RapportsData {
  metriques: {
    // Utilisateurs
    totalUsers: number;
    totalAdmins: number;
    totalGestionnaires: number;
    
    // Formations et demandes
    totalFormations: number;
    totalDemandes: number;
    totalDevis: number;
    totalContrats: number;
    
    // Formulaires et inspections
    totalFormulaires: number;
    totalReponses: number;
    totalInspections: number;
    
    // Suivi des stagiaires
    totalTrainees: number;
    totalSessions: number;
    totalFollowUps: number;
    totalProgress: number;
    totalSignatures: number;
    
    // Satisfaction et contributions
    totalContributions: number;
    totalSatisfaction: number;
    satisfactionMoyenne: number;
    
    // Non-conformités et actions correctives
    totalNonConformites: number;
    totalActionsCorrectives: number;
    tauxResolution: number;
    delaiMoyenResolution: number;
    
    // Documents et notifications
    totalDocuments: number;
    totalNotifications: number;
    
    // Factures
    totalInvoices: number;
    chiffreAffairesTotal: number;
  };
  repartitions: {
    // Utilisateurs
    usersParRole: Array<{ role: string; count: number }>;
    
    // Formations et demandes
    demandesParStatut: Array<{ statut: string; count: number }>;
    devisParStatut: Array<{ statut: string; count: number }>;
    
    // Inspections
    inspectionsParStatut: Array<{ statut: string; count: number }>;
    
    // Non-conformités
    nonConformitesParType: Array<{ type: string; count: number }>;
    nonConformitesParGravite: Array<{ gravite: string; count: number }>;
    nonConformitesParStatut: Array<{ statut: string; count: number }>;
    
    // Actions correctives
    actionsCorrectivesParStatut: Array<{ statut: string; count: number }>;
    actionsCorrectivesParPriorite: Array<{ priorite: string; count: number }>;
    
    // Notifications
    notificationsParType: Array<{ type: string; count: number }>;
    
    // Factures
    invoicesParStatut: Array<{ statut: string; count: number }>;
  };
  evolutions: {
    nonConformitesParMois: Array<{ mois: string; count: number }>;
    actionsCorrectivesParMois: Array<{ mois: string; count: number }>;
    inscriptionsParMois: Array<{ mois: string; session: string; count: number }>;
  };
  topUtilisateurs: {
    detecteurs: Array<{ id: string; nom: string; prenom?: string; email: string; count: number }>;
    responsables: Array<{ id: string; nom: string; prenom?: string; email: string; count: number }>;
  };
  sessionsPopulaires: Array<{ session: string; count: number }>;
}

const typeLabels = {
  SECURITE: 'Sécurité',
  QUALITE: 'Qualité',
  ENVIRONNEMENT: 'Environnement',
  PROCEDURE: 'Procédure',
  EQUIPEMENT: 'Équipement',
  FORMATION: 'Formation'
};

const graviteLabels = {
  BASSE: 'Basse',
  MOYENNE: 'Moyenne',
  HAUTE: 'Haute',
  CRITIQUE: 'Critique'
};

const statutLabels = {
  OUVERTE: 'Ouverte',
  EN_COURS: 'En cours',
  FERMEE: 'Fermée',
  EN_ATTENTE: 'En attente'
};

const prioriteLabels = {
  BASSE: 'Basse',
  MOYENNE: 'Moyenne',
  HAUTE: 'Haute',
  CRITIQUE: 'Critique'
};

const roleLabels = {
  USER: 'Utilisateur',
  ADMIN: 'Administrateur',
  GESTIONNAIRE: 'Gestionnaire'
};

const statutDemandeLabels = {
  EN_ATTENTE: 'En attente',
  EN_COURS: 'En cours',
  VALIDEE: 'Validée',
  REJETEE: 'Rejetée'
};

const statutDevisLabels = {
  BROUILLON: 'Brouillon',
  ENVOYE: 'Envoyé',
  ACCEPTE: 'Accepté',
  REFUSE: 'Refusé'
};

const statutContratLabels = {
  EN_ATTENTE: 'En attente',
  ACTIF: 'Actif',
  TERMINE: 'Terminé',
  RESILIE: 'Résilié'
};

const statutInspectionLabels = {
  PLANIFIEE: 'Planifiée',
  EN_COURS: 'En cours',
  TERMINEE: 'Terminée',
  ANNULEE: 'Annulée'
};

const statutInvoiceLabels = {
  BROUILLON: 'Brouillon',
  ENVOYEE: 'Envoyée',
  PAYEE: 'Payée',
  EN_RETARD: 'En retard'
};

export default function RapportsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [rapportsData, setRapportsData] = useState<RapportsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sessions, setSessions] = useState<string[]>([]);
  const [selectedSession, setSelectedSession] = useState<string>('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/');
    } else if (status === 'authenticated') {
      fetchSessions();
      fetchRapportsData();
    }
  }, [status, session, router]);

  const handleSessionChange = (session: string) => {
    setSelectedSession(session);
    fetchRapportsData(session);
  };

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/admin/sessions');
      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des sessions:', error);
    }
  };

  const fetchRapportsData = async (sessionFilter?: string) => {
    try {
      setLoading(true);
      const url = sessionFilter 
        ? `/api/admin/rapports?session=${encodeURIComponent(sessionFilter)}`
        : '/api/admin/rapports';
        
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setRapportsData(data);
      } else {
        const errorData = await response.json();
        setError(`Erreur ${response.status}: ${errorData.message || 'Erreur inconnue'}`);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des rapports:', error);
      setError('Erreur de connexion lors du chargement des rapports');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <h2 className="mt-4 text-xl font-semibold text-gray-900">Chargement des rapports...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Erreur de chargement</h1>
          <p className="text-red-600 mb-6">{error}</p>
          <button
            onClick={() => fetchRapportsData()}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!rapportsData) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Aucune donnée disponible</h1>
          <p className="text-gray-600">Aucune donnée de rapport n'est disponible pour le moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Rapports & Statistiques</h1>
        <p className="mt-2 text-sm text-gray-600">
          Vue d'ensemble des performances et statistiques du centre de formation
        </p>
        
        {/* Sélecteur de session */}
        <div className="mt-4 flex items-center space-x-4">
          <label htmlFor="session-select" className="text-sm font-medium text-gray-700">
            Filtrer par session :
          </label>
          <select
            id="session-select"
            value={selectedSession}
            onChange={(e) => handleSessionChange(e.target.value)}
            className="block w-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="">Toutes les sessions</option>
            {sessions.map((session) => (
              <option key={session} value={session}>
                {session}
              </option>
            ))}
          </select>
          {selectedSession && (
            <button
              onClick={() => handleSessionChange('')}
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              Effacer le filtre
            </button>
          )}
        </div>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6 mb-8">
        {/* Utilisateurs */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserGroupIcon className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Utilisateurs</dt>
                  <dd className="text-lg font-medium text-gray-900">{rapportsData.metriques.totalUsers}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Formations */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DocumentTextIcon className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Formations</dt>
                  <dd className="text-lg font-medium text-gray-900">{rapportsData.metriques.totalFormations}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Demandes */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-6 w-6 text-purple-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Demandes</dt>
                  <dd className="text-lg font-medium text-gray-900">{rapportsData.metriques.totalDemandes}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Sessions */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrophyIcon className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Sessions</dt>
                  <dd className="text-lg font-medium text-gray-900">{rapportsData.metriques.totalSessions}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Non-conformités */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Non-conformités</dt>
                  <dd className="text-lg font-medium text-gray-900">{rapportsData.metriques.totalNonConformites}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Actions correctives */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <WrenchScrewdriverIcon className="h-6 w-6 text-indigo-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Actions correctives</dt>
                  <dd className="text-lg font-medium text-gray-900">{rapportsData.metriques.totalActionsCorrectives}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Satisfaction */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Satisfaction</dt>
                  <dd className="text-lg font-medium text-gray-900">{rapportsData.metriques.satisfactionMoyenne}/5</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Chiffre d'affaires */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrophyIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">CA Total</dt>
                  <dd className="text-lg font-medium text-gray-900">{rapportsData.metriques.chiffreAffairesTotal.toLocaleString()}€</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Graphiques et tableaux */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Évolution des inscriptions aux sessions */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Évolution des inscriptions aux sessions (6 derniers mois)</h3>
          <div className="h-64 flex items-end justify-center space-x-2 border-l border-b border-gray-200">
            {rapportsData.evolutions.inscriptionsParMois.length > 0 ? (
              (() => {
                // Grouper par mois et calculer le total par mois
                const monthlyData = rapportsData.evolutions.inscriptionsParMois.reduce((acc, item) => {
                  const month = item.mois;
                  if (!acc[month]) {
                    acc[month] = 0;
                  }
                  acc[month] += item.count;
                  return acc;
                }, {} as Record<string, number>);
                
                const monthlyArray = Object.entries(monthlyData).map(([mois, count]) => ({ mois, count }));
                const maxCount = Math.max(...monthlyArray.map(i => i.count));
                
                return monthlyArray.map((item, index) => {
                  const height = maxCount > 0 ? (item.count / maxCount) * 200 : 0;
                  const month = new Date(item.mois).toLocaleDateString('fr-FR', { month: 'short' });
                  return (
                    <div key={index} className="flex flex-col items-center">
                      <div 
                        className="bg-blue-500 rounded-t-sm w-8 mb-2"
                        style={{ height: `${height}px` }}
                      ></div>
                      <span className="text-xs text-gray-500">{month}</span>
                      <span className="text-xs text-gray-400">{item.count}</span>
                    </div>
                  );
                });
              })()
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Aucune donnée disponible</p>
              </div>
            )}
          </div>
        </div>

        {/* Évolution des non-conformités */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Évolution des non-conformités (6 derniers mois)</h3>
          <div className="h-64 flex items-end justify-center space-x-2 border-l border-b border-gray-200">
            {rapportsData.evolutions.nonConformitesParMois.length > 0 ? (
              rapportsData.evolutions.nonConformitesParMois.map((item, index) => {
                const maxCount = Math.max(...rapportsData.evolutions.nonConformitesParMois.map(i => i.count));
                const height = maxCount > 0 ? (item.count / maxCount) * 200 : 0;
                const month = new Date(item.mois).toLocaleDateString('fr-FR', { month: 'short' });
                return (
                  <div key={index} className="flex flex-col items-center">
                    <div 
                      className="bg-red-500 rounded-t-sm w-8 mb-2"
                      style={{ height: `${height}px` }}
                    ></div>
                    <span className="text-xs text-gray-500">{month}</span>
                    <span className="text-xs text-gray-400">{item.count}</span>
                  </div>
                );
              })
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Aucune donnée disponible</p>
              </div>
            )}
          </div>
        </div>

        {/* Répartition par type de non-conformité */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Répartition par type de non-conformité</h3>
          <div className="space-y-4">
            {rapportsData.repartitions.nonConformitesParType.length > 0 ? (
              rapportsData.repartitions.nonConformitesParType.map((item, index) => {
                const total = rapportsData.repartitions.nonConformitesParType.reduce((sum, i) => sum + i.count, 0);
                const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;
                const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500'];
                return (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      {typeLabels[item.type as keyof typeof typeLabels] || item.type}
                    </span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`${colors[index % colors.length]} h-2 rounded-full`} 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{percentage}%</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 text-center">Aucune donnée disponible</p>
            )}
          </div>
        </div>
      </div>

      {/* Tableaux de données */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sessions les plus populaires */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Sessions les plus demandées</h3>
          </div>
          <div className="px-6 py-4">
            <div className="space-y-3">
              {rapportsData.sessionsPopulaires.length > 0 ? (
                rapportsData.sessionsPopulaires.slice(0, 5).map((session, index) => (
                  <div key={session.session} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 truncate" title={session.session}>
                      {session.session}
                    </span>
                    <span className="text-sm font-medium text-gray-900">{session.count} demande(s)</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center">Aucune donnée disponible</p>
              )}
            </div>
          </div>
        </div>

        {/* Top 5 détecteurs de non-conformités */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Top 5 détecteurs de non-conformités</h3>
          </div>
          <div className="px-6 py-4">
            <div className="space-y-3">
              {rapportsData.topUtilisateurs.detecteurs.length > 0 ? (
                rapportsData.topUtilisateurs.detecteurs.map((user, index) => (
                  <div key={user.id} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">
                      {user.prenom && user.nom ? `${user.prenom} ${user.nom}` : user.email}
                    </span>
                    <span className="text-sm font-medium text-gray-900">{user.count} détection(s)</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center">Aucune donnée disponible</p>
              )}
            </div>
          </div>
        </div>

        {/* Top 5 responsables d'actions correctives */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Top 5 responsables d'actions correctives</h3>
          </div>
          <div className="px-6 py-4">
            <div className="space-y-3">
              {rapportsData.topUtilisateurs.responsables.length > 0 ? (
                rapportsData.topUtilisateurs.responsables.map((user, index) => (
                  <div key={user.id} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">
                      {user.prenom && user.nom ? `${user.prenom} ${user.nom}` : user.email}
                    </span>
                    <span className="text-sm font-medium text-gray-900">{user.count} action(s)</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center">Aucune donnée disponible</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Répartitions détaillées */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* Non-conformités par gravité */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Non-conformités par gravité</h3>
          </div>
          <div className="px-6 py-4">
            <div className="space-y-3">
              {rapportsData.repartitions.nonConformitesParGravite.length > 0 ? (
                rapportsData.repartitions.nonConformitesParGravite.map((item, index) => {
                  const total = rapportsData.repartitions.nonConformitesParGravite.reduce((sum, i) => sum + i.count, 0);
                  const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;
                  const colors = {
                    BASSE: 'bg-green-500',
                    MOYENNE: 'bg-yellow-500',
                    HAUTE: 'bg-orange-500',
                    CRITIQUE: 'bg-red-500'
                  };
                  return (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        {graviteLabels[item.gravite as keyof typeof graviteLabels] || item.gravite}
                      </span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`${colors[item.gravite as keyof typeof colors] || 'bg-gray-500'} h-2 rounded-full`} 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{item.count}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500 text-center">Aucune donnée disponible</p>
              )}
            </div>
          </div>
        </div>

        {/* Actions correctives par statut */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Actions correctives par statut</h3>
          </div>
          <div className="px-6 py-4">
            <div className="space-y-3">
              {rapportsData.repartitions.actionsCorrectivesParStatut.length > 0 ? (
                rapportsData.repartitions.actionsCorrectivesParStatut.map((item, index) => {
                  const total = rapportsData.repartitions.actionsCorrectivesParStatut.reduce((sum, i) => sum + i.count, 0);
                  const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;
                  const colors = {
                    EN_COURS: 'bg-yellow-500',
                    TERMINEE: 'bg-green-500',
                    EN_ATTENTE: 'bg-blue-500',
                    ANNULEE: 'bg-gray-500'
                  };
                  return (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        {statutLabels[item.statut as keyof typeof statutLabels] || item.statut}
                      </span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`${colors[item.statut as keyof typeof colors] || 'bg-gray-500'} h-2 rounded-full`} 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{item.count}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500 text-center">Aucune donnée disponible</p>
              )}
            </div>
          </div>
        </div>

        {/* Actions correctives par priorité */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Actions correctives par priorité</h3>
          </div>
          <div className="px-6 py-4">
            <div className="space-y-3">
              {rapportsData.repartitions.actionsCorrectivesParPriorite.length > 0 ? (
                rapportsData.repartitions.actionsCorrectivesParPriorite.map((item, index) => {
                  const total = rapportsData.repartitions.actionsCorrectivesParPriorite.reduce((sum, i) => sum + i.count, 0);
                  const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;
                  const colors = {
                    BASSE: 'bg-green-500',
                    MOYENNE: 'bg-yellow-500',
                    HAUTE: 'bg-orange-500',
                    CRITIQUE: 'bg-red-500'
                  };
                  return (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        {prioriteLabels[item.priorite as keyof typeof prioriteLabels] || item.priorite}
                      </span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`${colors[item.priorite as keyof typeof colors] || 'bg-gray-500'} h-2 rounded-full`} 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{item.count}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500 text-center">Aucune donnée disponible</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 