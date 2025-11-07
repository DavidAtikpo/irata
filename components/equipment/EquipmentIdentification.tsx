import React, { useRef } from 'react';
import { PhotoIcon, QrCodeIcon, DocumentIcon } from '@heroicons/react/24/outline';

interface EquipmentIdentificationProps {
  formData: any;
  setFormData: (data: any) => void;
}

export default function EquipmentIdentification({ formData, setFormData }: EquipmentIdentificationProps) {
  const photoInputRef = useRef<HTMLInputElement>(null);
  const qrInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const dateAchatInputRef = useRef<HTMLInputElement>(null);
  const signatureInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Identification équipement
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Référence Interne */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Référence interne *
            </label>
            <input
              type="text"
              value={formData.referenceInterne}
              onChange={(e) => handleChange('referenceInterne', e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          {/* Numéro de série */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              N° de série
            </label>
            <input
              type="text"
              value={formData.numeroSerie}
              onChange={(e) => handleChange('numeroSerie', e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Date de Fabrication */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Date de Fabrication
            </label>
            <input
              type="text"
              value={formData.dateFabrication}
              onChange={(e) => handleChange('dateFabrication', e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="MM/AAAA"
            />
          </div>

          {/* Date d'Achat */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Date d'Achat
            </label>
            <input
              type="text"
              value={formData.dateAchat}
              onChange={(e) => handleChange('dateAchat', e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="DD/MM/AAAA"
            />
          </div>

          {/* Date de mise en service */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Date de mise en service
            </label>
            <input
              type="date"
              value={formData.dateMiseEnService}
              onChange={(e) => handleChange('dateMiseEnService', e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Date Inspection Détaillée */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Inspection Détaillée (tous les 6 mois)
            </label>
            <input
              type="text"
              value={formData.dateInspectionDetaillee}
              onChange={(e) => handleChange('dateInspectionDetaillee', e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="DD/MM/AAAA"
            />
          </div>

          {/* N° de kit */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              N° de kit
            </label>
            <input
              type="text"
              value={formData.numeroKit}
              onChange={(e) => handleChange('numeroKit', e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Taille */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Taille
            </label>
            <input
              type="text"
              value={formData.taille}
              onChange={(e) => handleChange('taille', e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Longueur */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Longueur
            </label>
            <input
              type="text"
              value={formData.longueur}
              onChange={(e) => handleChange('longueur', e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Normes et Certificat */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Normes et Certificat de conformité
            </label>
            <input
              type="text"
              value={formData.normesCertificat}
              onChange={(e) => handleChange('normesCertificat', e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Ex: EN 361:2002"
            />
          </div>

          {/* Documents Référence */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Documents Référence
            </label>
            <input
              type="text"
              value={formData.documentsReference}
              onChange={(e) => handleChange('documentsReference', e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Consommation */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Consommation
            </label>
            <input
              type="text"
              value={formData.consommation}
              onChange={(e) => handleChange('consommation', e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Attribution */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Attribution
            </label>
            <input
              type="text"
              value={formData.attribution}
              onChange={(e) => handleChange('attribution', e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Commentaire */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Commentaire
            </label>
            <textarea
              value={formData.commentaire}
              onChange={(e) => handleChange('commentaire', e.target.value)}
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Photo upload */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Photo de l'équipement
          </label>
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <PhotoIcon className="h-5 w-5 mr-2" />
              Télécharger une photo
            </button>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                // Handle photo upload
                console.log('Photo uploaded:', e.target.files);
              }}
            />
            {formData.photo && (
              <img
                src={formData.photo}
                alt="Photo"
                className="h-16 w-16 object-cover rounded"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

