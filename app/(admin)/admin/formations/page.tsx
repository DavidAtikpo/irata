'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Formation {
  id: string;
  titre: string;
  description: string;
  duree: string;
  prix: number;
  niveau: string;
}

export default function AdminFormationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [formations, setFormations] = useState<Formation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFormation, setEditingFormation] = useState<Formation | null>(null);
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    duree: '',
    prix: '',
    niveau: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/');
    } else if (status === 'authenticated') {
      fetchFormations();
    }
  }, [status, session, router]);

  const fetchFormations = async () => {
    try {
      const response = await fetch('/api/admin/formations');
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des formations');
      }
      const data = await response.json();
      setFormations(data);
    } catch (error) {
      setError('Erreur lors de la récupération des formations');
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingFormation
        ? `/api/admin/formations/${editingFormation.id}`
        : '/api/admin/formations';
      
      const response = await fetch(url, {
        method: editingFormation ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          prix: parseFloat(formData.prix),
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la sauvegarde de la formation');
      }

      await fetchFormations();
      setIsModalOpen(false);
      setEditingFormation(null);
      setFormData({
        titre: '',
        description: '',
        duree: '',
        prix: '',
        niveau: '',
      });
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur lors de la sauvegarde de la formation');
    }
  };

  const handleEdit = (formation: Formation) => {
    setEditingFormation(formation);
    setFormData({
      titre: formation.titre,
      description: formation.description,
      duree: formation.duree,
      prix: formation.prix.toString(),
      niveau: formation.niveau,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette formation ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/formations/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression de la formation');
      }

      await fetchFormations();
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur lors de la suppression de la formation');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900">Chargement...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-red-600">{error}</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Gestion des formations</h2>
            <p className="mt-2 text-gray-600">Gérez les formations disponibles</p>
          </div>
          <button
            onClick={() => {
              setEditingFormation(null);
              setFormData({
                titre: '',
                description: '',
                duree: '',
                prix: '',
                niveau: '',
              });
              setIsModalOpen(true);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Ajouter une formation
          </button>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {formations.map((formation) => (
              <li key={formation.id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-gray-900 truncate">
                      {formation.titre}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {formation.description}
                    </p>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <span className="mr-4">Durée: {formation.duree}</span>
                      <span className="mr-4">Niveau: {formation.niveau}</span>
                      <span>Prix: {formation.prix}€</span>
                    </div>
                  </div>
                  <div className="ml-4 flex-shrink-0 flex space-x-2">
                    <button
                      onClick={() => handleEdit(formation)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(formation.id)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingFormation ? 'Modifier la formation' : 'Ajouter une formation'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="titre" className="block text-sm font-medium text-gray-700">
                    Titre
                  </label>
                  <input
                    type="text"
                    id="titre"
                    value={formData.titre}
                    onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label htmlFor="duree" className="block text-sm font-medium text-gray-700">
                      Durée
                    </label>
                    <input
                      type="text"
                      id="duree"
                      value={formData.duree}
                      onChange={(e) => setFormData({ ...formData, duree: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="prix" className="block text-sm font-medium text-gray-700">
                      Prix (€)
                    </label>
                    <input
                      type="number"
                      id="prix"
                      value={formData.prix}
                      onChange={(e) => setFormData({ ...formData, prix: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="niveau" className="block text-sm font-medium text-gray-700">
                      Niveau
                    </label>
                    <select
                      id="niveau"
                      value={formData.niveau}
                      onChange={(e) => setFormData({ ...formData, niveau: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      required
                    >
                      <option value="">Sélectionner un niveau</option>
                      <option value="Débutant">Débutant</option>
                      <option value="Intermédiaire">Intermédiaire</option>
                      <option value="Avancé">Avancé</option>
                    </select>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm"
                  >
                    {editingFormation ? 'Modifier' : 'Ajouter'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingFormation(null);
                    }}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                  >
                    Annuler
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