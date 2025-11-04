'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface User {
  id: string;
  nom?: string;
  prenom?: string;
  email: string;
}

interface NonConformite {
  id: string;
  numero: string;
  titre: string;
  type: string;
  gravite: string;
  statut: string;
}

const typeLabels = {
  CORRECTION_IMMEDIATE: 'Correction immédiate',
  ACTION_CORRECTIVE: 'Action corrective',
  ACTION_PREVENTIVE: 'Action préventive',
  AMELIORATION_CONTINUE: 'Amélioration continue'
};

const prioriteLabels = {
  BASSE: 'Basse',
  MOYENNE: 'Moyenne',
  HAUTE: 'Haute',
  CRITIQUE: 'Critique'
};

export default function NouvelleActionCorrectivePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const nonConformiteId = searchParams.get('nonConformiteId');

  const [users, setUsers] = useState<User[]>([]);
  const [nonConformite, setNonConformite] = useState<NonConformite | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nonConformiteId: nonConformiteId || '',
    titre: '',
    description: '',
    type: 'ACTION_CORRECTIVE',
    priorite: 'MOYENNE',
    responsableId: '',
    dateEcheance: ''
  });

  useEffect(() => {
    const loadData = async () => {
      await fetchUsers();
      if (nonConformiteId) {
        await fetchNonConformite();
      } else {
        setLoading(false);
      }
    };
    loadData();
  }, [nonConformiteId]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      } else {
        const errorData = await response.json();
        console.error('Erreur lors du chargement des utilisateurs:', response.status, errorData);
        setError(`Erreur ${response.status}: ${errorData.message || 'Erreur inconnue'}`);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
      setError('Erreur de connexion lors du chargement des utilisateurs');
    }
  };

  const fetchNonConformite = async () => {
    try {
      const response = await fetch(`/api/admin/non-conformites/${nonConformiteId}`);
      if (response.ok) {
        const data = await response.json();
        setNonConformite(data);
        setFormData(prev => ({
          ...prev,
          nonConformiteId: data.id,
          titre: `Action corrective pour: ${data.titre}`
        }));
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la non-conformité:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/admin/actions-correctives', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/admin/actions-correctives/${data.actionCorrective.id}`);
      } else {
        const error = await response.json();
        alert(error.message || 'Erreur lors de la création de l\'action corrective');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la création de l\'action corrective');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-2">
        <div className="max-w-3xl mx-auto px-2">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-2">
        <div className="max-w-3xl mx-auto px-2">
          <div className="text-center py-6">
            <h1 className="text-sm font-bold text-gray-900 mb-2">Erreur de chargement</h1>
            <p className="text-red-600 text-[10px] mb-3">{error}</p>
            <Link
              href="/admin/actions-correctives"
              className="bg-indigo-600 text-white px-2 py-1 rounded text-[10px] hover:bg-indigo-700 transition-colors"
            >
              Retour
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-2">
      <div className="max-w-3xl mx-auto px-2">
        {/* Header */}
        <div className="mb-2">
          <div className="flex items-center gap-2 mb-2">
            <Link
              href={nonConformiteId ? `/admin/non-conformites/${nonConformiteId}` : '/admin/actions-correctives'}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-sm font-bold text-gray-900">Nouvelle action corrective</h1>
          </div>
          {nonConformite && (
            <div className="bg-blue-50 border border-blue-200 rounded p-2">
              <h3 className="text-[10px] font-medium text-blue-800 mb-1">NC associée</h3>
              <p className="text-blue-700 text-[9px]">
                <span className="font-medium">{nonConformite.numero}</span> - {nonConformite.titre}
              </p>
            </div>
          )}
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded shadow p-3">
          <form onSubmit={handleSubmit} className="space-y-2">
            <div>
              <label className="block text-[10px] font-medium text-gray-700 mb-1">
                Titre *
              </label>
              <input
                type="text"
                name="titre"
                value={formData.titre}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-2 py-1 text-[10px] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                required
                placeholder="Titre de l'action"
              />
            </div>

            <div>
              <label className="block text-[10px] font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full border border-gray-300 rounded px-2 py-1 text-[10px] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                required
                placeholder="Description..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-medium text-gray-700 mb-1">
                  Type *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-2 py-1 text-[10px] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                >
                  {Object.entries(typeLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-medium text-gray-700 mb-1">
                  Priorité *
                </label>
                <select
                  name="priorite"
                  value={formData.priorite}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-2 py-1 text-[10px] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                >
                  {Object.entries(prioriteLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-medium text-gray-700 mb-1">
                Responsable *
              </label>
              <select
                name="responsableId"
                value={formData.responsableId}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-2 py-1 text-[10px] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                required
              >
                <option value="">Sélectionner...</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.nom && user.prenom ? `${user.prenom} ${user.nom}` : user.email}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-medium text-gray-700 mb-1">
                Date d'échéance
              </label>
              <input
                type="date"
                name="dateEcheance"
                value={formData.dateEcheance}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-2 py-1 text-[10px] focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Link
                href={nonConformiteId ? `/admin/non-conformites/${nonConformiteId}` : '/admin/actions-correctives'}
                className="px-2 py-1 border border-gray-300 rounded text-gray-700 text-[10px] hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                Annuler
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="px-2 py-1 bg-indigo-600 text-white rounded text-[10px] hover:bg-indigo-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Création...' : 'Créer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
