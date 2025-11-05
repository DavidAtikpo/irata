'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  PlusIcon,
  DocumentIcon,
  PrinterIcon,
  QrCodeIcon
} from '@heroicons/react/24/outline';
import { generateSlugFromReference } from '@/lib/slug';

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
  photo: string;
  qrCode?: string;
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

  // Fonction pour obtenir le chemin de visualisation selon le type d'équipement
  const getViewPath = (inspection: Inspection) => {
    const typeEquipement = inspection.typeEquipement?.trim() || '';
    if (typeEquipement === 'Harnais de Suspension' || typeEquipement.toLowerCase().includes('harnais')) {
      return `/admin/equipment-detailed-inspections/harnais/${inspection.id}/view`;
    }
    if (typeEquipement === 'Mousqueton Triple Action' || typeEquipement.toLowerCase().includes('mousqueton')) {
      return `/admin/equipment-detailed-inspections/mousqueton/${inspection.id}/view`;
    }
    return `/admin/equipment-detailed-inspections/${inspection.id}/view`;
  };

  // Fonction pour obtenir le chemin d'édition selon le type d'équipement
  const getEditPath = (inspection: Inspection) => {
    const typeEquipement = inspection.typeEquipement?.trim() || '';
    if (typeEquipement === 'Harnais de Suspension' || typeEquipement.toLowerCase().includes('harnais')) {
      return `/admin/equipment-detailed-inspections/harnais/${inspection.id}/edit`;
    }
    if (typeEquipement === 'Mousqueton Triple Action' || typeEquipement.toLowerCase().includes('mousqueton')) {
      return `/admin/equipment-detailed-inspections/mousqueton/${inspection.id}/edit`;
    }
    return `/admin/equipment-detailed-inspections/${inspection.id}/edit`;
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
        // Rediriger vers la page d'édition de la nouvelle inspection selon le type
        // Utiliser le typeEquipement de l'inspection originale ou de data pour déterminer le chemin
        const typeEquipement = data.typeEquipement || inspection.typeEquipement || newInspection.typeEquipement;
        const inspectionForPath = { ...newInspection, typeEquipement };
        router.push(getEditPath(inspectionForPath));
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

  // Fonction pour obtenir l'URL de l'image QR code
  const getQRCodeImageUrl = (inspection: Inspection): string | null => {
    // 1. Si un QR code est stocké dans la base, l'utiliser en priorité
    if (inspection.qrCode) {
      // Si c'est une data URL (QR code avec CI.DES sauvegardé)
      if (inspection.qrCode.startsWith('data:image/')) {
        return inspection.qrCode;
      }
      
      // Si c'est une URL Cloudinary (ancien format)
      if (inspection.qrCode.startsWith('http://') || inspection.qrCode.startsWith('https://')) {
        return inspection.qrCode;
      }
    }
    
    // 2. Sinon, générer depuis l'ID unique pour garantir l'unicité
    if (inspection.id) {
      const slug = inspection.referenceInterne 
        ? generateSlugFromReference(inspection.referenceInterne) 
        : 'equipement';
      const publicUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}/inspection/${inspection.id}-${slug}` 
        : `/inspection/${inspection.id}-${slug}`;
      
      // Générer l'image QR code depuis l'API basée sur l'ID unique
      return `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(publicUrl)}`;
    }
    
    return null;
  };

  // Filtrer les inspections par type d'équipement
  const filteredInspections = selectedTab === 'Tous' 
    ? inspections 
    : inspections.filter(inspection => inspection.typeEquipement === selectedTab);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-[10px] text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-2 py-2">
        <div className="bg-white shadow rounded">
          <div className="px-2 py-1.5 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
              <h1 className="text-sm font-bold text-gray-900">
                Inspections Équipements
              </h1>
              <div className="flex items-center gap-1 flex-wrap">
                <button
                  onClick={() => router.push('/admin/equipment-detailed-inspections/harnais')}
                  className="inline-flex items-center px-1.5 py-0.5 border border-transparent rounded text-[10px] font-medium text-white bg-green-600 hover:bg-green-700"
                >
                  <PlusIcon className="h-3 w-3 mr-1" />
                  Nouveau Harnais
                </button>
                <button
                  onClick={() => router.push('/admin/equipment-detailed-inspections/mousqueton')}
                  className="inline-flex items-center px-1.5 py-0.5 border border-transparent rounded text-[10px] font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <PlusIcon className="h-3 w-3 mr-1" />
                  Nouveau Mousqueton
                </button>
                <button
                  onClick={() => router.push('/admin/equipment-detailed-inspections/nouveau')}
                  className="inline-flex items-center px-1.5 py-0.5 border border-transparent rounded text-[10px] font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <PlusIcon className="h-3 w-3 mr-1" />
                  Nouvelle inspection
                </button>
              </div>
            </div>
            
            {/* Onglets de filtrage */}
            <div className="flex flex-wrap gap-1">
              {equipmentTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedTab(type)}
                  className={`px-1.5 py-0.5 rounded text-[9px] font-medium transition-colors ${
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

          <div className="p-2">
            {error && (
              <div className="mb-2 bg-red-50 border border-red-200 text-red-700 px-2 py-1 rounded text-[10px]">
                {error}
              </div>
            )}

            {filteredInspections.length === 0 ? (
              <div className="text-center py-6">
                <DocumentIcon className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                <h3 className="text-xs font-medium text-gray-900 mb-1">Aucune inspection</h3>
                <p className="text-[10px] text-gray-500 mb-2">
                  {selectedTab === 'Tous' 
                    ? 'Créez votre première inspection.'
                    : `Aucune inspection pour "${selectedTab}".`
                  }
                </p>
                {selectedTab === 'Tous' && (
                  <button
                    onClick={() => router.push('/admin/equipment-detailed-inspections/nouveau')}
                    className="inline-flex items-center px-2 py-1 border border-transparent rounded text-[10px] font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    <PlusIcon className="h-3 w-3 mr-1" />
                    Créer
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-1.5 py-1 text-left text-[9px] font-medium text-gray-500 uppercase tracking-wider">
                        Photo
                      </th>
                      <th className="px-1.5 py-1 text-left text-[9px] font-medium text-gray-500 uppercase tracking-wider">
                        Équipement
                      </th>
                      <th className="px-1.5 py-1 text-left text-[9px] font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-1.5 py-1 text-left text-[9px] font-medium text-gray-500 uppercase tracking-wider">
                        N° série
                      </th>
                      <th className="px-1.5 py-1 text-left text-[9px] font-medium text-gray-500 uppercase tracking-wider">
                        Inspection (6 mois)
                      </th>
                      <th className="px-1.5 py-1 text-left text-[9px] font-medium text-gray-500 uppercase tracking-wider">
                        État
                      </th>
                      <th className="px-1.5 py-1 text-left text-[9px] font-medium text-gray-500 uppercase tracking-wider">
                        QR Code
                      </th>
                      <th className="px-1.5 py-1 text-right text-[9px] font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredInspections.map((inspection) => (
                      <tr key={inspection.id} className="hover:bg-gray-50">
                        <td className="px-1.5 py-1 whitespace-nowrap">
                          <div className="flex-shrink-0 h-6 w-6">
                            {inspection.photo ? (
                              <img
                                className="h-6 w-6 rounded object-cover border border-gray-200"
                                src={inspection.photo}
                                alt={`Photo de ${inspection.referenceInterne || 'l\'équipement'}`}
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                            ) : null}
                            <div className={`h-6 w-6 rounded bg-gray-100 border border-gray-200 flex items-center justify-center ${inspection.photo ? 'hidden' : ''}`}>
                              <DocumentIcon className="h-3 w-3 text-gray-400" />
                            </div>
                          </div>
                        </td>
                        <td className="px-1.5 py-1 whitespace-nowrap">
                          <div className="text-[9px] font-medium text-gray-900">
                            {inspection.referenceInterne || '-'}
                          </div>
                        </td>
                        <td className="px-1.5 py-1 whitespace-nowrap">
                          <div className="text-[9px] text-gray-900">
                            {inspection.typeEquipement || '-'}
                          </div>
                        </td>
                        <td className="px-1.5 py-1 whitespace-nowrap">
                          <div className="text-[9px] text-gray-900">
                            {inspection.numeroSerie || '-'}
                          </div>
                        </td>
                        <td className="px-1.5 py-1 whitespace-nowrap">
                          <div className="text-[9px] text-gray-900">
                            {formatDate(inspection.dateInspectionDetaillee)}
                          </div>
                        </td>
                        <td className="px-1.5 py-1 whitespace-nowrap">
                          {inspection.etat === 'OK' && isInspectionUpToDate(inspection.dateInspectionDetaillee) ? (
                            <img 
                              src="/picto-OK.jpg" 
                              alt="État valide" 
                              className="h-4 w-4 object-contain"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <img 
                              src="/invalide.png" 
                              alt="État invalide" 
                              className="h-4 w-4 object-contain"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          )}
                        </td>
                        <td className="px-1.5 py-1 whitespace-nowrap">
                          <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center">
                            {(() => {
                              const qrUrl = getQRCodeImageUrl(inspection);
                              if (qrUrl) {
                                return (
                                  <img 
                                    src={qrUrl} 
                                    alt="QR Code" 
                                    className="h-6 w-6 object-contain border border-gray-200 rounded"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                      const icon = e.currentTarget.nextElementSibling;
                                      if (icon) {
                                        (icon as HTMLElement).style.display = 'block';
                                      }
                                    }}
                                  />
                                );
                              }
                              return <QrCodeIcon className="h-3 w-3 text-gray-400" />;
                            })()}
                            <QrCodeIcon className="h-3 w-3 text-gray-400 hidden" />
                          </div>
                        </td>
                        <td className="px-1.5 py-1 whitespace-nowrap text-right text-[9px] font-medium">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => router.push(getViewPath(inspection))}
                              className="text-indigo-600 hover:text-indigo-900 p-0.5 text-[9px]"
                              title="Voir"
                            >
                              Voir
                            </button>
                            <button
                              onClick={() => router.push(getEditPath(inspection))}
                              className="text-yellow-600 hover:text-yellow-900 p-0.5 text-[9px]"
                              title="Modifier"
                            >
                              Modifier
                            </button>
                            <button
                              onClick={() => handleDuplicate(inspection)}
                              className="text-blue-600 hover:text-blue-900 p-0.5 text-[9px]"
                              title="Dupliquer"
                            >
                              Dupliquer
                            </button>
                            <button
                              onClick={() => handleDelete(inspection.id)}
                              disabled={deleteId === inspection.id}
                              className="text-red-600 hover:text-red-900 p-0.5 text-[9px] disabled:opacity-50"
                              title="Supprimer"
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