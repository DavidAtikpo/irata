'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircleIcon, XMarkIcon, PhotoIcon, QrCodeIcon, DocumentIcon } from '@heroicons/react/24/outline';
import CommentInput from '@/components/CommentInput';
import SignaturePad from '@/components/SignaturePad';

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
  };
  etatSangles: {
    ceintureCuisseBretelles: InspectionPoint;
    etatCouturesSecurite: InspectionPoint;
    presenceOurlets: InspectionPoint;
  };
  pointsAttache: {
    metalliques: InspectionPoint;
    textiles: InspectionPoint;
    plastiques: InspectionPoint;
    indicateurArretChute: InspectionPoint;
  };
  etatBouclesReglages: {
    passageSangles: InspectionPoint;
    fonctionnementBoucles: InspectionPoint;
  };
  etatElementsConfort: {
    mousses: InspectionPoint;
    passantsElastiques: InspectionPoint;
    elastiquesCuisses: InspectionPoint;
    portesMateriels: InspectionPoint;
  };
  etatConnecteurTorseCuissard: {
    corpsMousqueton: InspectionPoint;
    doigtMousqueton: InspectionPoint;
    bagueVerrouillage: InspectionPoint;
  };
  bloqueurCroll: {
    corpsTrousConnexion: InspectionPoint;
    gachette: InspectionPoint;
    taquetSecurite: InspectionPoint;
    fonctionnel: InspectionPoint;
  };
}

export default function NouvelleInspectionPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingPDF, setIsUploadingPDF] = useState(false);
  const [isUploadingDocumentReference, setIsUploadingDocumentReference] = useState(false);
  const [isUploadingDateAchat, setIsUploadingDateAchat] = useState(false);
  const [isUploadingNormes, setIsUploadingNormes] = useState(false);
  const [isUploadingCertificate, setIsUploadingCertificate] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [digitalSignature, setDigitalSignature] = useState('');
  const [prefillLoading, setPrefillLoading] = useState(false);
  const [openCommentFields, setOpenCommentFields] = useState<{[key: string]: boolean}>({});
  const [commentInputs, setCommentInputs] = useState<{[key: string]: string}>({});
  const [crossedOutItems, setCrossedOutItems] = useState<{[key: string]: boolean}>({});
  const [crossedOutWords, setCrossedOutWords] = useState<{[key: string]: {[word: string]: boolean}}>({});
  const commentInputRefs = useRef<{[key: string]: HTMLTextAreaElement | null}>({});

  // Initialiser les refs au montage du composant
  useEffect(() => {
    // Forcer la direction LTR au niveau global pour éviter les problèmes de texte inversé
    document.documentElement.dir = 'ltr';
    document.body.dir = 'ltr';
    document.documentElement.style.direction = 'ltr';
    document.body.style.direction = 'ltr';

    return () => {
      // Nettoyer toutes les refs au démontage
      Object.keys(commentInputRefs.current).forEach(key => {
        commentInputRefs.current[key] = null;
      });
    };
  }, []);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const qrInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null); // Documents Référence
  const normesPdfInputRef = useRef<HTMLInputElement>(null); // Normes et Certificat
  const dateAchatInputRef = useRef<HTMLInputElement>(null);
  const signatureInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    // Identification équipement
    referenceInterne: '',
    typeEquipement: 'Harnais de Suspension',
    numeroSerie: '',
    numeroSerieTop: '',
    numeroSerieCuissard: '',
    numeroSerieNonEtiquete: '',
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
    normesUrl: '',
    dateAchatImage: '',
    verificateurSignaturePdf: '',
    verificateurDigitalSignature: '',
    dateSignature: '',
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
        comment: '',
      },
      observationsPrelables: {
        referenceInterneMarquee: { status: 'V' as const, comment: '' },
        lisibiliteNumeroSerie: { status: 'V' as const, comment: '' },
        dureeVieNonDepassee: { status: 'V' as const, comment: '' },
      },
      etatSangles: {
        ceintureCuisseBretelles: { status: 'V' as const, comment: '' },
        etatCouturesSecurite: { status: 'V' as const, comment: '' },
        presenceOurlets: { status: 'V' as const, comment: '' },
      },
      pointsAttache: {
        metalliques: { status: 'V' as const, comment: '' },
        textiles: { status: 'V' as const, comment: '' },
        plastiques: { status: 'V' as const, comment: '' },
        indicateurArretChute: { status: 'V' as const, comment: '' },
      },
      etatBouclesReglages: {
        passageSangles: { status: 'V' as const, comment: '' },
        fonctionnementBoucles: { status: 'V' as const, comment: '' },
      },
      etatElementsConfort: {
        mousses: { status: 'V' as const, comment: '' },
        passantsElastiques: { status: 'V' as const, comment: '' },
        elastiquesCuisses: { status: 'V' as const, comment: '' },
        portesMateriels: { status: 'V' as const, comment: '' },
      },
      etatConnecteurTorseCuissard: {
        corpsMousqueton: { status: 'NA' as const, comment: '' },
        doigtMousqueton: { status: 'NA' as const, comment: '' },
        bagueVerrouillage: { status: 'NA' as const, comment: '' },
      },
      bloqueurCroll: {
        corpsTrousConnexion: { status: 'V' as const, comment: '' },
        gachette: { status: 'V' as const, comment: '' },
        taquetSecurite: { status: 'V' as const, comment: '' },
        fonctionnel: { status: 'V' as const, comment: '' },
      },
    },
    
    // Signature
    verificateurSignature: '',
    verificateurNom: '',
  });

  // Charger les données du QR code si présent dans l'URL
  useEffect(() => {
    const qrCode = searchParams.get('qrCode');
    const prefill = searchParams.get('prefill');
    
    if (qrCode && prefill === 'true' && !prefillLoading) {
      fetchEquipmentData(qrCode);
    }
  }, [searchParams]);

  const fetchEquipmentData = async (qrCode: string) => {
    setPrefillLoading(true);
    try {
      const response = await fetch(`/api/qr-equipment/${qrCode}`);
      
      if (!response.ok) {
        console.error('Équipement non trouvé');
        return;
      }

      const equipmentData = await response.json();
      
      // Pré-remplir le formulaire avec les données de l'équipement
      setFormData(prev => ({
        ...prev,
        referenceInterne: equipmentData.referenceInterne || '',
        numeroSerie: equipmentData.numeroSerie || '',
        normesCertificat: equipmentData.normesCertificat || equipmentData.normes || '', // Remplir avec les normes
        fabricant: equipmentData.fabricant || '',
        date: equipmentData.dateControle || '',
        signataire: equipmentData.signataire || '',
        pdfUrl: equipmentData.pdfUrl || '',
        nature: 'Déclaration UE de conformité',
        reference: equipmentData.referenceInterne || '',
        normes: equipmentData.normes || equipmentData.normesCertificat || '',
      }));

      console.log('✅ Formulaire pré-rempli avec les données du QR code:', qrCode);
    } catch (error) {
      console.error('Erreur lors du chargement des données de l\'équipement:', error);
    } finally {
      setPrefillLoading(false);
    }
  };

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

  // Fonction pour ouvrir/fermer l'input de commentaire
  const toggleCommentInput = (key: string) => {
    const isOpening = !openCommentFields[key];

    setOpenCommentFields(prev => ({
      ...prev,
      [key]: !prev[key]
    }));

    // Si l'input s'ouvre, initialiser avec le commentaire existant s'il y en a un
    if (isOpening) {
      const [section, field] = key.split('.');
      
      // Cas spécial pour antecedentProduit.comment
      let currentComment = '';
      if (section === 'antecedentProduit' && field === 'comment') {
        currentComment = formData.inspectionData.antecedentProduit.comment || '';
      } else {
      const sectionData = formData.inspectionData[section as keyof InspectionData] as any;
        currentComment = sectionData[field]?.comment || '';
      }
      
      setCommentInputs(prev => ({
        ...prev,
        [key]: currentComment
      }));

      // Focus sur le textarea après que le state a été mis à jour
      setTimeout(() => {
        const textarea = commentInputRefs.current[key];
        if (textarea) {
          textarea.focus();
          // S'assurer que le curseur est à la fin du texte
          textarea.setSelectionRange(textarea.value.length, textarea.value.length);
        }
      }, 100);
    } else {
      // Si on ferme l'input, nettoyer la ref
      if (commentInputRefs.current[key]) {
        commentInputRefs.current[key] = null;
      }
    }
  };

  // Fonction pour basculer l'état barré d'un élément
  const toggleCrossedOut = (key: string) => {
    setCrossedOutItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Fonction pour basculer l'état barré d'un mot spécifique
  const toggleCrossedOutWord = (key: string, word: string) => {
    setCrossedOutWords(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [word]: !prev[key]?.[word]
      }
    }));
  };

  // Fonction pour enregistrer le commentaire
  const saveComment = (key: string, section: string, field: string) => {
    const comment = commentInputs[key] || '';

    // Cas spécial pour antecedentProduit.comment
    if (section === 'antecedentProduit' && field === 'comment') {
      setFormData(prev => ({
        ...prev,
        inspectionData: {
          ...prev.inspectionData,
          antecedentProduit: {
            ...prev.inspectionData.antecedentProduit,
            comment: comment
          }
        }
      }));
    } else {
    const sectionData = formData.inspectionData[section as keyof InspectionData] as any;
    const fieldData = sectionData[field];
    const currentStatus = fieldData?.status || 'V';

    handleInspectionChange(section, field, currentStatus, comment);
    }

    setOpenCommentFields(prev => ({
      ...prev,
      [key]: false
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
              
              // Vérifier si c'est une URL vers /equipment/[code]
              let qrData: any = {};
              
              if (result.includes('/qr-equipment/') || result.includes('/equipment/')) {
                // Nouveau système : URL vers la page équipement
                console.log('QR Code - URL détectée, extraction du code équipement');
                const codeMatch = result.match(/\/(?:qr-)?equipment\/([a-zA-Z0-9_-]+)/);
                if (codeMatch && codeMatch[1]) {
                  const equipmentCode = codeMatch[1];
                  console.log('Code équipement extrait:', equipmentCode);
                  
                  // Charger les données depuis l'API
                  try {
                    const response = await fetch(`/api/qr-equipment/${equipmentCode}`);
                    if (response.ok) {
                      const equipmentData = await response.json();
                      console.log('Données équipement chargées depuis l\'API:', equipmentData);
                      
                      // Mapper les données de l'API au format attendu
                      qrData = {
                        referenceInterne: equipmentData.referenceInterne,
                        numeroSerie: equipmentData.numeroSerie,
                        fabricant: equipmentData.fabricant,
                        normes: equipmentData.normesCertificat || equipmentData.normes,
                        normesCertificat: equipmentData.normesCertificat || equipmentData.normes,
                        date: equipmentData.dateControle,
                        signataire: equipmentData.signataire,
                        produit: equipmentData.produit,
                        nature: 'Déclaration UE de conformité',
                        pdfUrl: equipmentData.pdfUrl
                      };
                    } else {
                      console.error('Erreur lors du chargement des données équipement');
                      setError('Impossible de charger les données de l\'équipement depuis le QR code');
                      return;
                    }
                  } catch (apiError) {
                    console.error('Erreur API:', apiError);
                    setError('Erreur lors de la récupération des données de l\'équipement');
                    return;
                  }
                }
              } else {
                // Ancien système : JSON dans le QR code
                try {
                  qrData = JSON.parse(result);
                  console.log('QR Code - JSON parsé (ancien système):', qrData);
                } catch (parseError) {
                  console.log('QR Code - Pas de JSON, utilisation du texte brut');
                  qrData = { rawText: result };
                }
              }
              
              // Auto-remplissage basé sur le QR code
              setFormData(prev => ({
                ...prev,
                // URL du QR code
                qrCode: data.url,
                
                // Champs d'inspection existants
                referenceInterne: qrData.referenceInterne || qrData.reference || prev.referenceInterne,
                numeroSerie: qrData.numeroSerie || prev.numeroSerie,
                dateFabrication: qrData.date || prev.dateFabrication, // Remplir avec la date du QR code
                typeEquipement: qrData.produit || qrData.typeEquipement || prev.typeEquipement,
                
                // Nouveaux champs du QR generator
                fabricant: qrData.fabricant || prev.fabricant,
                nature: qrData.nature || 'Déclaration UE de conformité',
                reference: qrData.referenceInterne || qrData.reference || prev.reference,
                type: qrData.type || 'Équipement de protection individuelle (EPI)',
                normes: qrData.normes || prev.normes,
                date: qrData.date || prev.date,
                signataire: qrData.signataire || prev.signataire,
                
                // Mise à jour des champs existants avec les nouvelles données
                normesCertificat: qrData.normesCertificat || qrData.normes || prev.normesCertificat, // Remplir les normes du QR code
                documentsReference: prev.documentsReference, // Ne pas écraser documentsReference
                dateAchat: prev.dateAchat, // Ne pas remplir dateAchat avec les données du QR code
                pdfUrl: qrData.pdfUrl || prev.pdfUrl, // URL du PDF depuis l'équipement
              }));
              
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

  // Upload PDF pour extraire UNIQUEMENT les normes
  const handlePDFUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingNormes(true);
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
        // Extraction limitée: ne remplir que les normes; le reste reste manuel
        setFormData(prev => ({
          ...prev,
          normesUrl: (data.extractedData?.pdfUrl || data.url || prev.normesUrl),
          normesCertificat: data.extractedData?.normes || prev.normesCertificat,
        }));
      } else {
        throw new Error('Erreur lors de l\'upload du PDF');
      }
    } catch (error) {
      setError('Erreur lors de l\'upload du PDF');
    } finally {
      setIsUploadingNormes(false);
    }
  };

  // Fonction pour upload d'image/PDF pour date d'achat (sans extraction de date)
  const handleDateAchatUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingDateAchat(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      formDataUpload.append('type', 'dateAchat');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      });

      if (response.ok) {
        const data = await response.json();
        // Stocker seulement l'URL de l'image/PDF, sans extraction de date
        setFormData(prev => ({ ...prev, dateAchatImage: data.url || data.extractedData?.dateAchatUrl || prev.dateAchatImage }));
      } else {
        throw new Error('Erreur lors de l\'upload du fichier');
      }
    } catch (error) {
      setError('Erreur lors de l\'upload du fichier');
    } finally {
      setIsUploadingDateAchat(false);
    }
  };

  // Upload PDF Documents de référence (sans extraction des normes)
  const handleReferencePDFUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingDocumentReference(true);
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
        setFormData(prev => ({
          ...prev,
          pdfUrl: data.url || prev.pdfUrl,
          documentsReference: data.extractedData?.reference || 'document detecte',
        }));
      } else {
        throw new Error('Erreur lors de l\'upload du document de référence');
      }
    } catch (error) {
      setError('Erreur lors de l\'upload du document de référence');
    } finally {
      setIsUploadingDocumentReference(false);
    }
  };


  // Fonction pour upload de signature PDF (certificat de contrôle)
  const handleSignatureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingCertificate(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      formDataUpload.append('type', 'signature');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      });

      if (response.ok) {
        const data = await response.json();
        const certificateUrl = data.url;
        setFormData(prev => ({ ...prev, verificateurSignaturePdf: certificateUrl }));
      } else {
        throw new Error('Erreur lors de l\'upload du certificat');
      }
    } catch (error) {
      setError('Erreur lors de l\'upload du certificat');
    } finally {
      setIsUploadingCertificate(false);
    }
  };

  // Fonction pour gérer la signature digitale
  const handleDigitalSignature = async (signature: string) => {
    setDigitalSignature(signature);
    setShowSignatureModal(false);

    // Enregistrer la signature dans le nouveau champ séparé
    const currentDate = new Date().toISOString();
    setFormData(prev => ({
      ...prev,
      verificateurDigitalSignature: signature,
      dateSignature: currentDate
    }));
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
          etatSangles: formData.inspectionData.etatSangles,
          pointsAttache: formData.inspectionData.pointsAttache,
          etatBouclesReglages: formData.inspectionData.etatBouclesReglages,
          etatElementsConfort: formData.inspectionData.etatElementsConfort,
          etatConnecteurTorseCuissard: formData.inspectionData.etatConnecteurTorseCuissard,
          bloqueurCroll: formData.inspectionData.bloqueurCroll,
          // Nouvelles données pour les éléments barrés
          crossedOutItems: crossedOutItems,
          crossedOutWords: crossedOutWords,
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

  const StatusSelect = ({
    currentStatus, 
    onStatusChange 
  }: { 
    currentStatus: 'V' | 'NA' | 'X'; 
    onStatusChange: (status: 'V' | 'NA' | 'X') => void;
  }) => (
    <select
      value={currentStatus}
      onChange={(e) => onStatusChange(e.target.value as 'V' | 'NA' | 'X')}
      className={`text-xs border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
        currentStatus === 'V'
          ? 'bg-green-50 border-green-200 text-green-800'
          : currentStatus === 'NA'
          ? 'bg-gray-50 border-gray-200 text-gray-800'
          : 'bg-red-50 border-red-200 text-red-800'
      }`}
    >
      <option value="V">V - Valide</option>
      <option value="NA">NA - Non Applicable</option>
      <option value="X">X - Invalide</option>
    </select>
  );

  // Composant réutilisable pour l'input de commentaire
  const CommentInputInline = ({
    fieldKey,
    section,
    field,
    value
  }: {
    fieldKey: string;
    section: string;
    field: string;
    value: any
  }) => {
    if (!openCommentFields[fieldKey]) {
      return null;
    }

    return (
      <div className="mt-2 ml-4">
        <CommentInput
          value={commentInputs[fieldKey] || ''}
          onChange={(newValue) => setCommentInputs(prev => ({...prev, [fieldKey]: newValue}))}
          onSave={() => saveComment(fieldKey, section, field)}
          onCancel={() => toggleCommentInput(fieldKey)}
          className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          placeholder="Ajouter votre commentaire..."
          rows={2}
          autoFocus={true}
        />
      </div>
    );
  };

  // Composant pour rendre du texte avec mots cliquables
  const ClickableText = ({
    text,
    fieldKey,
    className = "text-sm text-gray-700"
  }: {
    text: string;
    fieldKey: string;
    className?: string;
  }) => {
    // Diviser le texte en mots et séparateurs
    const parts = text.split(/(\s+|\/|\(|\)|-|\.)/);

    return (
      <span className={className}>
        {parts.map((part, index) => {
          // Si c'est un séparateur (espaces, /, (), etc.), l'afficher tel quel
          if (/^\s+$/.test(part) || /^[\/\(\)\-\.]+$/.test(part)) {
            return <span key={index}>{part}</span>;
          }

          // Si c'est un mot, le rendre cliquable
          const isCrossed = crossedOutWords[fieldKey]?.[part];
          return (
            <span
              key={index}
              className={`cursor-pointer hover:bg-gray-200 px-0.5 rounded transition-colors ${isCrossed ? 'line-through' : ''}`}
              onClick={() => toggleCrossedOutWord(fieldKey, part)}
              title={`Cliquez pour ${isCrossed ? 'débarrer' : 'barrer'} "${part}"`}
            >
              {part}
            </span>
          );
        })}
      </span>
    );
  };

  // Composant complet pour le commentaire
  const CommentSection = ({
    fieldKey,
    section,
    field,
    value
  }: {
    fieldKey: string;
    section: string;
    field: string;
    value: any
  }) => (
    <>
      <CommentInputInline fieldKey={fieldKey} section={section} field={field} value={value} />
      {value.comment && (
        <div className="text-xs text-gray-600 italic ml-4 mt-1">
          Commentaire: {value.comment}
        </div>
      )}
    </>
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

            {prefillLoading && (
              <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-700 mr-3"></div>
                <span>Chargement des données de l'équipement depuis le QR code...</span>
              </div>
            )}

            {searchParams.get('prefill') === 'true' && !prefillLoading && formData.referenceInterne && (
              <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded flex items-center">
                <CheckCircleIcon className="h-5 w-5 mr-3" />
                <div>
                  <strong>Formulaire pré-rempli !</strong>
                  <p className="text-sm mt-1">Les données de l'équipement ont été chargées automatiquement depuis le QR code.</p>
                </div>
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
              <div className="grid grid-cols-1 lg:grid-cols-6 gap-8">
                {/* Colonne gauche - Identification équipement */}
                <div className="lg:col-span-2 space-y-6">
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
                           onChange={handlePhotoUpload}
                           className="hidden"
                         />
                        </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          État
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              etat: prev.etat === 'OK' ? 'INVALID' : 'OK'
                            }));
                          }}
                          className={`w-full flex items-center justify-center h-20 rounded-lg transition-colors cursor-pointer ${
                            formData.etat === 'OK' 
                              ? 'bg-green-100 hover:bg-green-200' 
                              : 'bg-red-100 hover:bg-red-200'
                          }`}
                        >
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
                        </button>
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
                        <label htmlFor="numeroSerieTop" className="block text-sm font-medium text-gray-700">
                          N° de série Top
                        </label>
                        <input
                          type="text"
                          id="numeroSerieTop"
                          name="numeroSerieTop"
                          value={formData.numeroSerieTop}
                          onChange={handleChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          placeholder="N A"
                        />
                      </div>

                      <div>
                        <label htmlFor="numeroSerie" className="block text-sm font-medium text-gray-700">
                          N° de série
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
                        <label htmlFor="numeroSerieCuissard" className="block text-sm font-medium text-gray-700">
                          N° de série Cuissard
                        </label>
                        <input
                          type="text"
                          id="numeroSerieCuissard"
                          name="numeroSerieCuissard"
                          value={formData.numeroSerieCuissard}
                          onChange={handleChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          placeholder="N A"
                        />
                      </div>

                      <div>
                        <label htmlFor="numeroSerieNonEtiquete" className="block text-sm font-medium text-gray-700">
                          Numéro (non étiqueté)
                        </label>
                        <input
                          type="text"
                          id="numeroSerieNonEtiquete"
                          name="numeroSerieNonEtiquete"
                          value={formData.numeroSerieNonEtiquete}
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
                            className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="Ex: 2022-03-15"
                          />
                          <button
                            type="button"
                            onClick={() => dateAchatInputRef.current?.click()}
                            disabled={isUploadingDateAchat}
                            className={`inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium ${
                              isUploadingDateAchat
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'text-gray-700 bg-white hover:bg-gray-50'
                            }`}
                            title="Uploader une image/PDF (sans extraction de date)"
                          >
                            {isUploadingDateAchat ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                                <span className="text-xs">Chargement...</span>
                              </>
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
                          Uploader une image/PDF (la date reste à saisir manuellement)
                        </p>
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
                          <input
                            type="text"
                            id="dateInspectionDetaillee"
                            name="dateInspectionDetaillee"
                            value={formData.dateInspectionDetaillee}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="Date de la prochaine inspection"
                          />
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
                            onClick={() => normesPdfInputRef.current?.click()}
                            disabled={isUploadingNormes}
                            className={`inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium ${
                              isUploadingNormes
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'text-gray-700 bg-white hover:bg-gray-50'
                            }`}
                            title="Importer un PDF pour extraire les normes"
                          >
                            {isUploadingNormes ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                                <span className="text-xs">Chargement...</span>
                              </>
                            ) : (
                              <DocumentIcon className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                        <input
                          ref={normesPdfInputRef}
                          type="file"
                          accept=".pdf"
                          onChange={handlePDFUpload}
                          className="hidden"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Uploader un PDF pour extraire automatiquement les normes (le reste reste manuel)
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
                            disabled={isUploadingDocumentReference}
                            className={`inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium ${
                              isUploadingDocumentReference
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'text-gray-700 bg-white hover:bg-gray-50'
                            }`}
                            title="Uploader un document de référence (PDF)"
                          >
                            {isUploadingDocumentReference ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                                <span className="text-xs">Chargement...</span>
                              </>
                            ) : (
                              <DocumentIcon className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                        <input
                          ref={pdfInputRef}
                          type="file"
                          accept=".pdf"
                          onChange={handleReferencePDFUpload}
                          className="hidden"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Uploader un document de référence (PDF) — aucun remplissage automatique
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
                      {/*  */}
                    </div>
                  </div>
                </div>

                {/* Colonne droite - Vie de l'équipement */}
                <div className="lg:col-span-4 space-y-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                      Vie de l'équipement
                    </h2>

                    {/* Points d'inspection */}
                    <div className="space-y-6" dir="ltr">
                      {/* 1. ANTECEDENT DU PRODUIT */}
                      <div className="border-b border-gray-200 pb-4">
                        <div className="grid grid-cols-[40%_60%] gap-2">
                          <div className="text-sm font-medium text-gray-900">
                          1. ANTECEDENT DU PRODUIT:
                          </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                className="text-[10px] text-red-600 hover:underline"
                                onClick={() => toggleCommentInput('antecedentProduit.comment')}
                              >
                                ajouter commentaires
                              </button>
                            </div>
                            <CommentSection
                              fieldKey="antecedentProduit.comment"
                              section="antecedentProduit"
                              field="comment"
                              value={{ comment: formData.inspectionData.antecedentProduit.comment }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* 2. OBSERVATIONS PREALABLES */}
                      <div className="border-b border-gray-200 pb-4">
                        <div className="grid grid-cols-[40%_60%] gap-2">
                          <div className="text-sm font-medium text-gray-900">
                            2. OBSERVATIONS PREALABLES
                          </div>
                        <div className="space-y-2">
                            <div className="flex flex-col gap-1">
                              <li><span className="text-sm text-gray-700">Référence Interne marquée et lisible</span></li>
                              <div className="flex items-center justify-end gap-2">
                                <StatusSelect
                                currentStatus={formData.inspectionData.observationsPrelables.referenceInterneMarquee.status}
                                onStatusChange={(status) => handleInspectionChange('observationsPrelables', 'referenceInterneMarquee', status)}
                              />
                            </div>
                          </div>
                            <div className="flex flex-col gap-1">
                              <li>
                                <ClickableText
                                  text="Numéro de série lisible, ainsi que la norme"
                                  fieldKey="observationsPrelables.lisibiliteNumeroSerie"
                                />
                              </li>
                              {/* <div className="flex items-center justify-end gap-2">
                                <StatusSelect
                                currentStatus={formData.inspectionData.observationsPrelables.lisibiliteNumeroSerie.status}
                                onStatusChange={(status) => handleInspectionChange('observationsPrelables', 'lisibiliteNumeroSerie', status)}
                              />
                          </div> */}
                            </div>
                            <div className="flex flex-col gap-1">
                              <li><span className="text-sm text-gray-700">Durée de vie n'est pas dépassée</span></li>
                              {/* <div className="flex items-center justify-end gap-2">
                                <StatusSelect
                                currentStatus={formData.inspectionData.observationsPrelables.dureeVieNonDepassee.status}
                                onStatusChange={(status) => handleInspectionChange('observationsPrelables', 'dureeVieNonDepassee', status)}
                              />
                            </div> */}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 3. ETAT DES SANGLES DE */}
                      <div className="border-b border-gray-200 pb-4">
                        <div className="space-y-2">
                          <div className="text-sm font-medium text-gray-900 mb-2">
                            3. ETAT DES SANGLES DE
                          </div>
                          
                          {/* Ceinture / cuisse / bretelles */}
                          <div className="grid grid-cols-[40%_60%] gap-2 items-start">
                            <div className="text-sm text-gray-700 ml-2">- Ceinture / cuisse / liaison cuisse ceinture et bretelles / zones cachées par boucles et points d'attaches</div>
                            <div className="space-y-1">
                              <div className="flex flex-col gap-1">
                                <ClickableText
                                  text="Coupure/Gonflement/Usure Dommage dus à l'utilisation, à des traces de salissures, à la chaleur; aux UV, aux produits..."
                                  fieldKey="etatSangles.ceintureCuisseBretelles"
                                />
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    type="button"
                                    className="text-[10px] text-red-600 hover:underline"
                                    onClick={() => toggleCommentInput('etatSangles.ceintureCuisseBretelles')}
                                  >
                                    ajouter commentaires
                                  </button>
                                  <StatusSelect
                                    currentStatus={formData.inspectionData.etatSangles.ceintureCuisseBretelles.status}
                                    onStatusChange={(status) => handleInspectionChange('etatSangles', 'ceintureCuisseBretelles', status)}
                                  />
                                </div>
                              </div>
                              <CommentSection
                                fieldKey="etatSangles.ceintureCuisseBretelles"
                                section="etatSangles"
                                field="ceintureCuisseBretelles"
                                value={formData.inspectionData.etatSangles.ceintureCuisseBretelles}
                              />
                            </div>
                          </div>

                          {/* Etat coutures sécurité */}
                          <div className="grid grid-cols-[40%_60%] gap-2 items-start">
                            <div className="text-sm text-gray-700 ml-2">- Etat coutures sécurité (dessus/dessous): Fil couleur différente</div>
                            <div className="space-y-1">
                              <div className="flex flex-col gap-1">
                                <ClickableText
                                  text="Fil distendu, usé ou coupé..."
                                  fieldKey="etatSangles.etatCouturesSecurite"
                                />
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    type="button"
                                    className="text-[10px] text-red-600 hover:underline"
                                    onClick={() => toggleCommentInput('etatSangles.etatCouturesSecurite')}
                                  >
                                    ajouter commentaires
                                  </button>
                                  <StatusSelect
                                    currentStatus={formData.inspectionData.etatSangles.etatCouturesSecurite.status}
                                    onStatusChange={(status) => handleInspectionChange('etatSangles', 'etatCouturesSecurite', status)}
                                  />
                                </div>
                              </div>
                              <CommentSection
                                fieldKey="etatSangles.etatCouturesSecurite"
                                section="etatSangles"
                                field="etatCouturesSecurite"
                                value={formData.inspectionData.etatSangles.etatCouturesSecurite}
                              />
                            </div>
                          </div>

                          {/* Présence des ourlets */}
                          <div className="grid grid-cols-[40%_60%] gap-2 items-start">
                            <div className="text-sm text-gray-700 ml-2">- Présence des ourlets en bout de sangle</div>
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center justify-end gap-2">
                                <StatusSelect
                                  currentStatus={formData.inspectionData.etatSangles.presenceOurlets.status}
                                  onStatusChange={(status) => handleInspectionChange('etatSangles', 'presenceOurlets', status)}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 4. POINTS D'ATTACHE */}
                      <div className="border-b border-gray-200 pb-4">
                        <div className="space-y-2">
                          <div className="grid grid-cols-[40%_60%] gap-2 items-start">
                            <div className="text-sm font-medium text-gray-900">
                              4. POINTS D'ATTACHE  - Métalliques:
                            </div>
                            <div className="space-y-1">
                              <div className="flex flex-col gap-1">
                                <ClickableText
                                  text="Marque/Fissure/Usure/Déformation/Corrosion..."
                                  fieldKey="pointsAttache.metalliques"
                                />
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    type="button"
                                    className="text-[10px] text-red-600 hover:underline"
                                    onClick={() => toggleCommentInput('pointsAttache.metalliques')}
                                  >
                                    ajouter commentaires
                                  </button>
                                  <StatusSelect
                                    currentStatus={formData.inspectionData.pointsAttache.metalliques.status}
                                    onStatusChange={(status) => handleInspectionChange('pointsAttache', 'metalliques', status)}
                                  />
                                </div>
                              </div>
                              <CommentSection
                                fieldKey="pointsAttache.metalliques"
                                section="pointsAttache"
                                field="metalliques"
                                value={formData.inspectionData.pointsAttache.metalliques}
                              />
                            </div>
                          </div>

                          {/* Textiles */}
                          <div className="grid grid-cols-[40%_60%] gap-2 items-start">
                            <div className="text-sm text-gray-700 ml-2">- Textiles:</div>
                            <div className="space-y-1">
                              <div className="flex flex-col gap-1">
                                <ClickableText
                                  text="Coupure/Usure/Déchirement."
                                  fieldKey="pointsAttache.textiles"
                                />
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    type="button"
                                    className="text-[10px] text-red-600 hover:underline"
                                    onClick={() => toggleCommentInput('pointsAttache.textiles')}
                                  >
                                    Ajouter commentaires
                                  </button>
                                  <StatusSelect
                                    currentStatus={formData.inspectionData.pointsAttache.textiles.status}
                                    onStatusChange={(status) => handleInspectionChange('pointsAttache', 'textiles', status)}
                                  />
                                </div>
                              </div>
                              <CommentSection
                                fieldKey="pointsAttache.textiles"
                                section="pointsAttache"
                                field="textiles"
                                value={formData.inspectionData.pointsAttache.textiles}
                              />
                            </div>
                          </div>

                          {/* Plastiques */}
                          <div className="grid grid-cols-[40%_60%] gap-2 items-start">
                            <div className="text-sm text-gray-700 ml-2">- Plastiques:</div>
                            <div className="space-y-1">
                              <div className="flex flex-col gap-1">
                                <ClickableText
                                  text="Coupure/Usure/Déchirement..."
                                  fieldKey="pointsAttache.plastiques"
                                />
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    type="button"
                                    className="text-[10px] text-red-600 hover:underline"
                                    onClick={() => toggleCommentInput('pointsAttache.plastiques')}
                                  >
                                    ajouter commentaires
                                  </button>
                                  <StatusSelect
                                    currentStatus={formData.inspectionData.pointsAttache.plastiques.status}
                                    onStatusChange={(status) => handleInspectionChange('pointsAttache', 'plastiques', status)}
                                  />
                                </div>
                              </div>
                              <CommentSection
                                fieldKey="pointsAttache.plastiques"
                                section="pointsAttache"
                                field="plastiques"
                                value={formData.inspectionData.pointsAttache.plastiques}
                              />
                            </div>
                          </div>

                          {/* Indicateur arrêt de chute */}
                          <div className="grid grid-cols-[40%_60%] gap-2 items-start">
                            <div className="text-sm text-gray-700 ml-2">- Si indicateur arrêt de chute apparait</div>
                            <div className="flex flex-col gap-1">
                              <ClickableText
                                text="Oui - Non"
                                fieldKey="pointsAttache.indicateurArretChute"
                              />
                              <div className="flex items-center justify-end gap-2">
                                <StatusSelect
                                  currentStatus={formData.inspectionData.pointsAttache.indicateurArretChute.status}
                                  onStatusChange={(status) => handleInspectionChange('pointsAttache', 'indicateurArretChute', status)}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 5. ETAT BOUCLES DE REGLAGES */}
                      <div className="border-b border-gray-200 pb-4">
                        <div className="space-y-2">
                          {/* Grand titre avec Marque/Fissure/Usure/Déformation/Corrosion... */}
                          <div className="grid grid-cols-[40%_60%] gap-2 items-start">
                            <div className="text-sm font-medium text-gray-900">
                              5. ETAT BOUCLES DE REGLAGES
                            </div>
                            <div className="space-y-1">
                              <div className="flex flex-col gap-1">
                                <ClickableText
                                  text="Marque/Fissure/Usure/Déformation/Corrosion..."
                                  fieldKey="etatBouclesReglages.fonctionnementBoucles"
                                />
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    type="button"
                                    className="text-[10px] text-red-600 hover:underline"
                                    onClick={() => toggleCommentInput('etatBouclesReglages.fonctionnementBoucles')}
                                  >
                                    ajouter commentaires
                                  </button>
                                  <StatusSelect
                                    currentStatus={formData.inspectionData.etatBouclesReglages.fonctionnementBoucles.status}
                                    onStatusChange={(status) => handleInspectionChange('etatBouclesReglages', 'fonctionnementBoucles', status)}
                                  />
                                </div>
                              </div>
                              <CommentSection
                                fieldKey="etatBouclesReglages.fonctionnementBoucles"
                                section="etatBouclesReglages"
                                field="fonctionnementBoucles"
                                value={formData.inspectionData.etatBouclesReglages.fonctionnementBoucles}
                              />
                            </div>
                          </div>

                          {/* Passage de sangles */}
                          <div className="grid grid-cols-[40%_60%] gap-2 items-start">
                            <div className="text-sm text-gray-700 ml-2">- Passage de sangles (pas de vrille)</div>
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center justify-end gap-2">
                                <StatusSelect
                                  currentStatus={formData.inspectionData.etatBouclesReglages.passageSangles.status}
                                  onStatusChange={(status) => handleInspectionChange('etatBouclesReglages', 'passageSangles', status)}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Fonctionnement des boucles */}
                          <div className="grid grid-cols-[40%_60%] gap-2 items-start">
                            <div className="text-sm text-gray-700 ml-2">- Fonctionnement des boucles</div>
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center justify-end gap-2">
                                <StatusSelect
                                  currentStatus={formData.inspectionData.etatBouclesReglages.fonctionnementBoucles.status}
                                  onStatusChange={(status) => handleInspectionChange('etatBouclesReglages', 'fonctionnementBoucles', status)}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 6. ETAT ELEMENTS DE CONFORT */}
                      <div className="border-b border-gray-200 pb-4">
                        <div className="space-y-2">
                          {/* Grand titre avec Passants élastiques ou plastiques */}
                          <div className="grid grid-cols-[40%_60%] gap-2 items-start">
                            <div className="text-sm font-medium text-gray-900">
                              6. ETAT ELEMENTS DE CONFORT - Passants élastiques ou plastiques:
                            </div>
                            <div className="space-y-1">
                              <div className="flex flex-col gap-1">
                                <ClickableText
                                  text="Coupure/Déchirement/Usure..."
                                  fieldKey="etatElementsConfort.passantsElastiques"
                                />
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    type="button"
                                    className="text-[10px] text-red-600 hover:underline"
                                    onClick={() => toggleCommentInput('etatElementsConfort.passantsElastiques')}
                                  >
                                    ajouter commentaires
                                  </button>
                                  <StatusSelect
                                    currentStatus={formData.inspectionData.etatElementsConfort.passantsElastiques.status}
                                    onStatusChange={(status) => handleInspectionChange('etatElementsConfort', 'passantsElastiques', status)}
                                  />
                                </div>
                              </div>
                              <CommentSection
                                fieldKey="etatElementsConfort.passantsElastiques"
                                section="etatElementsConfort"
                                field="passantsElastiques"
                                value={formData.inspectionData.etatElementsConfort.passantsElastiques}
                              />
                            </div>
                          </div>

                          {/* Elastiques de cuisses */}
                          <div className="grid grid-cols-[40%_60%] gap-2 items-start">
                            <div className="text-sm text-gray-700 ml-2">- Elastiques de cuisses:</div>
                            <div className="space-y-1">
                              <div className="flex flex-col gap-1">
                                <ClickableText
                                  text="Coupure/Déchirement/Usure..."
                                  fieldKey="etatElementsConfort.elastiquesCuisses"
                                />
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    type="button"
                                    className="text-[10px] text-red-600 hover:underline"
                                    onClick={() => toggleCommentInput('etatElementsConfort.elastiquesCuisses')}
                                  >
                                    ajouter commentaires
                                  </button>
                                  <StatusSelect
                                    currentStatus={formData.inspectionData.etatElementsConfort.elastiquesCuisses.status}
                                    onStatusChange={(status) => handleInspectionChange('etatElementsConfort', 'elastiquesCuisses', status)}
                                  />
                                </div>
                              </div>
                              <CommentSection
                                fieldKey="etatElementsConfort.elastiquesCuisses"
                                section="etatElementsConfort"
                                field="elastiquesCuisses"
                                value={formData.inspectionData.etatElementsConfort.elastiquesCuisses}
                              />
                            </div>
                          </div>

                          {/* Portes matériels */}
                          <div className="grid grid-cols-[40%_60%] gap-2 items-start">
                            <div className="text-sm text-gray-700 ml-2">- Portes matériels:</div>
                            <div className="space-y-1">
                              <div className="flex flex-col gap-1">
                                <ClickableText
                                  text="Coupure/Déchirement/Usure..."
                                  fieldKey="etatElementsConfort.portesMateriels"
                                />
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    type="button"
                                    className="text-[10px] text-red-600 hover:underline"
                                    onClick={() => toggleCommentInput('etatElementsConfort.portesMateriels')}
                                  >
                                    ajouter commentaires
                                  </button>
                                  <StatusSelect
                                    currentStatus={formData.inspectionData.etatElementsConfort.portesMateriels.status}
                                    onStatusChange={(status) => handleInspectionChange('etatElementsConfort', 'portesMateriels', status)}
                                  />
                                </div>
                              </div>
                              <CommentSection
                                fieldKey="etatElementsConfort.portesMateriels"
                                section="etatElementsConfort"
                                field="portesMateriels"
                                value={formData.inspectionData.etatElementsConfort.portesMateriels}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 7. ETAT CONNECTEUR TORSE / CUISSARD (si il y a) */}
                      <div className="border-b border-gray-200 pb-4">
                        <div className="space-y-2">
                          {/* Grand titre avec Corps du mousqueton */}
                          <div className="grid grid-cols-[40%_60%] gap-2 items-start">
                            <div className="text-sm font-medium text-gray-900">
                              7. ETAT CONNECTEUR TORSE / CUISSARD (si il y a) - Corps du mousqueton (connecteur):
                            </div>
                            <div className="space-y-1">
                              <div className="flex flex-col gap-1">
                                <ClickableText
                                  text="Marque/Fissure/Usure/Déformation/Corrosion..."
                                  fieldKey="etatConnecteurTorseCuissard.corpsMousqueton"
                                />
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    type="button"
                                    className="text-[10px] text-red-600 hover:underline"
                                    onClick={() => toggleCommentInput('etatConnecteurTorseCuissard.corpsMousqueton')}
                                  >
                                    ajouter commentaires
                                  </button>
                                  <StatusSelect
                                    currentStatus={formData.inspectionData.etatConnecteurTorseCuissard.corpsMousqueton.status}
                                    onStatusChange={(status) => handleInspectionChange('etatConnecteurTorseCuissard', 'corpsMousqueton', status)}
                                  />
                                </div>
                              </div>
                              <CommentSection
                                fieldKey="etatConnecteurTorseCuissard.corpsMousqueton"
                                section="etatConnecteurTorseCuissard"
                                field="corpsMousqueton"
                                value={formData.inspectionData.etatConnecteurTorseCuissard.corpsMousqueton}
                              />
                            </div>
                          </div>

                          {/* Doigt du mousqueton */}
                          <div className="grid grid-cols-[40%_60%] gap-2 items-start">
                            <div className="text-sm text-gray-700 ml-2">- Doigt du mousqueton (connecteur):</div>
                            <div className="space-y-1">
                              <div className="flex flex-col gap-1">
                                <ClickableText
                                  text="Marque/Usure / Déformation/Fissure/Corrosion/Propreté des liaisons doigt; corps/Etat du rivet/ Ouverture manuelle complète/ Fermeture automatique du doigt; efficacité ressort de rappel..."
                                  fieldKey="etatConnecteurTorseCuissard.doigtMousqueton"
                                />
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    type="button"
                                    className="text-[10px] text-red-600 hover:underline"
                                    onClick={() => toggleCommentInput('etatConnecteurTorseCuissard.doigtMousqueton')}
                                  >
                                    ajouter commentaires
                                  </button>
                                  <StatusSelect
                                    currentStatus={formData.inspectionData.etatConnecteurTorseCuissard.doigtMousqueton.status}
                                    onStatusChange={(status) => handleInspectionChange('etatConnecteurTorseCuissard', 'doigtMousqueton', status)}
                                  />
                                </div>
                              </div>
                              <CommentSection
                                fieldKey="etatConnecteurTorseCuissard.doigtMousqueton"
                                section="etatConnecteurTorseCuissard"
                                field="doigtMousqueton"
                                value={formData.inspectionData.etatConnecteurTorseCuissard.doigtMousqueton}
                              />
                            </div>
                          </div>

                          {/* Bague de verrouillage */}
                          <div className="grid grid-cols-[40%_60%] gap-2 items-start">
                            <div className="text-sm text-gray-700 ml-2">- Bague de verrouillage:</div>
                            <div className="space-y-1">
                              <div className="flex flex-col gap-1">
                                <ClickableText
                                  text="Marque/Déformation/Fissure/Usure/Verrouillage - Déverrouillage manuel ou automatique..."
                                  fieldKey="etatConnecteurTorseCuissard.bagueVerrouillage"
                                />
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    type="button"
                                    className="text-[10px] text-red-600 hover:underline"
                                    onClick={() => toggleCommentInput('etatConnecteurTorseCuissard.bagueVerrouillage')}
                                  >
                                    ajouter commentaires
                                  </button>
                                  <StatusSelect
                                    currentStatus={formData.inspectionData.etatConnecteurTorseCuissard.bagueVerrouillage.status}
                                    onStatusChange={(status) => handleInspectionChange('etatConnecteurTorseCuissard', 'bagueVerrouillage', status)}
                                  />
                                </div>
                              </div>
                              <CommentSection
                                fieldKey="etatConnecteurTorseCuissard.bagueVerrouillage"
                                section="etatConnecteurTorseCuissard"
                                field="bagueVerrouillage"
                                value={formData.inspectionData.etatConnecteurTorseCuissard.bagueVerrouillage}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 8. BLOQUEUR CROLL */}
                      <div className="border-b border-gray-200 pb-4">
                        <div className="space-y-2">
                          {/* Grand titre avec Corps et ses trous de connexion */}
                          <div className="grid grid-cols-[40%_60%] gap-2 items-start">
                            <div className="text-sm font-medium text-gray-900">
                              8. BLOQUEUR CROLL - Corps et ses trous de connexion:
                            </div>
                            <div className="space-y-1">
                              <div className="flex flex-col gap-1">
                                <ClickableText
                                  text="Marque/Fissure/Déformation/Usure/Corrosion/..."
                                  fieldKey="bloqueurCroll.corpsTrousConnexion"
                                />
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    type="button"
                                    className="text-[10px] text-red-600 hover:underline"
                                    onClick={() => toggleCommentInput('bloqueurCroll.corpsTrousConnexion')}
                                  >
                                    ajouter commentaires
                                  </button>
                                  <StatusSelect
                                    currentStatus={formData.inspectionData.bloqueurCroll.corpsTrousConnexion.status}
                                    onStatusChange={(status) => handleInspectionChange('bloqueurCroll', 'corpsTrousConnexion', status)}
                                  />
                                </div>
                              </div>
                              <CommentSection
                                fieldKey="bloqueurCroll.corpsTrousConnexion"
                                section="bloqueurCroll"
                                field="corpsTrousConnexion"
                                value={formData.inspectionData.bloqueurCroll.corpsTrousConnexion}
                              />
                            </div>
                          </div>

                          {/* Gachette */}
                          <div className="grid grid-cols-[40%_60%] gap-2 items-start">
                            <div className="text-sm text-gray-700 ml-2">- Gachette:</div>
                            <div className="space-y-1">
                              <div className="flex flex-col gap-1">
                                <ClickableText
                                  text="Marque/Fissure/Déformation/Usure/Corrosion/ Présence de toutes les dents/Propreté de toutes les dents / Axe de la gâchette et du rivet (jeu, marque, déformation, fissure, usure, corrosion) / Rotation et ressort de rappel de la gâchette ..."
                                  fieldKey="bloqueurCroll.gachette"
                                />
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    type="button"
                                    className="text-[10px] text-red-600 hover:underline"
                                    onClick={() => toggleCommentInput('bloqueurCroll.gachette')}
                                  >
                                    ajouter commentaires
                                  </button>
                                  <StatusSelect
                                    currentStatus={formData.inspectionData.bloqueurCroll.gachette.status}
                                    onStatusChange={(status) => handleInspectionChange('bloqueurCroll', 'gachette', status)}
                                  />
                                </div>
                              </div>
                              <CommentSection
                                fieldKey="bloqueurCroll.gachette"
                                section="bloqueurCroll"
                                field="gachette"
                                value={formData.inspectionData.bloqueurCroll.gachette}
                              />
                            </div>
                          </div>

                          {/* Taquet de sécurité */}
                          <div className="grid grid-cols-[40%_60%] gap-2 items-start">
                            <div className="text-sm text-gray-700 ml-2">- Taquet de sécurité</div>
                            <div className="space-y-1">
                              <div className="flex flex-col gap-1">
                                <ClickableText
                                  text="Marque/Déformation/Fissure/Usure/Corrosion Blocage taquet fonctionnement..."
                                  fieldKey="bloqueurCroll.taquetSecurite"
                                />
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    type="button"
                                    className="text-[10px] text-red-600 hover:underline"
                                    onClick={() => toggleCommentInput('bloqueurCroll.taquetSecurite')}
                                  >
                                    Ajouter commentaires
                                  </button>
                                  <StatusSelect
                                    currentStatus={formData.inspectionData.bloqueurCroll.taquetSecurite.status}
                                    onStatusChange={(status) => handleInspectionChange('bloqueurCroll', 'taquetSecurite', status)}
                                  />
                                </div>
                              </div>
                              <CommentSection
                                fieldKey="bloqueurCroll.taquetSecurite"
                                section="bloqueurCroll"
                                field="taquetSecurite"
                                value={formData.inspectionData.bloqueurCroll.taquetSecurite}
                              />
                            </div>
                          </div>

                          {/* Fonctionnel */}
                          <div className="grid grid-cols-[40%_60%] gap-2 items-start">
                            <div className="text-sm text-gray-700 ml-2">- Fonctionnel:</div>
                            <div className="flex flex-col gap-1">
                              <div className="text-sm text-gray-700">Coulisse le long de la corde dans un sens, bloque dans l'autre</div>
                              <div className="flex items-center justify-end gap-2">
                                <StatusSelect
                                  currentStatus={formData.inspectionData.bloqueurCroll.fonctionnel.status}
                                  onStatusChange={(status) => handleInspectionChange('bloqueurCroll', 'fonctionnel', status)}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section Signature */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                      <h3 className="text-sm font-medium text-gray-900 mb-4">
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
                        <div className="space-y-4">
                          {/* Zone pour le certificat/document chargé */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Certificat de contrôle (PDF)
                            </label>
                            <div className="flex space-x-2">
                              <div className="flex-1 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center relative">
                                {isUploadingCertificate ? (
                                  <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 rounded-lg">
                                    <div className="flex flex-col items-center">
                                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-2"></div>
                                      <p className="text-xs text-gray-600">Chargement du certificat...</p>
                                    </div>
                                  </div>
                                ) : null}
                                {formData.verificateurSignaturePdf ? (
                                  <div className="text-green-600 text-sm">
                                    <DocumentIcon className="h-6 w-6 mx-auto mb-2" />
                                    <a
                                      href={formData.verificateurSignaturePdf}
                                      target="_blank"
                                      className="text-blue-600 hover:text-blue-800 underline text-xs"
                                    >
                                      <div>Certificat de contrôle</div>
                                    </a>
                                  </div>
                                ) : (
                                  <div className="text-gray-400 text-sm">
                                    <DocumentIcon className="h-6 w-6 mx-auto mb-2" />
                                    <div>Aucun certificat chargé</div>
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center">
                                <button
                                  type="button"
                                  onClick={() => signatureInputRef.current?.click()}
                                  disabled={isUploadingCertificate}
                                  className={`inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium ${
                                    isUploadingCertificate
                                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                      : 'text-gray-700 bg-white hover:bg-gray-50'
                                  }`}
                                  title="Uploader un certificat PDF"
                                >
                                  {isUploadingCertificate ? (
                                    <>
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                                      <span className="text-xs">Chargement...</span>
                                    </>
                                  ) : (
                                    <DocumentIcon className="h-4 w-4" />
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Zone pour la signature digitale */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Signature digitale
                            </label>
                            <div className="flex space-x-2">
                              <div className="flex-1 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                                {formData.verificateurDigitalSignature || digitalSignature ? (
                                  <div className="text-green-600 text-sm">
                                    <DocumentIcon className="h-6 w-6 mx-auto mb-2" />
                                    <div className="text-gray-600">
                                      <img src={formData.verificateurDigitalSignature || digitalSignature} alt="Signature digitale" className="h-16 mx-auto object-contain" />
                                      <div className="text-xs mt-2">Signature digitale enregistrée</div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-gray-400 text-sm">
                                    <DocumentIcon className="h-6 w-6 mx-auto mb-2" />
                                    <div>Aucune signature digitale</div>
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center">
                                <button
                                  type="button"
                                  onClick={() => setShowSignatureModal(true)}
                                  className="inline-flex items-center px-3 py-2 border border-indigo-300 rounded-md text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100"
                                  title="Signature digitale"
                                >
                                  ✍️ Signer
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                        <input
                          ref={signatureInputRef}
                          type="file"
                          accept=".pdf"
                          onChange={handleSignatureUpload}
                          className="hidden"
                        />
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


