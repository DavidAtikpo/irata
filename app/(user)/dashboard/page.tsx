'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  AcademicCapIcon,
  PlusIcon,
  DocumentTextIcon,
  UserIcon,
  CalendarIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

interface Demande {
  id: string;
  session: string;
  statut: string;
  createdAt: string;
}

interface Devis {
  id: string;
  numero: string;
  statut: string;
  montant: number;
  createdAt: string;
}

interface Contrat {
  id: string;
  statut: string;
  createdAt: string;
  devis: {
    numero: string;
    montant: number;
    dateFormation?: string;
  };
}

interface UserStats {
  demandesEnCours: number;
  demandesAcceptees: number;
  demandesRefusees: number;
  formationsSuivies: number;
  recentesDemandes: Demande[];
  devis: Devis[];
  contrats: Contrat[];
  totalMontant: number;
}

export default function UserDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchStats();
    }
  }, [status]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/user/stats');
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

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'EN_ATTENTE': return 'bg-yellow-100 text-yellow-800';
      case 'VALIDE': return 'bg-green-100 text-green-800';
      case 'SIGNE': return 'bg-blue-100 text-blue-800';
      case 'REFUSE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (statut: string) => {
    switch (statut) {
      case 'EN_ATTENTE': return 'En attente';
      case 'VALIDE': return 'Validé';
      case 'SIGNE': return 'Signé';
      case 'REFUSE': return 'Refusé';
      default: return statut;
    }
  };

  if (loading) {
    return (
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <h2 className="mt-4 text-xl font-semibold text-gray-900">Chargement du tableau de bord...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-400" />
            <h2 className="mt-4 text-xl font-semibold text-red-600">{error}</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 sm:py-8 lg:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* En-tête avec informations utilisateur */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="text-white">
              <h1 className="text-2xl sm:text-3xl font-bold">Bonjour, {session?.user?.prenom} {session?.user?.nom}</h1>
              <p className="mt-2 text-indigo-100">Bienvenue sur votre tableau de bord de formation</p>
              <div className="mt-4 flex items-center text-indigo-100">
                <CalendarIcon className="h-5 w-5 mr-2" />
                <span className="text-sm">{new Date().toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
            </div>
            <div className="mt-4 sm:mt-0">
              <div className="bg-white bg-opacity-20 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-white">{stats?.totalMontant || 0}€</div>
                <div className="text-indigo-100 text-sm">Total investi</div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistiques principales */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Demandes en cours */}
          <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <ClockIcon className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
                <div className="ml-4 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Demandes en cours</dt>
                    <dd className="text-2xl font-bold text-gray-900">{stats?.demandesEnCours || 0}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Demandes acceptées */}
          <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircleIcon className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="ml-4 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Demandes acceptées</dt>
                    <dd className="text-2xl font-bold text-gray-900">{stats?.demandesAcceptees || 0}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Demandes refusées */}
          <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <XCircleIcon className="h-6 w-6 text-red-600" />
                  </div>
                </div>
                <div className="ml-4 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Demandes refusées</dt>
                    <dd className="text-2xl font-bold text-gray-900">{stats?.demandesRefusees || 0}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Formations suivies */}
          <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <AcademicCapIcon className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="ml-4 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Formations suivies</dt>
                    <dd className="text-2xl font-bold text-gray-900">{stats?.formationsSuivies || 0}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="bg-white shadow-lg rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Actions rapides</h3>
            <ChartBarIcon className="h-6 w-6 text-gray-400" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/demande"
              className="group bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 hover:from-indigo-100 hover:to-purple-100 transition-all duration-300 border border-indigo-100 hover:border-indigo-200"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                    <PlusIcon className="h-6 w-6 text-indigo-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors">Nouvelle demande</h4>
                  <p className="mt-1 text-sm text-gray-600">Soumettre une demande de formation</p>
                </div>
              </div>
            </Link>

            <Link
              href="/mes-demandes"
              className="group bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 hover:from-blue-100 hover:to-cyan-100 transition-all duration-300 border border-blue-100 hover:border-blue-200"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <DocumentTextIcon className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">Mes demandes</h4>
                  <p className="mt-1 text-sm text-gray-600">Suivre l'état de mes demandes</p>
                </div>
              </div>
            </Link>

            <Link
              href="/documents"
              className="group bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 hover:from-purple-100 hover:to-pink-100 transition-all duration-300 border border-purple-100 hover:border-purple-200"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                    <DocumentTextIcon className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">Mes documents</h4>
                  <p className="mt-1 text-sm text-gray-600">Accéder aux documents</p>
                </div>
              </div>
            </Link>

            <Link
              href="/profile"
              className="group bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 hover:from-green-100 hover:to-emerald-100 transition-all duration-300 border border-green-100 hover:border-green-200"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                    <UserIcon className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-semibold text-gray-900 group-hover:text-green-700 transition-colors">Mon profil</h4>
                  <p className="mt-1 text-sm text-gray-600">Gérer mes informations</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Contrats et devis récents */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contrats récents */}
          <div className="bg-white shadow-lg rounded-xl border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Mes contrats</h3>
            </div>
            <div className="p-6">
              {stats?.contrats && stats.contrats.length > 0 ? (
                <div className="space-y-4">
                  {stats.contrats.slice(0, 3).map((contrat) => (
                    <div key={contrat.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">Devis #{contrat.devis.numero}</div>
                        <div className="text-sm text-gray-500">{contrat.devis.montant}€</div>
                      </div>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(contrat.statut)}`}>
                        {getStatusLabel(contrat.statut)}
                      </span>
                    </div>
                  ))}
                  {stats.contrats.length > 3 && (
                    <div className="text-center pt-2">
                      <Link href="/mon-contrat" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                        Voir tous mes contrats <ArrowRightIcon className="h-4 w-4 inline ml-1" />
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun contrat</h3>
                  <p className="mt-1 text-sm text-gray-500">Vous n'avez pas encore de contrats.</p>
                </div>
              )}
            </div>
          </div>

          {/* Devis récents */}
          <div className="bg-white shadow-lg rounded-xl border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Mes devis</h3>
            </div>
            <div className="p-6">
              {stats?.devis && stats.devis.length > 0 ? (
                <div className="space-y-4">
                  {stats.devis.slice(0, 3).map((devis) => (
                    <div key={devis.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">Devis #{devis.numero}</div>
                        <div className="text-sm text-gray-500">{devis.montant}€</div>
                      </div>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(devis.statut)}`}>
                        {getStatusLabel(devis.statut)}
                      </span>
                    </div>
                  ))}
                  {stats.devis.length > 3 && (
                    <div className="text-center pt-2">
                      <Link href="/mes-devis" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                        Voir tous mes devis <ArrowRightIcon className="h-4 w-4 inline ml-1" />
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun devis</h3>
                  <p className="mt-1 text-sm text-gray-500">Vous n'avez pas encore de devis.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Demandes récentes */}
        <div className="bg-white shadow-lg rounded-xl border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-900">Mes 5 dernières demandes</h3>
          </div>
          <div className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Session de formation
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date de la demande
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats?.recentesDemandes && stats.recentesDemandes.length > 0 ? (
                    stats.recentesDemandes.map((demande) => (
                      <tr key={demande.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {demande.session}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(demande.createdAt).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(demande.statut)}`}>
                            {getStatusLabel(demande.statut)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link 
                            href={`/mes-demandes/${demande.id}`} 
                            className="text-indigo-600 hover:text-indigo-900 font-medium"
                          >
                            Voir <ArrowRightIcon className="h-4 w-4 inline ml-1" />
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center">
                        <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune demande</h3>
                        <p className="mt-1 text-sm text-gray-500">Vous n'avez pas encore soumis de demandes.</p>
                        <div className="mt-4">
                          <Link
                            href="/demande"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                          >
                            <PlusIcon className="h-4 w-4 mr-2" />
                            Nouvelle demande
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 