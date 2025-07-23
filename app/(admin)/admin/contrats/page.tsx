'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  DocumentDuplicateIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon,
  ExclamationCircleIcon,
  UserIcon,
  DocumentTextIcon
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
}

interface Contrat {
  id: string;
  statut: string; // Changed from specific enum to string
  dateDebut?: string;
  dateFin?: string;
  createdAt: string;
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
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/');
    } else if (status === 'authenticated') {
      fetchContrats();
    }
  }, [status, session, router]);

  const fetchContrats = async () => {
    try {
      const response = await fetch('/api/admin/contrats');
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des contrats');
      }
      const data = await response.json();
      setContrats(data);
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

  const filteredContrats = contrats.filter(contrat => 
    filter === 'all' ? true : contrat.statut === filter
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
            <h2 className="text-3xl font-bold text-gray-900">Gestion des contrats</h2>
            <p className="mt-2 text-sm text-gray-600">
              Gérez les contrats de formation
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
              <option value="SIGNE">Signés</option>
              <option value="VALIDE">Validés</option>
              <option value="REFUSE">Refusés</option>
              <option value="ANNULE">Annulés</option>
            </select>
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <ul className="divide-y divide-gray-200">
            {filteredContrats.map((contrat) => {
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
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          Contrat #{contrat.id.slice(-6)}
                        </h3>
                        <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                          <StatusIcon className="h-4 w-4 mr-1" />
                          {status.label}
                        </span>
                      </div>
                      
                      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <div>
                          <p className="text-sm text-gray-500">
                            <span className="font-medium">Client:</span> {contrat.user.prenom} {contrat.user.nom}
                          </p>
                          <p className="text-sm text-gray-500">
                            <span className="font-medium">Email:</span> {contrat.user.email}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">
                            <span className="font-medium">Devis:</span> {contrat.devis.numero}
                          </p>
                          <p className="text-sm text-gray-500">
                            <span className="font-medium">Montant:</span> {contrat.devis.montant.toLocaleString('fr-FR')} €
                          </p>
                        </div>
                      </div>

                      {contrat.dateDebut && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-500">
                            <span className="font-medium">Date de début:</span> {new Date(contrat.dateDebut).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      )}

                      {contrat.dateFin && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-500">
                            <span className="font-medium">Date de fin:</span> {new Date(contrat.dateFin).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      )}

                      <p className="mt-2 text-sm text-gray-500">
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
                        <option value="SIGNE">Signé</option>
                        <option value="VALIDE">Validé</option>
                        <option value="REFUSE">Refusé</option>
                        <option value="ANNULE">Annulé</option>
                      </select>

                      <button
                        onClick={() => router.push(`/admin/contrats/${contrat.id}`)}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <DocumentTextIcon className="h-4 w-4 mr-2" />
                        Voir le contrat
                      </button>
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