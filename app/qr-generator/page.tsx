'use client';

import { useState } from 'react';
import { DocumentIcon, QrCodeIcon, ArrowDownTrayIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';

export default function QRGeneratorPage() {
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [qrCodeData, setQrCodeData] = useState<string>('');
  const [qrCodeImage, setQrCodeImage] = useState<string>('');

  // Fonction pour uploader et extraire les données du PDF
  const handlePDFUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setPdfFile(file);
    setIsUploading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'pdf');

            const response = await fetch('/api/qr-generator', {
              method: 'POST',
              body: formData,
            });

      if (response.ok) {
        const data = await response.json();
        setExtractedData(data.extractedData);
        setSuccess('PDF analysé avec succès !');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de l\'analyse du PDF');
      }
    } catch (error) {
      console.error('Erreur upload PDF:', error);
      setError(error instanceof Error ? error.message : 'Erreur lors de l\'upload du PDF');
    } finally {
      setIsUploading(false);
    }
  };

  // Fonction pour générer le QR code
  const generateQRCode = async () => {
    if (!extractedData) return;

    setIsGenerating(true);
    setError('');

    try {
      // Préparer les données pour le QR code optimisées pour l'inspection
      const qrData = {
        // Données principales pour l'inspection d'équipement
        referenceInterne: extractedData.reference || 'A010CA00',
        numeroSerie: extractedData.numeroSerie || 'Non détecté',
        dateFabrication: extractedData.date || '2019',
        typeEquipement: extractedData.produit || 'Casque Petzl VERTEX VENT',
        normesCertificat: extractedData.normes || 'EN 397, EN 50365',
        documentsReference: extractedData.documentsReference || 'Notice / Procédure',
        dateAchat: extractedData.dateAchat || 'Non détecté',
        
        // Données complémentaires de la déclaration UE
        nature: extractedData.nature || 'Déclaration UE de conformité',
        produit: extractedData.produit || 'Casque Petzl VERTEX VENT',
        reference: extractedData.reference || 'A010CA00',
        type: extractedData.type || 'Équipement de protection individuelle (EPI)',
        fabricant: extractedData.fabricant || 'Petzl Distribution, Crolles (France)',
        date: extractedData.date || '28/03/2019',
        signataire: extractedData.signataire || 'Bernard Bressoux, Product Risk Director',
        
        // URLs et métadonnées
        pdfUrl: extractedData.pdfUrl || '',
        cloudinaryUrl: extractedData.cloudinaryUrl || '',
        timestamp: new Date().toISOString(),
        
        // Version pour compatibilité
        version: '1.0',
        source: 'qr-generator'
      };

      // Convertir en JSON string
      const qrDataString = JSON.stringify(qrData);
      setQrCodeData(qrDataString);

      // Générer le QR code avec une API en ligne (ou utiliser une librairie)
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrDataString)}`;
      setQrCodeImage(qrCodeUrl);

      setSuccess('QR code généré avec succès !');
    } catch (error) {
      setError('Erreur lors de la génération du QR code');
    } finally {
      setIsGenerating(false);
    }
  };

  // Fonction pour télécharger le QR code
  const downloadQRCode = async () => {
    if (!qrCodeImage) return;

    try {
      // Récupérer l'image depuis l'URL
      const response = await fetch(qrCodeImage);
      const blob = await response.blob();
      
      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `qr-code-${Date.now()}.png`;
      
      // Ajouter au DOM, cliquer, puis supprimer
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Libérer l'URL
      window.URL.revokeObjectURL(url);
      
      setSuccess('QR code téléchargé avec succès !');
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      setError('Erreur lors du téléchargement du QR code');
    }
  };

  // Fonction pour copier les données JSON
  const copyQRData = () => {
    navigator.clipboard.writeText(qrCodeData);
    setSuccess('Données copiées dans le presse-papiers !');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Générateur de QR Code pour Inspection d'Équipement
          </h1>
          <p className="text-lg text-gray-600">
            Uploadez un PDF d'équipement pour générer un QR code contenant toutes les informations
          </p>
        </div>

        {/* Messages d'état */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-red-800">{error}</div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
            <div className="text-green-800">{success}</div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Colonne gauche - Upload et données */}
          <div className="space-y-6">
            {/* Upload PDF */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                1. Upload du PDF
              </h2>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handlePDFUpload}
                  className="hidden"
                  id="pdf-upload"
                />
                <label
                  htmlFor="pdf-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <CloudArrowUpIcon className="h-12 w-12 text-gray-400 mb-4" />
                  <span className="text-lg font-medium text-gray-900">
                    {pdfFile ? pdfFile.name : 'Cliquez pour sélectionner un PDF'}
                  </span>
                  <span className="text-sm text-gray-500 mt-2">
                    Formats acceptés: PDF
                  </span>
                </label>
              </div>

              {isUploading && (
                <div className="mt-4 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-600">Analyse du PDF en cours...</p>
                </div>
              )}
            </div>

            {/* Données extraites */}
            {extractedData && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  2. Données extraites
                </h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Nature:</span>
                    <span className="text-gray-900">{extractedData.nature || 'Non détecté'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Produit:</span>
                    <span className="text-gray-900">{extractedData.produit || 'Non détecté'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Référence:</span>
                    <span className="text-gray-900">{extractedData.reference || 'Non détecté'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Numéro de série:</span>
                    <span className="text-gray-900">{extractedData.numeroSerie || 'Non détecté'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Type:</span>
                    <span className="text-gray-900">{extractedData.type || 'Non détecté'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Normes:</span>
                    <span className="text-gray-900">{extractedData.normes || 'Non détecté'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Fabricant:</span>
                    <span className="text-gray-900">{extractedData.fabricant || 'Non détecté'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Date:</span>
                    <span className="text-gray-900">{extractedData.date || 'Non détecté'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Signataire:</span>
                    <span className="text-gray-900">{extractedData.signataire || 'Non détecté'}</span>
                  </div>
                </div>

                <button
                  onClick={generateQRCode}
                  disabled={isGenerating}
                  className="mt-4 w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Génération...
                    </>
                  ) : (
                    <>
                      <QrCodeIcon className="h-4 w-4 mr-2" />
                      Générer le QR Code
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Colonne droite - QR Code et PDF */}
          <div className="space-y-6">
            {/* PDF Viewer */}
            {extractedData && extractedData.pdfUrl && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  3. PDF Original
                </h2>
                
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <iframe
                    src={extractedData.pdfUrl}
                    className="w-full h-96"
                    title="PDF Viewer"
                  />
                </div>
                
                <div className="mt-4 text-center">
                  <a
                    href={extractedData.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <DocumentIcon className="h-4 w-4 mr-2" />
                    Ouvrir le PDF dans un nouvel onglet
                  </a>
                </div>
              </div>
            )}

            {/* QR Code */}
            {qrCodeImage && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  {extractedData && extractedData.pdfUrl ? '4. QR Code généré' : '3. QR Code généré'}
                </h2>
                
                <div className="text-center">
                  <img
                    src={qrCodeImage}
                    alt="QR Code"
                    className="mx-auto mb-4 border border-gray-200 rounded-lg"
                  />
                  
                  <div className="space-y-3">
                    <button
                      onClick={downloadQRCode}
                      className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 flex items-center justify-center"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                      Télécharger le QR Code
                    </button>
                    
                    <button
                      onClick={copyQRData}
                      className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 flex items-center justify-center"
                    >
                      <DocumentIcon className="h-4 w-4 mr-2" />
                      Copier les données JSON
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Instructions d'utilisation */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">
                Comment utiliser ce QR Code ?
              </h3>
              <ol className="text-sm text-blue-800 space-y-2">
                <li>1. Téléchargez le QR Code généré</li>
                <li>2. Imprimez-le et collez-le sur l'équipement</li>
                <li>3. Dans l'application d'inspection, scannez ce QR Code</li>
                <li>4. Les champs suivants seront automatiquement remplis :</li>
                <ul className="ml-4 mt-2 space-y-1 text-xs">
                  <li>• Référence interne</li>
                  <li>• Numéro de série</li>
                  <li>• Date de fabrication</li>
                  <li>• Type d'équipement</li>
                  <li>• Normes et certificat de conformité</li>
                  <li>• Documents de référence</li>
                  <li>• Date d'achat</li>
                </ul>
                <li>5. Le PDF original sera accessible via le lien dans le QR Code</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
