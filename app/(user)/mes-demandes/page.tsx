'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Demande {
  id: string;
  userId: string;
  statut: string;
  session: string;
  message: string | null;
  commentaire: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function MesDemandesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [demandes, setDemandes] = useState<Demande[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchDemandes();
    }
  }, [status]);

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

  if (loading) {
    return (
      <div className="py-12 px-4 sm:px-6 lg:px-8">
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
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-red-600">{error}</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 sm:py-8 lg:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Mes demandes de formation</h2>
          <p className="mt-2 text-sm sm:text-base text-gray-600">Consultez l'état de vos demandes de formation</p>
        </div>

        {demandes.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <p className="text-sm sm:text-base text-gray-600">Vous n'avez pas encore fait de demande de formation</p>
            <Link
              href="/demande"
              className="mt-4 inline-flex items-center px-3 sm:px-4 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
            >
              Faire une demande de formation
            </Link>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden rounded-lg">
            <ul className="divide-y divide-gray-200">
              {demandes.map((demande) => (
                <li key={demande.id} className="hover:bg-gray-50 transition-colors duration-200">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-medium text-gray-900 truncate">
                          Formation Cordiste IRATA - {demande.session}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Session: {demande.session}
                        </p>
                        {demande.message && (
                          <p className="mt-2 text-sm text-gray-600">
                            Message: {demande.message}
                          </p>
                        )}
                        {demande.commentaire && (
                          <p className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                            <strong>Commentaire de l'administrateur:</strong> {demande.commentaire}
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
                              : demande.statut === 'REFUSE'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {demande.statut === 'EN_ATTENTE'
                            ? 'En attente'
                            : demande.statut === 'VALIDE'
                            ? 'Validée'
                            : demande.statut === 'REFUSE'
                            ? 'Refusée'
                            : demande.statut === 'ANNULE'
                            ? 'Annulée'
                            : demande.statut}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      Demandée le {new Date(demande.createdAt).toLocaleDateString('fr-FR')}
                      {demande.updatedAt !== demande.createdAt && (
                        <span className="ml-2">
                          • Mise à jour le {new Date(demande.updatedAt).toLocaleDateString('fr-FR')}
                        </span>
                      )}
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