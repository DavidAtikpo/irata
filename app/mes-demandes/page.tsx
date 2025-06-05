'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Formation {
  id: string;
  titre: string;
  description: string;
  duree: number;
  prix: number;
  niveau: string;
}

interface Demande {
  id: string;
  formationId: string;
  userId: string;
  message: string | null;
  statut: string;
  createdAt: string;
  formation: Formation;
}

export default function MesDemandesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [demandes, setDemandes] = useState<Demande[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchDemandes();
    }
  }, [status, router]);

  const fetchDemandes = async () => {
    try {
      const response = await fetch('/api/demandes');
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des demandes');
      }
      const data = await response.json();
      setDemandes(data);
    } catch (error) {
      setError('Erreur lors de la récupération des demandes');
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
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
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Mes demandes de formation</h2>
          <p className="mt-2 text-gray-600">Consultez l'état de vos demandes de formation</p>
        </div>

        {demandes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Vous n'avez pas encore fait de demande de formation</p>
            <Link
              href="/formations"
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Voir les formations disponibles
            </Link>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {demandes.map((demande) => (
                <li key={demande.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {demande.formation.titre}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Durée: {demande.formation.duree} heures • Niveau: {demande.formation.niveau}
                        </p>
                        {demande.message && (
                          <p className="mt-2 text-sm text-gray-600">
                            Message: {demande.message}
                          </p>
                        )}
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            demande.statut === 'EN_ATTENTE'
                              ? 'bg-yellow-100 text-yellow-800'
                              : demande.statut === 'VALIDE'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {demande.statut === 'EN_ATTENTE'
                            ? 'En attente'
                            : demande.statut === 'VALIDE'
                            ? 'Validée'
                            : 'Refusée'}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      Demandée le {new Date(demande.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
} 