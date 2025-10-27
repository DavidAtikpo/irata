'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  PlusIcon,
  DocumentIcon,
  PrinterIcon
} from '@heroicons/react/24/outline';

interface Inspection {
  id: string;
  referenceInterne: string;
  typeEquipement: string;
  numeroSerie: string;
  dateFabrication: string;
  dateAchat: string;
  dateMiseEnService: string;
  dateInspectionDetaillee: string;
  etat: string;
  createdAt: string;
  createdBy: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
  };
}

export default function InspectionsListPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<string>('Tous');
  
  // Extraire les types d'équipements uniques depuis les inspections
  const equipmentTypes = ['Tous', ...Array.from(new Set(inspections.map(inspection => inspection.typeEquipement).filter(Boolean)))];

  useEffect(() => {
    const loadInspections = async () => {
      try {
        const response = await fetch('/api/admin/equipment-detailed-inspections');
        if (response.ok) {
          const data = await response.json();
          setInspections(data);
        } else {
          setError('Erreur lors du chargement des inspections');
        }
      } catch (error) {
        setError('Erreur lors du chargement des inspections');
      } finally {
        setIsLoading(false);
      }
    };

    if (status === 'authenticated') {
      loadInspections();
    }
  }, [status]);

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
    router.push('/');
    return null;
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette inspection ?')) {
      return;
    }

    setDeleteId(id);
    try {
      const response = await fetch(`/api/admin/equipment-detailed-inspections/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setInspections(prev => prev.filter(inspection => inspection.id !== id));
      } else {
        setError('Erreur lors de la suppression de l\'inspection');
      }
    } catch (error) {
      setError('Erreur lors de la suppression de l\'inspection');
    } finally {
      setDeleteId(null);
    }
  };

  const handleDuplicate = async (inspection: Inspection) => {
    try {
      // Récupérer les données complètes de l'inspection
      const response = await fetch(`/api/admin/equipment-detailed-inspections/${inspection.id}`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération de l\'inspection');
      }
      
      const data = await response.json();
      
      // Supprimer l'id et les champs générés automatiquement
      const { id, createdAt, updatedAt, createdBy, ...inspectionData } = data;
      
      // Créer une nouvelle inspection avec les données dupliquées
      const createResponse = await fetch('/api/admin/equipment-detailed-inspections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inspectionData),
      });

      if (createResponse.ok) {
        const newInspection = await createResponse.json();
        // Rediriger vers la page d'édition de la nouvelle inspection
        router.push(`/admin/equipment-detailed-inspections/${newInspection.id}/edit`);
      } else {
        setError('Erreur lors de la duplication de l\'inspection');
      }
    } catch (error) {
      setError('Erreur lors de la duplication de l\'inspection');
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  const isInspectionUpToDate = (dateInspectionDetaillee: string) => {
    if (!dateInspectionDetaillee) return false;
    
    let inspectionDate: Date;
    // Parser la date selon le format JJ/MM/AAAA
    if (dateInspectionDetaillee.includes('/')) {
      const parts = dateInspectionDetaillee.split('/');
      if (parts.length === 3) {
        inspectionDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
      } else {
        inspectionDate = new Date(dateInspectionDetaillee);
      }
    } else {
      inspectionDate = new Date(dateInspectionDetaillee);
    }
    
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    return inspectionDate >= sixMonthsAgo;
  };

  // Filtrer les inspections par type d'équipement
  const filteredInspections = selectedTab === 'Tous' 
    ? inspections 
    : inspections.filter(inspection => inspection.typeEquipement === selectedTab);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des inspections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900">
                Inspections Détaillées d'Équipements
              </h1>
              <button
                onClick={() => router.push('/admin/equipment-detailed-inspections/nouveau')}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Nouvelle inspection
              </button>
            </div>
            
            {/* Onglets de filtrage */}
            <div className="flex flex-wrap gap-2">
              {equipmentTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedTab(type)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedTab === type
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type}
                </button>
              ))}
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
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune inspection trouvée</h3>
                <p className="text-gray-500 mb-4">
                  {selectedTab === 'Tous' 
                    ? 'Commencez par créer votre première inspection d\'équipement.'
                    : `Aucune inspection trouvée pour le type "${selectedTab}".`
                  }
                </p>
                {selectedTab === 'Tous' && (
                  <button
                    onClick={() => router.push('/admin/equipment-detailed-inspections/nouveau')}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Créer une inspection
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Équipement
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        État
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredInspections.map((inspection) => (
                      <tr key={inspection.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {inspection.referenceInterne || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {inspection.typeEquipement || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {inspection.etat === 'OK' && isInspectionUpToDate(inspection.dateInspectionDetaillee) ? (
                            <img 
                              src="/picto-OK.jpg" 
                              alt="État valide" 
                              className="h-8 w-8 object-contain"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <img 
                              src="/invalide.png" 
                              alt="État invalide" 
                              className="h-8 w-8 object-contain"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => router.push(`/admin/equipment-detailed-inspections/${inspection.id}/view`)}
                              className="text-indigo-600 hover:text-indigo-900 p-1"
                              title="Voir l'inspection"
                            >
                              Voir
                            </button>
                            <button
                              onClick={() => router.push(`/admin/equipment-detailed-inspections/${inspection.id}/edit`)}
                              className="text-yellow-600 hover:text-yellow-900 p-1"
                              title="Modifier l'inspection"
                            >
                              Modifier
                            </button>
                            <button
                              onClick={() => handleDuplicate(inspection)}
                              className="text-blue-600 hover:text-blue-900 p-1"
                              title="Dupliquer l'inspection"
                            >
                              Dupliquer
                            </button>
                            <button
                              onClick={() => handleDelete(inspection.id)}
                              disabled={deleteId === inspection.id}
                              className="text-red-600 hover:text-red-900 p-1 disabled:opacity-50"
                              title="Supprimer l'inspection"
                            >
                              Supprimer
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}