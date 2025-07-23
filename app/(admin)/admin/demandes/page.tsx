'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  ClipboardDocumentListIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon,
  ExclamationCircleIcon,
  PencilIcon,
  DocumentTextIcon
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
}

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
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/');
    } else if (status === 'authenticated') {
      fetchDemandes();
    }
  }, [status, session, router]);

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

  const filteredDemandes = demandes.filter(demande => 
    filter === 'all' ? true : demande.statut === filter
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
        <div className="sm:flex sm:items-center sm:justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Gestion des demandes</h2>
            <p className="mt-2 text-sm text-gray-600">
              Gérez les demandes de formation des utilisateurs
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md text-black"
            >
              <option value="all">Tous les statuts</option>
              <option value="EN_ATTENTE">En attente</option>
              <option value="VALIDE">Validées</option>
              <option value="REFUSE">Refusées</option>
              <option value="ANNULE">Annulées</option>
            </select>
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <ul className="divide-y divide-gray-200">
            {filteredDemandes.map((demande) => {
              const status = statusConfig[demande.statut];
              const StatusIcon = status.icon;
              
              return (
                <li key={demande.id} className="px-4 py-6 sm:px-6 hover:bg-gray-50 transition-colors duration-150">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center">
                        <ClipboardDocumentListIcon className="h-5 w-5 text-gray-400 mr-2" />
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          Formation Cordiste - {demande.session}
                        </h3>
                        <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                          <StatusIcon className="h-4 w-4 mr-1" />
                          {status.label}
                        </span>
                      </div>
                      
                      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <div>
                          <p className="text-sm text-gray-500">
                            <span className="font-medium">Client:</span> {demande.user.prenom} {demande.user.nom}
                          </p>
                          <p className="text-sm text-gray-500">
                            <span className="font-medium">Email:</span> {demande.user.email}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">
                            <span className="font-medium">Session:</span> {demande.session}
                          </p>
                          <p className="text-sm text-gray-500">
                            <span className="font-medium">Date de demande:</span> {new Date(demande.createdAt).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>

                      {demande.message && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-500">
                            <span className="font-medium">Message:</span> {demande.message}
                          </p>
                        </div>
                      )}

                      {demande.commentaire && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-500">
                            <span className="font-medium">Commentaire:</span> {demande.commentaire}
                          </p>
                        </div>
                      )}

                      <p className="mt-2 text-sm text-gray-500">
                        <span className="font-medium">Date:</span> {new Date(demande.createdAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>

                    <div className="ml-4 flex-shrink-0 flex flex-col space-y-3">
                      {editingComment === demande.id ? (
                        <div className="space-y-2">
                          <textarea
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            rows={3}
                            placeholder="Ajouter un commentaire..."
                          />
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleStatusChange(demande.id, demande.statut, commentText)}
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                              Enregistrer
                            </button>
                            <button
                              onClick={() => {
                                setEditingComment(null);
                                setCommentText('');
                              }}
                              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                              Annuler
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingComment(demande.id);
                            setCommentText(demande.commentaire || '');
                          }}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          <PencilIcon className="h-4 w-4 mr-2" />
                          {demande.commentaire ? 'Modifier le commentaire' : 'Ajouter un commentaire'}
                        </button>
                      )}

                      <select
                        value={demande.statut}
                        onChange={(e) => handleStatusChange(demande.id, e.target.value)}
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md text-black"
                      >
                        <option value="EN_ATTENTE">En attente</option>
                        <option value="VALIDE">Validée</option>
                        <option value="REFUSE">Refusée</option>
                        <option value="ANNULE">Annulée</option>
                      </select>

                      {demande.statut === 'VALIDE' && (
                        <button
                          onClick={() => router.push(`/admin/devis/nouveau?demandeId=${demande.id}`)}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          <DocumentTextIcon className="h-4 w-4 mr-2" />
                          Créer un devis
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
} 