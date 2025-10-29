'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { CheckCircleIcon, XMarkIcon, PhotoIcon, QrCodeIcon, DocumentIcon, LinkIcon } from '@heroicons/react/24/outline';
import SignaturePad from '../../../../../../components/SignaturePad';
import CommentInput from '../../../../../../components/CommentInput';
import { generateSlugFromReference } from '@/lib/slug';

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
  const [crossedOutWords, setCrossedOutWords] = useState<{[key: string]: {[word: string]: boolean}}>({});
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [commentInputs, setCommentInputs] = useState<{[key: string]: string}>({});
  const [originalData, setOriginalData] = useState({
    certificatePdf: '',
    digitalSignature: '',
    dateSignature: '',
  });
  const [linkCopied, setLinkCopied] = useState(false);
  const [isUpdatingQR, setIsUpdatingQR] = useState(false);
  const [qrCodeImageUrl, setQrCodeImageUrl] = useState<string>('');
  const commentInputRefs = useRef<{[key: string]: HTMLTextAreaElement | null}>({});

  // Générer l'URL publique basée sur l'ID unique (garantit l'unicité même avec même référence interne)
  const getPublicUrl = () => {
    if (!inspectionId || !formData?.referenceInterne) return '';
    // Utiliser l'ID unique pour garantir l'unicité du QR code
    // Format: /inspection/[id]-[slug] pour garder la lisibilité et la compatibilité
    const slug = generateSlugFromReference(formData.referenceInterne);
    return typeof window !== 'undefined' 
      ? `${window.location.origin}/inspection/${inspectionId}-${slug}` 
      : '';
  };

  // Fonction pour générer le QR code avec texte CI.DES
  const generateQRCodeWithText = async (url: string): Promise<string> => {
    return new Promise((resolve) => {
      // Créer un canvas temporaire pour le QR code
      const canvas = document.createElement('canvas');
      const size = 300;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        // Fallback vers l'API standard si canvas n'est pas disponible
        resolve(`https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}`);
        return;
      }

      // Charger l'image QR code depuis l'API avec niveau de correction d'erreur élevé (H)
      // Le niveau H permet de masquer jusqu'à 30% du QR code sans perte de fonctionnalité
      const qrImage = new Image();
      qrImage.crossOrigin = 'anonymous';
      
      qrImage.onload = () => {
        // Dessiner le QR code
        ctx.drawImage(qrImage, 0, 0, size, size);
        
        // Ajouter un fond semi-transparent minimal pour le texte
        // Zone réduite pour masquer le minimum de modules QR
        const textSize = 36; // Légèrement réduit pour moins masquer
        const textAreaHeight = 48; // Zone réduite
        const textAreaWidth = 160; // Largeur ajustée
        const textY = size / 2;
        const textX = size / 2 - textAreaWidth / 2;
        
        // Fond blanc semi-transparent (masque moins le QR code)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillRect(textX, textY - textAreaHeight / 2, textAreaWidth, textAreaHeight);
        
        // Ajouter une bordure fine pour le texte
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.lineWidth = 1;
        ctx.strokeRect(textX, textY - textAreaHeight / 2, textAreaWidth, textAreaHeight);
        
        // Ajouter le texte CI.DES au centre
        ctx.font = `bold ${textSize}px Arial, sans-serif`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        
        // Mesurer la largeur du texte pour centrer
        const textCI = 'CI.';
        const textDES = 'DES';
        ctx.font = `bold ${textSize}px Arial, sans-serif`; // Réinitialiser pour la mesure
        const fullTextWidth = ctx.measureText(textCI).width + ctx.measureText(textDES).width;
        const startX = (size - fullTextWidth) / 2;
        
        // Dessiner "CI." (avec le point) en couleur ivoire
        ctx.fillStyle = '#F2A62C'; // Couleur ivoire
        const ciX = startX;
        ctx.fillText(textCI, ciX, textY);
        
        // Dessiner "DES" en noir juste après
        ctx.fillStyle = '#000000'; // Noir
        const desX = ciX + ctx.measureText(textCI).width;
        ctx.fillText(textDES, desX, textY);
        
        // Convertir le canvas en image URL
        const dataUrl = canvas.toDataURL('image/png');
        resolve(dataUrl);
      };

      qrImage.onerror = () => {
        // Fallback vers l'API standard en cas d'erreur
        resolve(`https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}`);
      };

      // Charger le QR code avec niveau de correction d'erreur élevé (H) pour permettre le masquage du centre
      // ECC H permet jusqu'à 30% de masquage tout en restant scannable
      qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}&ecc=H`;
    });
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
        // Recharger les données pour mettre à jour l'affichage
        const reloadResponse = await fetch(`/api/admin/equipment-detailed-inspections/${inspectionId}`);
        if (reloadResponse.ok) {
          const updatedData = await reloadResponse.json();
          setFormData(prev => ({ ...prev, qrCode: updatedData.qrCode || prev.qrCode }));
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
    link.download = `QR-Code-${formData?.referenceInterne || 'equipement'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Fonction pour obtenir l'URL de l'image QR code à afficher dans la grille
  const getQRCodeImageUrl = (): string | null => {
    // 1. Si un QR code est stocké dans la base, l'utiliser en priorité
    if (formData.qrCode) {
      // Si c'est une data URL (QR code avec CI.DES sauvegardé)
      if (formData.qrCode.startsWith('data:image/')) {
        return formData.qrCode;
      }
      
      // Si c'est une URL Cloudinary (ancien format)
      if (formData.qrCode.startsWith('http://') || formData.qrCode.startsWith('https://')) {
        return formData.qrCode;
      }
    }
    
    // 2. Si le QR code avec logo CI.DES est généré, l'utiliser
    if (qrCodeImageUrl) {
      return qrCodeImageUrl;
    }
    
    // 3. Sinon, générer depuis l'ID unique pour garantir l'unicité
    if (inspectionId && formData.referenceInterne) {
      const slug = generateSlugFromReference(formData.referenceInterne);
      const publicUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}/inspection/${inspectionId}-${slug}` 
        : `/inspection/${inspectionId}-${slug}`;
      
      // Générer l'image QR code depuis l'API basée sur l'ID unique
      return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(publicUrl)}`;
    }
    
    return null;
  };

  // Fonctions utilitaires pour gérer les signatures séparées
  const getCurrentCertificate = () => {
    return formData.verificateurSignaturePdf || originalData.certificatePdf;
  };

  const getCurrentDigitalSignature = () => {
    return formData.verificateurDigitalSignature || originalData.digitalSignature || digitalSignature;
  };
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
    verificateurDigitalSignature: '',
    dateSignature: '',
    etat: 'INVALID', // Même valeur par défaut que la page création
    
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
          console.log('Données chargées depuis API:', data);

          // Charger les données des mots barrés
          setCrossedOutWords(data.crossedOutWords || {});
          console.log('crossedOutWords chargés:', data.crossedOutWords);
          console.log('crossedOutItems chargés:', data.crossedOutItems);

          // Séparer et sauvegarder les valeurs originales pour certificat et signature digitale
          setOriginalData({
            certificatePdf: data.verificateurSignaturePdf || '',
            digitalSignature: data.verificateurDigitalSignature || '',
            dateSignature: data.dateSignature || '',
          });

          console.log('inspectionData depuis API:', data.observationsPrelables, data.calotteExterieurInterieur);

          // Créer le nouvel état formData en utilisant directement les données de l'API
          const newFormData = {
            // Copier toutes les données de base depuis l'API
            ...data,
            fabricant: data.fabricant || '',
            etat: data.etat || 'INVALID',

            // Structure d'inspectionData - utiliser directement les données de l'API
            inspectionData: {
              antecedentProduit: {
                miseEnService: data.antecedentProduit?.miseEnService || '',
              },
              // IMPORTANT : Utiliser directement les objets de l'API pour préserver statuts et commentaires
              // Avec fallback aux valeurs par défaut si les données n'existent pas
              observationsPrelables: data.observationsPrelables || {
                referenceInterneMarquee: { status: 'V', comment: '' },
                lisibiliteNumeroSerie: { status: 'V', comment: '' },
                dureeVieNonDepassee: { status: 'V', comment: '' },
              },
              calotteExterieurInterieur: data.calotteExterieurInterieur || {
                fentesTrousAccessoires: { status: 'V', comment: '' },
                voletsAeration: { status: 'NA', comment: '' },
                marqueFissureDeformation: { status: 'NA', comment: '' },
              },
              calotin: data.calotin || {
                otezElementsConfort: { status: 'NA', comment: '' },
              },
              coiffe: data.coiffe || {
                etatSanglesFixation: { status: 'V', comment: '' },
              },
              tourDeTete: data.tourDeTete || {
                usureDeformationElement: { status: 'V', comment: '' },
              },
              systemeReglage: data.systemeReglage || {
                etatFixations: { status: 'V', comment: '' },
              },
              jugulaire: data.jugulaire || {
                etatSanglesElements: { status: 'V', comment: '' },
                etatBoucleFermeture: { status: 'V', comment: '' },
              },
              mousseConfort: data.mousseConfort || {
                usureDeformationCasse: { status: 'V', comment: '' },
              },
              crochetsLampe: data.crochetsLampe || {
                usureDeformationCasse: { status: 'V', comment: '' },
              },
              accessoires: data.accessoires || {
                fonctionnementEtat: { status: 'NA', comment: '' },
              },
            },
          };

          // console.log('Nouveau formData créé:', newFormData);
          // console.log('Observations préalables dans formData:', newFormData.inspectionData.observationsPrelables);
          // console.log('Statut referenceInterneMarquee:', newFormData.inspectionData.observationsPrelables?.referenceInterneMarquee?.status);
          // console.log('Commentaire referenceInterneMarquee:', newFormData.inspectionData.observationsPrelables?.referenceInterneMarquee?.comment);

          setFormData(newFormData);

          console.log('Chargement terminé - Statuts et commentaires récupérés depuis l\'API');
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

  // Générer le QR code au chargement et quand referenceInterne ou ID change
  useEffect(() => {
    const loadQRCode = async () => {
      if (!inspectionId || !formData?.referenceInterne) return;
      // Utiliser l'ID unique pour garantir l'unicité du QR code
      const slug = generateSlugFromReference(formData.referenceInterne);
      const url = typeof window !== 'undefined' 
        ? `${window.location.origin}/inspection/${inspectionId}-${slug}` 
        : '';
      if (url) {
        const qrUrl = await generateQRCodeWithText(url);
        setQrCodeImageUrl(qrUrl);
      }
    };
    
    loadQRCode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inspectionId, formData?.referenceInterne]);

  // Debug: Logger les changements de formData
  useEffect(() => {
    if (formData.inspectionData?.observationsPrelables) {
      console.log('🔍 formData mis à jour - Statuts et commentaires:');
      console.log('- referenceInterneMarquee:', {
        status: formData.inspectionData.observationsPrelables.referenceInterneMarquee?.status,
        comment: formData.inspectionData.observationsPrelables.referenceInterneMarquee?.comment
      });
      console.log('- lisibiliteNumeroSerie:', {
        status: formData.inspectionData.observationsPrelables.lisibiliteNumeroSerie?.status,
        comment: formData.inspectionData.observationsPrelables.lisibiliteNumeroSerie?.comment
      });
    }
  }, [formData]);

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
    router.push('/');
    return null;
  }

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
      className="w-12 h-8 text-xs border border-gray-300 rounded px-1 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
    >
      <option value="V">V</option>
      <option value="NA">NA</option>
      <option value="X">X</option>
    </select>
  );

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
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      formDataUpload.append('type', 'signature');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
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

    // Enregistrer la signature dans le nouveau champ séparé
    const currentDate = new Date().toISOString();
    setFormData(prev => ({
      ...prev,
      verificateurDigitalSignature: signature,
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

  // Fonction pour rendre du texte avec mots barrés individuellement
  const renderCrossedOutText = (text: string, fieldKey: string) => {
    // Diviser le texte en mots et séparateurs
    const parts = text.split(/(\s+|\/|\(|\)|-|\.)/);

    return parts.map((part, index) => {
      // Si c'est un séparateur ou un mot vide, l'afficher tel quel
      if (/^\s+$/.test(part) || /^[\/\(\)\-\.]+$/.test(part) || part.trim() === '') {
        return <span key={index}>{part}</span>;
      }

      // Si c'est un mot, vérifier s'il est barré
      const isCrossed = crossedOutWords[fieldKey]?.[part] || false;
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
    });
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

  // Fonction pour commencer l'édition d'un commentaire
  const startEditingComment = (key: string, currentComment: string = '') => {
    setEditingComment(key);
    setCommentInputs(prev => ({
      ...prev,
      [key]: currentComment
    }));

    // Focus après le rendu
    setTimeout(() => {
      commentInputRefs.current[key]?.focus();
    }, 100);
  };

  // Fonction pour sauvegarder le commentaire
  const saveComment = (key: string, section: string, field: string) => {
    const comment = commentInputs[key] || '';

    // Récupérer le statut actuel de manière sécurisée
    const sectionData = formData.inspectionData[section as keyof InspectionData];
    const fieldData = sectionData && typeof sectionData === 'object' && field in sectionData
      ? (sectionData as any)[field]
      : null;
    const currentStatus = fieldData?.status || 'V';

    handleInspectionChange(section as keyof InspectionData, field, currentStatus, comment);
    setEditingComment(null);
  };

  // Fonction pour annuler l'édition
  const cancelEditingComment = () => {
    setEditingComment(null);
  };

  // Composant réutilisable pour un élément d'inspection avec statut et commentaire
  const InspectionItem = ({
    text,
    section,
    field,
    renderText
  }: {
    text: string;
    section: keyof InspectionData;
    field: string;
    renderText?: boolean;
  }) => {
    const fieldKey = `${section}.${field}`;
    const fieldData = (formData.inspectionData[section] as any)?.[field];

    return (
      <>
        <div className="bg-gray-100 p-1">
          <div className="flex flex-col gap-1">
            <span className="text-sm text-gray-700">
              {renderText ? renderCrossedOutText(text, fieldKey) : text}
            </span>
            <div className="flex items-center gap-2 justify-end">
              <StatusSelect
                currentStatus={fieldData?.status || 'V'}
                onStatusChange={(status) => handleInspectionChange(section, field, status)}
              />
              <button
                type="button"
                className="text-[10px] text-red-600 hover:underline"
                onClick={() => startEditingComment(fieldKey, fieldData?.comment || '')}
              >
                {fieldData?.comment ? 'Éditer commentaire' : 'Ajouter commentaire'}
              </button>
            </div>
          </div>
          {editingComment === fieldKey ? (
            <div className="ml-4 mt-1">
              <CommentInput
                value={commentInputs[fieldKey] || ''}
                onChange={(newValue) => setCommentInputs(prev => ({...prev, [fieldKey]: newValue}))}
                onSave={() => saveComment(fieldKey, section, field)}
                onCancel={cancelEditingComment}
                className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="Ajouter votre commentaire..."
                rows={2}
                autoFocus={true}
              />
            </div>
          ) : fieldData?.comment && (
            <div className="text-xs text-blue-600 italic ml-4">
              Commentaire: {fieldData.comment}
            </div>
          )}
        </div>
      </>
    );
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
      // Préparer les données à envoyer, en ne mettant à jour que les champs modifiés
      const submitData: any = {
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
          // Données pour les éléments barrés
          crossedOutWords: crossedOutWords,
        };

      // Gestion séparée des certificats PDF et signatures digitales
      const certificateChanged = formData.verificateurSignaturePdf !== originalData.certificatePdf;
      const digitalSignatureChanged = formData.verificateurDigitalSignature !== originalData.digitalSignature;
      const dateChanged = formData.dateSignature !== originalData.dateSignature;

      // Ajouter les champs seulement s'ils ont changé
      if (certificateChanged) {
        submitData.verificateurSignaturePdf = formData.verificateurSignaturePdf;
      }
      if (digitalSignatureChanged) {
        submitData.verificateurDigitalSignature = formData.verificateurDigitalSignature;
      }
      if (dateChanged) {
        submitData.dateSignature = formData.dateSignature;
      }

      console.log('=== DEBUG SAUVEGARDE ===');
      console.log('originalData:', originalData);
      console.log('certificateChanged:', certificateChanged);
      console.log('digitalSignatureChanged:', digitalSignatureChanged);
      console.log('dateChanged:', dateChanged);
      console.log('Envoi verificateurSignaturePdf:', submitData.verificateurSignaturePdf);
      console.log('Envoi verificateurDigitalSignature:', submitData.verificateurDigitalSignature);
      console.log('Envoi dateSignature:', submitData.dateSignature);
      console.log('========================');
      
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

            {/* Section génération QR Code pour admin */}
            {formData?.referenceInterne && (
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
                        type="button"
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
                        type="button"
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
                        type="button"
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
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Colonne gauche - Identification équipement - 40% */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <h2 className="text-sm font-semibold text-gray-900 mb-2">
                      Identification équipement
                    </h2>
                    
                    {/* Photo, État et QR Code */}
                    <div className="grid grid-cols-3 gap-1 mb-3">
                        <div className="text-center">
                          <div className="text-sm font-medium text-gray-700 mb-2">Photo</div>
                          <div 
                            className="border-2 border-dashed border-gray-300 rounded-lg p-4 h-32 text-center cursor-pointer hover:border-indigo-400 transition-colors flex items-center justify-center"
                            onClick={() => photoInputRef.current?.click()}
                          >
                            {formData.photo ? (
                              <img src={formData.photo} alt="Équipement" className="max-w-full max-h-full object-contain rounded" />
                            ) : (
                              <div className="text-gray-400">
                                <PhotoIcon className="h-8 w-8 mx-auto mb-2" />
                                <div className="text-xs">Cliquez pour ajouter</div>
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
                        <div className="text-center">
                          <div className="text-sm font-medium text-gray-700 mb-2">État</div>
                          <div className={`p-4 h-25 flex items-center justify-center rounded-lg ${
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
                        <div className="text-center">
                          <div className="text-sm font-medium text-gray-700 mb-2">QR Code</div>
                          <div className="border-2 border-gray-300 rounded-lg p-1 h-32 flex items-center justify-center">
                            {(() => {
                              const qrUrl = getQRCodeImageUrl();
                              if (qrUrl) {
                                return (
                                  <>
                                    <img 
                                      src={qrUrl} 
                                      alt="QR Code" 
                                      className="max-w-full max-h-full object-contain" 
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        const icon = e.currentTarget.nextElementSibling;
                                        if (icon) {
                                          (icon as HTMLElement).style.display = 'block';
                                        }
                                      }}
                                    />
                                    <QrCodeIcon className="h-8 w-8 text-gray-400" style={{ display: 'none' }} />
                                  </>
                                );
                              }
                              return <QrCodeIcon className="h-8 w-8 text-gray-400" />;
                            })()}
                          </div>
                        </div>
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

                {/* Colonne droite - Vie de l'équipement - 60% */}
                <div className="lg:col-span-3 space-y-6">
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <h2 className="text-sm font-semibold text-gray-900 mb-2">
                      Vie de l'équipement
                    </h2>

                    {/* Points d'inspection */}
                    <div className="space-y-2">
                      {/* 1. ANTECEDENT DU PRODUIT */}
                      <div className="border-b border-gray-200 pb-2">
                        <h3 className="text-xs font-medium text-gray-900 mb-1">
                          1. ANTECEDENT DU PRODUIT:
                        </h3>
                        <div className="space-y-1">
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
                      <div className="border-b border-gray-200 pb-2">
                        <div className="grid grid-cols-[45%_55%] gap-2">
                          {/* Première colonne : Titre - 45% */}
                          <div className="text-xs font-bold text-gray-900">
                            2. OBSERVATIONS PREALABLES
                          </div>

                          {/* Deuxième colonne : Éléments - 55% */}
                          <div className="space-y-2">
                            <InspectionItem
                              text="Référence Interne marquée et lisible"
                              section="observationsPrelables"
                              field="referenceInterneMarquee"
                              renderText={true}
                            />
                            <InspectionItem
                              text="Lisibilité Numéro de série, de la norme"
                              section="observationsPrelables"
                              field="lisibiliteNumeroSerie"
                              renderText={true}
                            />
                            <InspectionItem
                              text="Durée de vie n'est pas dépassée"
                              section="observationsPrelables"
                              field="dureeVieNonDepassee"
                              renderText={true}
                            />
                          </div>
                        </div>
                      </div>

                      {/* 3. CALOTTE */}
                      <div className="border-b border-gray-200 pb-2">
                        <div className="grid grid-cols-[45%_55%] gap-2">
                          {/* Première colonne : Titre */}
                          <div className="text-xs font-bold text-gray-900">
                            3. CALOTTE (Coque): - Extérieur- Intérieur
                          </div>

                          {/* Deuxième colonne : Éléments */}
                          <div className="space-y-2">
                            <InspectionItem
                              text="Marque/Impact/Fissure/déformation/Trace de salissure / Rayure/Brûlure/ Trace de produits chimique/Usure..."
                              section="calotteExterieurInterieur"
                              field="marqueFissureDeformation"
                              renderText={true}
                            />
                          </div>
                        </div>
                      </div>

                      {/* 4. CALOTIN - Fentes et trous accessoires */}
                      <div className="border-b border-gray-200 pb-2">
                        <div className="grid grid-cols-[45%_55%] gap-2">
                          {/* Première colonne : Titre */}
                          <div className="text-xs font-bold text-gray-900">
                           -Fentes et trous accessoires
                          </div>
                          <div className="space-y-2">
                            <InspectionItem
                              text="Déformation/Fissure/Impact ..."
                              section="calotteExterieurInterieur"
                              field="fentesTrousAccessoires"
                              renderText={true}
                            />
                          </div>
                        </div>
                      </div>

                      {/* 5. CALOTIN - Volets aération */}
                      <div className="border-b border-gray-200 pb-2">
                        <div className="grid grid-cols-[45%_55%] gap-2">
                          {/* Première colonne : Titre */}
                          <div className="text-xs font-bold text-gray-900">
                            -Volets aération si il y a, (fonctionnement)
                          </div>
                          <div className="space-y-2">
                            <InspectionItem
                              text="Volets aération si il y a, (fonctionnement)"
                              section="calotteExterieurInterieur"
                              field="voletsAeration"
                            />
                          </div>
                        </div>
                      </div>

                      {/* 4. CALOTIN */}
                      <div className="border-b border-gray-200 pb-2">
                        <div className="grid grid-cols-[45%_55%] gap-2">
                          {/* Première colonne : Titre */}
                          <div className="text-xs font-bold text-gray-900">
                            4. CALOTIN (si il y a): - Ôtez éléments de confort si nécessaire; Ne pas démonté calotin si fixé sur la coque.
                          </div>

                          {/* Deuxième colonne : Éléments */}
                          <div className="space-y-2">
                            <InspectionItem
                              text="Marque/Fissure/Déformation/Usure ..."
                              section="calotin"
                              field="otezElementsConfort"
                              renderText={true}
                            />
                          </div>
                        </div>
                      </div>

                      {/* 5. COIFFE */}
                      <div className="border-b border-gray-200 pb-2">
                        <div className="grid grid-cols-[45%_55%] gap-2">
                          <div className="text-xs font-bold text-gray-900">
                            5. COIFFE:- Etat des sangles et de leurs fixation dans la calotte.
                          </div>
                          <div className="space-y-2">
                            <InspectionItem
                              text="Usure/Coupure/Brûlure/Déformation ..."
                              section="coiffe"
                              field="etatSanglesFixation"
                              renderText={true}
                            />
                          </div>
                        </div>
                      </div>

                      {/* 6. TOUR DE TETE */}
                      <div className="border-b border-gray-200 pb-2">
                        <div className="grid grid-cols-[45%_55%] gap-2">
                          <div className="text-xs font-bold text-gray-900">
                            6. TOUR DE TETE
                          </div>
                          <div className="space-y-2">
                            <InspectionItem
                              text="Usure/Déformation/Elément manquant/Fixation ..."
                              section="tourDeTete"
                              field="usureDeformationElement"
                              renderText={true}
                            />
                          </div>
                        </div>
                      </div>

                      {/* 7. SYSTEME DE REGLAGE */}
                      <div className="border-b border-gray-200 pb-2">
                        <div className="grid grid-cols-[45%_55%] gap-2">
                          <div className="text-xs font-bold text-gray-900">
                            7. SYSTEME DE REGLAGE: - Etat, fixations; actionner système dans les deux sens; Tirez sur système pour voir si il se dérègle ou pas
                          </div>
                          <div className="space-y-2">
                            <InspectionItem
                              text="Usure/Déformation/Elément manquant/Fixation ..."
                              section="systemeReglage"
                              field="etatFixations"
                              renderText={true}
                            />
                          </div>
                        </div>
                      </div>

                      {/* 8. JUGULAIRE */}
                      <div className="border-b border-gray-200 pb-2">
                        <div className="grid grid-cols-[45%_55%] gap-2">
                          <div className="text-xs font-bold text-gray-900">
                            8. JUGULAIRE: - Etat sangles et éléments de réglage (inspecter les parties cachées également)
                          </div>
                          <div className="space-y-2">
                            <InspectionItem
                              text="Usure/Coupure/Brûlure/Déformation ..."
                              section="jugulaire"
                              field="etatSanglesElements"
                              renderText={true}
                            />
                          </div>
                        </div>
                      </div>

                      {/* 9. JUGULAIRE - Boucle de fermeture */}
                      <div className="border-b border-gray-200 pb-2">
                        <div className="grid grid-cols-[45%_55%] gap-2">
                          <div className="text-xs font-bold text-gray-900">
                            - Etat de la boucle de fermeture jugulaire
                          </div>
                          <div className="space-y-2">
                            <InspectionItem
                              text="Casse / Déformation / Fissure / Usure"
                              section="jugulaire"
                              field="etatBoucleFermeture"
                              renderText={true}
                            />
                          </div>
                        </div>
                      </div>

                      {/* 9. MOUSSE DE CONFORT */}
                      <div className="border-b border-gray-200 pb-2">
                        <div className="grid grid-cols-[45%_55%] gap-2">
                          <div className="text-xs font-bold text-gray-900">
                            9. MOUSSE DE CONFORT: Démonter pour laver ou remplacer quand c'est nécessaire
                          </div>
                          <div className="space-y-2">
                            <InspectionItem
                              text="Usure/Déformation/Casse ..."
                              section="mousseConfort"
                              field="usureDeformationCasse"
                              renderText={true}
                            />
                          </div>
                        </div>
                      </div>

                      {/* 10. CROCHETS DE LAMPE */}
                      <div className="border-b border-gray-200 pb-2">
                        <div className="grid grid-cols-[45%_55%] gap-2">
                          <div className="text-xs font-bold text-gray-900">
                            10. CROCHETS DE LAMPE
                          </div>
                          <div className="space-y-2">
                            <InspectionItem
                              text="Usure/Déformation/Casse/Elément manquant ..."
                              section="crochetsLampe"
                              field="usureDeformationCasse"
                              renderText={true}
                            />
                          </div>
                        </div>
                      </div>

                      {/* 11. ACCESSOIRES */}
                      <div className="border-b border-gray-200 pb-2">
                        <div className="grid grid-cols-[45%_55%] gap-2">
                          <div className="text-xs font-bold text-gray-900">
                            11. ACCESSOIRES: Visière, lampe
                          </div>
                          <div className="space-y-2">
                            <InspectionItem
                              text="Fonctionnement/Etat ..."
                              section="accessoires"
                              field="fonctionnementEtat"
                              renderText={true}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Signature */}
                      <div className="border-b border-gray-200 pb-2">
                        <h3 className="text-xs font-medium text-gray-900 mb-2">
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
                                Certificat du contrôleur (PDF)
                              </label>
                              <div className="flex space-x-2">
                                <div className="flex-1 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                                  {getCurrentCertificate() ? (
                                    <div className="text-green-600 text-sm">
                                      <DocumentIcon className="h-6 w-6 mx-auto mb-2" />
                                      <a
                                        href={getCurrentCertificate()}
                                        target="_blank"
                                        className="text-blue-600 hover:text-blue-800 underline text-xs"
                                      >
                                        <div>Certificat du contrôleur</div>
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
                                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                    title="Uploader un certificat PDF"
                                  >
                                    <DocumentIcon className="h-4 w-4" />
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
                                  {getCurrentDigitalSignature() ? (
                                    <div className="text-green-600 text-sm">
                                      <DocumentIcon className="h-6 w-6 mx-auto mb-2" />
                                      <div className="text-gray-600">
                                        <img src={getCurrentDigitalSignature()} alt="Signature digitale" className="h-16 mx-auto object-contain" />
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
