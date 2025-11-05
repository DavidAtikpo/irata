'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { CheckCircleIcon, XMarkIcon, PhotoIcon, QrCodeIcon, DocumentIcon, PrinterIcon, LinkIcon } from '@heroicons/react/24/outline';
import { generateSlugFromReference } from '@/lib/slug';

interface InspectionPoint {
  status: 'V' | 'NA' | 'X';
  comment?: string;
}

interface InspectionData {
  antecedentProduit: {
    miseEnService: string;
    comment: string;
  };
  observationsPrelables: {
    referenceInterneMarquee: InspectionPoint;
    lisibiliteNumeroSerie: InspectionPoint;
    dureeVieNonDepassee: InspectionPoint;
    comparaisonAppareilNeuf: InspectionPoint;
  };
  verificationCorps: {
    marqueFissure: InspectionPoint;
    usureCordeAncrages: InspectionPoint;
    etatBec: InspectionPoint;
  };
  verificationDoigt: {
    marqueUsure: InspectionPoint;
    proprete: InspectionPoint;
    etatRivet: InspectionPoint;
    ouvertureManuelle: InspectionPoint;
    fermetureAutomatique: InspectionPoint;
  };
  verificationBague: {
    marqueUsure: InspectionPoint;
    deverrouillage: InspectionPoint;
    verrouillageAutomatique: InspectionPoint;
  };
}

export default function ViewInspectionPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const inspectionId = params.id as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [inspection, setInspection] = useState<any>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [isUpdatingQR, setIsUpdatingQR] = useState(false);
  const [qrCodeImageUrl, setQrCodeImageUrl] = useState<string>('');

  // Fonction pour rendre du texte avec mots barrés individuellement
  const renderCrossedOutText = (text: string, fieldKey: string) => {
    if (!inspection?.crossedOutWords?.[fieldKey]) {
      return text;
    }

    // Diviser le texte en mots et séparateurs
    const parts = text.split(/(\s+|\/|\(|\)|-|\.)/);

    return parts.map((part, index) => {
      // Si c'est un séparateur, l'afficher tel quel
      if (/^\s+$/.test(part) || /^[\/\(\)\-\.]+$/.test(part)) {
        return <span key={index}>{part}</span>;
      }

      // Si c'est un mot, vérifier s'il est barré
      const isCrossed = inspection.crossedOutWords[fieldKey][part];
      return (
        <span
          key={index}
          className={isCrossed ? 'line-through' : ''}
        >
          {part}
        </span>
      );
    });
  };

  // Générer l'URL publique basée sur l'ID unique
  const getPublicUrl = () => {
    if (!inspection?.id) return '';
    const slug = inspection.referenceInterne 
      ? generateSlugFromReference(inspection.referenceInterne) 
      : 'equipement';
    return typeof window !== 'undefined' 
      ? `${window.location.origin}/inspection/${inspection.id}-${slug}` 
      : '';
  };

  // Fonction pour générer le QR code avec texte CI.DES
  const generateQRCodeWithText = async (url: string): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const size = 300;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        resolve(`https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}`);
        return;
      }

      const qrImage = new Image();
      qrImage.crossOrigin = 'anonymous';
      
      qrImage.onload = () => {
        ctx.drawImage(qrImage, 0, 0, size, size);
        
        const textSize = 36;
        const textAreaHeight = 48;
        const textAreaWidth = 160;
        const textY = size / 2;
        const textX = size / 2 - textAreaWidth / 2;
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillRect(textX, textY - textAreaHeight / 2, textAreaWidth, textAreaHeight);
        
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.lineWidth = 1;
        ctx.strokeRect(textX, textY - textAreaHeight / 2, textAreaWidth, textAreaHeight);
        
        ctx.font = `bold ${textSize}px Arial, sans-serif`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        
        const textCI = 'CI.';
        const textDES = 'DES';
        ctx.font = `bold ${textSize}px Arial, sans-serif`;
        const fullTextWidth = ctx.measureText(textCI).width + ctx.measureText(textDES).width;
        const startX = (size - fullTextWidth) / 2;
        
        ctx.fillStyle = '#F2A62C';
        const ciX = startX;
        ctx.fillText(textCI, ciX, textY);
        
        ctx.fillStyle = '#000000';
        const desX = ciX + ctx.measureText(textCI).width;
        ctx.fillText(textDES, desX, textY);
        
        const dataUrl = canvas.toDataURL('image/png');
        resolve(dataUrl);
      };

      qrImage.onerror = () => {
        resolve(`https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}`);
      };

      qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}&ecc=H`;
    });
  };

  // Charger les données de l'inspection
  useEffect(() => {
    const loadInspection = async () => {
      try {
        const response = await fetch(`/api/admin/equipment-detailed-inspections/${inspectionId}`);
        if (response.ok) {
          const data = await response.json();
          console.log('Données inspection:', data);
          setInspection(data);
        } else {
          setError('Erreur lors du chargement de l\'inspection');
        }
      } catch (error) {
        setError('Erreur lors du chargement de l\'inspection');
      } finally {
        setIsLoading(false);
      }
    };

    if (inspectionId) {
      loadInspection();
    }
  }, [inspectionId]);

  // Générer le QR code au chargement
  useEffect(() => {
    const loadQRCode = async () => {
      if (!inspection?.id) return;
      const slug = inspection.referenceInterne 
        ? generateSlugFromReference(inspection.referenceInterne) 
        : 'equipement';
      const url = typeof window !== 'undefined' 
        ? `${window.location.origin}/inspection/${inspection.id}-${slug}` 
        : '';
      if (url) {
        const qrUrl = await generateQRCodeWithText(url);
        setQrCodeImageUrl(qrUrl);
      }
    };
    
    loadQRCode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inspection?.id, inspection?.referenceInterne]);

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
    router.push('/');
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement de l'inspection...</p>
        </div>
      </div>
    );
  }

  if (error || !inspection) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Inspection non trouvée'}</p>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  const StatusIndicator = ({ status }: { status: 'V' | 'NA' | 'X' }) => {
    if (status === 'V') {
      return (
        <div className="inline-flex items-center justify-center w-6 h-6 text-orange-300 text-sm font-bold">
          V
        </div>
      );
    } else if (status === 'NA') {
      return (
        <div className="inline-flex items-center justify-center w-6 h-6 text-orange-300 text-sm font-bold">
          NA
        </div>
      );
    } else {
      return (
        <div className="inline-flex items-center justify-center w-6 h-6 text-orange-300 text-sm font-bold">
          X
        </div>
      );
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  // Helper functions pour les signatures séparées
  const getCurrentCertificate = (): string | null => {
    return inspection.verificateurSignaturePdf || null;
  };

  const getCurrentDigitalSignature = (): string | null => {
    return inspection.verificateurDigitalSignature || null;
  };

  const handlePrint = () => {
    window.print();
  };

  // Fonction pour copier le lien
  const handleCopyLink = async () => {
    try {
      const url = getPublicUrl();
      if (url && navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
      }
    } catch (error) {
      console.error('Erreur lors de la copie:', error);
    }
  };

  // Fonction pour mettre à jour le QR code dans la base de données
  const handleUpdateQRCode = async () => {
    if (!qrCodeImageUrl) return;
    
    setIsUpdatingQR(true);
    try {
      const response = await fetch(`/api/admin/equipment-detailed-inspections/${inspectionId}/update-qr-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ qrCodeImageUrl }),
      });

      if (response.ok) {
        const data = await response.json();
        const reloadResponse = await fetch(`/api/admin/equipment-detailed-inspections/${inspectionId}`);
        if (reloadResponse.ok) {
          const updatedData = await reloadResponse.json();
          setInspection(updatedData);
        }
        alert('QR code mis à jour avec succès !');
      } else {
        throw new Error('Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la mise à jour du QR code');
    } finally {
      setIsUpdatingQR(false);
    }
  };

  // Fonction pour télécharger le QR code
  const handleDownloadQRCode = () => {
    if (!qrCodeImageUrl) return;
    
    const link = document.createElement('a');
    link.href = qrCodeImageUrl;
    link.download = `QR-Code-${inspection?.referenceInterne || 'equipement'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Fonction pour rendre les normes cliquables avec liens PDF
  const renderClickableNormes = (text: string) => {
    const normesUrlToUse = inspection.normesUrl || inspection.pdfUrl;
    if (!text || !normesUrlToUse) return text;
    
    const normePattern = /(EN\s*\d+(?::\d{4})?(?:\s*\+\s*[A-Z]\d+(?::\d{4})?)?)/gi;
    
    return text.replace(normePattern, (match) => {
      return `<a href="/api/inspection-pdf?url=${encodeURIComponent(normesUrlToUse)}" target="_blank" class="text-blue-600 hover:text-blue-800 underline cursor-pointer" title="Télécharger le PDF des normes">${match}</a>`;
    });
  };

  // Fonction pour rendre les documents de référence cliquables
  const renderClickableReferences = (text: string) => {
    if (!text || !inspection.pdfUrl) return text;
    
    const referencePattern = /(notice|procédure|manuel|guide|instruction|référence|document)/gi;
    
    return text.replace(referencePattern, (match) => {
      return `<a href="/api/inspection-pdf?url=${encodeURIComponent(inspection.pdfUrl)}" target="_blank" class="text-blue-600 hover:text-blue-800 underline cursor-pointer" title="Télécharger le PDF">${match}</a>`;
    });
  };

  return (
    <div className="min-h-screen bg-white print:bg-white">
      {/* Header avec boutons d'action - masqué à l'impression */}
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 print:hidden">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            Inspection Détaillée d'Équipement
          </h1>
          <div className="flex space-x-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <PrinterIcon className="h-4 w-4 mr-2" />
              Imprimer
            </button>
            <button
              onClick={() => router.back()}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Retour
            </button>
          </div>
        </div>

        {/* Section génération QR Code pour admin */}
        {inspection?.referenceInterne && (
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">
                  🔗 Génération du QR Code
                </h3>
                <div className="text-xs text-blue-800 mb-2">
                  URL publique de cette inspection (pour générer le QR code) :
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 text-xs text-blue-600 break-all font-mono bg-white p-2 rounded border border-blue-200">
                    {getPublicUrl()}
                  </div>
                  <button
                    onClick={handleCopyLink}
                    className={`inline-flex items-center px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                      linkCopied
                        ? 'bg-green-500 text-white'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                    title="Copier le lien"
                  >
                    <LinkIcon className="h-3 w-3 mr-1" />
                    {linkCopied ? 'Copié !' : 'Copier'}
                  </button>
                </div>
                <div className="mt-3">
                  <div className="text-xs text-blue-800 mb-2">QR Code généré avec CI.DES :</div>
                  {qrCodeImageUrl ? (
                    <div className="inline-block bg-white p-2 rounded border border-blue-200">
                      <img
                        src={qrCodeImageUrl}
                        alt="QR Code CI.DES"
                        className="w-40 h-40"
                      />
                    </div>
                  ) : (
                    <div className="w-40 h-40 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400">
                      Chargement...
                    </div>
                  )}
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={handleUpdateQRCode}
                    disabled={!qrCodeImageUrl || isUpdatingQR}
                    className={`inline-flex items-center px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                      !qrCodeImageUrl || isUpdatingQR
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                    title="Mettre à jour le QR code dans la base de données"
                  >
                    {isUpdatingQR ? 'Mise à jour...' : '🔄 Mettre à jour'}
                  </button>
                  <button
                    onClick={handleDownloadQRCode}
                    disabled={!qrCodeImageUrl}
                    className={`inline-flex items-center px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                      !qrCodeImageUrl
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                    title="Télécharger le QR code"
                  >
                    📥 Télécharger
                  </button>
                </div>
                <div className="mt-2 text-xs text-blue-600">
                  💡 Utilisez l'URL ci-dessus ou le QR code pour partager cette inspection. Cliquez sur "Mettre à jour" pour sauvegarder le QR code dans la base de données.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-3 py-8 print:px-0 print:py-0">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-2 print:grid-cols-2">
          
          {/* Colonne gauche - Identification équipement - 40% */}
          <div className="lg:col-span-2 space-y-2">
            <div className="bg-white   p-2 print:border-0 print:shadow-none">
              <h2 className="text-lg font-bold text-gray-900 mb-6 text-center">
                Identification équipement
              </h2>
              
              {/* Photo et État */}
              <div className="grid grid-cols-3 gap-1 mb-3">
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-700 mb-2">Photo</div>
                  <div className="border-2 border-gray-300 rounded-lg p-4 h-32 flex items-center justify-center">
                    {inspection.photo ? (
                      <img src={inspection.photo} alt="Équipement" className="max-w-full max-h-full object-contain rounded" />
                    ) : (
                      <PhotoIcon className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-700 mb-2">État</div>
                  <div className=" p-4 h-25 flex items-center justify-center">
                    {inspection.etat === 'OK' ? (
                      <div className="text-center">
                        <img 
                          src="/picto-OK.jpg" 
                          alt="État valide" 
                          className="h-12 w-12 mx-auto mb-1 object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                            if (nextElement) {
                              nextElement.style.display = 'block';
                            }
                          }}
                        />
                        <CheckCircleIcon 
                          className="h-8 w-8 text-green-600 mx-auto mb-1 hidden" 
                          style={{ display: 'none' }}
                        />
                        <div className="text-xs font-medium text-green-800">Valide</div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <img 
                          src="/invalide.png" 
                          alt="État invalide" 
                          className="h-12 w-12 mx-auto mb-1 object-contain"
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
              {/* QR Code */}
              <div className="mb-2">
                <div className="text-sm font-medium text-gray-700 mb-2 text-center">QR Code</div>
                <div className=" p-1 h-20 flex items-center justify-center">
                  {inspection.qrCode ? (
                    <img src={inspection.qrCode} alt="QR Code" className="max-w-full max-h-full object-contain" />
                  ) : (
                    <QrCodeIcon className="h-8 w-8 text-gray-400" />
                  )}
                </div>
              </div>

              </div>



              {/* Détails de l'équipement */}
              <div className="space-y-3">
                <div className="flex justify-between bg-gray-100 p-2">
                  <span className="text-sm font-medium text-gray-700">Référence interne:</span>
                  <span className="text-sm text-gray-900 font-bold">{inspection.referenceInterne || '/'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">Type d'équipement:</span>
                  <span className="text-sm text-gray-900 font-bold">{inspection.typeEquipement || '/'}</span>
                </div>
                {/* <div className="flex justify-between bg-gray-100 p-2">
                  <span className="text-sm font-medium text-gray-700">N° de série Top:</span>
                  <span className="text-sm text-gray-900 font-bold">{inspection.numeroSerieTop || '/'}</span>
                </div> */}
                <div className="flex justify-between bg-gray-100 p-2">
                  <span className="text-sm font-medium text-gray-700">N° de série:</span>
                  <span className="text-sm text-gray-900 font-bold">{inspection.numeroSerie || '/'}</span>
                </div>
                {/* <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">N° de série Cuissard:</span>
                  <span className="text-sm text-gray-900 font-bold">{inspection.numeroSerieCuissard || '/'}</span>
                </div> */}
                {/* {inspection.numeroSerieNonEtiquete && (
                  <div className="flex justify-between bg-gray-100 p-2">
                    <span className="text-sm font-medium text-gray-700">Numéro (non étiqueté):</span>
                    <span className="text-sm text-gray-900 font-bold">{inspection.numeroSerieNonEtiquete || '/'}</span>
                  </div>
                )} */}
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">Date de Fabrication:</span>
                  <span className="text-sm text-gray-900 font-bold">{inspection.dateFabrication || '/'}</span>
                </div>
                <div className="flex justify-between bg-gray-100 p-2">
                  <span className="text-sm font-medium text-gray-700">Date d' Achat:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-900 font-bold">{inspection.dateAchat || '/'}</span>
                    {inspection.dateAchatImage && (
                      <button
                        onClick={() => window.open(`/api/inspection-pdf?url=${encodeURIComponent(inspection.dateAchatImage)}`, '_blank')}
                        className="text-blue-600 hover:text-blue-800 underline text-xs"
                      >
                        Voir PDF
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">Date de mise en service:</span>
                  <span className="text-sm text-gray-900 font-bold">{formatDate(inspection.dateMiseEnService) || '/'}</span>
                </div>
                <div className="flex justify-between bg-gray-100 p-2">
                  <span className="text-sm font-medium text-gray-700">Inspection Détaillée (tous les 6 mois):</span>
                  <span className="text-sm text-gray-900 font-bold">{inspection.dateInspectionDetaillee || 'date de l\'inspection'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">n° de kit:</span>
                  <span className="text-sm text-gray-900 font-bold">{inspection.numeroKit || '/'}</span>
                </div>
                <div className="flex justify-between bg-gray-100 p-2">
                  <span className="text-sm font-medium text-gray-700">Taille:</span>
                  <span className="text-sm text-gray-900 font-bold">{inspection.taille || '/'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">Longeur:</span>
                  <span className="text-sm text-gray-900 font-bold">{inspection.longueur || '/'}</span>
                </div>
                <div className="flex justify-between bg-gray-100 p-2">
                  <span className="text-sm font-medium text-gray-700">Normes et Certificat de conformité:</span>
                  <span 
                    className="text-sm text-gray-900 font-bold"
                    dangerouslySetInnerHTML={{ 
                      __html: inspection.normesCertificat ? renderClickableNormes(inspection.normesCertificat) : '/' 
                    }}
                  />
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">Documents Référence:</span>
                  <div className="flex items-center gap-2">
                    <span 
                      className="text-sm text-gray-900 font-bold"
                      dangerouslySetInnerHTML={{ 
                        __html: inspection.documentsReference ? renderClickableReferences(inspection.documentsReference) : '/' 
                      }}
                    />
                    {inspection.pdfUrl && (
                      <button
                        onClick={() => window.open(`/api/inspection-pdf?url=${encodeURIComponent(inspection.pdfUrl)}`, '_blank')}
                        className="text-blue-600 hover:text-blue-800 underline text-xs"
                      >
                        Voir Notice
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex justify-between bg-gray-100 p-2">
                  <span className="text-sm font-medium text-gray-700">Consommation:</span>
                  <span className="text-sm text-gray-900 font-bold">{inspection.consommation || '/'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">Attribution:</span>
                  <span className="text-sm text-gray-900 font-bold">{inspection.attribution || '/'}</span>
                </div>
                <div className="flex justify-between bg-gray-100 p-2">
                  <span className="text-sm font-medium text-gray-700">Commentaire:</span>
                  <span className="text-sm text-gray-900 font-bold">{inspection.commentaire || '/'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Colonne droite - Vie de l'équipement - 60% */}
          <div className="lg:col-span-3 space-y-1">
          <h2 className="text-sm font-bold text-gray-900">
                  Vie de l'équipement
                </h2>
            <div className="bg-white  p-6 print:border-0 print:shadow-none">

              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xs font-bold text-gray-900">
                 1. ANTECEDENT DU PRODUIT
                </h2>

                <div className="text-xs text-gray-600">
                  Mise en service le {formatDate(inspection.antecedentProduit?.miseEnService) || formatDate(inspection.dateMiseEnService)}
                </div>
              </div>
              {inspection.antecedentProduit?.comment && (
                <div className="text-xs text-blue-600 italic ml-4 mb-2">
                  Commentaire: {inspection.antecedentProduit.comment}
                </div>
              )}

              {/* Points d'inspection */}
              <div className="space-y-1">
                
                {/* Observations Préalables */}
                <div className="border-b border-gray-200 pb-2">
                  <div className="grid grid-cols-[40%_60%] gap-2">
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-gray-900">
                        2. OBSERVATIONS PREALABLES
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <li><span className="text-xs text-gray-700 flex-1">{renderCrossedOutText("Référence Interne marquée et lisible", "observationsPrelables.referenceInterneMarquee")}</span></li>
                        <StatusIndicator status={inspection.observationsPrelables?.referenceInterneMarquee?.status || 'V'} />
                      </div>
                      {inspection.observationsPrelables?.referenceInterneMarquee?.comment && (
                        <div className="text-xs text-blue-600 italic ml-4">
                          Commentaire: {inspection.observationsPrelables.referenceInterneMarquee.comment}
                        </div>
                      )}
                      <div className="flex items-center justify-between gap-2">
                        <li><span className="text-xs text-gray-700 flex-1">{renderCrossedOutText("Numéro de série lisible, ainsi que la norme", "observationsPrelables.lisibiliteNumeroSerie")}</span></li>
                        <StatusIndicator status={inspection.observationsPrelables?.lisibiliteNumeroSerie?.status || 'V'} />
                      </div>
                      {inspection.observationsPrelables?.lisibiliteNumeroSerie?.comment && (
                        <div className="text-xs text-blue-600 italic ml-4">
                          Commentaire: {inspection.observationsPrelables.lisibiliteNumeroSerie.comment}
                        </div>
                      )}
                      <div className="flex items-center justify-between gap-2">
                        <li><span className="text-xs text-gray-700 flex-1">{renderCrossedOutText("Durée de vie n'est pas dépassée", "observationsPrelables.dureeVieNonDepassee")}</span></li>
                        <StatusIndicator status={inspection.observationsPrelables?.dureeVieNonDepassee?.status || 'V'} />
                      </div>
                      {inspection.observationsPrelables?.dureeVieNonDepassee?.comment && (
                        <div className="text-xs text-blue-600 italic ml-4">
                          Commentaire: {inspection.observationsPrelables.dureeVieNonDepassee.comment}
                        </div>
                      )}
                      <div className="flex items-center justify-between gap-2">
                        <li><span className="text-xs text-gray-700 flex-1">{renderCrossedOutText("Comparez avec un appareil neuf l'absence de modification ou perte d'un élément", "observationsPrelables.comparaisonAppareilNeuf")}</span></li>
                        <StatusIndicator status={inspection.observationsPrelables?.comparaisonAppareilNeuf?.status || 'V'} />
                      </div>
                      {inspection.observationsPrelables?.comparaisonAppareilNeuf?.comment && (
                        <div className="text-xs text-blue-600 italic ml-4">
                          Commentaire: {inspection.observationsPrelables.comparaisonAppareilNeuf.comment}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 3. VERIFICATION CORPS */}
                <div className="border-b border-gray-200 pb-2">
                  <div className="space-y-2">
                    {/* Marque/Fissure/Déformation/Corrosion */}
                    <div className="grid grid-cols-[40%_60%] gap-2 items-start">
                      <div className="text-xs font-bold text-gray-900 mb-1">
                        3. VERIFICATION CORPS : – Doit être démonté de tout appareil pouvant masquer une partie du corps :
                      </div>
                      <div className="space-y-1">
                        <div className="bg-gray-100 p-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs text-gray-700 flex-1">{renderCrossedOutText("Marque / Fissure / Déformation / Corrosion", "verificationCorps.marqueFissure")}</span>
                            <StatusIndicator status={inspection.verificationCorps?.marqueFissure?.status || 'V'} />
                          </div>
                          {inspection.verificationCorps?.marqueFissure?.comment && (
                            <div className="text-xs text-blue-600 italic ml-4 mt-1">
                              Commentaire: {inspection.verificationCorps.marqueFissure.comment}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Vérifier l'usure provoquée par le passage de la corde */}
                    <div className="grid grid-cols-[40%_60%] gap-2 items-start">
                      <div className="text-xs text-gray-700 ml-2">- Vérifier l'usure provoquée par le passage de la corde ou l'appui sur les ancrages:</div>
                      <div className="space-y-1">
                        <div className="bg-gray-100 p-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs text-gray-700 flex-1">{renderCrossedOutText("Profondeur des marques - une usure de plus d'un mm de profondeur / Apparition d'arêtes tranchantes", "verificationCorps.usureCordeAncrages")}</span>
                            <StatusIndicator status={inspection.verificationCorps?.usureCordeAncrages?.status || 'V'} />
                          </div>
                          {inspection.verificationCorps?.usureCordeAncrages?.comment && (
                            <div className="text-xs text-blue-600 italic ml-4 mt-1">
                              Commentaire: {inspection.verificationCorps.usureCordeAncrages.comment}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Etat du bec */}
                    <div className="grid grid-cols-[40%_60%] gap-2 items-start">
                      <div className="text-xs text-gray-700 ml-2">- Vérifier l'état du bec:</div>
                      <div className="space-y-1">
                        <div className="bg-gray-100 p-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs text-gray-700 flex-1">{renderCrossedOutText("Marques, Usure, Fissures, Déformation,...", "verificationCorps.etatBec")}</span>
                            <StatusIndicator status={inspection.verificationCorps?.etatBec?.status || 'V'} />
                          </div>
                          {inspection.verificationCorps?.etatBec?.comment && (
                            <div className="text-xs text-blue-600 italic ml-4 mt-1">
                              Commentaire: {inspection.verificationCorps.etatBec.comment}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. VERIFICATION DU DOIGT */}
                <div className="border-b border-gray-200 pb-2">
                  <div className="space-y-2">
                    {/* Marque/Usure */}
                    <div className="grid grid-cols-[40%_60%] gap-2 items-start">
                      <div className="text-xs font-bold text-gray-900 ml-2">4. VERIFICATION DU DOIGT: - État:</div>
                      <div className="space-y-1">
                        <div className="bg-gray-100 p-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs text-gray-700 flex-1">{renderCrossedOutText("Marque / Usure / Fissure / Déformation / Corrosion...", "verificationDoigt.marqueUsure")}</span>
                            <StatusIndicator status={inspection.verificationDoigt?.marqueUsure?.status || 'V'} />
                          </div>
                          {inspection.verificationDoigt?.marqueUsure?.comment && (
                            <div className="text-xs text-blue-600 italic ml-4 mt-1">
                              Commentaire: {inspection.verificationDoigt.marqueUsure.comment}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Propreté */}
                    <div className="grid grid-cols-[40%_60%] gap-2 items-start">
                      <div className="text-xs text-gray-700 ml-2">- Vérifier propreté des parties ayant un mouvement à effectuer:</div>
                      <div className="space-y-1">
                        <div className="bg-gray-100 p-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs text-gray-700 flex-1">Propreté des liaisons doigt/corps...</span>
                            <StatusIndicator status={inspection.verificationDoigt?.proprete?.status || 'V'} />
                          </div>
                          {inspection.verificationDoigt?.proprete?.comment && (
                            <div className="text-xs text-blue-600 italic ml-4 mt-1">
                              Commentaire: {inspection.verificationDoigt.proprete.comment}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Etat du rivet */}
                    <div className="grid grid-cols-[40%_60%] gap-2 items-start">
                      <div className="text-xs text-gray-700 ml-2">- Vérifier l'état du rivet:</div>
                      <div className="space-y-1">
                        <div className="bg-gray-100 p-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs text-gray-700 flex-1">{renderCrossedOutText("craquelure / Déformation / Corrosion / Jeu...", "verificationDoigt.etatRivet")}</span>
                            <StatusIndicator status={inspection.verificationDoigt?.etatRivet?.status || 'V'} />
                          </div>
                          {inspection.verificationDoigt?.etatRivet?.comment && (
                            <div className="text-xs text-blue-600 italic ml-4 mt-1">
                              Commentaire: {inspection.verificationDoigt.etatRivet.comment}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Ouverture manuelle */}
                    <div className="grid grid-cols-[40%_60%] gap-2 items-start">
                      <div className="text-xs text-gray-700 ml-2">- Vérifier l'ouverture manuelle complète du doigt:</div>
                      <div className="bg-gray-100 p-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs text-gray-700 flex-1">Ouverture manuelle complète</span>
                          <StatusIndicator status={inspection.verificationDoigt?.ouvertureManuelle?.status || 'V'} />
                        </div>
                        {inspection.verificationDoigt?.ouvertureManuelle?.comment && (
                          <div className="text-xs text-blue-600 italic ml-4 mt-1">
                            Commentaire: {inspection.verificationDoigt.ouvertureManuelle.comment}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Fermeture automatique */}
                    <div className="grid grid-cols-[40%_60%] gap-2 items-start">
                      <div className="text-xs text-gray-700 ml-2">- Vérifier fermeture automatique du doigt, l'efficacité du ressort de rappel et l'alignement doigt/bec:</div>
                      <div className="space-y-1">
                        <div className="bg-gray-100 p-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs text-gray-700 flex-1">Efficacité ressort de rappel...</span>
                            <StatusIndicator status={inspection.verificationDoigt?.fermetureAutomatique?.status || 'V'} />
                          </div>
                          {inspection.verificationDoigt?.fermetureAutomatique?.comment && (
                            <div className="text-xs text-blue-600 italic ml-4 mt-1">
                              Commentaire: {inspection.verificationDoigt.fermetureAutomatique.comment}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5. VERIFICATION DE LA BAGUE */}
                <div className="border-b border-gray-200 pb-2">
                  <div className="space-y-2">
                    {/* Marque/Usure */}
                    <div className="grid grid-cols-[40%_60%] gap-2 items-start">
                      <div className="text-xs font-bold text-gray-900 ml-2">5. VERIFICATION DE LA BAGUE: - État:</div>
                      <div className="space-y-1">
                        <div className="bg-gray-100 p-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs text-gray-700 flex-1">{renderCrossedOutText("Marque / Usure / Fissure / Déformation / Corrosion / Jeu...", "verificationBague.marqueUsure")}</span>
                            <StatusIndicator status={inspection.verificationBague?.marqueUsure?.status || 'V'} />
                          </div>
                          {inspection.verificationBague?.marqueUsure?.comment && (
                            <div className="text-xs text-blue-600 italic ml-4 mt-1">
                              Commentaire: {inspection.verificationBague.marqueUsure.comment}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Déverrouillage */}
                    <div className="grid grid-cols-[40%_60%] gap-2 items-start">
                      <div className="text-xs text-gray-700 ml-2">- Bague automatique : - Vérifier le bon fonctionnement du système de déverrouillage de la bague, selon le mode d'ouverture:</div>
                      <div className="space-y-1">
                        <div className="bg-gray-100 p-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs text-gray-700 flex-1">Déverrouillage manuel ou automatique...</span>
                            <StatusIndicator status={inspection.verificationBague?.deverrouillage?.status || 'V'} />
                          </div>
                          {inspection.verificationBague?.deverrouillage?.comment && (
                            <div className="text-xs text-blue-600 italic ml-4 mt-1">
                              Commentaire: {inspection.verificationBague.deverrouillage.comment}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Verrouillage automatique */}
                    <div className="grid grid-cols-[40%_60%] gap-2 items-start">
                      <div className="text-xs text-gray-700 ml-2">- Vérifier le verrouillage automatique lorsque vous relâcher la bague ; Si nécessaire nettoyer:</div>
                      <div className="bg-gray-100 p-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs text-gray-700 flex-1">Verrouillage automatique</span>
                          <StatusIndicator status={inspection.verificationBague?.verrouillageAutomatique?.status || 'V'} />
                        </div>
                        {inspection.verificationBague?.verrouillageAutomatique?.comment && (
                          <div className="text-xs text-blue-600 italic ml-4 mt-1">
                            Commentaire: {inspection.verificationBague.verrouillageAutomatique.comment}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Signature */}
                <div className="pt-4 bg-gray-100 p-2">
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-700 mb-4">Signature</div>
                    
                    {/* Premier cadre : Certificat de contrôleur (PDF) */}
                    <div className="border-2 border-gray-300 rounded-lg p-8 h-24 flex items-center justify-center">
                      {getCurrentCertificate() ? (
                        <div className="text-center">
                          <DocumentIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          <button
                            onClick={() => window.open(`/api/inspection-pdf?url=${encodeURIComponent(getCurrentCertificate()!)}`, '_blank')}
                            className="text-orange-600 hover:text-orange-800 underline text-xs"
                          >
                          Certificat de controleur
                          </button>
                        </div>
                      ) : (
                        <div className="text-gray-400 text-sm">Certificat de controleur</div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <div className="text-xs text-gray-500">Original Signé {inspection.verificateurNom || 'LA'}</div>
                      {inspection.dateSignature && (
                        <div className="text-xs text-gray-500">
                          le {formatDate(inspection.dateSignature)}
                        </div>
                      )}
                    </div>
                    
                    {/* Deuxième cadre : Signature digitale */}
                    {getCurrentDigitalSignature() && (
                      <div>
                        <div className="border-2 border-gray-300 rounded-lg p-8 h-32 flex items-center justify-center mt-4">
                          <img 
                            src={getCurrentDigitalSignature()!} 
                            alt="Signature digitale" 
                            className="max-w-full max-h-24 object-contain" 
                          />
                        </div>
                        <div className="flex items-center justify-center gap-2 mt-2">
                          <div className="text-xs text-gray-500">
                            {inspection.dateSignature ? `Signé le ${formatDate(inspection.dateSignature)}` : 'Signature digitale'}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

