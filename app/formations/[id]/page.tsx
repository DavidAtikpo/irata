'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { use } from 'react';

interface Formation {
  id: string;
  titre: string;
  description: string;
  duree: number;
  prix: number;
  niveau: string;
}

export default function FormationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [formation, setFormation] = useState<Formation | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const resolvedParams = use(params);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchFormation();
    }
  }, [status, router, resolvedParams.id]);

  const fetchFormation = async () => {
    try {
      const response = await fetch(`/api/formations/${resolvedParams.id}`);
      if (!response.ok) {
        throw new Error('Formation non trouvée');
      }
      const data = await response.json();
      setFormation(data);
    } catch (error) {
      setError('Erreur lors de la récupération de la formation');
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formation) return;

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/demandes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formationId: formation.id,
          message: message,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création de la demande');
      }

      router.push('/demande/success');
    } catch (error) {
      setError('Erreur lors de la création de la demande');
      console.error('Erreur:', error);
    } finally {
      setSubmitting(false);
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

  if (error || !formation) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-red-600">{error || 'Formation non trouvée'}</h2>
            <Link
              href="/formations"
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Retour aux formations
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h1 className="text-3xl font-bold text-gray-900">{formation.titre}</h1>
            <p className="mt-1 text-sm text-gray-500">
              Durée: {formation.duree} heures • Niveau: {formation.niveau} • Prix: {formation.prix}€
            </p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <div className="prose max-w-none">
              <p className="text-gray-700">{formation.description}</p>
            </div>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                  Message (optionnel)
                </label>
                <div className="mt-1">
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ajoutez un message pour accompagner votre demande..."
                  />
                </div>
              </div>
              {error && (
                <div className="text-red-600 text-sm">{error}</div>
              )}
              <div className="flex justify-end space-x-4">
                <Link
                  href="/formations"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Annuler
                </Link>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {submitting ? 'Envoi en cours...' : 'Demander cette formation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 