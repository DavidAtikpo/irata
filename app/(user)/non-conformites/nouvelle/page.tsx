'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const typeOptions = [
  { value: 'SECURITE', label: 'Sécurité' },
  { value: 'QUALITE', label: 'Qualité' },
  { value: 'PROCEDURE', label: 'Procédure' },
  { value: 'EQUIPEMENT', label: 'Équipement' },
  { value: 'FORMATION', label: 'Formation' },
  { value: 'DOCUMENTATION', label: 'Documentation' },
  { value: 'ENVIRONNEMENT', label: 'Environnement' },
  { value: 'AUTRE', label: 'Autre' }
];

const graviteOptions = [
  { value: 'MINEURE', label: 'Mineure', description: 'Impact limité, correction simple' },
  { value: 'MAJEURE', label: 'Majeure', description: 'Impact significatif, nécessite une action corrective' },
  { value: 'CRITIQUE', label: 'Critique', description: 'Impact grave, action immédiate requise' }
];

export default function NouvelleNonConformitePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    type: '',
    gravite: '',
    lieu: '',
    responsableId: '',
    dateEcheance: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.titre || !formData.description || !formData.type || !formData.gravite) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/user/non-conformites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        router.push(`/non-conformites/${result.nonConformite.id}`);
      } else {
        const error = await response.json();
        alert(error.message || 'Erreur lors de la création de la non-conformité');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la création de la non-conformité');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={() => router.back()}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Déclarer une non-conformité</h1>
          </div>
          <p className="text-gray-600">
            Remplissez le formulaire ci-dessous pour déclarer une nouvelle non-conformité.
          </p>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-lg shadow">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Titre */}
            <div>
              <label htmlFor="titre" className="block text-sm font-medium text-gray-700 mb-2">
                Titre de la non-conformité *
              </label>
              <input
                type="text"
                id="titre"
                name="titre"
                value={formData.titre}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Ex: Équipement de sécurité défaillant"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description détaillée *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Décrivez en détail la non-conformité observée, les circonstances, les personnes impliquées, etc."
                required
              />
            </div>

            {/* Type et Gravité */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                  Type de non-conformité *
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">Sélectionnez un type</option>
                  {typeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="gravite" className="block text-sm font-medium text-gray-700 mb-2">
                  Gravité *
                </label>
                <select
                  id="gravite"
                  name="gravite"
                  value={formData.gravite}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">Sélectionnez une gravité</option>
                  {graviteOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {formData.gravite && (
                  <p className="mt-1 text-sm text-gray-500">
                    {graviteOptions.find(opt => opt.value === formData.gravite)?.description}
                  </p>
                )}
              </div>
            </div>

            {/* Lieu */}
            <div>
              <label htmlFor="lieu" className="block text-sm font-medium text-gray-700 mb-2">
                Lieu de la non-conformité
              </label>
              <input
                type="text"
                id="lieu"
                name="lieu"
                value={formData.lieu}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Ex: Atelier de formation, Zone de pratique, etc."
              />
            </div>

            {/* Date d'échéance */}
            <div>
              <label htmlFor="dateEcheance" className="block text-sm font-medium text-gray-700 mb-2">
                Date d'échéance souhaitée
              </label>
              <input
                type="date"
                id="dateEcheance"
                name="dateEcheance"
                value={formData.dateEcheance}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                min={new Date().toISOString().split('T')[0]}
              />
              <p className="mt-1 text-sm text-gray-500">
                Date limite souhaitée pour la résolution de cette non-conformité
              </p>
            </div>

            {/* Informations sur le déclarant */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Informations du déclarant</h3>
              <div className="text-sm text-gray-600">
                <p><strong>Nom:</strong> {session?.user?.nom || 'Non renseigné'}</p>
                <p><strong>Prénom:</strong> {session?.user?.prenom || 'Non renseigné'}</p>
                <p><strong>Email:</strong> {session?.user?.email}</p>
                <p><strong>Date de déclaration:</strong> {new Date().toLocaleDateString('fr-FR')}</p>
              </div>
            </div>

            {/* Boutons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Création...' : 'Déclarer la non-conformité'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
