"use client";

import { useState, useEffect } from 'react';
import CrowdfundingDashboard from '../../../components/CrowdfundingDashboard';
import { BaseContribution, ContributionStats } from '@/types/crowdfunding';

interface AdminContribution extends BaseContribution {
  donorEmail: string;
  donorPhone?: string;
  returnAmount: number;
  returnDescription?: string;
  paymentMethod: string;
  notes?: string;
  userId?: string;
}

export default function AdminFinancementParticipatif() {
  const [contributions, setContributions] = useState<AdminContribution[]>([]);
  const [stats, setStats] = useState<ContributionStats>({
    totalRaised: 0,
    goal: 50000000,
    contributorCount: 0,
    averageContribution: 0,
    progressPercentage: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedContribution, setSelectedContribution] = useState<AdminContribution | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    fetchContributions();
  }, [filterStatus, filterType]);

  const fetchContributions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.set('status', filterStatus);
      if (filterType !== 'all') params.set('type', filterType);
      
      const response = await fetch(`/api/crowdfunding/contributions?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setContributions(data.data.contributions);
        setStats(data.data.stats);
      } else {
        setError(data.error || 'Erreur lors du chargement');
      }
    } catch (err) {
      setError('Erreur de connexion');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateContributionStatus = async (id: string, status: string, notes?: string) => {
    try {
      const response = await fetch(`/api/crowdfunding/contributions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, notes }),
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchContributions();
        setSelectedContribution(null);
      } else {
        setError(data.error || 'Erreur lors de la mise à jour');
      }
    } catch (err) {
      setError('Erreur lors de la mise à jour');
      console.error('Erreur:', err);
    }
  };

  const deleteContribution = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette contribution ?')) return;
    
    try {
      const response = await fetch(`/api/crowdfunding/contributions/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchContributions();
        setSelectedContribution(null);
      } else {
        setError(data.error || 'Erreur lors de la suppression');
      }
    } catch (err) {
      setError('Erreur lors de la suppression');
      console.error('Erreur:', err);
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-semibold";
    switch (status) {
      case 'pending': return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'confirmed': return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'processed': return `${baseClasses} bg-green-100 text-green-800`;
      case 'cancelled': return `${baseClasses} bg-red-100 text-red-800`;
      default: return baseClasses;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'preformation': return '🎓 Formation';
      case 'financial': return '💰 Financier';
      case 'material': return '🎁 Matériel';
      default: return type;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount);
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'confirmed': return 'Confirmé';
      case 'processed': return 'Traité';
      case 'cancelled': return 'Annulé';
      default: return status;
    }
  };

  const computedProgress = Math.round((stats.totalRaised / stats.goal) * 100);
  const progressPct: number =
    typeof stats.progressPercentage === 'number' ? stats.progressPercentage : computedProgress;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <h2 className="mt-4 text-xl font-semibold text-gray-900">Chargement des données de financement...</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* En-tête principal */}
        <div className="sm:flex sm:items-center sm:justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 flex items-center">
              🎯 Gestion Financement Participatif
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Gérez les contributions pour le Centre de Multi Formations en Sécurité du Togo
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <button
              onClick={() => window.open('/financement-participatif', '_blank')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
              </svg>
              Page Publique
            </button>
            <button
              onClick={fetchContributions}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              Actualiser
            </button>
          </div>
        </div>

        {/* Indicateur de statut temps réel */}
        <div className="mb-6 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-900">
                  Système actif - {contributions.length} contributions
                </span>
              </div>
              <div className="hidden sm:flex items-center space-x-4 text-sm text-gray-500">
                <span>
                  Objectif: {((stats.totalRaised / stats.goal) * 100).toFixed(1)}% atteint
                </span>
                <span>•</span>
                <span>
                  {formatCurrency(stats.goal - stats.totalRaised)} FCFA restants
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-xs text-gray-500">
                Dernière MAJ: {new Date().toLocaleTimeString('fr-FR')}
              </span>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-xs text-gray-600">En ligne</span>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4 border border-red-200">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Erreur</h3>
                <div className="mt-1 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard */}
        <div className="mb-8">
          <CrowdfundingDashboard
            stats={stats}
            recentContributions={contributions.slice(0, 5)}
            showAdminView={true}
          />
        </div>

        {/* Filters */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Filtres et Options</h3>
            <p className="text-sm text-gray-500 mt-1">Affinez votre recherche dans les contributions</p>
          </div>
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="pending">En attente</option>
                  <option value="confirmed">Confirmé</option>
                  <option value="processed">Traité</option>
                  <option value="cancelled">Annulé</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">Tous les types</option>
                  <option value="preformation">Formation</option>
                  <option value="financial">Financier</option>
                  <option value="material">Matériel</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setFilterStatus('all');
                    setFilterType('all');
                  }}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Réinitialiser
                </button>
              </div>
              <div className="flex items-end">
                <button
                  onClick={fetchContributions}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                  </svg>
                  Actualiser
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Contributions Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                  </svg>
                  Liste des Contributions
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {contributions.length} contribution{contributions.length !== 1 ? 's' : ''} • 
                  Total collecté: {formatCurrency(stats.totalRaised)} FCFA
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-500">
                  {progressPct}% de l'objectif atteint
                </span>
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(progressPct, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        
        {contributions.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-4">📭</div>
            <p>Aucune contribution trouvée</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Donateur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Montant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {contributions.map((contribution) => (
                  <tr key={contribution.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {contribution.donorName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {contribution.donorEmail}
                        </p>
                        {contribution.donorPhone && (
                          <p className="text-xs text-gray-400">
                            {contribution.donorPhone}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-semibold text-green-600">
                          {formatCurrency(contribution.amount)} FCFA
                        </p>
                        <p className="text-xs text-gray-500">
                          Retour: {formatCurrency(contribution.returnAmount)} FCFA
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {getTypeLabel(contribution.type)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusBadge(contribution.status)}>
                        {getStatusLabel(contribution.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(contribution.date).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedContribution(contribution)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Voir
                        </button>
                        {contribution.status === 'pending' && (
                          <button
                            onClick={() => deleteContribution(contribution.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Suppr.
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        </div>

        {/* Contribution Detail Modal */}
        {selectedContribution && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-800">
                    Détails de la Contribution
                  </h3>
                  <button
                    onClick={() => setSelectedContribution(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Donateur</label>
                      <p className="text-sm text-gray-900">{selectedContribution.donorName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <p className="text-sm text-gray-900">{selectedContribution.donorEmail}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Téléphone</label>
                      <p className="text-sm text-gray-900">{selectedContribution.donorPhone || 'Non renseigné'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Type</label>
                      <p className="text-sm text-gray-900">{getTypeLabel(selectedContribution.type)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Montant</label>
                      <p className="text-sm font-semibold text-green-600">
                        {formatCurrency(selectedContribution.amount)} FCFA
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Montant de retour</label>
                      <p className="text-sm text-gray-900">
                        {formatCurrency(selectedContribution.returnAmount)} FCFA
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Méthode de paiement</label>
                      <p className="text-sm text-gray-900">{selectedContribution.paymentMethod}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Date</label>
                      <p className="text-sm text-gray-900">
                        {new Date(selectedContribution.date).toLocaleString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  
                  {selectedContribution.returnDescription && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Description du retour</label>
                      <p className="text-sm text-gray-900">{selectedContribution.returnDescription}</p>
                    </div>
                  )}

                  {selectedContribution.notes && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Notes</label>
                      <p className="text-sm text-gray-900">{selectedContribution.notes}</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Statut actuel</label>
                    <span className={getStatusBadge(selectedContribution.status)}>
                      {getStatusLabel(selectedContribution.status)}
                    </span>
                  </div>

                  <div className="border-t pt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Actions</label>
                    <div className="flex flex-wrap gap-2">
                      {selectedContribution.status === 'pending' && (
                        <button
                          onClick={() => updateContributionStatus(selectedContribution.id, 'confirmed')}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition duration-300"
                        >
                          Confirmer
                        </button>
                      )}
                      {selectedContribution.status === 'confirmed' && (
                        <button
                          onClick={() => updateContributionStatus(selectedContribution.id, 'processed')}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition duration-300"
                        >
                          Marquer comme traité
                        </button>
                      )}
                      {(selectedContribution.status === 'pending' || selectedContribution.status === 'confirmed') && (
                        <button
                          onClick={() => updateContributionStatus(selectedContribution.id, 'cancelled')}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 transition duration-300"
                        >
                          Annuler
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}