'use client';

import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { DocumentArrowDownIcon, MagnifyingGlassIcon, FunnelIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useDevisNotifications } from '../../../../hooks/useDevisNotifications';

interface Devis {
  id: string;
  numero: string;
  client?: string;
  mail?: string;
  montant?: number;
  statut: string;
  createdAt?: string;
  demande?: { 
    user?: { prenom?: string; nom?: string };
    entreprise?: string | null;
    typeInscription?: string | null;
  };
}

type FilterStatus = 'tous' | 'VALIDE' | 'INVALIDE' | 'BROUILLON' | 'EN_ATTENTE';
type SortField = 'date' | 'numero' | 'montant' | 'client';
type SortOrder = 'asc' | 'desc';

export default function DevisListPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [devis, setDevis] = useState<Devis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // États pour les filtres et la recherche
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('tous');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  
  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [activeTab, setActiveTab] = useState<'tous' | 'en_attente' | 'valides'>('en_attente');

  // Utiliser le hook pour les notifications de devis
  useDevisNotifications();

  // Logique de filtrage et tri
  const filteredAndSortedDevis = useMemo(() => {
    let filtered = devis.filter(d => {
      // Filtre par statut
      if (statusFilter !== 'tous' && d.statut !== statusFilter) {
        return false;
      }
      
      // Filtre par recherche
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const client = d.demande?.user ? `${d.demande.user.prenom ?? ''} ${d.demande.user.nom ?? ''}`.trim() : (d.client ?? '');
        return (
          d.numero.toLowerCase().includes(searchLower) ||
          client.toLowerCase().includes(searchLower) ||
          (d.mail ?? '').toLowerCase().includes(searchLower)
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
        case 'numero':
          aValue = a.numero || '';
          bValue = b.numero || '';
          break;
        case 'montant':
          aValue = a.montant || 0;
          bValue = b.montant || 0;
          break;
        case 'client':
          aValue = a.demande?.user ? `${a.demande.user.prenom ?? ''} ${a.demande.user.nom ?? ''}`.trim() : (a.client ?? '');
          bValue = b.demande?.user ? `${b.demande.user.prenom ?? ''} ${b.demande.user.nom ?? ''}`.trim() : (b.client ?? '');
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [devis, statusFilter, searchTerm, sortField, sortOrder]);

  // Items visibles selon l'onglet
  const isConvention = (_d: Devis) => false; // inutile sans onglets type

  const tabItems = useMemo(() => {
    if (activeTab === 'en_attente') return filteredAndSortedDevis.filter(d => d.statut === 'EN_ATTENTE');
    if (activeTab === 'valides') return filteredAndSortedDevis.filter(d => d.statut === 'VALIDE');
    return filteredAndSortedDevis;
  }, [filteredAndSortedDevis, activeTab]);

  // Logique de pagination
  const totalPages = Math.ceil(tabItems.length / itemsPerPage) || 1;
  const paginatedDevis = tabItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Index: compter le nombre de devis par utilisateur (clé: email si présent, sinon nom complet)
  const devisCountByUser = useMemo(() => {
    const map = new Map<string, number>();
    for (const d of devis) {
      const key = (d.mail && d.mail.trim()) || (
        d.demande?.user ? `${(d.demande.user.prenom ?? '').trim()} ${(d.demande.user.nom ?? '').trim()}`.trim() : ''
      ) || '—';
      map.set(key, (map.get(key) || 0) + 1);
    }
    return map;
  }, [devis]);

  // Statistiques
  const stats = useMemo(() => {
    const total = devis.length;
    const valides = devis.filter(d => d.statut === 'VALIDE').length;
    const invalides = devis.filter(d => d.statut === 'INVALIDE').length;
    const brouillons = devis.filter(d => d.statut === 'BROUILLON').length;
    const enAttente = devis.filter(d => d.statut === 'EN_ATTENTE').length;
    
    return { total, valides, invalides, brouillons, enAttente };
  }, [devis]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/');
    } else if (status === 'authenticated') {
      fetchDevis();
    }
  }, [status, session, router]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchTerm, sortField, sortOrder, activeTab]);



  const fetchDevis = async () => {
    try {
      const response = await fetch('/api/admin/devis');
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des devis');
      }
      const data = await response.json();
      setDevis(data);
    } catch (error) {
      setError('Erreur lors de la récupération des devis');
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadDevis = async (devisId: string, numero: string) => {
    try {
      const response = await fetch(`/api/admin/devis/${devisId}/pdf`);
      if (!response.ok) {
        throw new Error('Erreur lors du téléchargement du devis');
      }
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `devis_${numero}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur lors du téléchargement du devis');
    }
  };

  // Supprimer un devis (ADMIN)
  const deleteDevis = async (devisId: string) => {
    const confirmed = window.confirm('Confirmer la suppression de ce devis ? Cette action est irréversible.');
    if (!confirmed) return;
    try {
      const res = await fetch(`/api/admin/devis/${devisId}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Erreur lors de la suppression');
      }
      // Mise à jour locale de la liste
      setDevis(prev => prev.filter(d => d.id !== devisId));
    } catch (err) {
      console.error(err);
      setError((err as Error).message || 'Erreur lors de la suppression du devis');
    }
  };

  // Fonction pour obtenir les couleurs du badge de statut
  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'VALIDE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'INVALIDE':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'BROUILLON':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'EN_ATTENTE':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
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
      <div className="min-h-screen bg-gray-100 py-8 px-2 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto bg-white shadow rounded-lg p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <h2 className="mt-4 text-xl font-semibold text-gray-900">Chargement...</h2>
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
              <h1 className="text-2xl font-bold text-gray-900">Gestion des devis</h1>
              <p className="mt-2 text-sm text-gray-700">
                Gérez tous les devis de votre organisation
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Link
                href="/admin/devis/nouveau"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Nouveau devis
              </Link>
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
                    <dt className="text-sm font-medium text-gray-500 truncate">Valides</dt>
                    <dd className="text-lg font-medium text-green-600">{stats.valides}</dd>
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
                    <dt className="text-sm font-medium text-gray-500 truncate">Invalides</dt>
                    <dd className="text-lg font-medium text-red-600">{stats.invalides}</dd>
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
                    <dt className="text-sm font-medium text-gray-500 truncate">Brouillons</dt>
                    <dd className="text-lg font-medium text-gray-600">{stats.brouillons}</dd>
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

        {/* Filtres, onglets et recherche */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            {/* Onglets statut devis + type */}
            <div className="mb-4 flex flex-wrap gap-2">
              <button
                onClick={() => setActiveTab('tous')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium border ${activeTab === 'tous' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300'}`}
              >
                Tous
              </button>
              <button
                onClick={() => setActiveTab('en_attente')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium border ${activeTab === 'en_attente' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300'}`}
              >
                En attente (user)
              </button>
              <button
                onClick={() => setActiveTab('valides')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium border ${activeTab === 'valides' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300'}`}
              >
                Validés
              </button>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              {/* Recherche */}
              <div className="relative flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Rechercher par numéro, client ou email..."
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
                    <option value="tous">Tous les statuts</option>
                    <option value="VALIDE">Valides</option>
                    <option value="INVALIDE">Invalides</option>
                    <option value="BROUILLON">Brouillons</option>
                    <option value="EN_ATTENTE">En attente</option>
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
                    <option value="numero-asc">Numéro (A-Z)</option>
                    <option value="numero-desc">Numéro (Z-A)</option>
                    <option value="client-asc">Client (A-Z)</option>
                    <option value="client-desc">Client (Z-A)</option>
                    <option value="montant-desc">Montant (élevé)</option>
                    <option value="montant-asc">Montant (faible)</option>
                  </select>
                </div>

                {/* Items per page */}
                <div className="relative">
                  <select
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option value={12}>12 par page</option>
                    <option value={24}>24 par page</option>
                    <option value={48}>48 par page</option>
                    <option value={96}>96 par page</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Compteur de résultats */}
            <div className="mt-4 text-sm text-gray-700">
              Affichage de <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> à{' '}
              <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredAndSortedDevis.length)}</span> sur{' '}
              <span className="font-medium">{filteredAndSortedDevis.length}</span> résultats
            </div>
          </div>
        </div>

        {/* Liste des devis */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {filteredAndSortedDevis.length === 0 ? (
            <div className="text-center py-12">
              <FunnelIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun devis trouvé</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter !== 'tous'
                  ? 'Essayez de modifier vos critères de recherche.'
                  : 'Commencez par créer un nouveau devis.'}
              </p>
            </div>
          ) : (
            <>
              {/* En-têtes du tableau */}
              <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="col-span-2">
                    <button 
                      onClick={() => handleSort('numero')}
                      className="flex items-center space-x-1 hover:text-gray-700"
                    >
                      <span>N° Devis</span>
                      {sortField === 'numero' && (
                        <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </button>
                  </div>
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
                      onClick={() => handleSort('montant')}
                      className="flex items-center space-x-1 hover:text-gray-700"
                    >
                      <span>Montant</span>
                      {sortField === 'montant' && (
                        <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </button>
                  </div>
                  <div className="col-span-1">Statut</div>
                  <div className="col-span-2 text-center">Actions</div>
                </div>
              </div>

              {/* Lignes groupées par Aujourd'hui / Hier / Date */}
              {(() => {
                const toDateOnly = (dt: Date) => new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
                const today = toDateOnly(new Date());
                const yesterday = new Date(today);
                yesterday.setDate(today.getDate() - 1);

                const labelOf = (d: Date) => {
                  const dOnly = toDateOnly(d);
                  if (dOnly.getTime() === today.getTime()) return "Aujourd'hui";
                  if (dOnly.getTime() === yesterday.getTime()) return 'Hier';
                  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
                };

                const groups = new Map<string, typeof paginatedDevis>();
                for (const d of paginatedDevis) {
                  const label = d.createdAt ? labelOf(new Date(d.createdAt)) : '—';
                  if (!groups.has(label)) groups.set(label, []);
                  groups.get(label)!.push(d);
                }

                const renderRow = (d: typeof paginatedDevis[number]) => (
                  <div key={d.id} className="px-6 py-4 hover:bg-gray-50 transition-colors duration-150">
                    <div className="grid grid-cols-12 gap-4 items-center">
                      {/* Numéro */}
                      <div className="col-span-2">
                        <div className="text-sm font-medium text-gray-900">#{d.numero}</div>
                      </div>
                      {/* Date */}
                      <div className="col-span-1">
                        <div className="text-sm text-gray-900">
                          {d.createdAt ? new Date(d.createdAt).toLocaleDateString('fr-FR') : '-'}
                        </div>
                      </div>
                      {/* Client */}
                      <div className="col-span-2">
                        <div className="text-sm text-gray-900 flex items-center gap-2">
                          <span>
                            {d.demande?.user 
                              ? `${d.demande.user.prenom ?? ''} ${d.demande.user.nom ?? ''}`.trim() || 'N/A'
                              : d.client || 'N/A'
                            }
                          </span>
                          {(() => {
                            const key = (d.mail && d.mail.trim()) || (
                              d.demande?.user ? `${(d.demande.user.prenom ?? '').trim()} ${(d.demande.user.nom ?? '').trim()}`.trim() : ''
                            ) || '—';
                            const count = devisCountByUser.get(key) || 0;
                            if (count > 1) {
                              return (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-200" title="Nombre total de devis pour cet utilisateur">
                                  {count} devis
                                </span>
                              );
                            }
                            return (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-green-50 text-green-700 border border-green-200" title="Premier devis pour cet utilisateur">
                                1 devis
                              </span>
                            );
                          })()}
                        </div>
                      </div>
                      {/* Email */}
                      <div className="col-span-3">
                        <div className="text-sm text-gray-900 truncate" title={d.mail || 'N/A'}>
                          {d.mail || 'N/A'}
                        </div>
                      </div>
                      {/* Montant */}
                      <div className="col-span-1">
                        <div className="text-sm font-semibold text-gray-900">
                          {typeof d.montant === 'number' 
                            ? d.montant.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
                            : 'N/A'
                          }
                        </div>
                      </div>
                      {/* Statut */}
                      <div className="col-span-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(d.statut)}`}>
                          {d.statut || 'N/A'}
                        </span>
                      </div>
                      {/* Actions */}
                      <div className="col-span-2 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <Link
                            href={`/admin/devis/${d.id}`}
                            className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
                            title="Voir détails"
                          >
                            Voir
                          </Link>
                          <button
                            onClick={() => downloadDevis(d.id, d.numero)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                            title="Télécharger PDF"
                          >
                            <DocumentArrowDownIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteDevis(d.id)}
                            className="p-1 text-red-400 hover:text-red-600"
                            title="Supprimer"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );

                return (
                  <>
                    {Array.from(groups.entries()).map(([label, items]) => (
                      <div key={label} className="">
                        <div className="bg-gray-100 px-6 py-2 border-b border-gray-200 mt-6">
                          <h3 className="text-sm font-semibold text-gray-800">{label}</h3>
                        </div>
                        <div className="divide-y divide-gray-200">
                          {items.map(renderRow)}
                        </div>
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