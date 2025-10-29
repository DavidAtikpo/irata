'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircleIcon, XMarkIcon, PhotoIcon, QrCodeIcon, DocumentIcon } from '@heroicons/react/24/outline';
import CommentInput from '@/components/CommentInput';

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
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingPDF, setIsUploadingPDF] = useState(false);
  const [isUploadingDocuments, setIsUploadingDocuments] = useState(false);
  const [isUploadingDateAchat, setIsUploadingDateAchat] = useState(false);
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
    verificateurDigitalSignature: '',
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
      const sectionData = formData.inspectionData[section as keyof InspectionData] as any;
      const currentComment = sectionData[field]?.comment || '';
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

    const sectionData = formData.inspectionData[section as keyof InspectionData] as any;
    const fieldData = sectionData[field];
    const currentStatus = fieldData?.status || 'V';

    handleInspectionChange(section, field, currentStatus, comment);

    setOpenCommentFields(prev => ({
      ...prev,
      [key]: false
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
              const nextInspectionDate = calculateNextInspectionDate();
              setFormData(prev => ({
                ...prev,
                // URL du QR code
                qrCode: data.url,
                
                // Champs d'inspection existants
                referenceInterne: qrData.referenceInterne || qrData.reference || prev.referenceInterne,
                numeroSerie: qrData.numeroSerie || prev.numeroSerie,
                dateFabrication: qrData.date || prev.dateFabrication, // Remplir avec la date du QR code
                typeEquipement: qrData.produit || qrData.typeEquipement || prev.typeEquipement,
                dateInspectionDetaillee: nextInspectionDate,
                
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
            pdfUrl: data.extractedData.pdfUrl || data.extractedData.cloudinaryUrl || data.url || prev.pdfUrl,
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
        setFormData(prev => ({ ...prev, dateAchatImage: data.extractedData?.dateAchatUrl || data.url }));
        
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
                          {/* <button */}
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
                        <div className="grid grid-cols-[40%_60%] gap-2">
                          {/* Première colonne : Titre - 45% */}
                          <div className="text-sm font-medium text-gray-900">
                            2. OBSERVATIONS PREALABLES
                          </div>

                          {/* Deuxième colonne : Éléments - 55% */}
                        <div className="space-y-2">
                            <div className="flex flex-col gap-1">
                              <li><span className="text-sm text-gray-700">Référence Interne marquée et lisible</span></li>
                              <div className="flex items-center justify-end gap-2">
                                {/* <button
                                  type="button"
                                  className="text-[10px] text-red-600 hover:underline"
                                  onClick={() => toggleCommentInput('observationsPrelables.referenceInterneMarquee')}
                                >
                                  Ajouter commentaires
                                </button> */}
                                <StatusSelect
                                currentStatus={formData.inspectionData.observationsPrelables.referenceInterneMarquee.status}
                                onStatusChange={(status) => handleInspectionChange('observationsPrelables', 'referenceInterneMarquee', status)}
                              />
                            </div>
                          </div>
                            {/* <CommentSection
                              fieldKey="observationsPrelables.referenceInterneMarquee"
                              section="observationsPrelables"
                              field="referenceInterneMarquee"
                              value={formData.inspectionData.observationsPrelables.referenceInterneMarquee}
                            /> */}
                            <div className="flex flex-col gap-1">
                              <li>
                                <span
                                  className="text-sm text-gray-700 cursor-pointer hover:bg-gray-100 px-1 rounded transition-colors"
                                  onClick={() => toggleCrossedOut('observationsPrelables.lisibiliteNumeroSerie')}
                                >
                                  Lisibilité {crossedOutItems['observationsPrelables.lisibiliteNumeroSerie'] ? <del>Numéro de série</del> : 'Numéro de série'}, de la norme
                                </span>
                              </li>
                              {/* <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  className="text-[10px] text-red-600 hover:underline"
                                  onClick={() => toggleCommentInput('observationsPrelables.lisibiliteNumeroSerie')}
                                >
                                  Ajouter commentaires
                                </button>
                                <StatusSelect
                                currentStatus={formData.inspectionData.observationsPrelables.lisibiliteNumeroSerie.status}
                                onStatusChange={(status) => handleInspectionChange('observationsPrelables', 'lisibiliteNumeroSerie', status)}
                              />
                            </div> */}
                          </div>
                            {/* <CommentSection
                              fieldKey="observationsPrelables.lisibiliteNumeroSerie"
                              section="observationsPrelables"
                              field="lisibiliteNumeroSerie"
                              value={formData.inspectionData.observationsPrelables.lisibiliteNumeroSerie}
                            /> */}
                            <div className="flex flex-col gap-1">
                              <li><span className="text-sm text-gray-700">Durée de vie n'est pas dépassée</span></li>
                              {/* <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  className="text-[10px] text-red-600 hover:underline"
                                  onClick={() => toggleCommentInput('observationsPrelables.dureeVieNonDepassee')}
                                >
                                  Ajouter commentaires
                                </button>
                                <StatusSelect
                                currentStatus={formData.inspectionData.observationsPrelables.dureeVieNonDepassee.status}
                                onStatusChange={(status) => handleInspectionChange('observationsPrelables', 'dureeVieNonDepassee', status)}
                              />
                            </div> */}
                            </div>
                            {/* <CommentSection
                              fieldKey="observationsPrelables.dureeVieNonDepassee"
                              section="observationsPrelables"
                              field="dureeVieNonDepassee"
                              value={formData.inspectionData.observationsPrelables.dureeVieNonDepassee}
                            /> */}
                          </div>
                        </div>
                      </div>

                      {/* 3. CALOTTE (Coque) - Extérieur-Intérieur */}
                      <div className="border-b border-gray-200 pb-4">
                        <div className="grid grid-cols-[40%_60%] gap-2">
                          {/* Première colonne : Titre */}
                          <div className="text-sm font-medium text-gray-900">
                            3. CALOTTE (Coque): - Extérieur- Intérieur
                            </div>

                          {/* Deuxième colonne : Éléments */}
                          <div className="space-y-2">
                            <div className="flex flex-col gap-1 bg-gray-100 p-1">
                              <ClickableText
                                text="Marque/Impact/Fissure/déformation/Trace de salissure / Rayure/Brûlure/ Trace de produits chimique/Usure..."
                                fieldKey="calotteExterieurInterieur.marqueFissureDeformation"
                              />
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  className="text-[10px] text-red-600 hover:underline"
                                  onClick={() => toggleCommentInput('calotteExterieurInterieur.marqueFissureDeformation')}
                                >
                                  Ajouter commentaires
                                </button>
                                <StatusSelect
                                currentStatus={formData.inspectionData.calotteExterieurInterieur.marqueFissureDeformation.status}
                                onStatusChange={(status) => handleInspectionChange('calotteExterieurInterieur', 'marqueFissureDeformation', status)}
                              />
                            </div>
                            </div>
                            <CommentSection
                              fieldKey="calotteExterieurInterieur.marqueFissureDeformation"
                              section="calotteExterieurInterieur"
                              field="marqueFissureDeformation"
                              value={formData.inspectionData.calotteExterieurInterieur.marqueFissureDeformation}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="border-b border-gray-200 pb-4">
                        <div className="grid grid-cols-[40%_60%] gap-2">
                          <div className="text-sm font-medium text-gray-900">
                            -Fentes et trous accessoires
                          </div>
                          <div className="space-y-2">
                            <div className="flex flex-col gap-1 bg-gray-100 p-1">
                              <ClickableText
                                text="Déformation/Fissure/Impact ..."
                                fieldKey="calotteExterieurInterieur.fentesTrousAccessoires"
                              />
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  className="text-[10px] text-red-600 hover:underline"
                                  onClick={() => toggleCommentInput('calotteExterieurInterieur.fentesTrousAccessoires')}
                                >
                                  Ajouter commentaires
                                </button>
                                <StatusSelect
                                  currentStatus={formData.inspectionData.calotteExterieurInterieur.fentesTrousAccessoires.status}
                                  onStatusChange={(status) => handleInspectionChange('calotteExterieurInterieur', 'fentesTrousAccessoires', status)}
                                />
                              </div>
                            </div>
                            <CommentSection
                              fieldKey="calotteExterieurInterieur.fentesTrousAccessoires"
                              section="calotteExterieurInterieur"
                              field="fentesTrousAccessoires"
                              value={formData.inspectionData.calotteExterieurInterieur.fentesTrousAccessoires}
                            />
                          </div>
                        </div>
                      </div>

                      {/* -Volets aération si il y a, (fonctionnement) */}
                      <div className="border-b border-gray-200 pb-4">
                        <div className="grid grid-cols-[40%_60%] gap-2">
                          <div className="text-sm font-medium text-gray-900">
                            -Volets aération si il y a, (fonctionnement)
                          </div>
                          <div className="space-y-2">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  className="text-[10px] text-red-600 hover:underline"
                                  onClick={() => toggleCommentInput('calotteExterieurInterieur.voletsAeration')}
                                >
                                  Ajouter commentaires
                                </button>
                                <StatusSelect
                                  currentStatus={formData.inspectionData.calotteExterieurInterieur.voletsAeration.status}
                                  onStatusChange={(status) => handleInspectionChange('calotteExterieurInterieur', 'voletsAeration', status)}
                                />
                              </div>
                            </div>
                            <CommentSection
                              fieldKey="calotteExterieurInterieur.voletsAeration"
                              section="calotteExterieurInterieur"
                              field="voletsAeration"
                              value={formData.inspectionData.calotteExterieurInterieur.voletsAeration}
                            />
                          </div>
                        </div>
                      </div>

                      {/* 4. CALOTIN */}
                      <div className="border-b border-gray-200 pb-4">
                        <div className="grid grid-cols-[40%_60%] gap-2">
                          <div className="text-sm font-medium text-gray-900">
                            4. CALOTIN (si il y a): - Ôtez éléments de confort si nécessaire; Ne pas démonté calotin si fixé sur la coque.
                          </div>

                          {/* Deuxième colonne : Éléments */}
                        <div className="space-y-2">
                            <div className="flex flex-col gap-1">
                              <ClickableText
                                text="Marque/Fissure/Déformation/Usure ..."
                                fieldKey="calotin.otezElementsConfort"
                              />
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  className="text-[10px] text-red-600 hover:underline"
                                  onClick={() => toggleCommentInput('calotin.otezElementsConfort')}
                                >
                                  Ajouter commentaires
                                </button>
                                <StatusSelect
                                currentStatus={formData.inspectionData.calotin.otezElementsConfort.status}
                                onStatusChange={(status) => handleInspectionChange('calotin', 'otezElementsConfort', status)}
                              />
                            </div>
                            </div>
                            <CommentSection
                              fieldKey="calotin.otezElementsConfort"
                              section="calotin"
                              field="otezElementsConfort"
                              value={formData.inspectionData.calotin.otezElementsConfort}
                            />
                          </div>
                        </div>
                      </div>

                      {/* 5. COIFFE */}
                      <div className="border-b border-gray-200 pb-4">
                        <div className="grid grid-cols-[40%_60%] gap-2">
                          <div className="text-sm font-medium text-gray-900">
                            5. COIFFE:- Etat des sangles et de leurs fixation dans la calotte.
                          </div>
                        <div className="space-y-2">
                            <div className="flex flex-col gap-1">
                              
                                <ClickableText
                                  text="Usure/Coupure/Brûlure/Déformation ..."
                                  fieldKey="coiffe.etatSanglesFixation"
                                />
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  className="text-[10px] text-red-600 hover:underline"
                                  onClick={() => toggleCommentInput('coiffe.etatSanglesFixation')}
                                >
                                  Ajouter commentaires
                                </button>
                                <StatusSelect
                                currentStatus={formData.inspectionData.coiffe.etatSanglesFixation.status}
                                onStatusChange={(status) => handleInspectionChange('coiffe', 'etatSanglesFixation', status)}
                              />
                            </div>
                            </div>
                            <CommentSection
                              fieldKey="coiffe.etatSanglesFixation"
                              section="coiffe"
                              field="etatSanglesFixation"
                              value={formData.inspectionData.coiffe.etatSanglesFixation}
                            />
                          </div>
                        </div>
                      </div>

                      {/* 6. TOUR DE TETE */}
                      <div className="border-b border-gray-200 pb-4">
                        <div className="grid grid-cols-[40%_60%] gap-2">
                          <div className="text-sm font-medium text-gray-900">
                            6. TOUR DE TETE
                          </div>
                        <div className="space-y-2">
                            <div className="flex flex-col gap-1">
                              
                                <ClickableText
                                  text="Usure/Déformation/Elément manquant/Fixation ..."
                                  fieldKey="tourDeTete.usureDeformationElement"
                                />
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  className="text-[10px] text-red-600 hover:underline"
                                  onClick={() => toggleCommentInput('tourDeTete.usureDeformationElement')}
                                >
                                  Ajouter commentaires
                                </button>
                                <StatusSelect
                                currentStatus={formData.inspectionData.tourDeTete.usureDeformationElement.status}
                                onStatusChange={(status) => handleInspectionChange('tourDeTete', 'usureDeformationElement', status)}
                              />
                            </div>
                            </div>
                            <CommentSection
                              fieldKey="tourDeTete.usureDeformationElement"
                              section="tourDeTete"
                              field="usureDeformationElement"
                              value={formData.inspectionData.tourDeTete.usureDeformationElement}
                            />
                          </div>
                        </div>
                      </div>

                      {/* 7. SYSTEME DE REGLAGE */}
                      <div className="border-b border-gray-200 pb-4">
                        <div className="grid grid-cols-[40%_60%] gap-2">
                          <div className="text-sm font-medium text-gray-900">
                            7. SYSTEME DE REGLAGE: - Etat, fixations; actionner système dans les deux sens; Tirez sur système pour voir si il se dérègle ou pas
                          </div>
                        <div className="space-y-2">
                            <div className="flex flex-col gap-1">
                              
                                <ClickableText
                                  text="Usure/Déformation/Elément manquant/Fixation ..."
                                  fieldKey="systemeReglage.etatFixations"
                                />
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  className="text-[10px] text-red-600 hover:underline"
                                  onClick={() => toggleCommentInput('systemeReglage.etatFixations')}
                                >
                                  Ajouter commentaires
                                </button>
                                <StatusSelect
                                currentStatus={formData.inspectionData.systemeReglage.etatFixations.status}
                                onStatusChange={(status) => handleInspectionChange('systemeReglage', 'etatFixations', status)}
                              />
                            </div>
                            </div>
                            <CommentSection
                              fieldKey="systemeReglage.etatFixations"
                              section="systemeReglage"
                              field="etatFixations"
                              value={formData.inspectionData.systemeReglage.etatFixations}
                            />
                          </div>
                        </div>
                      </div>

                      {/* 8. JUGULAIRE */}
                      <div className="border-b border-gray-200 pb-4">
                        <div className="grid grid-cols-[40%_60%] gap-2">
                          <div className="text-sm font-medium text-gray-900">
                            8. JUGULAIRE: - Etat sangles et éléments de réglage (inspecter les parties cachées également)
                          </div>
                        <div className="space-y-2">
                            <div className="flex flex-col gap-1">
                              
                                <ClickableText
                                  text="Usure/Coupure/Brûlure/Déformation ..."
                                  fieldKey="coiffe.etatSanglesFixation"
                                />
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  className="text-[10px] text-red-600 hover:underline"
                                  onClick={() => toggleCommentInput('jugulaire.etatSanglesElements')}
                                >
                                  Ajouter commentaires
                                </button>
                                <StatusSelect
                                currentStatus={formData.inspectionData.jugulaire.etatSanglesElements.status}
                                onStatusChange={(status) => handleInspectionChange('jugulaire', 'etatSanglesElements', status)}
                              />
                            </div>
                          </div>
                            <CommentSection
                              fieldKey="jugulaire.etatSanglesElements"
                              section="jugulaire"
                              field="etatSanglesElements"
                              value={formData.inspectionData.jugulaire.etatSanglesElements}
                            />
                          </div>
                        </div>
                      </div>
                      {/* 9. JUGULAIRE - Boucle de fermeture */}
                      <div className="border-b border-gray-200 pb-4">
                        <div className="grid grid-cols-[40%_60%] gap-2">
                          <div className="text-sm font-medium text-gray-900">
                            - Etat de la boucle de fermeture jugulaire
                          </div>
                          <div className="space-y-2">
                            <div className="flex flex-col gap-1">
                              
                                <ClickableText
                                  text="Casse / Déformation / Fissure / Usure"
                                  fieldKey="jugulaire.etatBoucleFermeture"
                                />
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  className="text-[10px] text-red-600 hover:underline"
                                  onClick={() => toggleCommentInput('jugulaire.etatBoucleFermeture')}
                                >
                                  Ajouter commentaires
                                </button>
                                <StatusSelect
                                currentStatus={formData.inspectionData.jugulaire.etatBoucleFermeture.status}
                                onStatusChange={(status) => handleInspectionChange('jugulaire', 'etatBoucleFermeture', status)}
                              />
                            </div>
                            </div>
                            <CommentSection
                              fieldKey="jugulaire.etatBoucleFermeture"
                              section="jugulaire"
                              field="etatBoucleFermeture"
                              value={formData.inspectionData.jugulaire.etatBoucleFermeture}
                            />
                          </div>
                        </div>
                      </div>

                      {/* 9. MOUSSE DE CONFORT */}
                      <div className="border-b border-gray-200 pb-4">
                        <div className="grid grid-cols-[40%_60%] gap-2">
                          <div className="text-sm font-medium text-gray-900">
                            9. MOUSSE DE CONFORT: Démonter pour laver ou remplacer quand c'est nécessaire
                          </div>
                        <div className="space-y-2">
                            <div className="flex flex-col gap-1">
                              <span className="text-sm text-gray-700"></span>
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  className="text-[10px] text-red-600 hover:underline"
                                  onClick={() => toggleCommentInput('mousseConfort.usureDeformationCasse')}
                                >
                                  Ajouter commentaires
                                </button>
                                <StatusSelect
                                currentStatus={formData.inspectionData.mousseConfort.usureDeformationCasse.status}
                                onStatusChange={(status) => handleInspectionChange('mousseConfort', 'usureDeformationCasse', status)}
                              />
                            </div>
                            </div>
                            <CommentSection
                              fieldKey="mousseConfort.usureDeformationCasse"
                              section="mousseConfort"
                              field="usureDeformationCasse"
                              value={formData.inspectionData.mousseConfort.usureDeformationCasse}
                            />
                          </div>
                        </div>
                      </div>

                      {/* 10. CROCHETS DE LAMPE */}
                      <div className="border-b border-gray-200 pb-4">
                        <div className="grid grid-cols-[40%_60%] gap-2">
                          <div className="text-sm font-medium text-gray-900">
                            10. CROCHETS DE LAMPE
                          </div>
                        <div className="space-y-2">
                            <div className="flex flex-col gap-1">
                              
                                <ClickableText
                                  text="Usure/Déformation/Casse/Elément manquant ..."
                                  fieldKey="crochetsLampe.usureDeformationCasse"
                                />
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  className="text-[10px] text-red-600 hover:underline"
                                  onClick={() => toggleCommentInput('crochetsLampe.usureDeformationCasse')}
                                >
                                  Ajouter commentaires
                                </button>
                                <StatusSelect
                                currentStatus={formData.inspectionData.crochetsLampe.usureDeformationCasse.status}
                                onStatusChange={(status) => handleInspectionChange('crochetsLampe', 'usureDeformationCasse', status)}
                              />
                            </div>
                            </div>
                            <CommentSection
                              fieldKey="crochetsLampe.usureDeformationCasse"
                              section="crochetsLampe"
                              field="usureDeformationCasse"
                              value={formData.inspectionData.crochetsLampe.usureDeformationCasse}
                            />
                          </div>
                        </div>
                      </div>

                      {/* 11. ACCESSOIRES */}
                      <div className="border-b border-gray-200 pb-4">
                        <div className="grid grid-cols-[40%_60%] gap-2">
                          <div className="text-sm font-medium text-gray-900">
                            11. ACCESSOIRES: Visière, lampe
                          </div>
                        <div className="space-y-2">
                            <div className="flex flex-col gap-1">
                              <span className="text-sm text-gray-700">Fonctionnement/Etat ...</span>
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  className="text-[10px] text-red-600 hover:underline"
                                  onClick={() => toggleCommentInput('accessoires.fonctionnementEtat')}
                                >
                                  Ajouter commentaires
                                </button>
                                <StatusSelect
                                currentStatus={formData.inspectionData.accessoires.fonctionnementEtat.status}
                                onStatusChange={(status) => handleInspectionChange('accessoires', 'fonctionnementEtat', status)}
                              />
                            </div>
                            </div>
                            <CommentSection
                              fieldKey="accessoires.fonctionnementEtat"
                              section="accessoires"
                              field="fonctionnementEtat"
                              value={formData.inspectionData.accessoires.fonctionnementEtat}
                            />
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


