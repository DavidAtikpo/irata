'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  ClipboardDocumentListIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon,
  ExclamationCircleIcon,
  PencilIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarIcon,
  UserIcon,
  EnvelopeIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

interface User {
  id: string;
  email: string;
  nom: string;
  prenom: string;
}

interface Demande {
  id: string;
  statut: 'EN_ATTENTE' | 'VALIDE' | 'REFUSE' | 'ANNULE';
  session: string;
  message?: string;
  commentaire?: string;
  createdAt: string;
  user: User;
  hasDevis?: boolean; // Nouveau champ pour indiquer si un devis existe
}

type FilterStatus = 'all' | 'EN_ATTENTE' | 'VALIDE' | 'REFUSE' | 'ANNULE';
type SortField = 'date' | 'client' | 'session' | 'statut';
type SortOrder = 'asc' | 'desc';

const statusConfig = {
  EN_ATTENTE: {
    color: 'bg-yellow-500 text-white',
    icon: ClockIcon,
    label: 'En attente'
  },
  VALIDE: {
    color: 'bg-green-500 text-white',
    icon: CheckCircleIcon,
    label: 'Validée'
  },
  REFUSE: {
    color: 'bg-red-500 text-white',
    icon: XCircleIcon,
    label: 'Refusée'
  },
  ANNULE: {
    color: 'bg-gray-500 text-white',
    icon: ExclamationCircleIcon,
    label: 'Annulée'
  }
};

export default function AdminDemandesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [demandes, setDemandes] = useState<Demande[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  
  // Filtres et recherche
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  
  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Logique de filtrage et tri
  const filteredAndSortedDemandes = useMemo(() => {
    let filtered = demandes.filter(d => {
      // Filtre par statut
      if (statusFilter !== 'all' && d.statut !== statusFilter) {
        return false;
      }
      
      // Filtre par recherche
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const client = `${d.user.prenom ?? ''} ${d.user.nom ?? ''}`.trim();
        return (
          client.toLowerCase().includes(searchLower) ||
          (d.user.email ?? '').toLowerCase().includes(searchLower) ||
          (d.session ?? '').toLowerCase().includes(searchLower) ||
          (d.message ?? '').toLowerCase().includes(searchLower)
        );
      }
      
      return true;
    });

    // Tri
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortField) {
        case 'date':
          aValue = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          bValue = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          break;
        case 'client':
          aValue = `${a.user.prenom ?? ''} ${a.user.nom ?? ''}`.trim();
          bValue = `${b.user.prenom ?? ''} ${b.user.nom ?? ''}`.trim();
          break;
        case 'session':
          aValue = a.session || '';
          bValue = b.session || '';
          break;
        case 'statut':
          aValue = a.statut || '';
          bValue = b.statut || '';
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [demandes, statusFilter, searchTerm, sortField, sortOrder]);

  // Logique de pagination
  const totalPages = Math.ceil(filteredAndSortedDemandes.length / itemsPerPage);
  const paginatedDemandes = filteredAndSortedDemandes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Statistiques
  const stats = useMemo(() => {
    const total = demandes.length;
    const enAttente = demandes.filter(d => d.statut === 'EN_ATTENTE').length;
    const validees = demandes.filter(d => d.statut === 'VALIDE').length;
    const refusees = demandes.filter(d => d.statut === 'REFUSE').length;
    const annulees = demandes.filter(d => d.statut === 'ANNULE').length;
    
    return { total, enAttente, validees, refusees, annulees };
  }, [demandes]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/');
    } else if (status === 'authenticated') {
      fetchDemandes();
    }
  }, [status, session, router]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchTerm, sortField, sortOrder]);

  const fetchDemandes = async () => {
    try {
      const response = await fetch('/api/admin/demandes');
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des demandes');
      }
      const data = await response.json();
      setDemandes(data);
    } catch (error) {
      setError('Erreur lors de la récupération des demandes');
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: string, commentaire?: string) => {
    try {
      const response = await fetch(`/api/admin/demandes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status,
          commentaire: commentaire || null 
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de la mise à jour du statut');
      }

      await fetchDemandes();
      setEditingComment(null);
    } catch (error) {
      console.error('Erreur:', error);
      setError(error instanceof Error ? error.message : 'Erreur lors de la mise à jour du statut');
    }
  };

  // Fonction pour obtenir les couleurs du badge de statut
  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'VALIDE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'REFUSE':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'EN_ATTENTE':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ANNULE':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Fonction pour trier les colonnes
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

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
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestion des demandes</h1>
              <p className="mt-2 text-sm text-gray-700">
                Gérez les demandes de formation de votre organisation
              </p>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="w-0 flex-1">
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
                <div className="w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">En attente</dt>
                    <dd className="text-lg font-medium text-yellow-600">{stats.enAttente}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Validées</dt>
                    <dd className="text-lg font-medium text-green-600">{stats.validees}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Refusées</dt>
                    <dd className="text-lg font-medium text-red-600">{stats.refusees}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Annulées</dt>
                    <dd className="text-lg font-medium text-gray-600">{stats.annulees}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Erreurs */}
        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Erreur</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

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
                  placeholder="Rechercher par client, email, session..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex items-center space-x-4">
                {/* Filtre par statut */}
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as FilterStatus)}
                    className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="EN_ATTENTE">En attente</option>
                    <option value="VALIDE">Validées</option>
                    <option value="REFUSE">Refusées</option>
                    <option value="ANNULE">Annulées</option>
                  </select>
                </div>

                {/* Tri */}
                <div className="relative">
                  <select
                    value={`${sortField}-${sortOrder}`}
                    onChange={(e) => {
                      const [field, order] = e.target.value.split('-') as [SortField, SortOrder];
                      setSortField(field);
                      setSortOrder(order);
                    }}
                    className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option value="date-desc">Date (récent)</option>
                    <option value="date-asc">Date (ancien)</option>
                    <option value="client-asc">Client (A-Z)</option>
                    <option value="client-desc">Client (Z-A)</option>
                    <option value="session-asc">Session (A-Z)</option>
                    <option value="session-desc">Session (Z-A)</option>
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
              <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredAndSortedDemandes.length)}</span> sur{' '}
              <span className="font-medium">{filteredAndSortedDemandes.length}</span> résultats
            </div>
          </div>
        </div>

        {/* Liste des demandes */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {filteredAndSortedDemandes.length === 0 ? (
            <div className="text-center py-12">
              <FunnelIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune demande trouvée</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter !== 'all'
                  ? 'Essayez de modifier vos critères de recherche.'
                  : 'Aucune demande n\'a été trouvée.'}
              </p>
            </div>
          ) : (
            <>
              {/* En-têtes du tableau */}
              <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="col-span-1">
                    <button 
                      onClick={() => handleSort('date')}
                      className="flex items-center space-x-1 hover:text-gray-700"
                    >
                      <span>Date</span>
                      {sortField === 'date' && (
                        <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </button>
                  </div>
                  <div className="col-span-2">
                    <button 
                      onClick={() => handleSort('client')}
                      className="flex items-center space-x-1 hover:text-gray-700"
                    >
                      <span>Client</span>
                      {sortField === 'client' && (
                        <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </button>
                  </div>
                  <div className="col-span-3">Email</div>
                  <div className="col-span-1">
                    <button 
                      onClick={() => handleSort('session')}
                      className="flex items-center space-x-1 hover:text-gray-700"
                    >
                      <span>Session</span>
                      {sortField === 'session' && (
                        <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </button>
                  </div>
                  <div className="col-span-1">
                    <button 
                      onClick={() => handleSort('statut')}
                      className="flex items-center space-x-1 hover:text-gray-700"
                    >
                      <span>Statut</span>
                      {sortField === 'statut' && (
                        <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </button>
                  </div>
                  <div className="col-span-2">Message</div>
                  <div className="col-span-2 text-center">Actions</div>
                </div>
              </div>

              {/* Lignes du tableau */}
              <div className="divide-y divide-gray-200">
                {paginatedDemandes.map((demande) => (
                  <div key={demande.id} className="px-6 py-4 hover:bg-gray-50 transition-colors duration-150">
                    <div className="grid grid-cols-12 gap-4 items-center">
                      {/* Date */}
                      <div className="col-span-1">
                        <div className="text-sm text-gray-900">
                          {new Date(demande.createdAt).toLocaleDateString('fr-FR')}
                        </div>
                      </div>

                      {/* Client */}
                      <div className="col-span-2">
                        <div className="text-sm font-medium text-gray-900">
                          {`${demande.user.prenom ?? ''} ${demande.user.nom ?? ''}`.trim() || 'N/A'}
                        </div>
                      </div>

                      {/* Email */}
                      <div className="col-span-3">
                        <div className="text-sm text-gray-900 truncate" title={demande.user.email}>
                          {demande.user.email}
                        </div>
                      </div>

                      {/* Session */}
                      <div className="col-span-1">
                        <div className="text-sm text-gray-900 truncate" title={demande.session}>
                          {demande.session}
                        </div>
                      </div>

                      {/* Statut */}
                      <div className="col-span-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(demande.statut)}`}>
                          {statusConfig[demande.statut]?.label || demande.statut}
                        </span>
                      </div>

                      {/* Message */}
                      <div className="col-span-2">
                        <div className="text-sm text-gray-500 truncate" title={demande.message || 'Aucun message'}>
                          {demande.message || '-'}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="col-span-2">
                        <div className="flex flex-col space-y-2">
                          {editingComment === demande.id ? (
                            <div className="space-y-2">
                              <textarea
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                rows={2}
                                placeholder="Commentaire..."
                              />
                              <div className="flex space-x-1">
                                <button
                                  onClick={() => handleStatusChange(demande.id, demande.statut, commentText)}
                                  className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-white bg-indigo-600 hover:bg-indigo-700"
                                >
                                  OK
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingComment(null);
                                    setCommentText('');
                                  }}
                                  className="inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                                >
                                  ✕
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  setEditingComment(demande.id);
                                  setCommentText(demande.commentaire || '');
                                }}
                                className="inline-flex items-center text-xs text-indigo-600 hover:text-indigo-500 font-medium"
                                title="Ajouter/modifier commentaire"
                              >
                                <PencilIcon className="h-3 w-3 mr-1" />
                                {demande.commentaire ? 'Modifier' : 'Commenter'}
                              </button>
                              
                              <select
                                value={demande.statut}
                                onChange={(e) => handleStatusChange(demande.id, e.target.value)}
                                className="block w-full text-xs border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
                              >
                                <option value="EN_ATTENTE">En attente</option>
                                <option value="VALIDE">Validée</option>
                                <option value="REFUSE">Refusée</option>
                                <option value="ANNULE">Annulée</option>
                              </select>

                              {demande.statut === 'VALIDE' && !demande.hasDevis && (
                                <button
                                  onClick={() => router.push(`/admin/devis/nouveau?demandeId=${demande.id}`)}
                                  className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700"
                                  title="Créer un devis"
                                >
                                  <DocumentTextIcon className="h-3 w-3 mr-1" />
                                  Devis
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Commentaire affiché */}
                    {demande.commentaire && editingComment !== demande.id && (
                      <div className="mt-2 px-3 py-2 bg-gray-50 rounded text-sm text-gray-600">
                        <strong>Commentaire:</strong> {demande.commentaire}
                      </div>
                    )}
                  </div>
                ))}
              </div>

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