'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  DocumentDuplicateIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon,
  ExclamationCircleIcon,
  UserIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarIcon,
  EnvelopeIcon,
  CurrencyEuroIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

interface User {
  id: string;
  email: string;
  nom: string;
  prenom: string;
}

interface Devis {
  id: string;
  numero: string;
  montant: number;
  statut: string;
  demande?: {
    entreprise?: string | null;
    typeInscription?: string | null;
  };
}

interface Contrat {
  id: string;
  statut: string;
  dateDebut?: string;
  dateFin?: string;
  createdAt: string;
  entrepriseNom?: string | null;
  numero?: string | null;
  reference?: string | null;
  user: User;
  devis: Devis;
}

const statusConfig: Record<string, { color: string; icon: any; label: string }> = {
  EN_ATTENTE: {
    color: 'bg-yellow-500 text-white',
    icon: ClockIcon,
    label: 'En attente'
  },
  VALIDE: {
    color: 'bg-green-500 text-white',
    icon: CheckCircleIcon,
    label: 'Validé'
  },
  REFUSE: {
    color: 'bg-red-500 text-white',
    icon: XCircleIcon,
    label: 'Refusé'
  },
  ANNULE: {
    color: 'bg-gray-500 text-white',
    icon: ExclamationCircleIcon,
    label: 'Annulé'
  },
  SIGNE: {
    color: 'bg-blue-500 text-white',
    icon: DocumentDuplicateIcon,
    label: 'Signé'
  }
};

export default function AdminContratsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [contrats, setContrats] = useState<Contrat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // États pour les filtres et la recherche
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<string>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Statistiques
  const [stats, setStats] = useState({
    total: 0,
    enAttente: 0,
    signes: 0,
    valides: 0,
    refuses: 0,
    annules: 0
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/');
    } else if (status === 'authenticated') {
      fetchContrats();
    }
  }, [status, session, router]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, dateFilter, searchTerm, sortField, sortOrder]);

  const fetchContrats = async () => {
    try {
      const response = await fetch('/api/admin/contrats');
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des contrats');
      }
      const data = await response.json();
      setContrats(data);
      
      // Calculer les statistiques
      const stats = {
        total: data.length,
        enAttente: data.filter((c: Contrat) => c.statut === 'EN_ATTENTE').length,
        signes: data.filter((c: Contrat) => c.statut === 'SIGNE').length,
        valides: data.filter((c: Contrat) => c.statut === 'VALIDE' || c.statut === 'SIGNE').length, // Les validés = VALIDE + SIGNE
        refuses: data.filter((c: Contrat) => c.statut === 'REFUSE').length,
        annules: data.filter((c: Contrat) => c.statut === 'ANNULE').length
      };
      setStats(stats);
    } catch (error) {
      setError('Erreur lors de la récupération des contrats');
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/contrats/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de la mise à jour du statut');
      }

      await fetchContrats();
    } catch (error) {
      console.error('Erreur:', error);
      setError(error instanceof Error ? error.message : 'Erreur lors de la mise à jour du statut');
    }
  };

  // Filtrage et tri des contrats
  const filteredAndSortedContrats = useMemo(() => {
    let filtered = contrats.filter(contrat => {
      // Filtre par statut
      if (statusFilter !== 'all') {
        if (statusFilter === 'VALIDE') {
          // Pour le filtre "Validés", inclure aussi les contrats "Signés"
          if (contrat.statut !== 'VALIDE' && contrat.statut !== 'SIGNE') {
            return false;
          }
        } else {
          // Pour les autres filtres, correspondance exacte
          if (contrat.statut !== statusFilter) {
            return false;
          }
        }
      }
      
      // Filtre par date
      if (dateFilter !== 'all') {
        const contratDate = new Date(contrat.createdAt);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - contratDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        switch (dateFilter) {
          case 'today':
            if (diffDays > 1) return false;
            break;
          case 'week':
            if (diffDays > 7) return false;
            break;
          case 'month':
            if (diffDays > 30) return false;
            break;
        }
      }
      
      // Filtre par recherche
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const userName = `${contrat.user.prenom} ${contrat.user.nom}`.toLowerCase();
        const userEmail = contrat.user.email.toLowerCase();
        const devisNumero = contrat.devis.numero.toLowerCase();
        
        if (!userName.includes(searchLower) && 
            !userEmail.includes(searchLower) && 
            !devisNumero.includes(searchLower)) {
          return false;
        }
      }
      
      return true;
    });

    // Tri
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortField) {
        case 'date':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'client':
          aValue = `${a.user.prenom} ${a.user.nom}`.toLowerCase();
          bValue = `${b.user.prenom} ${b.user.nom}`.toLowerCase();
          break;
        case 'montant':
          aValue = a.devis.montant;
          bValue = b.devis.montant;
          break;
        case 'statut':
          aValue = a.statut;
          bValue = b.statut;
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [contrats, statusFilter, dateFilter, searchTerm, sortField, sortOrder]);

  // Logique de pagination
  const totalPages = Math.ceil(filteredAndSortedContrats.length / itemsPerPage);
  const paginatedContrats = filteredAndSortedContrats.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <h2 className="mt-4 text-xl font-semibold text-gray-900">Chargement...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{error}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* En-tête avec statistiques */}
        <div className="mb-8">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Gestion des contrats</h2>
              <p className="mt-2 text-sm text-gray-600">
                Gérez les contrats de formation
              </p>
            </div>
          </div>

          {/* Statistiques */}
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-5">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <DocumentDuplicateIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.total}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ClockIcon className="h-6 w-6 text-yellow-500" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">En attente</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.enAttente}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CheckCircleIcon className="h-6 w-6 text-green-500" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Validés</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.valides}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <XCircleIcon className="h-6 w-6 text-red-500" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Refusés</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.refuses}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ExclamationCircleIcon className="h-6 w-6 text-gray-500" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Annulés</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.annules}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtres et recherche */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              {/* Recherche */}
              <div className="relative flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Rechercher par client, email, devis..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex items-center space-x-4">
                {/* Filtre par statut */}
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="EN_ATTENTE">En attente</option>
                    <option value="VALIDE">Validés (incluant Signés)</option>
                    <option value="REFUSE">Refusés</option>
                    <option value="ANNULE">Annulés</option>
                  </select>
                </div>

                {/* Filtre par date */}
                <div className="relative">
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option value="all">Toutes les dates</option>
                    <option value="today">Aujourd'hui</option>
                    <option value="week">Cette semaine</option>
                    <option value="month">Ce mois</option>
                  </select>
                </div>

                {/* Tri */}
                <div className="relative">
                  <select
                    value={`${sortField}-${sortOrder}`}
                    onChange={(e) => {
                      const [field, order] = e.target.value.split('-') as [string, 'asc' | 'desc'];
                      setSortField(field);
                      setSortOrder(order);
                    }}
                    className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option value="date-desc">Date (récent)</option>
                    <option value="date-asc">Date (ancien)</option>
                    <option value="client-asc">Client (A-Z)</option>
                    <option value="client-desc">Client (Z-A)</option>
                    <option value="montant-desc">Montant (élevé)</option>
                    <option value="montant-asc">Montant (faible)</option>
                    <option value="statut-asc">Statut (A-Z)</option>
                    <option value="statut-desc">Statut (Z-A)</option>
                  </select>
                </div>

                {/* Items per page */}
                <div className="relative">
                  <select
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option value={10}>10 par page</option>
                    <option value={25}>25 par page</option>
                    <option value={50}>50 par page</option>
                    <option value={100}>100 par page</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Compteur de résultats */}
            <div className="mt-4 text-sm text-gray-700">
              Affichage de <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> à{' '}
              <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredAndSortedContrats.length)}</span> sur{' '}
              <span className="font-medium">{filteredAndSortedContrats.length}</span> résultats
            </div>
          </div>
        </div>

        {/* Liste des contrats (groupée par Aujourd'hui / Hier / Autres dates) */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {filteredAndSortedContrats.length === 0 ? (
            <div className="text-center py-12">
              <FunnelIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun contrat trouvé</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter !== 'all' || dateFilter !== 'all'
                  ? 'Essayez de modifier vos critères de recherche.'
                  : 'Aucun contrat n\'a été trouvé.'}
              </p>
            </div>
          ) : (
            <>
              {(() => {
                const today = new Date();
                const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                const startOfYesterday = new Date(startOfToday);
                startOfYesterday.setDate(startOfYesterday.getDate() - 1);
                const endOfYesterday = new Date(startOfToday);
                endOfYesterday.setMilliseconds(endOfYesterday.getMilliseconds() - 1);

                const formatHeading = (d: Date) => d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });

                const todayItems: typeof paginatedContrats = [];
                const yesterdayItems: typeof paginatedContrats = [];
                const othersMap: Record<string, typeof paginatedContrats> = {};

                for (const c of paginatedContrats) {
                  const d = new Date(c.createdAt);
                  if (d >= startOfToday) {
                    todayItems.push(c);
                  } else if (d >= startOfYesterday && d <= endOfYesterday) {
                    yesterdayItems.push(c);
                  } else {
                    const key = formatHeading(d);
                    if (!othersMap[key]) othersMap[key] = [];
                    othersMap[key].push(c);
                  }
                }

                const renderItem = (contrat: typeof paginatedContrats[number]) => {
                  const status = statusConfig[contrat.statut] || {
                    color: 'bg-gray-500 text-white',
                    icon: ExclamationCircleIcon,
                    label: contrat.statut || 'Inconnu'
                  };
                  const StatusIcon = status.icon;
                  return (
                    <li key={contrat.id} className="px-4 py-6 sm:px-6 hover:bg-gray-50 transition-colors duration-150">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center">
                            <DocumentDuplicateIcon className="h-5 w-5 text-gray-400 mr-2" />
                            {(() => {
                              const isConvention = Boolean(
                                contrat.entrepriseNom ||
                                contrat.devis?.demande?.entreprise ||
                                ((contrat.devis?.demande?.typeInscription || '').toLowerCase() === 'entreprise')
                              );
                              return (
                                <h3 className="text-lg font-medium text-gray-900 truncate">
                                  {isConvention ? 'Convention' : 'Contrat'} #{contrat.id.slice(-6)}
                                </h3>
                              );
                            })()}
                            <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                              <StatusIcon className="h-4 w-4 mr-1" />
                              {status.label}
                            </span>
                          </div>
                          
                          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                            <div>
                              <p className="text-sm text-gray-500">
                                <UserIcon className="h-4 w-4 inline mr-1" />
                                <span className="font-medium">Client:</span> {contrat.user.prenom} {contrat.user.nom}
                              </p>
                              <p className="text-sm text-gray-500">
                                <EnvelopeIcon className="h-4 w-4 inline mr-1" />
                                <span className="font-medium">Email:</span> {contrat.user.email}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">
                                <DocumentTextIcon className="h-4 w-4 inline mr-1" />
                                <span className="font-medium">Devis:</span> {contrat.devis.numero}
                              </p>
                              {(contrat.numero || contrat.reference) && (
                                <p className="text-sm text-gray-500 mt-1">
                                  <span className="font-medium">N°:</span> {contrat.numero || '—'}
                                  {`  `}
                                  <span className="font-medium ml-3">Réf:</span> {contrat.reference || '—'}
                                </p>
                              )}
                              <p className="text-sm text-gray-500">
                                <CurrencyEuroIcon className="h-4 w-4 inline mr-1" />
                                <span className="font-medium">Montant:</span> {contrat.devis.montant.toLocaleString('fr-FR')} €
                              </p>
                            </div>
                          </div>

                          <p className="mt-2 text-sm text-gray-500">
                            <CalendarIcon className="h-4 w-4 inline mr-1" />
                            <span className="font-medium">Date de création:</span> {new Date(contrat.createdAt).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>

                        <div className="ml-4 flex-shrink-0 flex flex-col space-y-3">
                          <select
                            value={contrat.statut}
                            onChange={(e) => handleStatusChange(contrat.id, e.target.value)}
                            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md text-black"
                          >
                            <option value="EN_ATTENTE">En attente</option>
                            <option value="VALIDE">Validé</option>
                            <option value="REFUSE">Refusé</option>
                            <option value="ANNULE">Annulé</option>
                          </select>

                          <button
                            onClick={() => router.push(`/admin/contrats/${contrat.id}`)}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            <DocumentTextIcon className="h-4 w-4 mr-2" />
                            {(() => {
                              const isConvention = Boolean(
                                contrat.entrepriseNom ||
                                contrat.devis?.demande?.entreprise ||
                                ((contrat.devis?.demande?.typeInscription || '').toLowerCase() === 'entreprise')
                              );
                              return isConvention ? 'Voir la convention' : 'Voir le contrat';
                            })()}
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                };

                return (
                  <>
                    {todayItems.length > 0 && (
                      <div className="mt-4">
                        <h4 className="px-4 py-3 sm:px-6 font-semibold text-gray-900 bg-gray-50 rounded-t">Aujourd'hui</h4>
                        <ul className="divide-y divide-gray-200">{todayItems.map(renderItem)}</ul>
                      </div>
                    )}
                    {yesterdayItems.length > 0 && (
                      <div className="mt-10">
                        <h4 className="px-4 py-3 sm:px-6 font-semibold text-gray-900 bg-gray-50 rounded-t">Hier</h4>
                        <ul className="divide-y divide-gray-200">{yesterdayItems.map(renderItem)}</ul>
                      </div>
                    )}
                    {Object.keys(othersMap)
                      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
                      .map((key) => (
                        <div key={key} className="mt-10">
                          <h4 className="px-4 py-3 sm:px-6 font-semibold text-gray-900 bg-gray-50 rounded-t">{key}</h4>
                          <ul className="divide-y divide-gray-200">{othersMap[key].map(renderItem)}</ul>
                        </div>
                      ))}
                  </>
                );
              })()}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Précédent
                    </button>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Suivant
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Page <span className="font-medium">{currentPage}</span> sur <span className="font-medium">{totalPages}</span>
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                        </button>
                        {[...Array(totalPages)].map((_, i) => {
                          const page = i + 1;
                          if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                            return (
                              <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                  currentPage === page
                                    ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                }`}
                              >
                                {page}
                              </button>
                            );
                          } else if (page === currentPage - 2 || page === currentPage + 2) {
                            return (
                              <span key={page} className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                                ...
                              </span>
                            );
                          }
                          return null;
                        })}
                        <button
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
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
