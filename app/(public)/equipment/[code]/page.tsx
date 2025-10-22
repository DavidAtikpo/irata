'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  CheckCircleIcon, 
  DocumentArrowDownIcon,
  CalendarIcon,
  DocumentTextIcon,
  WrenchScrewdriverIcon,
  ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline';

interface Equipment {
  id: string;
  qrCode: string;
  produit?: string;
  referenceInterne?: string;
  numeroSerie?: string;
  normes?: string;
  fabricant?: string;
  dateControle?: string;
  signataire?: string;
  pdfUrl: string;
  cloudinaryPublicId: string;
  createdBy: {
    id: string;
    nom: string;
    prenom: string;
  };
  createdAt: string;
}

export default function EquipmentViewPage() {
  const params = useParams();
  const router = useRouter();
  const code = params?.code as string;
  
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (code) {
      fetchEquipment();
    }
  }, [code]);

  const fetchEquipment = async () => {
    try {
      const response = await fetch(`/api/equipment/${code}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Équipement non trouvé. Veuillez vérifier le code QR.');
        } else {
          setError('Erreur lors de la récupération de l\'équipement.');
        }
        return;
      }

      const data = await response.json();
      setEquipment(data);
    } catch (error) {
      console.error('Erreur:', error);
      setError('Impossible de charger les données de l\'équipement.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    if (equipment?.pdfUrl) {
      window.open(equipment.pdfUrl, '_blank');
    }
  };

  const handleFillInspectionForm = () => {
    // Rediriger vers le formulaire d'inspection avec les données pré-remplies
    if (equipment) {
      const queryParams = new URLSearchParams({
        qrCode: equipment.qrCode,
        prefill: 'true'
      }).toString();
      
      router.push(`/admin/equipment-detailed-inspections/nouveau?${queryParams}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des données...</p>
        </div>
      </div>
    );
  }

  if (error || !equipment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Erreur</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white shadow-lg mb-4">
            <WrenchScrewdriverIcon className="h-10 w-10 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Fiche Équipement</h1>
          <p className="text-gray-600 mt-2">Centre de Formation CI.DES</p>
        </div>

        {/* Carte de l'équipement */}
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          {/* Badge de vérification */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
            <div className="flex items-center justify-center text-white">
              <CheckCircleIcon className="h-6 w-6 mr-2" />
              <span className="font-semibold">Équipement Vérifié et Enregistré</span>
            </div>
          </div>

          <div className="p-8">
            {/* Informations principales */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {equipment.produit || 'Équipement'}
              </h2>
              {equipment.fabricant && (
                <p className="text-lg text-indigo-600 font-semibold">
                  Fabricant: {equipment.fabricant}
                </p>
              )}
            </div>

            {/* Détails en grille */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {equipment.referenceInterne && (
                <div className="flex items-start space-x-3">
                  <ClipboardDocumentCheckIcon className="h-6 w-6 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Référence interne</p>
                    <p className="text-base text-gray-900 font-mono">{equipment.referenceInterne}</p>
                  </div>
                </div>
              )}

              {equipment.numeroSerie && (
                <div className="flex items-start space-x-3">
                  <DocumentTextIcon className="h-6 w-6 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Numéro de série</p>
                    <p className="text-base text-gray-900 font-mono">{equipment.numeroSerie}</p>
                  </div>
                </div>
              )}

              {equipment.normes && (
                <div className="flex items-start space-x-3">
                  <CheckCircleIcon className="h-6 w-6 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Normes</p>
                    <p className="text-base text-gray-900">{equipment.normes}</p>
                  </div>
                </div>
              )}

              {equipment.dateControle && (
                <div className="flex items-start space-x-3">
                  <CalendarIcon className="h-6 w-6 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Date de contrôle</p>
                    <p className="text-base text-gray-900">{equipment.dateControle}</p>
                  </div>
                </div>
              )}

              {equipment.signataire && (
                <div className="flex items-start space-x-3 md:col-span-2">
                  <DocumentTextIcon className="h-6 w-6 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Signataire</p>
                    <p className="text-base text-gray-900">{equipment.signataire}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start space-x-3 md:col-span-2">
                <CheckCircleIcon className="h-6 w-6 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Code QR</p>
                  <p className="text-base text-gray-900 font-mono">{equipment.qrCode}</p>
                </div>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleDownloadPDF}
                className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                Télécharger la fiche (PDF)
              </button>

              <button
                onClick={handleFillInspectionForm}
                className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-indigo-600 text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                <WrenchScrewdriverIcon className="h-5 w-5 mr-2" />
                Remplir formulaire d'inspection
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Enregistré par {equipment.createdBy.prenom} {equipment.createdBy.nom} le{' '}
              {new Date(equipment.createdAt).toLocaleDateString('fr-FR')} à{' '}
              {new Date(equipment.createdAt).toLocaleTimeString('fr-FR')}
            </p>
          </div>
        </div>

        {/* Information supplémentaire */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <strong>Astuce:</strong> Cliquez sur "Remplir formulaire d'inspection" pour pré-remplir automatiquement 
                le formulaire d'inspection avec les données de cet équipement.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

