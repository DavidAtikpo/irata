'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Formation {
  id: string;
  titre: string;
  description: string;
  duree: string;
  prix: number;
  niveau: string;
}

export default function FormationsPage() {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Chargement...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600">
          <h2 className="text-2xl font-semibold mb-4">{error}</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Nos Formations</h1>
          <p className="text-xl text-gray-600">
            Découvrez notre catalogue de formations professionnelles
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {formations.map((formation) => (
            <div
              key={formation.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{formation.titre}</h2>
                <p className="text-gray-600 mb-4 line-clamp-3">{formation.description}</p>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-500">{formation.duree}</span>
                  <span className="text-sm font-medium text-gray-500">{formation.niveau}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-blue-600">{formation.prix} €</span>
                  <Link
                    href={`/formations/${formation.id}`}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    En savoir plus
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 