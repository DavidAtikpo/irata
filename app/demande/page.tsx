'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

interface Formation {
  id: string;
  titre: string;
  description: string;
  duree: string;
  prix: number;
  niveau: string;
}

export default function DemandePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formations, setFormations] = useState<Formation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    formationId: searchParams.get('formation') || '',
    message: '',
  });

  useEffect(() => {
    const fetchFormations = async () => {
      try {
        const response = await fetch('/api/formations');
        if (!response.ok) throw new Error('Erreur lors du chargement des formations');
        const data = await response.json();
        setFormations(data);
      } catch (err) {
        setError('Erreur lors du chargement des formations');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFormations();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    if (!session) {
      router.push('/login?callbackUrl=/demande');
      return;
    }

    try {
      const response = await fetch('/api/demandes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Une erreur est survenue');
      }

      router.push('/demande/success');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Chargement...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-3xl font-bold mb-8">Demande de Formation</h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative mb-6" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="formationId" className="block text-sm font-medium text-gray-700">
                Formation
              </label>
              <select
                id="formationId"
                name="formationId"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={formData.formationId}
                onChange={handleChange}
              >
                <option value="">Sélectionnez une formation</option>
                {formations.map((formation) => (
                  <option key={formation.id} value={formation.id}>
                    {formation.titre} - {formation.niveau} ({formation.prix} €)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                Message (optionnel)
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={formData.message}
                onChange={handleChange}
                placeholder="Précisez vos besoins ou questions..."
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.push('/formations')}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isSubmitting ? 'Envoi en cours...' : 'Envoyer la demande'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 