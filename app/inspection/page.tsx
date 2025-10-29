'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { generateSlugFromReference } from '@/lib/slug';
import { PhotoIcon, DocumentIcon } from '@heroicons/react/24/outline';

interface Inspection {
  id: string;
  referenceInterne: string;
  typeEquipement: string;
  numeroSerie: string | null;
  etat: string;
  photo: string | null;
  qrCode: string | null;
  createdAt: string;
}

export default function PublicInspectionsListPage() {
  const router = useRouter();
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadInspections = async () => {
      try {
        const response = await fetch('/api/public/inspections');
        if (response.ok) {
          const data = await response.json();
          setInspections(data);
        } else {
          setError('Erreur lors du chargement des équipements');
        }
      } catch (error) {
        setError('Erreur lors du chargement des équipements');
      } finally {
        setIsLoading(false);
      }
    };

    loadInspections();
  }, []);

  // Filtrer les inspections par recherche
  const filteredInspections = inspections.filter(inspection => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      inspection.referenceInterne?.toLowerCase().includes(search) ||
      inspection.typeEquipement?.toLowerCase().includes(search) ||
      inspection.numeroSerie?.toLowerCase().includes(search)
    );
  });

  const handleInspectionClick = (inspection: Inspection) => {
    const slug = generateSlugFromReference(inspection.referenceInterne);
    router.push(`/inspection/${slug}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des équipements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Liste des Équipements - Inspections
            </h1>
            
            {/* Barre de recherche */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Rechercher par référence, type ou numéro de série..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {filteredInspections.length === 0 ? (
              <div className="text-center py-12">
                <DocumentIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? 'Aucun équipement trouvé' : 'Aucun équipement disponible'}
                </h3>
                <p className="text-gray-500">
                  {searchTerm 
                    ? 'Essayez avec d\'autres mots-clés'
                    : 'Aucun équipement enregistré pour le moment.'
                  }
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredInspections.map((inspection) => (
                  <div
                    key={inspection.id}
                    onClick={() => handleInspectionClick(inspection)}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
                  >
                    <div className="flex items-start space-x-4">
                      {/* Photo */}
                      <div className="flex-shrink-0">
                        <div className="h-20 w-20 rounded-lg border border-gray-200 overflow-hidden bg-gray-100">
                          {inspection.photo ? (
                            <img
                              src={inspection.photo}
                              alt={inspection.referenceInterne}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <div className={`h-full w-full flex items-center justify-center ${inspection.photo ? 'hidden' : ''}`}>
                            <PhotoIcon className="h-8 w-8 text-gray-400" />
                          </div>
                        </div>
                      </div>

                      {/* Informations */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">
                          {inspection.referenceInterne}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {inspection.typeEquipement}
                        </p>
                        {inspection.numeroSerie && (
                          <p className="text-xs text-gray-400 mt-1">
                            S/N: {inspection.numeroSerie}
                          </p>
                        )}
                        <div className="mt-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            inspection.etat === 'OK'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {inspection.etat === 'OK' ? 'Valide' : 'Invalide'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
