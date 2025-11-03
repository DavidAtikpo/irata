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
  niveau?: string | null;
  hasDevis?: boolean; // Nouveau champ pour indiquer si un devis existe
  devisId?: string | null;
  devisNumero?: string | null;
  devisStatut?: 'EN_ATTENTE' | 'VALIDE' | 'REFUSE' | 'ANNULE' | null;
  sessionChangeRequest?: string | null;
  sessionChangeStatus?: 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED' | null;
  sessionChangeReason?: string | null;
  sessionChangeDate?: string | null;
}

type FilterStatus = 'all' | 'EN_ATTENTE' | 'VALIDE' | 'REFUSE' | 'ANNULE';
type SortField = 'date' | 'client' | 'session' | 'statut';
type SortOrder = 'asc' | 'desc';

const statusConfig = {
  EN_ATTENTE: {
    color: 'bg-yellow-500 text-white',
    icon: ClockIcon,
    label: 'Admin attente'
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
  
  // États pour les demandes de changement de session
  const [sessionChangeModal, setSessionChangeModal] = useState<{show: boolean; demande: Demande | null}>({show: false, demande: null});
  const [sessionChangeComment, setSessionChangeComment] = useState('');
  const [processingChange, setProcessingChange] = useState(false);
  
  // Filtres et recherche
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  
  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [activeTab, setActiveTab] = useState<'demandes' | 'demandes_validees' | 'devis_crees' | 'devis_valides'>('demandes');
  
  // Compteur de demandes de changement en attente
  const pendingSessionChanges = demandes.filter(d => d.sessionChangeStatus === 'PENDING').length;

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

  // Logique de pagination (sera recalculée selon l'onglet actif)
  // Placeholders, mis à jour après calcul tabItems
  let totalPages = Math.ceil(filteredAndSortedDemandes.length / itemsPerPage);
  let paginatedDemandes = filteredAndSortedDemandes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Groupes: 1) A valider (demande EN_ATTENTE, sans devis), 2) A créer devis (demande VALIDE, sans devis), 3) Devis en attente user (demande VALIDE, devis EN_ATTENTE), 4) Devis validé (demande VALIDE, devis VALIDE)
  // IMPORTANT: Les demandes avec changement de session en attente sont TOUJOURS dans "a_valider" pour rester visibles
  const grouped = useMemo(() => {
    const groups: Record<string, Demande[]> = {
      a_valider: [],
      a_creer_devis: [],
      devis_en_attente_user: [],
      devis_valide: [],
    };
    for (const d of filteredAndSortedDemandes) {
      // PRIORITÉ: Si changement de session en attente, mettre dans l'onglet principal
      if (d.sessionChangeStatus === 'PENDING') {
        groups.a_valider.push(d);
        continue;
      }
      
      // Sinon, groupement normal
      if (!d.hasDevis) {
        if (d.statut === 'EN_ATTENTE') groups.a_valider.push(d);
        else if (d.statut === 'VALIDE') groups.a_creer_devis.push(d);
      } else {
        if (d.devisStatut === 'EN_ATTENTE') groups.devis_en_attente_user.push(d);
        else if (d.devisStatut === 'VALIDE') groups.devis_valide.push(d);
        else groups.devis_en_attente_user.push(d);
      }
    }
    return groups;
  }, [filteredAndSortedDemandes]);

  // Eléments visibles selon onglet
  const tabItems = useMemo(() => {
    switch (activeTab) {
      case 'demandes':
        return grouped.a_valider;
      case 'demandes_validees':
        return grouped.a_creer_devis;
      case 'devis_crees':
        return grouped.devis_en_attente_user;
      case 'devis_valides':
      default:
        return grouped.devis_valide;
    }
  }, [grouped, activeTab]);

  // Pagination recalculée sur l'onglet actif
  totalPages = Math.ceil(tabItems.length / itemsPerPage) || 1;
  paginatedDemandes = tabItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Group by date bucket (Aujourd'hui, Hier, dd/mm/yyyy)
  const bucketizeByDate = (items: Demande[]) => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const toKey = (d: Date) => d.toLocaleDateString('fr-FR');
    const todayKey = toKey(today);
    const yesterdayKey = toKey(yesterday);

    const map = new Map<string, Demande[]>();
    for (const it of items) {
      const key = toKey(new Date(it.createdAt));
      const label = key === todayKey ? "Aujourd'hui" : key === yesterdayKey ? 'Hier' : key;
      if (!map.has(label)) map.set(label, []);
      map.get(label)!.push(it);
    }
    return map;
  };

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
      router.push('/login');
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

  // Fonctions pour gérer les demandes de changement de session
  const handleSessionChangeApproval = async (demandeId: string, action: 'approve' | 'reject') => {
    setProcessingChange(true);
    try {
      const response = await fetch(`/api/admin/demandes/session-change/${demandeId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          adminComment: sessionChangeComment
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors du traitement');
      }

      // Recharger les demandes
      await fetchDemandes();
      setSessionChangeModal({show: false, demande: null});
      setSessionChangeComment('');
    } catch (error: any) {
      alert(error.message || 'Erreur lors du traitement de la demande');
      console.error('Erreur:', error);
    } finally {
      setProcessingChange(false);
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
    <div className="min-h-screen bg-gray-50 py-2">
      <div className="max-w-7xl mx-auto px-2 sm:px-3">
        {/* Alerte changements de session en attente */}
        {pendingSessionChanges > 0 && (
          <div className="mb-2 bg-blue-50 border-l-2 border-blue-400 p-2 rounded">
            <div className="flex items-center">
              <ClockIcon className="h-4 w-4 text-blue-400 mr-2" />
              <p className="text-[10px] text-blue-700">
                <span className="font-medium">
                  {pendingSessionChanges} demande{pendingSessionChanges > 1 ? 's' : ''} de changement
                </span>
                {' '}— Clic sur <strong className="inline-flex items-center px-1 py-0.5 rounded text-[9px] bg-blue-200 text-blue-800">🔄 Changement</strong>
              </p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-3">
          <h1 className="text-lg font-bold text-gray-900">Gestion des demandes</h1>
          <p className="text-[10px] text-gray-600">
            Gérez les demandes de formation
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6 mb-3">
          <div className="bg-white overflow-hidden shadow-sm rounded p-2">
            <dt className="text-[9px] font-medium text-gray-500 truncate">Total</dt>
            <dd className="text-sm font-bold text-gray-900">{stats.total}</dd>
          </div>
          <div className="bg-white overflow-hidden shadow-sm rounded p-2">
            <dt className="text-[9px] font-medium text-gray-500 truncate">Attente</dt>
            <dd className="text-sm font-bold text-yellow-600">{stats.enAttente}</dd>
          </div>
          <div className="bg-white overflow-hidden shadow-sm rounded p-2">
            <dt className="text-[9px] font-medium text-gray-500 truncate">Validées</dt>
            <dd className="text-sm font-bold text-green-600">{stats.validees}</dd>
          </div>
          <div className="bg-white overflow-hidden shadow-sm rounded p-2">
            <dt className="text-[9px] font-medium text-gray-500 truncate">Session↻</dt>
            <dd className="text-sm font-bold text-blue-600">{pendingSessionChanges}</dd>
          </div>
          <div className="bg-white overflow-hidden shadow-sm rounded p-2">
            <dt className="text-[9px] font-medium text-gray-500 truncate">Refusées</dt>
            <dd className="text-sm font-bold text-red-600">{stats.refusees}</dd>
          </div>
          <div className="bg-white overflow-hidden shadow-sm rounded p-2">
            <dt className="text-[9px] font-medium text-gray-500 truncate">Annulées</dt>
            <dd className="text-sm font-bold text-gray-600">{stats.annulees}</dd>
          </div>
        </div>

        {/* Erreurs */}
        {error && (
          <div className="mb-2 rounded bg-red-50 p-2">
            <h3 className="text-[10px] font-medium text-red-800">Erreur</h3>
            <div className="text-[10px] text-red-700">{error}</div>
          </div>
        )}

        {/* Filtres et recherche */}
        <div className="bg-white shadow-sm rounded mb-2">
          <div className="px-3 py-2 border-b border-gray-200">
            {/* Onglets */}
            <div className="mb-2 flex flex-wrap gap-1">
              <button
                onClick={() => setActiveTab('demandes')}
                className={`px-2 py-1 rounded text-[10px] font-medium border ${activeTab === 'demandes' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300'}`}
              >
                Demandes
              </button>
              <button
                onClick={() => setActiveTab('demandes_validees')}
                className={`px-2 py-1 rounded text-[10px] font-medium border ${activeTab === 'demandes_validees' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300'}`}
              >
                Validées
              </button>
              <button
                onClick={() => setActiveTab('devis_crees')}
                className={`px-2 py-1 rounded text-[10px] font-medium border ${activeTab === 'devis_crees' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300'}`}
              >
                Devis créés
              </button>
              <button
                onClick={() => setActiveTab('devis_valides')}
                className={`px-2 py-1 rounded text-[10px] font-medium border ${activeTab === 'devis_valides' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300'}`}
              >
                Devis validés
              </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 gap-2">
              {/* Recherche */}
              <div className="relative flex-1 max-w-md">
                <MagnifyingGlassIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                <input
                  type="text"
                  className="block w-full pl-7 pr-2 py-1 border border-gray-300 rounded text-[10px] bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2">
                {/* Filtre par statut */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as FilterStatus)}
                  className="block pl-2 pr-6 py-1 text-[10px] border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded"
                >
                  <option value="all">Tous</option>
                  <option value="EN_ATTENTE">Attente</option>
                  <option value="VALIDE">Validées</option>
                  <option value="REFUSE">Refusées</option>
                  <option value="ANNULE">Annulées</option>
                </select>

                {/* Tri */}
                <select
                  value={`${sortField}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split('-') as [SortField, SortOrder];
                    setSortField(field);
                    setSortOrder(order);
                  }}
                  className="block pl-2 pr-6 py-1 text-[10px] border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded"
                >
                  <option value="date-desc">Date ↓</option>
                  <option value="date-asc">Date ↑</option>
                  <option value="client-asc">Client A-Z</option>
                  <option value="client-desc">Client Z-A</option>
                  <option value="session-asc">Session A-Z</option>
                  <option value="session-desc">Session Z-A</option>
                </select>

                {/* Items per page */}
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="block pl-2 pr-6 py-1 text-[10px] border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>

            {/* Compteur de résultats */}
            <div className="mt-2 text-[9px] text-gray-600">
              <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span>-
              <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredAndSortedDemandes.length)}</span>/
              <span className="font-medium">{filteredAndSortedDemandes.length}</span>
            </div>
          </div>
        </div>

        {/* Liste des demandes */}
        <div className="bg-white shadow-sm rounded overflow-hidden">
          {filteredAndSortedDemandes.length === 0 ? (
            <div className="text-center py-8">
              <FunnelIcon className="mx-auto h-8 w-8 text-gray-400" />
              <h3 className="mt-2 text-[11px] font-medium text-gray-900">Aucune demande</h3>
              <p className="mt-1 text-[10px] text-gray-500">
                {searchTerm || statusFilter !== 'all'
                  ? 'Modifiez vos critères.'
                  : 'Aucune demande trouvée.'}
              </p>
            </div>
          ) : (
            <>
              {/* En-têtes du tableau */}
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                <div className="grid grid-cols-12 gap-2 text-[10px] font-medium text-gray-500 uppercase tracking-wider">
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
                  <div className="col-span-2">Email</div>
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
                  <div className="col-span-1 text-center">Niveau</div>
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
                  <div className="col-span-1">Devis</div>
                  <div className="col-span-1">Msg</div>
                  <div className="col-span-2 text-center">Actions</div>
                </div>
              </div>

              {/* Lignes du tableau */}
              <div className="divide-y divide-gray-200">
                {paginatedDemandes.map((demande) => (
                  <div key={demande.id} className="px-4 py-3 hover:bg-gray-50 transition-colors duration-150">
                    <div className="grid grid-cols-12 gap-2 items-center">
                      {/* Date */}
                      <div className="col-span-1">
                        <div className="text-[11px] text-gray-900">
                          {new Date(demande.createdAt).toLocaleDateString('fr-FR', {day: '2-digit', month: '2-digit'})}
                        </div>
                      </div>

                      {/* Client */}
                      <div className="col-span-2">
                        <div className="text-[11px] font-medium text-gray-900 truncate" title={`${demande.user.prenom ?? ''} ${demande.user.nom ?? ''}`.trim()}>
                          {`${demande.user.prenom ?? ''} ${demande.user.nom ?? ''}`.trim() || 'N/A'}
                        </div>
                      </div>

                      {/* Email */}
                      <div className="col-span-2">
                        <div className="text-[11px] text-gray-900 truncate" title={demande.user.email}>
                          {demande.user.email}
                        </div>
                      </div>

                      {/* Session */}
                      <div className="col-span-1">
                        <div className="text-[10px] text-gray-900 truncate" title={demande.session}>
                          {demande.session}
                        </div>
                        {demande.sessionChangeStatus === 'PENDING' && demande.sessionChangeRequest && (
                          <div className="mt-0.5">
                            <span className="inline-flex items-center px-1 py-0.5 rounded text-[9px] font-medium bg-blue-100 text-blue-800">
                              🔄 → {demande.sessionChangeRequest}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Niveau */}
                      <div className="col-span-1 text-center">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                          {demande.niveau || '1'}
                        </span>
                      </div>

                      {/* Statut */}
                      <div className="col-span-1">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium border ${getStatusColor(demande.statut)}`}>
                          {statusConfig[demande.statut]?.label || demande.statut}
                        </span>
                      </div>

                      {/* Devis */}
                      <div className="col-span-1">
                        {demande.hasDevis ? (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium border bg-green-50 text-green-700 border-green-200" title="Un devis a été créé pour cette demande">
                            Créé
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium border bg-yellow-50 text-yellow-700 border-yellow-200" title="Aucun devis créé pour cette demande">
                            Attente
                          </span>
                        )}
                      </div>

                      {/* Message */}
                      <div className="col-span-1">
                        <div className="text-[10px] text-gray-500 truncate" title={demande.message || 'Aucun message'}>
                          {demande.message || '-'}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="col-span-2">
                        <div className="flex flex-col space-y-1">
                          {editingComment === demande.id ? (
                            <div className="space-y-1">
                              <textarea
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full text-[10px] border-gray-300 rounded-md"
                                rows={2}
                                placeholder="Commentaire..."
                              />
                              <div className="flex space-x-1">
                                <button
                                  onClick={() => handleStatusChange(demande.id, demande.statut, commentText)}
                                  className="inline-flex items-center px-1.5 py-0.5 border border-transparent text-[10px] font-medium rounded text-white bg-indigo-600 hover:bg-indigo-700"
                                >
                                  OK
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingComment(null);
                                    setCommentText('');
                                  }}
                                  className="inline-flex items-center px-1.5 py-0.5 border border-gray-300 text-[10px] font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
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
                                className="inline-flex items-center text-[10px] text-indigo-600 hover:text-indigo-500 font-medium"
                                title="Ajouter/modifier commentaire"
                              >
                                <PencilIcon className="h-3 w-3 mr-0.5" />
                                {demande.commentaire ? 'Modif' : 'Comm'}
                              </button>
                              
                              <select
                                value={demande.statut}
                                onChange={(e) => handleStatusChange(demande.id, e.target.value)}
                                className="block w-full text-[10px] py-0.5 border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
                              >
                                <option value="EN_ATTENTE">Attente</option>
                                <option value="VALIDE">Validée</option>
                                <option value="REFUSE">Refusée</option>
                                <option value="ANNULE">Annulée</option>
                              </select>

                              {demande.statut === 'VALIDE' && !demande.hasDevis && (
                                <button
                                  onClick={() => router.push(`/admin/devis/nouveau?demandeId=${demande.id}`)}
                                  className="inline-flex items-center px-1.5 py-0.5 border border-transparent text-[10px] font-medium rounded text-white bg-green-600 hover:bg-green-700"
                                  title="Créer un devis"
                                >
                                  <DocumentTextIcon className="h-3 w-3 mr-0.5" />
                                  Devis
                                </button>
                              )}
                              {demande.hasDevis && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium bg-gray-100 text-gray-700 border border-gray-200" title="Un devis existe déjà pour cette demande">
                                  Créé
                                </span>
                              )}
                              
                              {demande.sessionChangeStatus === 'PENDING' && (
                                <button
                                  onClick={() => setSessionChangeModal({show: true, demande})}
                                  className="inline-flex items-center px-2 py-1 border-2 border-blue-500 text-[10px] font-bold rounded text-white bg-blue-600 hover:bg-blue-700 shadow-sm animate-pulse"
                                  title="⚠️ CLIQUEZ ICI pour gérer la demande de changement de session"
                                >
                                  🔄 Changement
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Commentaire affiché */}
                    {demande.commentaire && editingComment !== demande.id && (
                      <div className="mt-1 px-2 py-1 bg-gray-50 rounded text-[10px] text-gray-600">
                        <strong>Commentaire:</strong> {demande.commentaire}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-white px-2 py-2 flex items-center justify-between border-t border-gray-200">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="inline-flex items-center px-2 py-1 border border-gray-300 text-[10px] font-medium rounded text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      ←
                    </button>
                    <span className="text-[10px] text-gray-700">
                      {currentPage}/{totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="inline-flex items-center px-2 py-1 border border-gray-300 text-[10px] font-medium rounded text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      →
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <p className="text-[10px] text-gray-700">
                      Page <span className="font-medium">{currentPage}</span>/<span className="font-medium">{totalPages}</span>
                    </p>
                    <nav className="inline-flex rounded shadow-sm -space-x-px">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="inline-flex items-center px-1.5 py-1 rounded-l border border-gray-300 bg-white text-[10px] text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <ChevronLeftIcon className="h-3 w-3" />
                      </button>
                      {[...Array(totalPages)].map((_, i) => {
                        const page = i + 1;
                        if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                          return (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`inline-flex items-center px-2 py-1 border text-[10px] font-medium ${
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
                            <span key={page} className="inline-flex items-center px-2 py-1 border border-gray-300 bg-white text-[10px] text-gray-700">
                              ...
                            </span>
                          );
                        }
                        return null;
                      })}
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="inline-flex items-center px-1.5 py-1 rounded-r border border-gray-300 bg-white text-[10px] text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <ChevronRightIcon className="h-3 w-3" />
                      </button>
                    </nav>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal de gestion des changements de session */}
        {sessionChangeModal.show && sessionChangeModal.demande && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
            <div className="bg-white rounded max-w-lg w-full p-4 shadow-xl">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Demande de changement de session
              </h3>
              
              <div className="space-y-2 mb-4">
                <div className="bg-gray-50 p-2 rounded">
                  <p className="text-[10px] text-gray-600 mb-1">
                    <strong>Utilisateur:</strong> {sessionChangeModal.demande.user.prenom} {sessionChangeModal.demande.user.nom}
                  </p>
                  <p className="text-[10px] text-gray-600 mb-1">
                    <strong>Email:</strong> {sessionChangeModal.demande.user.email}
                  </p>
                  <p className="text-[10px] text-gray-600">
                    <strong>Date:</strong> {sessionChangeModal.demande.sessionChangeDate ? new Date(sessionChangeModal.demande.sessionChangeDate).toLocaleDateString('fr-FR') : 'N/A'}
                  </p>
                </div>

                <div className="border-l-2 border-blue-500 pl-2">
                  <p className="text-[10px] font-medium text-gray-900">Session actuelle:</p>
                  <p className="text-[11px] text-gray-700">{sessionChangeModal.demande.session}</p>
                </div>

                <div className="border-l-2 border-green-500 pl-2">
                  <p className="text-[10px] font-medium text-gray-900">Nouvelle session:</p>
                  <p className="text-[11px] text-gray-700">{sessionChangeModal.demande.sessionChangeRequest}</p>
                </div>

                {sessionChangeModal.demande.sessionChangeReason && (
                  <div className="bg-blue-50 p-2 rounded">
                    <p className="text-[10px] font-medium text-blue-900 mb-0.5">Raison:</p>
                    <p className="text-[10px] text-blue-800">{sessionChangeModal.demande.sessionChangeReason}</p>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-medium text-gray-700 mb-1">
                    Commentaire admin (optionnel)
                  </label>
                  <textarea
                    value={sessionChangeComment}
                    onChange={(e) => setSessionChangeComment(e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-[10px] focus:outline-none focus:ring-1 focus:ring-blue-500"
                    rows={2}
                    placeholder="Commentaire..."
                    disabled={processingChange}
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setSessionChangeModal({show: false, demande: null});
                    setSessionChangeComment('');
                  }}
                  disabled={processingChange}
                  className="px-3 py-1 text-[10px] font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition-colors disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  onClick={() => handleSessionChangeApproval(sessionChangeModal.demande!.id, 'reject')}
                  disabled={processingChange}
                  className="px-3 py-1 text-[10px] font-medium text-white bg-red-600 hover:bg-red-700 rounded transition-colors disabled:opacity-50"
                >
                  {processingChange ? '...' : '❌ Refuser'}
                </button>
                <button
                  onClick={() => handleSessionChangeApproval(sessionChangeModal.demande!.id, 'approve')}
                  disabled={processingChange}
                  className="px-3 py-1 text-[10px] font-medium text-white bg-green-600 hover:bg-green-700 rounded transition-colors disabled:opacity-50"
                >
                  {processingChange ? '...' : '✅ Approuver'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 