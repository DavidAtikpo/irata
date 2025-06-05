'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  UserIcon, 
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  XCircleIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  DocumentDuplicateIcon
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
  }[];
  devis: {
    id: string;
    numero: string;
    statut: string;
  }[];
  contrats: {
    id: string;
    statut: string;
  }[];
}

export default function AdminUtilisateursPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/');
    } else if (status === 'authenticated') {
      fetchUsers();
    }
  }, [status, session, router]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des utilisateurs');
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      setError('Erreur lors de la récupération des utilisateurs');
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
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
            <h2 className="text-3xl font-bold text-gray-900">Gestion des utilisateurs</h2>
            <p className="mt-2 text-sm text-gray-600">
              Gérez les utilisateurs de la plateforme
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <input
              type="text"
              placeholder="Rechercher un utilisateur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            />
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <ul className="divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <li key={user.id} className="px-4 py-6 sm:px-6 hover:bg-gray-50 transition-colors duration-150">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center">
                      <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        {user.prenom} {user.nom}
                      </h3>
                      <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role === 'ADMIN' ? 'Administrateur' : 'Utilisateur'}
                      </span>
                    </div>
                    
                    <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <div>
                        <p className="text-sm text-gray-500">
                          <EnvelopeIcon className="h-4 w-4 inline mr-1" />
                          {user.email}
                        </p>
                        {user.telephone && (
                          <p className="text-sm text-gray-500">
                            <PhoneIcon className="h-4 w-4 inline mr-1" />
                            {user.telephone}
                          </p>
                        )}
                      </div>
                      {user.entreprise && (
                        <div>
                          <p className="text-sm text-gray-500">
                            <BuildingOfficeIcon className="h-4 w-4 inline mr-1" />
                            {user.entreprise}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-900 flex items-center">
                          <ClipboardDocumentListIcon className="h-4 w-4 mr-1" />
                          Demandes
                        </h4>
                        <p className="mt-1 text-sm text-gray-500">
                          {user.demandes?.length || 0} demande(s)
                        </p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-900 flex items-center">
                          <DocumentTextIcon className="h-4 w-4 mr-1" />
                          Devis
                        </h4>
                        <p className="mt-1 text-sm text-gray-500">
                          {user.devis?.length || 0} devis
                        </p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-900 flex items-center">
                          <DocumentDuplicateIcon className="h-4 w-4 mr-1" />
                          Contrats
                        </h4>
                        <p className="mt-1 text-sm text-gray-500">
                          {user.contrats?.length || 0} contrat(s)
                        </p>
                      </div>
                    </div>

                    <p className="mt-4 text-sm text-gray-500">
                      <span className="font-medium">Inscrit le:</span> {new Date(user.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>

                  <div className="ml-4 flex-shrink-0">
                    <button
                      onClick={() => router.push(`/admin/utilisateurs/${user.id}`)}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Voir le profil
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
} 