'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { CheckCircleIcon, XMarkIcon, PhotoIcon, QrCodeIcon, DocumentIcon } from '@heroicons/react/24/outline';
import SignaturePad from '../../../../../../components/SignaturePad';

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

export default function EditInspectionPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const inspectionId = params.id as string;
  
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [digitalSignature, setDigitalSignature] = useState('');
  const photoInputRef = useRef<HTMLInputElement>(null);
  const qrInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
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
    dateSignature: '',
    etat: 'OK',
    
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

  // Charger les données de l'inspection
  useEffect(() => {
    const loadInspection = async () => {
      try {
        const response = await fetch(`/api/admin/equipment-detailed-inspections/${inspectionId}`);
        if (response.ok) {
          const data = await response.json();
          setFormData(prev => ({
            ...prev,
            ...data,
            fabricant: data.fabricant || '',
            inspectionData: {
              antecedentProduit: {
                miseEnService: data.antecedentProduit?.miseEnService || '',
              },
              observationsPrelables: {
                referenceInterneMarquee: data.observationsPrelables?.referenceInterneMarquee || { status: 'V' as const, comment: '' },
                lisibiliteNumeroSerie: data.observationsPrelables?.lisibiliteNumeroSerie || { status: 'V' as const, comment: '' },
                dureeVieNonDepassee: data.observationsPrelables?.dureeVieNonDepassee || { status: 'V' as const, comment: '' },
              },
              calotteExterieurInterieur: {
                fentesTrousAccessoires: data.calotteExterieurInterieur?.fentesTrousAccessoires || { status: 'V' as const, comment: '' },
                voletsAeration: data.calotteExterieurInterieur?.voletsAeration || { status: 'NA' as const, comment: '' },
                marqueFissureDeformation: data.calotteExterieurInterieur?.marqueFissureDeformation || { status: 'NA' as const, comment: '' },
              },
              calotin: {
                otezElementsConfort: data.calotin?.otezElementsConfort || { status: 'NA' as const, comment: '' },
              },
              coiffe: {
                etatSanglesFixation: data.coiffe?.etatSanglesFixation || { status: 'V' as const, comment: '' },
              },
              tourDeTete: {
                usureDeformationElement: data.tourDeTete?.usureDeformationElement || { status: 'V' as const, comment: '' },
              },
              systemeReglage: {
                etatFixations: data.systemeReglage?.etatFixations || { status: 'V' as const, comment: '' },
              },
              jugulaire: {
                etatSanglesElements: data.jugulaire?.etatSanglesElements || { status: 'V' as const, comment: '' },
                etatBoucleFermeture: data.jugulaire?.etatBoucleFermeture || { status: 'V' as const, comment: '' },
              },
              mousseConfort: {
                usureDeformationCasse: data.mousseConfort?.usureDeformationCasse || { status: 'V' as const, comment: '' },
              },
              crochetsLampe: {
                usureDeformationCasse: data.crochetsLampe?.usureDeformationCasse || { status: 'V' as const, comment: '' },
              },
              accessoires: {
                fonctionnementEtat: data.accessoires?.fonctionnementEtat || { status: 'NA' as const, comment: '' },
              },
            },
          }));
        } else {
          setError('Erreur lors du chargement de l\'inspection');
        }
      } catch (error) {
        setError('Erreur lors du chargement de l\'inspection');
      } finally {
        setIsLoadingData(false);
      }
    };

    if (inspectionId) {
      loadInspection();
    }
  }, [inspectionId]);

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
    router.push('/');
    return null;
  }

  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement de l'inspection...</p>
        </div>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Si c'est la date d'inspection détaillée, mettre à jour tous les fichiers
    if (name === 'dateInspectionDetaillee' && value) {
      updateAllFilesInspectionDate(value);
    }
  };

  // Fonction pour mettre à jour tous les fichiers avec la nouvelle date d'inspection
  const updateAllFilesInspectionDate = async (newDate: string) => {
    try {
      const response = await fetch(`/api/admin/equipment-detailed-inspections/${inspectionId}/update-inspection-date`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dateInspectionDetaillee: newDate }),
      });

      if (!response.ok) {
        console.error('Erreur lors de la mise à jour des fichiers');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour des fichiers:', error);
    }
  };

  const handleInspectionChange = (section: keyof InspectionData, field: string, status: 'V' | 'NA' | 'X', comment?: string) => {
    setFormData(prev => ({
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
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'qrcode');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({ ...prev, qrCode: data.url }));
        
        // Auto-remplissage basé sur le QR code
        if (data.extractedData) {
          setFormData(prev => ({
            ...prev,
            referenceInterne: data.extractedData.referenceInterne || prev.referenceInterne,
            numeroSerie: data.extractedData.numeroSerie || prev.numeroSerie,
            dateFabrication: data.extractedData.dateFabrication || prev.dateFabrication,
            typeEquipement: data.extractedData.typeEquipement || prev.typeEquipement,
            dateInspectionDetaillee: calculateNextInspectionDate(),
          }));
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

    setIsUploading(true);
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
        if (data.extractedData) {
          setFormData(prev => ({
            ...prev,
            normesCertificat: data.extractedData.normes || prev.normesCertificat,
            documentsReference: data.extractedData.reference || prev.documentsReference,
            dateFabrication: data.extractedData.dateFabrication || prev.dateFabrication,
            dateAchat: data.extractedData.dateAchat || prev.dateAchat,
            numeroSerie: data.extractedData.numeroSerie || prev.numeroSerie,
            pdfUrl: data.extractedData.pdfUrl || prev.pdfUrl,
          }));
        }
      } else {
        throw new Error('Erreur lors de l\'upload du PDF');
      }
    } catch (error) {
      setError('Erreur lors de l\'upload du PDF');
    } finally {
      setIsUploading(false);
    }
  };

  // Fonction pour upload d'image pour date d'achat
  const handleDateAchatUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
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
        if (data.extractedData) {
          setFormData(prev => ({
            ...prev,
            dateAchat: data.extractedData.dateAchat || prev.dateAchat,
          }));
        }
      } else {
        throw new Error('Erreur lors de l\'upload de l\'image');
      }
    } catch (error) {
      setError('Erreur lors de l\'upload de l\'image');
    } finally {
      setIsUploading(false);
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

  // Fonction pour gérer la signature digitale
  const handleDigitalSignature = async (signature: string) => {
    setDigitalSignature(signature);
    setShowSignatureModal(false);
    
    // Enregistrer la signature directement dans formData avec la date actuelle
    const currentDate = new Date().toISOString();
    setFormData(prev => ({ 
      ...prev, 
      verificateurSignaturePdf: signature,
      dateSignature: currentDate
    }));
    
    // Mettre à jour tous les équipements de même type avec cette signature
    await updateAllEquipmentSignatures(signature, currentDate);
  };

  // Fonction pour mettre à jour tous les équipements de même type
  const updateAllEquipmentSignatures = async (signature: string, date: string) => {
    try {
      const response = await fetch(`/api/admin/equipment-detailed-inspections/${inspectionId}/update-all-signatures`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          signature, 
          dateSignature: date 
        }),
      });

      if (!response.ok) {
        console.error('Erreur lors de la mise à jour des signatures');
      } else {
        console.log('Tous les équipements ont été signés');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour des signatures:', error);
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
      const submitData = {
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
          dateSignature: formData.dateSignature || null,
        };
      
      console.log('Envoi dateSignature:', submitData.dateSignature);
      
      const response = await fetch(`/api/admin/equipment-detailed-inspections/${inspectionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        router.push('/admin/equipment-detailed-inspections');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erreur lors de la mise à jour de l\'inspection');
      }
    } catch (error) {
      setError('Erreur lors de la mise à jour de l\'inspection');
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
      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
        currentStatus === status
          ? status === 'V'
            ? 'bg-green-100 text-green-800 border-2 border-green-300'
            : status === 'NA'
            ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-300'
            : 'bg-red-100 text-red-800 border-2 border-red-300'
          : 'bg-gray-100 text-gray-600 border-2 border-gray-200 hover:bg-gray-200'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">
                Modifier l'inspection d'équipement
              </h1>
              <button
                onClick={() => router.back()}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Retour
              </button>
            </div>
          </div>

          <div className="p-6">
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
                             <img src={formData.photo} alt="Équipement" className="max-w-full h-32 object-cover rounded" />
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
                          Référence Interne
                        </label>
                        <input
                          type="text"
                          id="referenceInterne"
                          name="referenceInterne"
                          value={formData.referenceInterne}
                          onChange={handleChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
                            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                            title="Uploader une image/PDF pour extraire la date d'achat"
                          >
                            <PhotoIcon className="h-4 w-4" />
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
                             onChange={handleChange}
                             className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-yellow-50"
                             placeholder="Date de la prochaine inspection"
                           />
                           <button
                             type="button"
                             onClick={() => {
                               const newDate = calculateNextInspectionDate();
                               setFormData(prev => ({ ...prev, dateInspectionDetaillee: newDate }));
                               updateAllFilesInspectionDate(newDate);
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
                            onClick={() => pdfInputRef.current?.click()}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                            title="Uploader un PDF pour auto-remplissage"
                          >
                            <DocumentIcon className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          Uploader un PDF pour extraire automatiquement les documents de référence
                        </p>
                        {/* Affichage des documents cliquables */}

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
                        <textarea
                          id="commentaire"
                          name="commentaire"
                          rows={3}
                          value={formData.commentaire}
                          onChange={handleChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
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
                            <span className="text-sm text-gray-700">Fentes et trous accessoires</span>
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
                            <span className="text-sm text-gray-700">Volets aération si il y a, (fonctionnement)</span>
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
                            <span className="text-sm text-gray-700">Marque/Fissure/Déformation</span>
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
                            <span className="text-sm text-gray-700">Ôtez éléments de confort si nécessaire</span>
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
                            <span className="text-sm text-gray-700">Etat des sangles et de leurs fixation dans la calotte</span>
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
                          6. TOUR DE TETE
                        </h3>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">Usure/Déformation/Elément manquant/Fixation</span>
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
                            <span className="text-sm text-gray-700">Etat, fixations; actionner système dans les deux sens</span>
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
                            <span className="text-sm text-gray-700">Etat sangles et éléments de réglage</span>
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
                            <span className="text-sm text-gray-700">Etat de la boucle de fermeture jugulaire</span>
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
                          9. MOUSSE DE CONFORT
                        </h3>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">Démonter pour laver ou remplacer quand c'est nécessaire</span>
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
                          10. CROCHETS DE LAMPE
                        </h3>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">Usure/Déformation/Casse/Elément manquant</span>
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
                          11. ACCESSOIRES: Visière, lampe
                        </h3>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">Fonctionnement/Etat</span>
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

                      {/* Signature */}
                      <div className="border-b border-gray-200 pb-4">
                        <h3 className="text-sm font-medium text-gray-900 mb-3">
                          Signature
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
                                {formData.verificateurSignaturePdf || digitalSignature ? (
                                  <div className="text-green-600 text-sm">
                                    <DocumentIcon className="h-6 w-6 mx-auto mb-2" />
                                    {formData.verificateurSignaturePdf ? (
                                      <a 
                                        href={formData.verificateurSignaturePdf} 
                                        target="_blank" 
                                        className="text-blue-600 hover:text-blue-800 underline text-xs"
                                      >
                                        <div>Certificat du controleur</div>
                                      </a>
                                    ) : (
                                      <div className="text-gray-600">
                                        <img src={digitalSignature} alt="Signature digitale" className="h-16 mx-auto object-contain" />
                                        <div className="text-xs mt-2">Signature digitale enregistrée</div>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="text-gray-400 text-sm">
                                    <DocumentIcon className="h-6 w-6 mx-auto mb-2" />
                                    <div>Zone de signature</div>
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col space-y-2">
                                <button
                                  type="button"
                                  onClick={() => setShowSignatureModal(true)}
                                  className="inline-flex items-center px-3 py-2 border border-indigo-300 rounded-md text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100"
                                  title="Signature digitale"
                                >
                                  ✍️ Signer
                                </button>
                                <button
                                  type="button"
                                  onClick={() => signatureInputRef.current?.click()}
                                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                  title="Uploader une signature PDF"
                                >
                                  <DocumentIcon className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                            <input
                              ref={signatureInputRef}
                              type="file"
                              accept=".pdf"
                              onChange={handleSignatureUpload}
                              className="hidden"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                              Cliquez sur <span 
                                className="text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
                                onClick={() => setShowSignatureModal(true)}
                              >
                                "Uploader un PDF de signature Original" 
                              </span> ou signez digitalement
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Mise à jour...' : 'Mettre à jour l\'inspection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Modal de signature digitale */}
      {showSignatureModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Signature digitale</h3>
            <p className="text-sm text-gray-600 mb-4">
              Signez ci-dessous avec votre curseur ou votre doigt
            </p>
            <SignaturePad
              onSave={handleDigitalSignature}
              width={400}
              height={200}
            />
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowSignatureModal(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
