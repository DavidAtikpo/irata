'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon,
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline';

interface Devis {
  id: string;
  numero: string;
  montant: number;
  statut: 'EN_ATTENTE' | 'VALIDE' | 'REFUSE';
  createdAt: string;
  demande: {
    formation: {
      titre: string;
    };
  };
}

export default function MesDevisPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [devis, setDevis] = useState<Devis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchDevis();
    }
  }, [status, session, router]);

  const fetchDevis = async () => {
    try {
      const response = await fetch('/api/user/devis');
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

  const getStatusConfig = (statut: string) => {
    switch (statut) {
      case 'VALIDE':
        return {
          icon: CheckCircleIcon,
          color: 'bg-green-100 text-green-800',
          label: 'Validé'
        };
      case 'REFUSE':
        return {
          icon: XCircleIcon,
          color: 'bg-red-100 text-red-800',
          label: 'Refusé'
        };
      default:
        return {
          icon: ClockIcon,
          color: 'bg-yellow-100 text-yellow-800',
          label: 'En attente'
        };
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

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Mes devis</h2>
          <p className="mt-2 text-sm text-gray-600">
            Consultez l'état de vos devis
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        )}

        {devis.length === 0 ? (
          <div className="text-center py-12">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun devis</h3>
            <p className="mt-1 text-sm text-gray-500">
              Vous n'avez pas encore de devis.
            </p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {devis.map((devis) => {
                const status = getStatusConfig(devis.statut);
                const StatusIcon = status.icon;

                return (
                  <li key={devis.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-2" />
                          <p className="text-sm font-medium text-indigo-600 truncate">
                            Devis #{devis.numero}
                          </p>
                        </div>
                        <div className="ml-2 flex-shrink-0 flex">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                            <StatusIcon className="h-4 w-4 mr-1" />
                            {status.label}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            {devis.demande.formation.titre}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <p>
                            {new Date(devis.createdAt).toLocaleDateString('fr-FR')} - {devis.montant.toLocaleString('fr-FR')} €
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 flex justify-end space-x-2">
                        <button
                          onClick={() => router.push(`/mes-devis/${devis.id}`)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          <EyeIcon className="h-4 w-4 mr-1" />
                          Voir le devis
                        </button>
                        {devis.statut === 'VALIDE' && (
                          <button
                            onClick={() => router.push(`/mes-devis/${devis.id}/contrat`)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            <DocumentDuplicateIcon className="h-4 w-4 mr-1" />
                            Remplir le contrat
                          </button>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
} 