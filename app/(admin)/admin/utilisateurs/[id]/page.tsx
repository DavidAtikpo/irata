'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React from 'react';
import { 
  UserIcon, 
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  DocumentDuplicateIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

interface User {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  telephone?: string;
  entreprise?: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  demandes: {
    id: string;
    statut: string;
    createdAt: string;
    formation: {
      titre: string;
    };
  }[];
  devis: {
    id: string;
    numero: string;
    statut: string;
    montant: number;
    createdAt: string;
  }[];
  contrats: {
    id: string;
    statut: string;
    dateDebut?: string;
    dateFin?: string;
    createdAt: string;
    devis: {
      numero: string;
      montant: number;
    };
  }[];
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
  }
};

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const resolvedParams = React.use(params);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/');
    } else if (status === 'authenticated') {
      fetchUser();
    }
  }, [status, session, router]);

  const fetchUser = async () => {
    try {
      const response = await fetch(`/api/admin/users/${resolvedParams.id}`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération de l\'utilisateur');
      }
      const data = await response.json();
      setUser(data);
    } catch (error) {
      setError('Erreur lors de la récupération de l\'utilisateur');
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
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

  if (error || !user) {
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
                  <h3 className="text-sm font-medium text-red-800">{error || 'Utilisateur non trouvé'}</h3>
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
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Retour
          </button>
        </div>

        {/* Informations utilisateur */}
        <div className="bg-white shadow sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center">
              <UserIcon className="h-5 w-5 mr-2" />
              Informations utilisateur
            </h3>
            <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <p className="text-sm font-medium text-gray-500">Nom complet</p>
                <p className="mt-1 text-sm text-gray-900">{user.prenom} {user.nom}</p>
              </div>

              <div className="sm:col-span-3">
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="mt-1 text-sm text-gray-900">{user.email}</p>
              </div>

              {user.telephone && (
                <div className="sm:col-span-3">
                  <p className="text-sm font-medium text-gray-500">Téléphone</p>
                  <p className="mt-1 text-sm text-gray-900">{user.telephone}</p>
                </div>
              )}

              {user.entreprise && (
                <div className="sm:col-span-3">
                  <p className="text-sm font-medium text-gray-500">Entreprise</p>
                  <p className="mt-1 text-sm text-gray-900">{user.entreprise}</p>
                </div>
              )}

              <div className="sm:col-span-3">
                <p className="text-sm font-medium text-gray-500">Rôle</p>
                <p className="mt-1 text-sm text-gray-900">
                  {user.role === 'ADMIN' ? 'Administrateur' : 'Utilisateur'}
                </p>
              </div>

              <div className="sm:col-span-3">
                <p className="text-sm font-medium text-gray-500">Date d'inscription</p>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(user.createdAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Demandes */}
        <div className="bg-white shadow sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center">
              <ClipboardDocumentListIcon className="h-5 w-5 mr-2" />
              Demandes de formation
            </h3>
            <div className="mt-6">
              {!user.demandes || user.demandes.length === 0 ? (
                <p className="text-sm text-gray-500">Aucune demande de formation</p>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {user.demandes.map((demande) => {
                    const status = statusConfig[demande.statut as keyof typeof statusConfig];
                    const StatusIcon = status.icon;
                    
                    return (
                      <li key={demande.id} className="py-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{demande.formation?.titre || 'Formation inconnue'}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(demande.createdAt).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                            <StatusIcon className="h-4 w-4 mr-1" />
                            {status.label}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Devis */}
        <div className="bg-white shadow sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center">
              <DocumentTextIcon className="h-5 w-5 mr-2" />
              Devis
            </h3>
            <div className="mt-6">
              {!user.devis || user.devis.length === 0 ? (
                <p className="text-sm text-gray-500">Aucun devis</p>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {user.devis.map((devis) => {
                    const status = statusConfig[devis.statut as keyof typeof statusConfig];
                    const StatusIcon = status.icon;
                    
                    return (
                      <li key={devis.id} className="py-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Devis #{devis.numero}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(devis.createdAt).toLocaleDateString('fr-FR')} - {devis.montant?.toLocaleString('fr-FR') || '0'} €
                            </p>
                          </div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                            <StatusIcon className="h-4 w-4 mr-1" />
                            {status.label}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Contrats */}
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center">
              <DocumentDuplicateIcon className="h-5 w-5 mr-2" />
              Contrats
            </h3>
            <div className="mt-6">
              {!user.contrats || user.contrats.length === 0 ? (
                <p className="text-sm text-gray-500">Aucun contrat</p>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {user.contrats.map((contrat) => {
                    const status = statusConfig[contrat.statut as keyof typeof statusConfig];
                    const StatusIcon = status.icon;
                    
                    return (
                      <li key={contrat.id} className="py-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              Contrat #{contrat.id.slice(-6)} - Devis #{contrat.devis?.numero || 'N/A'}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(contrat.createdAt).toLocaleDateString('fr-FR')} - {contrat.devis?.montant?.toLocaleString('fr-FR') || '0'} €
                            </p>
                            {contrat.dateDebut && (
                              <p className="text-sm text-gray-500">
                                Du {new Date(contrat.dateDebut).toLocaleDateString('fr-FR')}
                                {contrat.dateFin && ` au ${new Date(contrat.dateFin).toLocaleDateString('fr-FR')}`}
                              </p>
                            )}
                          </div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                            <StatusIcon className="h-4 w-4 mr-1" />
                            {status.label}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 