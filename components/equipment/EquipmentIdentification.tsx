import React, { useRef } from 'react';
import { PhotoIcon, QrCodeIcon, DocumentIcon, CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface EquipmentIdentificationProps {
  formData: any;
  setFormData: (data: any) => void;
  onPhotoUpload?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onQRCodeUpload?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onPDFUpload?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDateAchatUpload?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDocumentsUpload?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isUploading?: boolean;
  isUploadingPDF?: boolean;
  isUploadingDateAchat?: boolean;
  isUploadingDocuments?: boolean;
  calculateNextInspectionDate?: () => string;
  updateEtatBasedOnInspectionDate?: (date: string) => void;
}

export default function EquipmentIdentification({ 
  formData, 
  setFormData,
  onPhotoUpload,
  onQRCodeUpload,
  onPDFUpload,
  onDateAchatUpload,
  onDocumentsUpload,
  isUploading = false,
  isUploadingPDF = false,
  isUploadingDateAchat = false,
  isUploadingDocuments = false,
  calculateNextInspectionDate,
  updateEtatBasedOnInspectionDate,
}: EquipmentIdentificationProps) {
  const photoInputRef = useRef<HTMLInputElement>(null);
  const qrInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const dateAchatInputRef = useRef<HTMLInputElement>(null);
  const documentsInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg" dir="ltr">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Identification équipement
      </h2>
      
      {/* Photo et État */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Photo
          </label>
          <div 
            className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-indigo-400 transition-colors"
            onClick={() => photoInputRef.current?.click()}
          >
            {formData.photo ? (
              <img src={formData.photo} alt="Équipement" className="max-w-full h-50 object-cover rounded" />
            ) : (
              <div className="text-gray-400">
                <PhotoIcon className="h-8 w-8 mx-auto mb-2" />
                <div className="text-sm">Cliquez pour ajouter une photo</div>
              </div>
            )}
          </div>
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            onChange={onPhotoUpload}
            className="hidden"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            État
          </label>
          <div className={`flex items-center justify-center h-20 rounded-lg ${
            formData.etat === 'OK' 
              ? 'bg-green-100' 
              : 'bg-red-100'
          }`}>
            {formData.etat === 'OK' ? (
              <div className="text-center">
                <img 
                  src="/picto-OK.jpg" 
                  alt="État valide" 
                  className="h-50 max-w-50 mx-auto mb-1 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                    if (nextElement) {
                      nextElement.style.display = 'block';
                    }
                  }}
                />
                <CheckCircleIcon 
                  className="h-8 w-12 text-green-600 mx-auto mb-1 hidden" 
                  style={{ display: 'none' }}
                />
                <div className="text-xs font-medium text-green-800">Valide</div>
              </div>
            ) : (
              <div className="text-center">
                <img 
                  src="/invalide.png" 
                  alt="État invalide" 
                  className="h-50 max-w-full mx-auto mb-1 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                    if (nextElement) {
                      nextElement.style.display = 'block';
                    }
                  }}
                />
                <XMarkIcon 
                  className="h-8 w-8 text-red-600 mx-auto mb-1 hidden" 
                  style={{ display: 'none' }}
                />
                <div className="text-xs font-medium text-red-800">Invalide</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* QR Code */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          QR Code (Auto-remplissage)
        </label>
        <div 
          className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-indigo-400 transition-colors"
          onClick={() => qrInputRef.current?.click()}
        >
          {formData.qrCode ? (
            <img src={formData.qrCode} alt="QR Code" className="max-w-full h-24 object-contain rounded" />
          ) : (
            <div className="text-gray-400">
              <QrCodeIcon className="h-8 w-8 mx-auto mb-2" />
              <div className="text-sm">Cliquez pour scanner le QR code</div>
              <div className="text-xs text-gray-500 mt-1">Auto-remplira les données</div>
            </div>
          )}
        </div>
        <input
          ref={qrInputRef}
          type="file"
          accept="image/*"
          onChange={onQRCodeUpload}
          className="hidden"
        />
      </div>

      {/* Champs d'identification */}
      <div className="space-y-4" dir="ltr">
        <div>
          <label htmlFor="referenceInterne" className="block text-sm font-medium text-gray-700">
            Référence interne
          </label>
          <input
            type="text"
            id="referenceInterne"
            name="referenceInterne"
            value={formData.referenceInterne}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          />
        </div>

        <div>
          <label htmlFor="typeEquipement" className="block text-sm font-medium text-gray-700">
            Type d'équipement
          </label>
          <input
            type="text"
            id="typeEquipement"
            name="typeEquipement"
            value={formData.typeEquipement}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="fabricant" className="block text-sm font-medium text-gray-700">
            Fabricant
          </label>
          <input
            type="text"
            id="fabricant"
            name="fabricant"
            value={formData.fabricant || ''}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-blue-50"
            placeholder="Ex: Petzl Distribution, Crolles (France)"
          />
        </div>

        <div>
          <label htmlFor="numeroSerie" className="block text-sm font-medium text-gray-700">
            Numéro de série
          </label>
          <input
            type="text"
            id="numeroSerie"
            name="numeroSerie"
            value={formData.numeroSerie}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="dateFabrication" className="block text-sm font-medium text-gray-700">
            Date de Fabrication
          </label>
          <input
            type="text"
            id="dateFabrication"
            name="dateFabrication"
            value={formData.dateFabrication}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="dateAchat" className="block text-sm font-medium text-gray-700">
            Date d'Achat
          </label>
          <div className="mt-1 flex space-x-2">
            <input
              type="text"
              id="dateAchat"
              name="dateAchat"
              value={formData.dateAchat}
              onChange={handleChange}
              className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-yellow-50"
              placeholder="Ex: 2022-03-15"
            />
            {onDateAchatUpload && (
              <>
                <button
                  type="button"
                  onClick={() => dateAchatInputRef.current?.click()}
                  disabled={isUploadingDateAchat}
                  className={`inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium ${
                    isUploadingDateAchat 
                      ? 'text-gray-400 bg-gray-100 cursor-not-allowed' 
                      : 'text-gray-700 bg-white hover:bg-gray-50'
                  }`}
                  title={isUploadingDateAchat ? "Upload en cours..." : "Uploader une image/PDF pour extraire la date d'achat"}
                >
                  {isUploadingDateAchat ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  ) : (
                    <PhotoIcon className="h-4 w-4" />
                  )}
                </button>
                <input
                  ref={dateAchatInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={onDateAchatUpload}
                  className="hidden"
                />
              </>
            )}
          </div>
          {onDateAchatUpload && (
            <p className="mt-1 text-xs text-gray-500">
              Uploader une image/PDF pour extraire automatiquement la date d'achat
            </p>
          )}
        </div>

        <div>
          <label htmlFor="dateMiseEnService" className="block text-sm font-medium text-gray-700">
            Date de mise en service
          </label>
          <input
            type="date"
            id="dateMiseEnService"
            name="dateMiseEnService"
            value={formData.dateMiseEnService}
            onChange={(e) => {
              const value = e.target.value;
              setFormData((prev: any) => ({
                ...prev,
                dateMiseEnService: value,
                inspectionData: {
                  ...prev.inspectionData,
                  antecedentProduit: {
                    ...prev.inspectionData?.antecedentProduit || {},
                    miseEnService: value
                  }
                }
              }));
            }}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="dateInspectionDetaillee" className="block text-sm font-medium text-gray-700">
            Inspection Détaillée (tous les 6 mois)
          </label>
          <div className="mt-1 flex space-x-2">
            <input
              type="text"
              id="dateInspectionDetaillee"
              name="dateInspectionDetaillee"
              value={formData.dateInspectionDetaillee}
              onChange={(e) => {
                const value = e.target.value;
                setFormData((prev: any) => ({ ...prev, dateInspectionDetaillee: value }));
                if (updateEtatBasedOnInspectionDate) {
                  updateEtatBasedOnInspectionDate(value);
                }
              }}
              className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-yellow-50"
              placeholder="Date de la prochaine inspection"
            />
            {calculateNextInspectionDate && (
              <button
                type="button"
                onClick={() => {
                  const nextDate = calculateNextInspectionDate();
                  setFormData((prev: any) => ({ ...prev, dateInspectionDetaillee: nextDate }));
                  if (updateEtatBasedOnInspectionDate) {
                    updateEtatBasedOnInspectionDate(nextDate);
                  }
                }}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                title="Calculer automatiquement (6 mois)"
              >
                <span className="text-xs">+6 mois</span>
              </button>
            )}
          </div>
          {calculateNextInspectionDate && (
            <p className="mt-1 text-xs text-gray-500">
              Calcul automatique de la prochaine inspection
            </p>
          )}
        </div>

        <div>
          <label htmlFor="numeroKit" className="block text-sm font-medium text-gray-700">
            n° de kit
          </label>
          <input
            type="text"
            id="numeroKit"
            name="numeroKit"
            value={formData.numeroKit}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="taille" className="block text-sm font-medium text-gray-700">
            Taille
          </label>
          <input
            type="text"
            id="taille"
            name="taille"
            value={formData.taille}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="longueur" className="block text-sm font-medium text-gray-700">
            Longueur
          </label>
          <input
            type="text"
            id="longueur"
            name="longueur"
            value={formData.longueur}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="normesCertificat" className="block text-sm font-medium text-gray-700">
            Normes et Certificat de conformité
          </label>
          <div className="mt-1 flex space-x-2">
            <input
              type="text"
              id="normesCertificat"
              name="normesCertificat"
              value={formData.normesCertificat}
              onChange={handleChange}
              className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Ex: EN1249: 2012 EN 397: 2012+A1:2012"
            />
            {onPDFUpload && (
              <>
                <button
                  type="button"
                  onClick={() => pdfInputRef.current?.click()}
                  disabled={isUploadingPDF}
                  className={`inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium ${
                    isUploadingPDF 
                      ? 'text-gray-400 bg-gray-100 cursor-not-allowed' 
                      : 'text-gray-700 bg-white hover:bg-gray-50'
                  }`}
                  title={isUploadingPDF ? "Upload en cours..." : "Uploader un PDF pour extraire les normes"}
                >
                  {isUploadingPDF ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  ) : (
                    <DocumentIcon className="h-4 w-4" />
                  )}
                </button>
                <input
                  ref={pdfInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={onPDFUpload}
                  className="hidden"
                />
              </>
            )}
          </div>
          {onPDFUpload && (
            <p className="mt-1 text-xs text-gray-500">
              Uploader un PDF pour extraire automatiquement les normes
            </p>
          )}
        </div>

        <div>
          <label htmlFor="documentsReference" className="block text-sm font-medium text-gray-700">
            Documents Référence
          </label>
          <div className="mt-1 flex space-x-2">
            <input
              type="text"
              id="documentsReference"
              name="documentsReference"
              value={formData.documentsReference}
              onChange={handleChange}
              className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-yellow-50"
              placeholder="Ex: Notice / Procédure d'inspection"
            />
            {onDocumentsUpload && (
              <>
                <button
                  type="button"
                  onClick={() => documentsInputRef.current?.click()}
                  disabled={isUploadingDocuments}
                  className={`inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium ${
                    isUploadingDocuments 
                      ? 'text-gray-400 bg-gray-100 cursor-not-allowed' 
                      : 'text-gray-700 bg-white hover:bg-gray-50'
                  }`}
                  title={isUploadingDocuments ? "Upload en cours..." : "Uploader un PDF pour auto-remplissage"}
                >
                  {isUploadingDocuments ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  ) : (
                    <DocumentIcon className="h-4 w-4" />
                  )}
                </button>
                <input
                  ref={documentsInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={onDocumentsUpload}
                  className="hidden"
                />
              </>
            )}
          </div>
          {onDocumentsUpload && (
            <p className="mt-1 text-xs text-gray-500">
              Uploader un PDF pour extraire automatiquement les documents de référence
            </p>
          )}
        </div>

        <div>
          <label htmlFor="consommation" className="block text-sm font-medium text-gray-700">
            Consommation
          </label>
          <input
            type="text"
            id="consommation"
            name="consommation"
            value={formData.consommation}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="attribution" className="block text-sm font-medium text-gray-700">
            Attribution
          </label>
          <input
            type="text"
            id="attribution"
            name="attribution"
            value={formData.attribution}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="commentaire" className="block text-sm font-medium text-gray-700">
            Commentaire
          </label>
          <input
            type="text"
            id="commentaire"
            name="commentaire"
            value={formData.commentaire}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
      </div>
    </div>
  );
}
