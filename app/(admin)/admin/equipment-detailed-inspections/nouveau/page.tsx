'use client';

import { useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { CheckCircleIcon, XMarkIcon, PhotoIcon, QrCodeIcon, DocumentIcon } from '@heroicons/react/24/outline';

interface InspectionPoint {
  status: 'V' | 'NA' | 'X';
  comment?: string;
}

interface InspectionData {
  antecedentProduit: {
    miseEnService: string;
  };
  observationsPrelables: {
    referenceInterneMarquee: InspectionPoint;
    lisibiliteNumeroSerie: InspectionPoint;
    dureeVieNonDepassee: InspectionPoint;
  };
  calotteExterieurInterieur: {
    fentesTrousAccessoires: InspectionPoint;
    voletsAeration: InspectionPoint;
    marqueFissureDeformation: InspectionPoint;
  };
  calotin: {
    otezElementsConfort: InspectionPoint;
  };
  coiffe: {
    etatSanglesFixation: InspectionPoint;
  };
  tourDeTete: {
    usureDeformationElement: InspectionPoint;
  };
  systemeReglage: {
    etatFixations: InspectionPoint;
  };
  jugulaire: {
    etatSanglesElements: InspectionPoint;
    etatBoucleFermeture: InspectionPoint;
  };
  mousseConfort: {
    usureDeformationCasse: InspectionPoint;
  };
  crochetsLampe: {
    usureDeformationCasse: InspectionPoint;
  };
  accessoires: {
    fonctionnementEtat: InspectionPoint;
  };
}

export default function NouvelleInspectionPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingPDF, setIsUploadingPDF] = useState(false);
  const [isUploadingDocuments, setIsUploadingDocuments] = useState(false);
  const [isUploadingDateAchat, setIsUploadingDateAchat] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const qrInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const documentsInputRef = useRef<HTMLInputElement>(null);
  const dateAchatInputRef = useRef<HTMLInputElement>(null);
  const signatureInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    // Identification équipement
    referenceInterne: '',
    typeEquipement: 'Casque',
    numeroSerie: '',
    dateFabrication: '',
    dateAchat: '',
    dateMiseEnService: '',
    dateInspectionDetaillee: '',
    numeroKit: '',
    taille: '',
    longueur: '',
    normesCertificat: '',
    documentsReference: '',
    consommation: '',
    attribution: '',
    commentaire: '',
    photo: '',
    qrCode: '',
    pdfUrl: '',
    dateAchatImage: '',
    verificateurSignaturePdf: '',
    etat: 'INVALID', // État invalide par défaut
    
    // Nouveaux champs pour QR code
    fabricant: '',
    nature: '',
    reference: '',
    type: '',
    normes: '',
    date: '',
    signataire: '',
    
    // Vie de l'équipement
    inspectionData: {
      antecedentProduit: {
        miseEnService: '',
      },
      observationsPrelables: {
        referenceInterneMarquee: { status: 'V' as const, comment: '' },
        lisibiliteNumeroSerie: { status: 'V' as const, comment: '' },
        dureeVieNonDepassee: { status: 'V' as const, comment: '' },
      },
      calotteExterieurInterieur: {
        fentesTrousAccessoires: { status: 'V' as const, comment: '' },
        voletsAeration: { status: 'NA' as const, comment: '' },
        marqueFissureDeformation: { status: 'NA' as const, comment: '' },
      },
      calotin: {
        otezElementsConfort: { status: 'NA' as const, comment: '' },
      },
      coiffe: {
        etatSanglesFixation: { status: 'V' as const, comment: '' },
      },
      tourDeTete: {
        usureDeformationElement: { status: 'V' as const, comment: '' },
      },
      systemeReglage: {
        etatFixations: { status: 'V' as const, comment: '' },
      },
      jugulaire: {
        etatSanglesElements: { status: 'V' as const, comment: '' },
        etatBoucleFermeture: { status: 'V' as const, comment: '' },
      },
      mousseConfort: {
        usureDeformationCasse: { status: 'V' as const, comment: '' },
      },
      crochetsLampe: {
        usureDeformationCasse: { status: 'V' as const, comment: '' },
      },
      accessoires: {
        fonctionnementEtat: { status: 'NA' as const, comment: '' },
      },
    },
    
    // Signature
    verificateurSignature: '',
    verificateurNom: '',
  });

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
    router.push('/');
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleInspectionChange = (section: string, field: string, status: 'V' | 'NA' | 'X', comment?: string) => {
    setFormData((prev) => ({
      ...prev,
      inspectionData: {
        ...prev.inspectionData,
        [section]: {
          ...prev.inspectionData[section as keyof InspectionData],
          [field]: { status, comment: comment || '' },
        },
      },
    }));
  };

  // Fonction pour calculer la prochaine date d'inspection (6 mois)
  const calculateNextInspectionDate = () => {
    const today = new Date();
    const nextInspection = new Date(today);
    nextInspection.setMonth(today.getMonth() + 6);
    return nextInspection.toLocaleDateString('fr-FR');
  };

  // Fonction pour vérifier si la date d'inspection détaillée est valide
  const isInspectionDateValid = (dateString: string) => {
    if (!dateString) return false;
    
    try {
      let inspectionDate: Date;
      
      // Gérer le format français DD/MM/YYYY
      if (dateString.includes('/')) {
        const [day, month, year] = dateString.split('/');
        inspectionDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      } else {
        // Format standard
        inspectionDate = new Date(dateString);
      }
      
      const today = new Date();
      
      // Vérifier si la date est dans le futur (valide)
      return inspectionDate > today;
    } catch (error) {
      return false;
    }
  };

  // Fonction pour mettre à jour l'état basé sur la date d'inspection
  const updateEtatBasedOnInspectionDate = (inspectionDate: string) => {
    const isValid = isInspectionDateValid(inspectionDate);
    setFormData(prev => ({
      ...prev,
      etat: isValid ? 'OK' : 'INVALID'
    }));
  };

  // Fonction pour upload de photo
  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'photo');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({ ...prev, photo: data.url }));
      } else {
        throw new Error('Erreur lors de l\'upload de la photo');
      }
    } catch (error) {
      setError('Erreur lors de l\'upload de la photo');
    } finally {
      setIsUploading(false);
    }
  };

  // Fonction pour upload de QR code
  const handleQRCodeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // 1. Upload du fichier vers le serveur
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'qrcode');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        
        // 2. Extraction côté client avec qr-scanner
        try {
          const QrScanner = (await import('qr-scanner')).default;
          
          // Créer un canvas temporaire pour l'image
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const img = new Image();
          
          img.onload = async () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx?.drawImage(img, 0, 0);
            
            try {
              // Utiliser qr-scanner pour extraire les données
              const result = await QrScanner.scanImage(img);
              console.log('QR Code - Données extraites côté client:', result);
              
              // Parser les données JSON du QR code
              let qrData: any = {};
              try {
                qrData = JSON.parse(result);
                console.log('QR Code - JSON parsé:', qrData);
              } catch (parseError) {
                console.log('QR Code - Pas de JSON, utilisation du texte brut');
                qrData = { rawText: result };
              }
              
              // Auto-remplissage basé sur le QR code
              const nextInspectionDate = calculateNextInspectionDate();
              setFormData(prev => ({
                ...prev,
                // URL du QR code
                qrCode: data.url,
                
                // Champs d'inspection existants
                referenceInterne: qrData.reference || qrData.referenceInterne || prev.referenceInterne,
                numeroSerie: qrData.numeroSerie || prev.numeroSerie,
                dateFabrication: qrData.dateFabrication || prev.dateFabrication,
                typeEquipement: qrData.produit || qrData.typeEquipement || prev.typeEquipement,
                dateInspectionDetaillee: nextInspectionDate,
                
                // Nouveaux champs du QR generator
                fabricant: qrData.fabricant || prev.fabricant,
                nature: qrData.nature || prev.nature,
                reference: qrData.reference || prev.reference,
                type: qrData.type || prev.type,
                normes: qrData.normes || prev.normes,
                date: qrData.date || prev.date,
                signataire: qrData.signataire || prev.signataire,
                
                // Mise à jour des champs existants avec les nouvelles données
                normesCertificat: qrData.normes || prev.normesCertificat,
                documentsReference: prev.documentsReference, // Ne pas écraser documentsReference
                dateAchat: qrData.date || prev.dateAchat,
              }));
              
              // Mettre à jour l'état basé sur la nouvelle date d'inspection
              updateEtatBasedOnInspectionDate(nextInspectionDate);
              
              console.log('QR Code - Champs remplis avec succès');
            } catch (qrError) {
              console.error('Erreur extraction QR côté client:', qrError);
              setError('Erreur lors de l\'extraction du QR code');
            }
          };
          
          img.src = URL.createObjectURL(file);
          
        } catch (importError) {
          console.error('Erreur import qr-scanner:', importError);
          setError('Bibliothèque QR Scanner non disponible');
        }
      } else {
        throw new Error('Erreur lors de l\'upload du QR code');
      }
    } catch (error) {
      setError('Erreur lors de l\'upload du QR code');
    } finally {
      setIsUploading(false);
    }
  };

  // Fonction pour upload de PDF (normes et certificats)
  const handlePDFUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingPDF(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'pdf');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        
        // Auto-remplissage basé sur l'extraction du PDF
        // Ne mettre à jour que les champs spécifiques au PDF, préserver les données du QR code
        if (data.extractedData) {
          setFormData(prev => ({
            ...prev,
            // Seulement les champs spécifiques au PDF
            normesCertificat: data.extractedData.normes || prev.normesCertificat,
            documentsReference: data.extractedData.reference || prev.documentsReference,
            pdfUrl: data.extractedData.pdfUrl || prev.pdfUrl,
            // Ne pas écraser les données du QR code (dateFabrication, numeroSerie, dateAchat)
            // Ces champs restent inchangés s'ils ont été remplis par le QR code
          }));
          
          // Afficher les informations d'extraction PDF
          if (data.extractedData.rawText) {
            console.log('PDF - Texte extrait:', data.extractedData.rawText);
            console.log('PDF - Normes détectées:', data.extractedData.normes);
            console.log('PDF - Références détectées:', data.extractedData.reference);
            console.log('PDF - Confiance:', data.extractedData.confidence);
          }
        }
      } else {
        throw new Error('Erreur lors de l\'upload du PDF');
      }
    } catch (error) {
      setError('Erreur lors de l\'upload du PDF');
    } finally {
      setIsUploadingPDF(false);
    }
  };

  // Fonction pour upload de PDF pour documents de référence
  const handleDocumentsUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingDocuments(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'reference');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        
        // Auto-remplissage basé sur l'extraction du PDF pour les documents de référence
        if (data.extractedData) {
          setFormData(prev => ({
            ...prev,
            // Seulement le champ documents de référence
            documentsReference: data.extractedData.reference || prev.documentsReference,
            // Ne pas écraser les autres données
          }));
          
          // Afficher les informations d'extraction
          if (data.extractedData.rawText) {
            console.log('Documents - Texte extrait:', data.extractedData.rawText);
            console.log('Documents - Références détectées:', data.extractedData.reference);
            console.log('Documents - Confiance:', data.extractedData.confidence);
          }
        }
      } else {
        throw new Error('Erreur lors de l\'upload du PDF');
      }
    } catch (error) {
      setError('Erreur lors de l\'upload du PDF');
    } finally {
      setIsUploadingDocuments(false);
    }
  };

  // Fonction pour upload d'image pour date d'achat
  const handleDateAchatUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingDateAchat(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'dateAchat');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({ ...prev, dateAchatImage: data.url }));
        
        // Auto-remplissage basé sur l'extraction de l'image
        // Ne mettre à jour que le champ dateAchat, préserver les autres données
        if (data.extractedData) {
          setFormData(prev => ({
            ...prev,
            // Seulement le champ dateAchat
            dateAchat: data.extractedData.dateAchat || prev.dateAchat,
            // Ne pas écraser les données du QR code (dateFabrication, numeroSerie, referenceInterne, typeEquipement)
          }));
          
          // Afficher les informations d'extraction
          if (data.extractedData.rawText) {
            console.log('Texte extrait:', data.extractedData.rawText);
            console.log('Confiance:', data.extractedData.confidence);
          }
        }
      } else {
        throw new Error('Erreur lors de l\'upload de l\'image');
      }
    } catch (error) {
      setError('Erreur lors de l\'upload de l\'image');
    } finally {
      setIsUploadingDateAchat(false);
    }
  };

  // Fonction pour upload de signature PDF
  const handleSignatureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'signature');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({ ...prev, verificateurSignaturePdf: data.url }));
      } else {
        throw new Error('Erreur lors de l\'upload de la signature');
      }
    } catch (error) {
      setError('Erreur lors de l\'upload de la signature');
    } finally {
      setIsUploading(false);
    }
  };

  // Fonction pour rendre les normes cliquables avec liens PDF
  const renderClickableNormes = (text: string) => {
    if (!text || !formData.pdfUrl) return text;
    
    // Remplacer les normes par des liens cliquables vers le PDF
    return text.replace(/([A-Z0-9]+:?\s*[0-9]+(?:\+[A-Z0-9]+:[0-9]+)*)/g, (match, norme) => {
      return `<a href="${formData.pdfUrl}" target="_blank" class="text-blue-600 hover:text-blue-800 underline font-medium">${norme}</a>`;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/equipment-detailed-inspections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          antecedentProduit: formData.inspectionData.antecedentProduit,
          observationsPrelables: formData.inspectionData.observationsPrelables,
          calotteExterieurInterieur: formData.inspectionData.calotteExterieurInterieur,
          calotin: formData.inspectionData.calotin,
          coiffe: formData.inspectionData.coiffe,
          tourDeTete: formData.inspectionData.tourDeTete,
          systemeReglage: formData.inspectionData.systemeReglage,
          jugulaire: formData.inspectionData.jugulaire,
          mousseConfort: formData.inspectionData.mousseConfort,
          crochetsLampe: formData.inspectionData.crochetsLampe,
          accessoires: formData.inspectionData.accessoires,
          // Nouveaux champs du QR Generator
          fabricant: formData.fabricant,
          nature: formData.nature,
          reference: formData.reference,
          type: formData.type,
          normes: formData.normes,
          date: formData.date,
          signataire: formData.signataire,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Une erreur est survenue');
      }

      router.push('/admin/equipment-detailed-inspections');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const StatusButton = ({ 
    currentStatus, 
    status, 
    label, 
    onStatusChange 
  }: { 
    currentStatus: 'V' | 'NA' | 'X'; 
    status: 'V' | 'NA' | 'X'; 
    label: string; 
    onStatusChange: (status: 'V' | 'NA' | 'X') => void;
  }) => (
    <button
      type="button"
      onClick={() => onStatusChange(status)}
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
        currentStatus === status
          ? status === 'V'
            ? 'bg-green-100 text-green-800'
            : status === 'NA'
            ? 'bg-gray-100 text-gray-800'
            : 'bg-red-100 text-red-800'
          : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
      }`}
    >
      {status === 'V' && <CheckCircleIcon className="h-4 w-4 mr-1" />}
      {status === 'X' && <XMarkIcon className="h-4 w-4 mr-1" />}
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Nouvelle Inspection d'Équipement
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Formulaire d'inspection détaillée d'équipement
                </p>
              </div>
              <button
                onClick={() => router.back()}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Retour
              </button>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
              )}

              {isUploading && (
                <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    Upload en cours...
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Colonne gauche - Identification équipement */}
                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
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
                           onChange={handlePhotoUpload}
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
                                  // Fallback vers l'icône si l'image n'existe pas
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
                                  // Fallback vers l'icône si l'image n'existe pas
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
                         onChange={handleQRCodeUpload}
                         className="hidden"
                       />
                      </div>

                    {/* Champs d'identification */}
                    <div className="space-y-4">
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
                          value={formData.fabricant}
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
                        </div>
                        <input
                          ref={dateAchatInputRef}
                          type="file"
                          accept="image/*,.pdf"
                          onChange={handleDateAchatUpload}
                          className="hidden"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Uploader une image/PDF pour extraire automatiquement la date d'achat
                        </p>
                        {/* Aperçu de l'image uploadée */}
                        {formData.dateAchatImage && (
                          <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm">
                            <div className="text-green-800 font-medium mb-1">Image de date d'achat :</div>
                            <img src={formData.dateAchatImage} alt="Date d'achat" className="max-w-full h-24 object-contain rounded" />
                          </div>
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
                            setFormData(prev => ({
                              ...prev,
                              dateMiseEnService: value,
                              inspectionData: {
                                ...prev.inspectionData,
                                antecedentProduit: {
                                  ...prev.inspectionData.antecedentProduit,
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
                               setFormData(prev => ({ ...prev, dateInspectionDetaillee: value }));
                               updateEtatBasedOnInspectionDate(value);
                             }}
                             className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-yellow-50"
                             placeholder="Date de la prochaine inspection"
                           />
                           <button
                             type="button"
                             onClick={() => {
                               const nextDate = calculateNextInspectionDate();
                               setFormData(prev => ({ ...prev, dateInspectionDetaillee: nextDate }));
                               updateEtatBasedOnInspectionDate(nextDate);
                             }}
                             className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                             title="Calculer automatiquement (6 mois)"
                           >
                             <span className="text-xs">+6 mois</span>
                           </button>
                         </div>
                         <p className="mt-1 text-xs text-gray-500">
                           Calcul automatique de la prochaine inspection
                         </p>
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
                          <button
                            type="button"
                            onClick={() => pdfInputRef.current?.click()}
                            disabled={isUploadingPDF}
                            className={`inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium ${
                              isUploadingPDF 
                                ? 'text-gray-400 bg-gray-100 cursor-not-allowed' 
                                : 'text-gray-700 bg-white hover:bg-gray-50'
                            }`}
                            title={isUploadingPDF ? "Upload en cours..." : "Uploader un PDF pour auto-remplissage"}
                          >
                            {isUploadingPDF ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            ) : (
                              <DocumentIcon className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                        <input
                          ref={pdfInputRef}
                          type="file"
                          accept=".pdf"
                          onChange={handlePDFUpload}
                          className="hidden"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Uploader un PDF pour extraire automatiquement les normes
                        </p>
                        {/* Affichage des normes cliquables */}
                        {formData.normesCertificat && formData.pdfUrl && (
                          <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                            <div className="text-blue-800 font-medium mb-1">Normes disponibles :</div>
                            <div 
                              dangerouslySetInnerHTML={{ 
                                __html: renderClickableNormes(formData.normesCertificat) 
                              }}
                            />
                          </div>
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
                        </div>
                        <input
                          ref={documentsInputRef}
                          type="file"
                          accept=".pdf"
                          onChange={handleDocumentsUpload}
                          className="hidden"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Uploader un PDF pour extraire automatiquement les documents de référence
                        </p>
                        {/* Affichage des documents cliquables */}
                        {formData.documentsReference && formData.pdfUrl && (
                          <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm">
                            <div className="text-green-800 font-medium mb-1">Documents disponibles :</div>
                            <div 
                              dangerouslySetInnerHTML={{ 
                                __html: renderClickableNormes(formData.documentsReference) 
                              }}
                            />
                          </div>
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

                      {/* Nouveaux champs du QR Generator */}
                      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h3 className="text-sm font-medium text-blue-900 mb-3">
                          Informations du QR Code (Déclaration UE de conformité)
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="nature" className="block text-sm font-medium text-gray-700">
                              Nature
                            </label>
                            <input
                              type="text"
                              id="nature"
                              name="nature"
                              value={formData.nature}
                              onChange={handleChange}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-blue-50"
                              placeholder="Ex: Déclaration UE de conformité"
                            />
                          </div>

                          <div>
                            <label htmlFor="reference" className="block text-sm font-medium text-gray-700">
                              Référence
                            </label>
                            <input
                              type="text"
                              id="reference"
                              name="reference"
                              value={formData.reference}
                              onChange={handleChange}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-blue-50"
                              placeholder="Ex: A010CA00"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                              Cette référence sera automatiquement copiée dans "Référence interne"
                            </p>
                          </div>

                          <div>
                            <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                              Type
                            </label>
                            <input
                              type="text"
                              id="type"
                              name="type"
                              value={formData.type}
                              onChange={handleChange}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-blue-50"
                              placeholder="Ex: Équipement de protection individuelle (EPI)"
                            />
                          </div>

                          <div>
                            <label htmlFor="normes" className="block text-sm font-medium text-gray-700">
                              Normes
                            </label>
                            <input
                              type="text"
                              id="normes"
                              name="normes"
                              value={formData.normes}
                              onChange={handleChange}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-blue-50"
                              placeholder="Ex: EN 397, EN 50365"
                            />
                          </div>

                          <div>
                            <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                              Date
                            </label>
                            <input
                              type="text"
                              id="date"
                              name="date"
                              value={formData.date}
                              onChange={handleChange}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-blue-50"
                              placeholder="Ex: 28/03/2019"
                            />
                          </div>

                          <div>
                            <label htmlFor="signataire" className="block text-sm font-medium text-gray-700">
                              Signataire
                            </label>
                            <input
                              type="text"
                              id="signataire"
                              name="signataire"
                              value={formData.signataire}
                              onChange={handleChange}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-blue-50"
                              placeholder="Ex: Bernard Bressoux, Product Risk Director"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Colonne droite - Vie de l'équipement */}
                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                      Vie de l'équipement
                    </h2>

                    {/* Points d'inspection */}
                    <div className="space-y-6">
                      {/* 1. ANTECEDENT DU PRODUIT */}
                      <div className="border-b border-gray-200 pb-4">
                        <h3 className="text-sm font-medium text-gray-900 mb-3">
                          1. ANTECEDENT DU PRODUIT:
                        </h3>
                        <div className="space-y-2">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Mise en service le
                            </label>
                            <input
                              type="date"
                              value={formData.inspectionData.antecedentProduit.miseEnService}
                              onChange={(e) => {
                                const value = e.target.value;
                                setFormData(prev => ({
                                  ...prev,
                                  dateMiseEnService: value,
                                  inspectionData: {
                                    ...prev.inspectionData,
                                    antecedentProduit: {
                                      ...prev.inspectionData.antecedentProduit,
                                      miseEnService: value
                                    }
                                  }
                                }));
                              }}
                              className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          </div>
                        </div>
                      </div>

                      {/* 2. OBSERVATIONS PREALABLES */}
                      <div className="border-b border-gray-200 pb-4">
                        <h3 className="text-sm font-medium text-gray-900 mb-3">
                          2. OBSERVATIONS PREALABLES:
                        </h3>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">Référence Interne marquée et lisible</span>
                            <div className="flex space-x-2">
                              <StatusButton
                                currentStatus={formData.inspectionData.observationsPrelables.referenceInterneMarquee.status}
                                status="V"
                                label="V"
                                onStatusChange={(status) => handleInspectionChange('observationsPrelables', 'referenceInterneMarquee', status)}
                              />
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">Lisibilité Numéro de série, de la norme</span>
                            <div className="flex space-x-2">
                              <StatusButton
                                currentStatus={formData.inspectionData.observationsPrelables.lisibiliteNumeroSerie.status}
                                status="V"
                                label="V"
                                onStatusChange={(status) => handleInspectionChange('observationsPrelables', 'lisibiliteNumeroSerie', status)}
                              />
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">Durée de vie n'est pas dépassée</span>
                            <div className="flex space-x-2">
                              <StatusButton
                                currentStatus={formData.inspectionData.observationsPrelables.dureeVieNonDepassee.status}
                                status="V"
                                label="V"
                                onStatusChange={(status) => handleInspectionChange('observationsPrelables', 'dureeVieNonDepassee', status)}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 3. CALOTTE (Coque) - Extérieur-Intérieur */}
                      <div className="border-b border-gray-200 pb-4">
                        <h3 className="text-sm font-medium text-gray-900 mb-3">
                          3. CALOTTE (Coque): - Extérieur-Intérieur:
                        </h3>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">Fentes et trous accessoires:</span>
                            <div className="flex space-x-2">
                              <StatusButton
                                currentStatus={formData.inspectionData.calotteExterieurInterieur.fentesTrousAccessoires.status}
                                status="V"
                                label="V"
                                onStatusChange={(status) => handleInspectionChange('calotteExterieurInterieur', 'fentesTrousAccessoires', status)}
                              />
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">Volets aération si il y a, (fonctionnement):</span>
                            <div className="flex space-x-2">
                              <StatusButton
                                currentStatus={formData.inspectionData.calotteExterieurInterieur.voletsAeration.status}
                                status="NA"
                                label="NA"
                                onStatusChange={(status) => handleInspectionChange('calotteExterieurInterieur', 'voletsAeration', status)}
                              />
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">Marque/Fissure/Déformation/Usure ... Ajouter commentaires</span>
                            <div className="flex space-x-2">
                              <StatusButton
                                currentStatus={formData.inspectionData.calotteExterieurInterieur.marqueFissureDeformation.status}
                                status="NA"
                                label="NA"
                                onStatusChange={(status) => handleInspectionChange('calotteExterieurInterieur', 'marqueFissureDeformation', status)}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 4. CALOTIN */}
                      <div className="border-b border-gray-200 pb-4">
                        <h3 className="text-sm font-medium text-gray-900 mb-3">
                          4. CALOTIN (si il y a):
                        </h3>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">- Ôtez éléments de confort si nécessaire; Ne pas démonté calotin si fixé sur la coque.</span>
                            <div className="flex space-x-2">
                              <StatusButton
                                currentStatus={formData.inspectionData.calotin.otezElementsConfort.status}
                                status="NA"
                                label="NA"
                                onStatusChange={(status) => handleInspectionChange('calotin', 'otezElementsConfort', status)}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 5. COIFFE */}
                      <div className="border-b border-gray-200 pb-4">
                        <h3 className="text-sm font-medium text-gray-900 mb-3">
                          5. COIFFE:
                        </h3>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">- Etat des sangles et de leurs fixation dans la calotte. Usure/Coupure/Brûlure/Déformation... Ajouter commentaires.</span>
                            <div className="flex space-x-2">
                              <StatusButton
                                currentStatus={formData.inspectionData.coiffe.etatSanglesFixation.status}
                                status="V"
                                label="V"
                                onStatusChange={(status) => handleInspectionChange('coiffe', 'etatSanglesFixation', status)}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 6. TOUR DE TETE */}
                      <div className="border-b border-gray-200 pb-4">
                        <h3 className="text-sm font-medium text-gray-900 mb-3">
                          6. TOUR DE TETE:
                        </h3>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">Usure/Déformation/Elément manquant/ Fixation ... ajouter commentaires.</span>
                            <div className="flex space-x-2">
                              <StatusButton
                                currentStatus={formData.inspectionData.tourDeTete.usureDeformationElement.status}
                                status="V"
                                label="V"
                                onStatusChange={(status) => handleInspectionChange('tourDeTete', 'usureDeformationElement', status)}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 7. SYSTEME DE REGLAGE */}
                      <div className="border-b border-gray-200 pb-4">
                        <h3 className="text-sm font-medium text-gray-900 mb-3">
                          7. SYSTEME DE REGLAGE:
                        </h3>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">- Etat, fixations; actionner système dans les deux sens; Tirez sur système pour voir si il se dérègle ou pas. Usure/Déformation / Elément manquant/ Fixation ... ajouter commentaires</span>
                            <div className="flex space-x-2">
                              <StatusButton
                                currentStatus={formData.inspectionData.systemeReglage.etatFixations.status}
                                status="V"
                                label="V"
                                onStatusChange={(status) => handleInspectionChange('systemeReglage', 'etatFixations', status)}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 8. JUGULAIRE */}
                      <div className="border-b border-gray-200 pb-4">
                        <h3 className="text-sm font-medium text-gray-900 mb-3">
                          8. JUGULAIRE:
                        </h3>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">- Etat sangles et éléments de réglage (inspecter les parties cachées également). Usure/Coupure/Brûlure/Déformation... Ajouter commentaires</span>
                            <div className="flex space-x-2">
                              <StatusButton
                                currentStatus={formData.inspectionData.jugulaire.etatSanglesElements.status}
                                status="V"
                                label="V"
                                onStatusChange={(status) => handleInspectionChange('jugulaire', 'etatSanglesElements', status)}
                              />
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">Etat de la boucle de fermeture jugulaire: Casse/Déformation/Fissure / Usure ... ajouter commentaires</span>
                            <div className="flex space-x-2">
                              <StatusButton
                                currentStatus={formData.inspectionData.jugulaire.etatBoucleFermeture.status}
                                status="V"
                                label="V"
                                onStatusChange={(status) => handleInspectionChange('jugulaire', 'etatBoucleFermeture', status)}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 9. MOUSSE DE CONFORT */}
                      <div className="border-b border-gray-200 pb-4">
                        <h3 className="text-sm font-medium text-gray-900 mb-3">
                          9. MOUSSE DE CONFORT:
                        </h3>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">Démonter pour laver ou remplacer quand c'est nécessaire. Usure/Déformation/Casse/ Elément manquant... ajouter commentaires.</span>
                            <div className="flex space-x-2">
                              <StatusButton
                                currentStatus={formData.inspectionData.mousseConfort.usureDeformationCasse.status}
                                status="V"
                                label="V"
                                onStatusChange={(status) => handleInspectionChange('mousseConfort', 'usureDeformationCasse', status)}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 10. CROCHETS DE LAMPE */}
                      <div className="border-b border-gray-200 pb-4">
                        <h3 className="text-sm font-medium text-gray-900 mb-3">
                          10. CROCHETS DE LAMPE:
                        </h3>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">Usure/Déformation/Casse/ Elément manquant... ajouter commentaires.</span>
                            <div className="flex space-x-2">
                              <StatusButton
                                currentStatus={formData.inspectionData.crochetsLampe.usureDeformationCasse.status}
                                status="V"
                                label="V"
                                onStatusChange={(status) => handleInspectionChange('crochetsLampe', 'usureDeformationCasse', status)}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 11. ACCESSOIRES */}
                      <div className="border-b border-gray-200 pb-4">
                        <h3 className="text-sm font-medium text-gray-900 mb-3">
                          11. ACCESSOIRES: Visière, lampe:
                        </h3>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">Fonctionnement / Etat... ajouter commentaires.</span>
                            <div className="flex space-x-2">
                              <StatusButton
                                currentStatus={formData.inspectionData.accessoires.fonctionnementEtat.status}
                                status="NA"
                                label="NA"
                                onStatusChange={(status) => handleInspectionChange('accessoires', 'fonctionnementEtat', status)}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section Signature */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                      <h3 className="text-sm font-medium text-gray-900 mb-4">
                        Vérificateur / signature
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="verificateurNom" className="block text-sm font-medium text-gray-700">
                            Nom du vérificateur
                          </label>
                          <input
                            type="text"
                            id="verificateurNom"
                            name="verificateurNom"
                            value={formData.verificateurNom}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          />
                        </div>
                        <div>
                          <label htmlFor="verificateurSignature" className="block text-sm font-medium text-gray-700">
                            Signature
                          </label>
                          <div className="mt-1 flex space-x-2">
                            <div className="flex-1 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                              {formData.verificateurSignaturePdf ? (
                                <div className="text-green-600 text-sm">
                                  <DocumentIcon className="h-6 w-6 mx-auto mb-2" />
                                  <div>Signature PDF uploadée</div>
                                  <a 
                                    href={formData.verificateurSignaturePdf} 
                                    target="_blank" 
                                    className="text-blue-600 hover:text-blue-800 underline text-xs"
                                  >
                                    Voir le PDF
                                  </a>
                                </div>
                              ) : (
                                <div className="text-gray-400 text-sm">
                                  <DocumentIcon className="h-6 w-6 mx-auto mb-2" />
                                  <div>Zone de signature</div>
                                </div>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => signatureInputRef.current?.click()}
                              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                              title="Uploader une signature PDF"
                            >
                              <DocumentIcon className="h-4 w-4" />
                            </button>
                          </div>
                          <input
                            ref={signatureInputRef}
                            type="file"
                            accept=".pdf"
                            onChange={handleSignatureUpload}
                            className="hidden"
                          />
                          <p className="mt-1 text-xs text-gray-500">
                            Uploader un PDF de signature
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {isLoading ? 'Enregistrement...' : 'Enregistrer l\'inspection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
