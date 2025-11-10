'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircleIcon, XMarkIcon, PhotoIcon, QrCodeIcon, DocumentIcon } from '@heroicons/react/24/outline';
import { equipmentConfig } from '@/config/equipment-types';
import EquipmentIdentification from '@/components/equipment/EquipmentIdentification';
import EquipmentInspectionSections from '@/components/equipment/EquipmentInspectionSections';
import TemplateBasedInspectionSections from '@/components/equipment/TemplateBasedInspectionSections';

interface Template {
  id: string;
  name: string;
  description: string;
  structure: any;
}

export default function CreateEquipmentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingPDF, setIsUploadingPDF] = useState(false);
  const [isUploadingDateAchat, setIsUploadingDateAchat] = useState(false);
  const [isUploadingDocuments, setIsUploadingDocuments] = useState(false);
  
  // Mode de sélection : 'template' ou 'config'
  const [selectionMode, setSelectionMode] = useState<'template' | 'config'>('template');
  
  // Si mode template : ID du template sélectionné
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  
  // Si mode config : type d'équipement depuis config
  const [selectedType, setSelectedType] = useState<string>(
    searchParams.get('type') || 'Harnais de Suspension'
  );

  // Types d'équipements disponibles (ancien système)
  const equipmentTypes = Object.keys(equipmentConfig);

  // Charger les templates
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const response = await fetch('/api/admin/equipment-templates');
        if (response.ok) {
          const data = await response.json();
          setTemplates(data);
          
          // Si un template est passé en paramètre URL
          const templateIdParam = searchParams.get('templateId');
          if (templateIdParam && data.length > 0) {
            const template = data.find((t: Template) => t.id === templateIdParam);
            if (template) {
              setSelectionMode('template');
              setSelectedTemplateId(templateIdParam);
              setSelectedTemplate(template);
            }
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des templates:', error);
      } finally {
        setIsLoadingTemplates(false);
      }
    };

    if (status === 'authenticated') {
      loadTemplates();
    }
  }, [status, searchParams]);

  const [formData, setFormData] = useState({
    // Identification équipement (commune à tous)
    referenceInterne: '',
    typeEquipement: '',
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
    verificateurNom: '',
    fabricant: '',
    etat: 'INVALID',
    templateId: null as string | null,
    
    // Données d'inspection dynamiques selon le type
    inspectionData: {} as any,
  });

  // Initialiser les données d'inspection selon le mode sélectionné
  useEffect(() => {
    if (selectionMode === 'template' && selectedTemplate) {
      setFormData(prev => ({
        ...prev,
        typeEquipement: selectedTemplate.name,
        templateId: selectedTemplate.id,
        inspectionData: {
          antecedentProduit: {
            miseEnService: prev.dateMiseEnService || '',
            comment: '',
          },
        },
      }));
    } else if (selectionMode === 'config' && equipmentConfig[selectedType]) {
      const config = equipmentConfig[selectedType];
      setFormData(prev => ({
        ...prev,
        typeEquipement: selectedType,
        templateId: null,
        inspectionData: config.defaultInspectionData,
      }));
    }
  }, [selectionMode, selectedTemplate, selectedType]);

  // Charger le template sélectionné
  useEffect(() => {
    if (selectionMode === 'template' && selectedTemplateId) {
      const template = templates.find(t => t.id === selectedTemplateId);
      if (template) {
        setSelectedTemplate(template);
      }
    }
  }, [selectedTemplateId, templates, selectionMode]);

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
    router.push('/');
    return null;
  }

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
                dateFabrication: qrData.date || prev.dateFabrication,
                typeEquipement: qrData.produit || qrData.typeEquipement || prev.typeEquipement,
                dateInspectionDetaillee: nextInspectionDate,
                
                // Nouveaux champs du QR generator
                fabricant: qrData.fabricant || prev.fabricant,
                normesCertificat: qrData.normesCertificat || qrData.normes || prev.normesCertificat,
                pdfUrl: qrData.pdfUrl || prev.pdfUrl,
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
        if (data.extractedData) {
          setFormData(prev => ({
            ...prev,
            normesCertificat: data.extractedData.normes || prev.normesCertificat,
            documentsReference: data.extractedData.reference || prev.documentsReference,
            pdfUrl: data.extractedData.pdfUrl || data.extractedData.cloudinaryUrl || data.url || prev.pdfUrl,
          }));
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
      setIsUploadingDateAchat(false);
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
            documentsReference: data.extractedData.reference || prev.documentsReference,
          }));
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

  // Fonction pour vérifier si une subsection a réellement des données saisies
  const hasRealData = (subsectionData: any, subsection: any): boolean => {
    if (!subsectionData) return false;
    
    // Si c'est un sous-titre, l'afficher toujours
    if (subsection.isSubtitle) return true;
    
    // Vérifier si un commentaire a été ajouté (non vide)
    const hasComment = subsectionData.comment && typeof subsectionData.comment === 'string' && subsectionData.comment.trim() !== '';
    
    // Vérifier si des mots ont été barrés
    const hasCrossedWords = subsectionData.crossedWords && Object.keys(subsectionData.crossedWords).length > 0
      ? Object.values(subsectionData.crossedWords).some((crossed: any) => crossed === true)
      : false;
    
    // Si la subsection a un status
    if (subsection.hasStatus) {
      const status = subsectionData.status;
      
      // Si le status est 'V' (valeur par défaut), on ne l'affiche que s'il y a un commentaire ou des mots barrés
      if (status === 'V' || status === undefined || status === null || status === '') {
        return hasComment || hasCrossedWords;
      }
      
      // Si le status est 'NA' ou 'X', on l'affiche toujours (car c'est une modification explicite de l'utilisateur)
      if (status === 'NA' || status === 'X') {
        return true;
      }
      
      // Pour tout autre status, on l'affiche
      if (status && status !== '') {
        return true;
      }
    } else {
      // Pour les subsections sans status, on vérifie seulement commentaire et mots barrés
      return hasComment || hasCrossedWords;
    }
    
    return false;
  };

  // Fonction pour filtrer les sections avec seulement des données par défaut
  // IMPORTANT: Sauvegarder toutes les subsections qui sont présentes dans sectionData
  // Le filtre hasRealData ne doit être utilisé que pour l'affichage, pas pour la sauvegarde
  const filterEmptySections = (sectionData: any, section: any): any => {
    if (!sectionData || Object.keys(sectionData).length === 0) {
      return null;
    }

    const filteredSection: any = {};
    let hasAnyData = false;

    // Sauvegarder toutes les subsections qui sont présentes dans sectionData
    // Si elles sont initialisées, elles doivent être sauvegardées
    section.subsections.forEach((subsection: any) => {
      const subsectionData = sectionData[subsection.id];
      if (subsectionData !== undefined && subsectionData !== null) {
        // Sauvegarder la subsection même si elle n'a que le status 'V' par défaut
        // Le filtre hasRealData sera utilisé dans le view pour déterminer l'affichage
        filteredSection[subsection.id] = subsectionData;
        hasAnyData = true;
      }
    });

    return hasAnyData ? filteredSection : null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      let body: any;

      if (selectionMode === 'template' && selectedTemplate) {
        // Mode template : préparer les données depuis le template
        console.log('Création inspection avec template:', {
          templateId: selectedTemplate.id,
          templateName: selectedTemplate.name,
          typeEquipement: formData.typeEquipement,
          selectedTemplateId: selectedTemplateId
        });
        
        // Liste des champs scalaires à inclure (pas les sections JSON de l'ancien système)
        const scalarFields = [
          'referenceInterne', 'typeEquipement', 'fabricant', 'numeroSerie',
          'numeroSerieTop', 'numeroSerieCuissard', 'numeroSerieNonEtiquete',
          'dateFabrication', 'dateAchat', 'dateMiseEnService', 'dateInspectionDetaillee',
          'numeroKit', 'taille', 'longueur', 'normesCertificat', 'documentsReference',
          'consommation', 'attribution', 'commentaire', 'photo', 'qrCode',
          'pdfUrl', 'normesUrl', 'dateAchatImage', 'verificateurSignature',
          'verificateurSignaturePdf', 'verificateurDigitalSignature', 'verificateurNom',
          'dateSignature', 'etat', 'status'
        ];

        // Sections de l'ancien système à exclure
        const sectionsToExclude = [
          'etatSangles', 'pointsAttache', 'etatBouclesReglages', 'etatElementsConfort',
          'etatConnecteurTorseCuissard', 'bloqueurCroll', 'verificationCorps',
          'verificationDoigt', 'verificationBague', 'calotteExterieurInterieur',
          'calotin', 'coiffe', 'tourDeTete', 'systemeReglage', 'jugulaire',
          'mousseConfort', 'crochetsLampe', 'accessoires'
        ];

        // Construire le body avec seulement les champs scalaires nécessaires
        body = {
          // Inclure seulement les champs scalaires
          ...Object.fromEntries(
            Object.entries(formData).filter(([key]) => 
              scalarFields.includes(key) && key !== 'inspectionData' && key !== 'templateId'
            )
          ),
          // Template ID
          templateId: selectedTemplate.id,
        };

        // Toujours ajouter antecedentProduit (section 1 automatique)
        if (formData.inspectionData.antecedentProduit) {
          body.antecedentProduit = formData.inspectionData.antecedentProduit;
        }

        // Ajouter observationsPrelables si présent
        if (formData.inspectionData.observationsPrelables) {
          body.observationsPrelables = formData.inspectionData.observationsPrelables;
        }

        // Filtrer et ajouter seulement les sections du template qui ont des données réelles
        selectedTemplate.structure.sections.forEach((section: any) => {
          const sectionData = formData.inspectionData[section.id];
          if (sectionData) {
            const filteredSection = filterEmptySections(sectionData, section);
            if (filteredSection) {
              body[section.id] = filteredSection;
              console.log(`Section ${section.id} (${section.title}):`, {
                totalSubsectionsInTemplate: section.subsections.length,
                subsectionsInFormData: Object.keys(sectionData).length,
                subsectionsAfterFilter: Object.keys(filteredSection).length,
                formDataKeys: Object.keys(sectionData),
                filteredKeys: Object.keys(filteredSection),
                missingAfterFilter: section.subsections
                  .filter((sub: any) => sectionData[sub.id] !== undefined && !filteredSection[sub.id])
                  .map((sub: any) => ({ id: sub.id, label: sub.label }))
              });
            } else {
              console.log(`Section ${section.id} (${section.title}): filteredSection is null`);
            }
          } else {
            console.log(`Section ${section.id} (${section.title}): sectionData is undefined`);
          }
        });

        // S'assurer qu'aucune section de l'ancien système n'est incluse
        sectionsToExclude.forEach(section => {
          if (body[section]) {
            console.log(`Removing old system section '${section}' from body`);
            delete body[section];
          }
        });

        console.log('Body to send (after filtering):', {
          templateId: body.templateId,
          typeEquipement: body.typeEquipement,
          sectionsInBody: Object.keys(body).filter(key => 
            !scalarFields.includes(key) && 
            key !== 'templateId' && 
            key !== 'antecedentProduit' && 
            key !== 'observationsPrelables'
          ),
          hasOldSystemSections: sectionsToExclude.some(section => body[section])
        });
      } else {
        // Mode config : utiliser l'ancien système
        const config = equipmentConfig[selectedType];
        body = config.prepareSubmitData(formData);
        // S'assurer que templateId n'est pas défini pour l'ancien système
        body.templateId = null;
      }

      const response = await fetch('/api/admin/equipment-detailed-inspections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const data = await response.json();
        router.push('/admin/equipment-detailed-inspections');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erreur lors de la création de l\'inspection');
      }
    } catch (error) {
      setError('Erreur lors de la création de l\'inspection');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-sm text-indigo-600 hover:text-indigo-800"
          >
            ← Retour
          </button>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">
              Nouvelle Inspection d'Équipement
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* Sélection du mode : Template ou Config */}
            <div className="bg-blue-50 border border-blue-200 p-4 rounded">
              <label className="block text-sm font-medium text-gray-900 mb-3">
                Mode de création *
              </label>
              <div className="flex space-x-4 mb-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="template"
                    checked={selectionMode === 'template'}
                    onChange={(e) => setSelectionMode('template')}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    🆕 Utiliser un Template (Recommandé)
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="config"
                    checked={selectionMode === 'config'}
                    onChange={(e) => setSelectionMode('config')}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Ancien système (Config)
                  </span>
                </label>
              </div>

              {selectionMode === 'template' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sélectionner un Template *
                  </label>
                  {isLoadingTemplates ? (
                    <p className="text-sm text-gray-600">Chargement des templates...</p>
                  ) : templates.length === 0 ? (
                    <div className="bg-yellow-50 border border-yellow-200 p-3 rounded">
                      <p className="text-sm text-yellow-700 mb-2">
                        Aucun template disponible. Créez-en un d'abord !
                      </p>
                      <button
                        type="button"
                        onClick={() => router.push('/admin/equipment-templates/create')}
                        className="text-sm text-yellow-800 underline"
                      >
                        Créer un template
                      </button>
                    </div>
                  ) : (
                    <select
                      value={selectedTemplateId}
                      onChange={(e) => {
                        const newTemplateId = e.target.value;
                        console.log('Template sélectionné changé:', {
                          newTemplateId,
                          templates: templates.map(t => ({ id: t.id, name: t.name }))
                        });
                        setSelectedTemplateId(newTemplateId);
                        const template = templates.find(t => t.id === newTemplateId);
                        console.log('Template trouvé:', template ? { id: template.id, name: template.name } : 'Aucun');
                        setSelectedTemplate(template || null);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    >
                      <option value="">-- Sélectionner un template --</option>
                      {templates.map((template) => (
                        <option key={template.id} value={template.id}>
                          {template.name} {template.description ? `- ${template.description}` : ''}
                        </option>
                      ))}
                    </select>
                  )}
                  <p className="mt-2 text-sm text-gray-600">
                    Les sections d'inspection seront chargées depuis le template sélectionné.
                  </p>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type d'équipement *
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  >
                    {equipmentTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 text-sm text-gray-600">
                    Les sections d'inspection s'adapteront automatiquement selon le type sélectionné.
                  </p>
                </div>
              )}
            </div>

            {/* Layout en grid comme dans nouveau/page.tsx */}
            <div className="grid grid-cols-1 lg:grid-cols-6 gap-8">
              {/* Colonne gauche - Identification équipement */}
              <div className="lg:col-span-2 space-y-6">
                <EquipmentIdentification
                  formData={formData}
                  setFormData={setFormData}
                  onPhotoUpload={handlePhotoUpload}
                  onQRCodeUpload={handleQRCodeUpload}
                  onPDFUpload={handlePDFUpload}
                  onDateAchatUpload={handleDateAchatUpload}
                  onDocumentsUpload={handleDocumentsUpload}
                  isUploading={isUploading}
                  isUploadingPDF={isUploadingPDF}
                  isUploadingDateAchat={isUploadingDateAchat}
                  isUploadingDocuments={isUploadingDocuments}
                  calculateNextInspectionDate={calculateNextInspectionDate}
                  updateEtatBasedOnInspectionDate={updateEtatBasedOnInspectionDate}
                />
              </div>

              {/* Colonne droite - Vie de l'équipement */}
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Vie de l'équipement
                  </h2>
                  
                  {/* Sections d'inspection dynamiques */}
                  {selectionMode === 'template' && selectedTemplate ? (
                    <TemplateBasedInspectionSections
                      template={selectedTemplate}
                      formData={formData}
                      setFormData={setFormData}
                      onSignatureUpload={handleSignatureUpload}
                      isUploadingSignature={isUploading}
                    />
                  ) : selectionMode === 'config' ? (
                    <EquipmentInspectionSections
                      selectedType={selectedType}
                      formData={formData}
                      setFormData={setFormData}
                    />
                  ) : (
                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
                      <p className="text-sm text-yellow-700">
                        Veuillez sélectionner un template ou un type d'équipement.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isLoading ? 'Création...' : 'Créer l\'inspection'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

