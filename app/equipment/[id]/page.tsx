'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { DocumentIcon, QrCodeIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';

interface EquipmentData {
  id: string;
  qrCode: string;
  produit: string;
  referenceInterne: string;
  numeroSerie: string;
  typeEquipement: string;
  normesCertificat: string;
  fabricant: string;
  dateControle: string;
  signataire: string;
  pdfUrl: string;
  rawText: string;
  createdAt: string;
}

export default function EquipmentPage() {
  const params = useParams();
  const qrCode = params.id as string;
  const [equipment, setEquipment] = useState<EquipmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (qrCode) {
      fetchEquipmentData();
    }
  }, [qrCode]);

  const fetchEquipmentData = async () => {
    try {
      const response = await fetch(`/api/equipment/${qrCode}`);
      if (response.ok) {
        const data = await response.json();
        setEquipment(data);
      } else {
        setError('Équipement non trouvé');
      }
    } catch (error) {
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleInspectionForm = () => {
    // Rediriger vers le formulaire d'inspection avec les données pré-remplies
    const formData = {
      qrCode: equipment?.qrCode,
      referenceInterne: equipment?.referenceInterne,
      numeroSerie: equipment?.numeroSerie,
      normesCertificat: equipment?.normesCertificat,
      fabricant: equipment?.fabricant,
      dateControle: equipment?.dateControle,
      signataire: equipment?.signataire,
    };
    
    // Stocker les données dans localStorage pour le formulaire
    localStorage.setItem('equipmentInspectionData', JSON.stringify(formData));
    
    // Rediriger vers le formulaire d'inspection
    window.location.href = '/inspection-form';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des données de l'équipement...</p>
        </div>
      </div>
    );
  }

  if (error || !equipment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <QrCodeIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Équipement non trouvé</h1>
          <p className="text-gray-600">Le code QR "{qrCode}" ne correspond à aucun équipement enregistré.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Fiche d'Équipement
          </h1>
          <p className="text-lg text-gray-600">
            Code QR: <span className="font-mono font-bold text-indigo-600">{equipment.qrCode}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Colonne gauche - Informations de l'équipement */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Informations de l'Équipement
              </h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Produit</label>
                    <p className="mt-1 text-sm text-gray-900">{equipment.produit || 'Non spécifié'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Référence Interne</label>
                    <p className="mt-1 text-sm text-gray-900">{equipment.referenceInterne || 'Non spécifié'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Numéro de Série</label>
                    <p className="mt-1 text-sm text-gray-900">{equipment.numeroSerie || 'Non spécifié'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type d'Équipement</label>
                    <p className="mt-1 text-sm text-gray-900">{equipment.typeEquipement || 'Non spécifié'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Normes & Certificat</label>
                    <p className="mt-1 text-sm text-gray-900">{equipment.normesCertificat || 'Non spécifié'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Fabricant</label>
                    <p className="mt-1 text-sm text-gray-900">{equipment.fabricant || 'Non spécifié'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date de Contrôle</label>
                    <p className="mt-1 text-sm text-gray-900">{equipment.dateControle || 'Non spécifié'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Signataire</label>
                    <p className="mt-1 text-sm text-gray-900">{equipment.signataire || 'Non spécifié'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Actions Disponibles
              </h2>
              
              <div className="space-y-3">
                <button
                  onClick={handleInspectionForm}
                  className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 flex items-center justify-center"
                >
                  <ClipboardDocumentListIcon className="h-5 w-5 mr-2" />
                  Remplir Formulaire d'Inspection
                </button>
                
                {equipment.pdfUrl && (
                  <a
                    href={equipment.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 flex items-center justify-center"
                  >
                    <DocumentIcon className="h-5 w-5 mr-2" />
                    Voir le PDF Original
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Colonne droite - PDF Viewer */}
          {equipment.pdfUrl && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Document Original
              </h2>
              
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <iframe
                  src={equipment.pdfUrl}
                  className="w-full h-96"
                  title="PDF Viewer"
                />
              </div>
            </div>
          )}
        </div>

        {/* Informations supplémentaires */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            📱 Comment utiliser cette fiche ?
          </h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li><strong>1.</strong> Consultez les informations de l'équipement ci-dessus</li>
            <li><strong>2.</strong> Cliquez sur "Remplir Formulaire d'Inspection" pour créer une nouvelle inspection</li>
            <li><strong>3.</strong> Le formulaire se pré-remplira automatiquement avec les données de l'équipement</li>
            <li><strong>4.</strong> Complétez l'inspection et sauvegardez les résultats</li>
            <li><strong>5.</strong> Consultez le PDF original si nécessaire</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
