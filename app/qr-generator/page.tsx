'use client';

import { useState, useEffect } from 'react';
import { DocumentIcon, QrCodeIcon, ArrowDownTrayIcon, CloudArrowUpIcon, AcademicCapIcon, ClipboardDocumentListIcon, IdentificationIcon } from '@heroicons/react/24/outline';

interface Document {
  id: string;
  title: string;
  type: 'diploma' | 'certificate' | 'inspection' | 'other';
  url: string;
  description?: string;
  createdAt: string;
}

interface EquipmentHistory {
  id: string;
  qrCode: string;
  produit: string;
  referenceInterne: string;
  pdfUrl: string;
  createdAt: string;
}

export default function QRGeneratorPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [qrCodeImage, setQrCodeImage] = useState<string>('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'documents' | 'inspection' | 'history'>('documents');
  
  // États pour l'inspection d'équipement
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<any>(null);
  
  // États pour l'historique
  const [equipmentHistory, setEquipmentHistory] = useState<EquipmentHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Charger les documents disponibles et l'historique
  useEffect(() => {
    fetchDocuments();
    fetchEquipmentHistory();
  }, []);

  const fetchEquipmentHistory = async () => {
    setLoadingHistory(true);
    try {
      const response = await fetch('/api/equipment/history');
      if (response.ok) {
        const data = await response.json();
        setEquipmentHistory(data);
      } else {
        console.error('Erreur lors du chargement de l\'historique');
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/documents');
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents || []);
      } else {
        setError('Erreur lors du chargement des documents');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur lors du chargement des documents');
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour uploader et extraire les données du fichier (PDF ou image) pour l'inspection
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Vérifier le type de fichier
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(fileExtension || '');
    const isPdf = fileExtension === 'pdf';
    
    if (!isImage && !isPdf) {
      setError('Format de fichier non supporté. Veuillez uploader un PDF ou une image (JPG, PNG, etc.)');
      return;
    }

    setUploadedFile(file);
    setIsUploading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', isPdf ? 'pdf' : 'image');

      const response = await fetch('/api/qr-generator', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Données extraites du serveur:', data.extractedData);
        setExtractedData(data.extractedData);
        setSuccess(`${isPdf ? 'PDF' : 'Image'} analysé avec succès !`);
        
        // Rafraîchir l'historique après un upload réussi
        fetchEquipmentHistory();
      } else {
        const errorData = await response.json();
        
        // Gérer spécifiquement l'erreur OCR non disponible
        if (errorData.code === 'OCR_NOT_AVAILABLE' || errorData.code === 'PDF_SCANNED_OCR_REQUIRED') {
          throw new Error(
            `⚠️ ${errorData.message}\n\n` +
            `💡 ${errorData.suggestion}\n\n` +
            `${errorData.helpLink ? `📖 En savoir plus: ${errorData.helpLink}` : ''}`
          );
        }
        
        throw new Error(errorData.error || `Erreur lors de l'analyse du ${isPdf ? 'PDF' : 'fichier'}`);
      }
    } catch (error: any) {
      console.error('Erreur upload fichier:', error);
      
      // Gérer les erreurs spécifiques
      if (error.message && error.message.includes('trop volumineux')) {
        setError(`${error.message}\n\n💡 ${error.suggestion || 'Compressez le PDF avant de l\'uploader.'}`);
      } else {
        setError(error instanceof Error ? error.message : `Erreur lors de l'upload du ${isPdf ? 'PDF' : 'fichier'}`);
      }
    } finally {
      setIsUploading(false);
    }
  };

  // Fonction pour générer le QR code pour un document
  const generateDocumentQRCode = async (document: Document) => {
    setIsGenerating(true);
    setError('');

    try {
      // URL du document avec l'ID
      const documentUrl = `${window.location.origin}/documents/${document.id}`;
      
      // Utiliser le service QR Code Generator
      const qrCodeUrl = `https://app.qr-code-generator.com/?data=${encodeURIComponent(documentUrl)}&size=600x600`;
      
      setQrCodeImage(qrCodeUrl);
      setQrCodeUrl(documentUrl);
      setSelectedDocument(document);
      setSuccess(`QR code généré pour ${document.title} !`);
    } catch (error) {
      setError('Erreur lors de la génération du QR code');
    } finally {
      setIsGenerating(false);
    }
  };

  // Fonction pour générer le QR code pour l'inspection d'équipement
  const generateInspectionQRCode = async () => {
    if (!extractedData) return;

    setIsGenerating(true);
    setError('');

    try {
      // Vérifier si on a un code QR et une URL d'équipement depuis l'API
      if (extractedData.qrCode && extractedData.equipmentUrl) {
        // Utiliser l'URL de l'équipement générée par l'API
        const equipmentUrl = extractedData.equipmentUrl;
        
        // Générer l'image du QR code via service externe
        const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(equipmentUrl)}`;
        
        setQrCodeImage(qrCodeImageUrl);
        setQrCodeUrl(equipmentUrl);
        setSuccess(`QR code généré ! Code: ${extractedData.qrCode}`);
      } else {
        // Fallback: ancien système avec données JSON (si la migration Prisma n'est pas faite)
        const qrData = {
          referenceInterne: extractedData.reference || 'Non détecté',
          numeroSerie: extractedData.numeroSerie || 'Non détecté',
          dateFabrication: extractedData.date || 'Non détecté',
          typeEquipement: extractedData.produit || 'Non détecté',
          normesCertificat: extractedData.normes || 'Non détecté',
          fabricant: extractedData.fabricant || 'Non détecté',
          date: extractedData.date || 'Non détecté',
          signataire: extractedData.signataire || 'Non détecté',
          pdfUrl: extractedData.pdfUrl || '',
          timestamp: new Date().toISOString(),
        };

        const qrDataString = JSON.stringify(qrData);
        const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(qrDataString)}`;
        
        setQrCodeImage(qrCodeImageUrl);
        setQrCodeUrl(qrDataString);
        setSuccess('QR code généré (mode fallback - exécutez la migration Prisma pour le mode complet)');
      }
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
    navigator.clipboard.writeText(qrCodeUrl);
    setSuccess('Données copiées dans le presse-papiers !');
  };

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'diploma':
        return <AcademicCapIcon className="h-6 w-6 text-blue-600" />;
      case 'certificate':
        return <IdentificationIcon className="h-6 w-6 text-green-600" />;
      case 'inspection':
        return <ClipboardDocumentListIcon className="h-6 w-6 text-orange-600" />;
      default:
        return <DocumentIcon className="h-6 w-6 text-gray-600" />;
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'diploma':
        return 'Diplôme';
      case 'certificate':
        return 'Certificat';
      case 'inspection':
        return 'Inspection';
      default:
        return 'Document';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Générateur de QR Codes
          </h1>
          <p className="text-lg text-gray-600">
            Générez des QR codes pour vos documents et inspections d'équipement
          </p>
        </div>

        {/* Onglets */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('documents')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'documents'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Documents en ligne
              </button>
              <button
                onClick={() => setActiveTab('inspection')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'inspection'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Inspection d'équipement
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'history'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Historique ({equipmentHistory.length})
              </button>
            </nav>
          </div>
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

        {/* Contenu selon l'onglet actif */}
        {activeTab === 'history' ? (
          /* Onglet Historique */
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Historique des équipements ({equipmentHistory.length})
              </h2>
              
              {loadingHistory ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-600">Chargement de l'historique...</p>
                </div>
              ) : equipmentHistory.length === 0 ? (
                <div className="text-center py-8">
                  <DocumentIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Aucun équipement dans l'historique</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Les équipements que vous uploadez apparaîtront ici
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Produit
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Référence
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Code QR
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {equipmentHistory.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {item.produit || 'Non détecté'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {item.referenceInterne || 'Non détecté'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {item.qrCode}
                            </code>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(item.createdAt).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button
                              onClick={() => window.open(`/equipment/${item.qrCode}`, '_blank')}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Voir détails
                            </button>
                            <button
                              onClick={() => {
                                // Utiliser l'URL Cloudinary originale directement
                                window.open(item.pdfUrl, '_blank');
                              }}
                              className="text-green-600 hover:text-green-900"
                            >
                              Voir PDF
                            </button>
                            <button
                              onClick={() => {
                                const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(`${window.location.origin}/equipment/${item.qrCode}`)}`;
                                const link = document.createElement('a');
                                link.href = qrUrl;
                                link.download = `qr-${item.qrCode}.png`;
                                link.click();
                              }}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Télécharger QR
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : activeTab === 'documents' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Colonne gauche - Liste des documents */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Documents disponibles
                </h2>
                
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-600">Chargement des documents...</p>
                  </div>
                ) : documents.length === 0 ? (
                  <div className="text-center py-8">
                    <DocumentIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Aucun document disponible</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Les administrateurs peuvent ajouter des documents dans la section admin.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {documents.map((document) => (
                      <div
                        key={document.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center space-x-3">
                          {getDocumentIcon(document.type)}
                          <div>
                            <h3 className="font-medium text-gray-900">{document.title}</h3>
                            <p className="text-sm text-gray-500">
                              {getDocumentTypeLabel(document.type)} • {new Date(document.createdAt).toLocaleDateString('fr-FR')}
                            </p>
                            {document.description && (
                              <p className="text-xs text-gray-400 mt-1">{document.description}</p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => generateDocumentQRCode(document)}
                          disabled={isGenerating}
                          className="inline-flex items-center px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <QrCodeIcon className="h-4 w-4 mr-2" />
                          Générer QR
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Colonne droite - QR Code généré */}
            <div className="space-y-6">
              {qrCodeImage && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    QR Code généré
                  </h2>
                  
                  <div className="text-center">
                    <img
                      src={qrCodeImage}
                      alt="QR Code"
                      className="mx-auto mb-4 border border-gray-200 rounded-lg w-72 sm:w-80 md:w-96 h-auto"
                    />
                    
                    {selectedDocument && (
                      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                        <h3 className="font-medium text-blue-900">{selectedDocument.title}</h3>
                        <p className="text-sm text-blue-700">{getDocumentTypeLabel(selectedDocument.type)}</p>
                        <p className="text-xs text-blue-600 mt-1">URL: {qrCodeUrl}</p>
                      </div>
                    )}
                    
                    <div className="space-y-3">
                      <button
                        onClick={downloadQRCode}
                        className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 flex items-center justify-center"
                      >
                        <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                        Télécharger le QR Code
                      </button>
                      
                      <button
                        onClick={() => navigator.clipboard.writeText(qrCodeUrl)}
                        className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 flex items-center justify-center"
                      >
                        <DocumentIcon className="h-4 w-4 mr-2" />
                        Copier l'URL
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Onglet Inspection d'équipement */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Colonne gauche - Upload et données */}
            <div className="space-y-6">
              {/* Upload fichier */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  1. Upload du fichier
                </h2>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.gif,.bmp,.webp"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <CloudArrowUpIcon className="h-12 w-12 text-gray-400 mb-4" />
                    <span className="text-lg font-medium text-gray-900">
                      {uploadedFile ? uploadedFile.name : 'Cliquez pour sélectionner un fichier'}
                    </span>
                    <span className="text-sm text-gray-500 mt-2">
                      Formats acceptés: PDF, JPG, PNG, GIF, BMP, WEBP
                    </span>
                    <span className="text-xs text-orange-600 mt-2 font-medium">
                      ⚠️ Taille max: 10 MB (plan Cloudinary gratuit)
                    </span>
                  </label>
                </div>
                
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                  <strong>💡 Astuce:</strong> Si votre PDF est trop volumineux, compressez-le sur{' '}
                  <a href="https://www.ilovepdf.com/compress_pdf" target="_blank" rel="noopener noreferrer" className="underline font-medium">
                    ilovepdf.com
                  </a>
                </div>

                {isUploading && (
                  <div className="mt-4 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-600">Analyse du fichier en cours...</p>
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
                    
                    {/* URL de l'équipement si disponible */}
                    {extractedData.equipmentUrl && (
                      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                        <h4 className="font-medium text-green-800 mb-2">✅ Équipement enregistré !</h4>
                        <p className="text-xs text-green-700 mb-1">Code QR: <span className="font-mono font-bold">{extractedData.qrCode}</span></p>
                        <p className="text-xs text-green-700">URL: <a href={extractedData.equipmentUrl} target="_blank" rel="noopener noreferrer" className="underline">{extractedData.equipmentUrl}</a></p>
                      </div>
                    )}
                    
                    {/* Texte brut pour débogage */}
                    <details className="mt-4">
                      <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                        Voir le texte brut extrait (débogage)
                      </summary>
                      <div className="mt-2 p-3 bg-gray-100 rounded">
                        <pre className="text-xs text-gray-600 whitespace-pre-wrap max-h-32 overflow-y-auto">
                          {extractedData.rawText || 'Aucun texte brut disponible'}
                        </pre>
                      </div>
                    </details>
                  </div>

                  <button
                    onClick={generateInspectionQRCode}
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
                        Générer le QR Code d'inspection
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
                      className="mx-auto mb-4 border border-gray-200 rounded-lg w-72 sm:w-80 md:w-96 h-auto"
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
                  📱 Comment utiliser ce QR Code ?
                </h3>
                <ol className="text-sm text-blue-800 space-y-2">
                  <li><strong>1.</strong> Téléchargez le QR Code généré ci-dessus</li>
                  <li><strong>2.</strong> Imprimez-le et collez-le sur l'équipement</li>
                  <li><strong>3.</strong> Scannez le QR Code avec un smartphone</li>
                  <li><strong>4.</strong> Vous serez redirigé vers la page de l'équipement avec :
                    <ul className="ml-4 mt-1 space-y-1 text-xs">
                      <li>✓ Toutes les données de l'équipement</li>
                      <li>✓ Accès au PDF original</li>
                      <li>✓ Bouton "Remplir formulaire d'inspection"</li>
                    </ul>
                  </li>
                  <li><strong>5.</strong> Cliquez sur "Remplir formulaire d'inspection"</li>
                  <li><strong>6.</strong> Le formulaire se pré-remplit automatiquement avec :
                    <ul className="ml-4 mt-1 space-y-1 text-xs">
                      <li>• Référence interne</li>
                      <li>• Numéro de série</li>
                      <li>• Normes et certificat</li>
                      <li>• Fabricant</li>
                      <li>• Date de contrôle</li>
                      <li>• Signataire</li>
                    </ul>
                  </li>
                </ol>
                
                {extractedData?.equipmentUrl && (
                  <div className="mt-4 p-3 bg-white rounded border border-blue-200">
                    <p className="text-xs text-blue-900 font-medium mb-1">🔗 URL de test :</p>
                    <a 
                      href={extractedData.equipmentUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800 underline break-all"
                    >
                      {extractedData.equipmentUrl}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}