'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  UserIcon, 
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon,
  ShieldCheckIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

type Role = 'USER' | 'ADMIN' | 'GESTIONNAIRE' | 'CONTRIBUTOR' | 'CLIENT';

interface User {
  id: string;
  email: string;
  nom: string | null;
  prenom: string | null;
  phone: string | null;
  role: Role;
  createdAt: string;
  isActive: boolean;
}

const roleLabels: Record<Role, string> = {
  USER: 'Utilisateur',
  ADMIN: 'Administrateur',
  GESTIONNAIRE: 'Gestionnaire',
  CONTRIBUTOR: 'Contributeur',
  CLIENT: 'Client',
};

const roleColors: Record<Role, string> = {
  USER: 'bg-blue-100 text-blue-800',
  ADMIN: 'bg-purple-100 text-purple-800',
  GESTIONNAIRE: 'bg-green-100 text-green-800',
  CONTRIBUTOR: 'bg-yellow-100 text-yellow-800',
  CLIENT: 'bg-gray-100 text-gray-800',
};

export default function RolesManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<Role | 'ALL'>('ALL');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
      setLoading(true);
      const response = await fetch('/api/admin/users/all');
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

  const handleEditRole = (user: User) => {
    setEditingUserId(user.id);
    setEditingRole(user.role);
    setSuccessMessage(null);
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
    setEditingRole(null);
  };

  const handleSaveRole = async (userId: string) => {
    if (!editingRole) return;

    try {
      setSaving(true);
      const response = await fetch(`/api/admin/users/${userId}/update-role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: editingRole }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la mise à jour du rôle');
      }

      // Mettre à jour localement
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: editingRole } : user
      ));

      setSuccessMessage(`Rôle mis à jour avec succès pour ${users.find(u => u.id === userId)?.email}`);
      setEditingUserId(null);
      setEditingRole(null);

      // Effacer le message de succès après 3 secondes
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur lors de la mise à jour du rôle');
      console.error('Erreur:', error);
      setTimeout(() => setError(null), 5000);
    } finally {
      setSaving(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      (user.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (user.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
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
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheckIcon className="h-8 w-8 text-indigo-600" />
            <h2 className="text-3xl font-bold text-gray-900">Gestion des rôles</h2>
          </div>
          <p className="text-sm text-gray-600">
            Gérez les rôles et permissions des utilisateurs de la plateforme
          </p>
        </div>

        {/* Messages de succès/erreur */}
        {successMessage && (
          <div className="mb-4 rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-5 w-5 text-green-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <XCircleIcon className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Filtres et recherche */}
        <div className="bg-white shadow rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Recherche */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Rechercher par nom, prénom ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            {/* Filtre par rôle */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FunnelIcon className="h-5 w-5 text-gray-400" />
              </div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as Role | 'ALL')}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="ALL">Tous les rôles</option>
                {Object.entries(roleLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {Object.entries(roleLabels).map(([role, label]) => {
            const count = users.filter(u => u.role === role).length;
            return (
              <div key={role} className="bg-white rounded-lg shadow p-4">
                <div className="text-sm font-medium text-gray-500">{label}</div>
                <div className="mt-2 text-2xl font-bold text-gray-900">{count}</div>
              </div>
            );
          })}
        </div>

        {/* Liste des utilisateurs */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Utilisateurs ({filteredUsers.length})
            </h3>
          </div>
          
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun utilisateur trouvé</h3>
              <p className="mt-1 text-sm text-gray-500">
                Essayez de modifier vos critères de recherche ou de filtrage.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <li key={user.id} className="px-4 py-5 sm:px-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <UserIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {user.prenom} {user.nom || user.email}
                            </p>
                            {!user.isActive && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                Inactif
                              </span>
                            )}
                          </div>
                          <div className="mt-1 flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <EnvelopeIcon className="h-4 w-4" />
                              {user.email}
                            </span>
                            {user.phone && (
                              <span className="flex items-center gap-1">
                                <PhoneIcon className="h-4 w-4" />
                                {user.phone}
                              </span>
                            )}
                            <span className="text-xs text-gray-400">
                              Inscrit le {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="ml-4 flex items-center gap-3">
                      {editingUserId === user.id ? (
                        <div className="flex items-center gap-2">
                          <select
                            value={editingRole || user.role}
                            onChange={(e) => setEditingRole(e.target.value as Role)}
                            disabled={saving}
                            className="block px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          >
                            {Object.entries(roleLabels).map(([value, label]) => (
                              <option key={value} value={value}>{label}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleSaveRole(user.id)}
                            disabled={saving || editingRole === user.role}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {saving ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Enregistrement...
                              </>
                            ) : (
                              'Enregistrer'
                            )}
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            disabled={saving}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                          >
                            Annuler
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${roleColors[user.role]}`}>
                            {roleLabels[user.role]}
                          </span>
                          <button
                            onClick={() => handleEditRole(user)}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            <PencilIcon className="h-4 w-4 mr-1" />
                            Modifier
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

