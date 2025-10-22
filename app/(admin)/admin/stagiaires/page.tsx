'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  UserPlusIcon,
  PhotoIcon,
  QrCodeIcon,
  DocumentArrowDownIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  AcademicCapIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

interface Stagiaire {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  formation: string;
  dateFormation: string;
  photo?: string;
  qrCode?: string;
  statut: 'EN_ATTENTE' | 'PHOTO_UPLOADED' | 'DIPLOME_GENERATED' | 'DIPLOME_DOWNLOADED';
  diplomeUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface Formation {
  id: string;
  nom: string;
  duree: number;
  description: string;
}

export default function AdminStagiairesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stagiaires, setStagiaires] = useState<Stagiaire[]>([]);
  const [formations, setFormations] = useState<Formation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // États pour les filtres et la recherche
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [formationFilter, setFormationFilter] = useState<string>('all');
  
  // États pour les modales
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStagiaire, setSelectedStagiaire] = useState<Stagiaire | null>(null);
  
  // Formulaire d'ajout/modification
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    formation: '',
    dateFormation: ''
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/');
    } else if (status === 'authenticated') {
      fetchStagiaires();
      fetchFormations();
    }
  }, [status, session, router]);

  const fetchStagiaires = async () => {
    try {
      const response = await fetch('/api/admin/stagiaires');
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des stagiaires');
      }
      const data = await response.json();
      setStagiaires(data);
    } catch (error) {
      setError('Erreur lors de la récupération des stagiaires');
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFormations = async () => {
    try {
      const response = await fetch('/api/admin/formations');
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des formations');
      }
      const data = await response.json();
      setFormations(data);
    } catch (error) {
      console.error('Erreur formations:', error);
    }
  };

  const handleAddStagiaire = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/stagiaires', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'ajout du stagiaire');
      }

      setShowAddModal(false);
      setFormData({ nom: '', prenom: '', email: '', formation: '', dateFormation: '' });
      fetchStagiaires();
    } catch (error) {
      setError('Erreur lors de l\'ajout du stagiaire');
      console.error('Erreur:', error);
    }
  };

  const handleEditStagiaire = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStagiaire) return;

    try {
      const response = await fetch(`/api/admin/stagiaires/${selectedStagiaire.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la modification du stagiaire');
      }

      setShowEditModal(false);
      setSelectedStagiaire(null);
      setFormData({ nom: '', prenom: '', email: '', formation: '', dateFormation: '' });
      fetchStagiaires();
    } catch (error) {
      setError('Erreur lors de la modification du stagiaire');
      console.error('Erreur:', error);
    }
  };

  const handleDeleteStagiaire = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce stagiaire ?')) return;

    try {
      const response = await fetch(`/api/admin/stagiaires/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression du stagiaire');
      }

      fetchStagiaires();
    } catch (error) {
      setError('Erreur lors de la suppression du stagiaire');
      console.error('Erreur:', error);
    }
  };

  const generateDiplome = async (stagiaire: Stagiaire) => {
    try {
      const response = await fetch(`/api/admin/stagiaires/${stagiaire.id}/diplome`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la génération du diplôme');
      }

      fetchStagiaires();
    } catch (error) {
      setError('Erreur lors de la génération du diplôme');
      console.error('Erreur:', error);
    }
  };

  const getStatusConfig = (statut: string) => {
    switch (statut) {
      case 'EN_ATTENTE':
        return {
          color: 'bg-yellow-100 text-yellow-800',
          icon: ClockIcon,
          label: 'En attente'
        };
      case 'PHOTO_UPLOADED':
        return {
          color: 'bg-blue-100 text-blue-800',
          icon: PhotoIcon,
          label: 'Photo uploadée'
        };
      case 'DIPLOME_GENERATED':
        return {
          color: 'bg-green-100 text-green-800',
          icon: CheckCircleIcon,
          label: 'Diplôme généré'
        };
      case 'DIPLOME_DOWNLOADED':
        return {
          color: 'bg-purple-100 text-purple-800',
          icon: DocumentArrowDownIcon,
          label: 'Diplôme téléchargé'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800',
          icon: XCircleIcon,
          label: 'Inconnu'
        };
    }
  };

  // Filtrage des stagiaires
  const filteredStagiaires = stagiaires.filter(stagiaire => {
    const matchesSearch = !searchTerm || 
      `${stagiaire.nom} ${stagiaire.prenom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stagiaire.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || stagiaire.statut === statusFilter;
    const matchesFormation = formationFilter === 'all' || stagiaire.formation === formationFilter;
    
    return matchesSearch && matchesStatus && matchesFormation;
  });

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

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Gestion des Stagiaires</h2>
              <p className="mt-2 text-sm text-gray-600">
                Gérez les stagiaires et générez leurs diplômes
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <UserPlusIcon className="h-4 w-4 mr-2" />
              Ajouter un stagiaire
            </button>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              {/* Recherche */}
              <div className="relative flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Rechercher par nom, prénom, email..."
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
                    <option value="PHOTO_UPLOADED">Photo uploadée</option>
                    <option value="DIPLOME_GENERATED">Diplôme généré</option>
                    <option value="DIPLOME_DOWNLOADED">Diplôme téléchargé</option>
                  </select>
                </div>

                {/* Filtre par formation */}
                <div className="relative">
                  <select
                    value={formationFilter}
                    onChange={(e) => setFormationFilter(e.target.value)}
                    className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option value="all">Toutes les formations</option>
                    {formations.map(formation => (
                      <option key={formation.id} value={formation.nom}>
                        {formation.nom}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Liste des stagiaires */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {filteredStagiaires.length === 0 ? (
            <div className="text-center py-12">
              <FunnelIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun stagiaire trouvé</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter !== 'all' || formationFilter !== 'all'
                  ? 'Essayez de modifier vos critères de recherche.'
                  : 'Commencez par ajouter un stagiaire.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredStagiaires.map((stagiaire) => {
                const statusConfig = getStatusConfig(stagiaire.statut);
                const StatusIcon = statusConfig.icon;
                
                return (
                  <div key={stagiaire.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          {stagiaire.photo ? (
                            <img
                              className="h-12 w-12 rounded-full object-cover"
                              src={stagiaire.photo}
                              alt={`${stagiaire.prenom} ${stagiaire.nom}`}
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                              <AcademicCapIcon className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-medium text-gray-900">
                            {stagiaire.prenom} {stagiaire.nom}
                          </h3>
                          <p className="text-sm text-gray-500">{stagiaire.email}</p>
                          <p className="text-sm text-gray-500">{stagiaire.formation}</p>
                          <p className="text-xs text-gray-400">
                            Ajouté le {new Date(stagiaire.createdAt).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        {/* Statut */}
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
                          <StatusIcon className="h-4 w-4 mr-1" />
                          {statusConfig.label}
                        </span>

                        {/* Actions */}
                        <div className="flex items-center space-x-2">
                          {stagiaire.statut === 'PHOTO_UPLOADED' && (
                            <button
                              onClick={() => generateDiplome(stagiaire)}
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                            >
                              <QrCodeIcon className="h-4 w-4 mr-2" />
                              Générer diplôme
                            </button>
                          )}
                          
                          {stagiaire.diplomeUrl && (
                            <a
                              href={stagiaire.diplomeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                              <EyeIcon className="h-4 w-4 mr-2" />
                              Voir diplôme
                            </a>
                          )}

                          <button
                            onClick={() => {
                              setSelectedStagiaire(stagiaire);
                              setFormData({
                                nom: stagiaire.nom,
                                prenom: stagiaire.prenom,
                                email: stagiaire.email,
                                formation: stagiaire.formation,
                                dateFormation: stagiaire.dateFormation
                              });
                              setShowEditModal(true);
                            }}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                          >
                            <PencilIcon className="h-4 w-4 mr-2" />
                            Modifier
                          </button>

                          <button
                            onClick={() => handleDeleteStagiaire(stagiaire.id)}
                            className="inline-flex items-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                          >
                            <TrashIcon className="h-4 w-4 mr-2" />
                            Supprimer
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal d'ajout */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Ajouter un stagiaire</h3>
              </div>
              <form onSubmit={handleAddStagiaire} className="px-6 py-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nom</label>
                    <input
                      type="text"
                      required
                      value={formData.nom}
                      onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Prénom</label>
                    <input
                      type="text"
                      required
                      value={formData.prenom}
                      onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Formation</label>
                    <select
                      required
                      value={formData.formation}
                      onChange={(e) => setFormData({ ...formData, formation: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">Sélectionner une formation</option>
                      {formations.map(formation => (
                        <option key={formation.id} value={formation.nom}>
                          {formation.nom}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date de formation</label>
                    <input
                      type="date"
                      required
                      value={formData.dateFormation}
                      onChange={(e) => setFormData({ ...formData, dateFormation: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Ajouter
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de modification */}
        {showEditModal && selectedStagiaire && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Modifier le stagiaire</h3>
              </div>
              <form onSubmit={handleEditStagiaire} className="px-6 py-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nom</label>
                    <input
                      type="text"
                      required
                      value={formData.nom}
                      onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Prénom</label>
                    <input
                      type="text"
                      required
                      value={formData.prenom}
                      onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Formation</label>
                    <select
                      required
                      value={formData.formation}
                      onChange={(e) => setFormData({ ...formData, formation: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">Sélectionner une formation</option>
                      {formations.map(formation => (
                        <option key={formation.id} value={formation.nom}>
                          {formation.nom}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date de formation</label>
                    <input
                      type="date"
                      required
                      value={formData.dateFormation}
                      onChange={(e) => setFormData({ ...formData, dateFormation: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedStagiaire(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Modifier
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
