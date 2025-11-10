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

export default function ViewInspectionPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const inspectionId = params.id as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [inspection, setInspection] = useState<any>(null);
  const [template, setTemplate] = useState<any>(null);
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

  // Générer l'URL publique basée sur l'ID unique (garantit l'unicité même avec même référence interne)
  const getPublicUrl = () => {
    if (!inspection?.id) return '';
    // Utiliser l'ID unique pour garantir l'unicité du QR code
    // Format: /inspection/[id]-[slug] pour garder la lisibilité et la compatibilité
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

  // Charger les données de l'inspection
  useEffect(() => {
    const loadInspection = async () => {
      try {
        const response = await fetch(`/api/admin/equipment-detailed-inspections/${inspectionId}`);
        if (response.ok) {
          const data = await response.json();
          console.log('Données inspection:', data);
          console.log('Date signature:', data.dateSignature);
          console.log('Template ID:', data.templateId);
          console.log('Type équipement:', data.typeEquipement);
          console.log('Template inclus:', data.template);
          console.log('Template Sections:', data.templateSections);
          setInspection(data);
          // Si l'inspection utilise un template, le template est déjà inclus dans la réponse
          if (data.template) {
            console.log('Setting template from inspection data:', {
              templateId: data.template.id,
              templateName: data.template.name,
              typeEquipement: data.typeEquipement,
              inspectionTemplateId: data.templateId
            });
            // Vérifier que le template correspond au templateId de l'inspection
            if (data.template.id !== data.templateId) {
              console.error('❌ ERREUR CRITIQUE: Le template inclus ne correspond pas au templateId!', {
                templateIdInData: data.templateId,
                templateIdInTemplate: data.template.id,
                templateName: data.template.name,
                typeEquipement: data.typeEquipement
              });
              // Ne pas utiliser ce template, charger le bon depuis l'API
              console.log('Chargement du bon template depuis l\'API...');
              const templateResponse = await fetch(`/api/admin/equipment-templates/${data.templateId}`);
              if (templateResponse.ok) {
                const correctTemplate = await templateResponse.json();
                console.log('✅ Bon template chargé:', {
                  templateId: correctTemplate.id,
                  templateName: correctTemplate.name
                });
                setTemplate(correctTemplate);
              } else {
                console.error('❌ Impossible de charger le bon template');
              }
            } else {
              console.log('✅ Template correspond au templateId');
              setTemplate(data.template);
            }
          } else if (data.templateId) {
            // Si le template n'est pas inclus, le charger séparément
            console.log('Template not included, loading separately with templateId:', data.templateId);
            const templateResponse = await fetch(`/api/admin/equipment-templates/${data.templateId}`);
            if (templateResponse.ok) {
              const templateData = await templateResponse.json();
              console.log('Template loaded:', {
                templateId: templateData.id,
                templateName: templateData.name,
                typeEquipement: data.typeEquipement,
                matches: templateData.id === data.templateId
              });
              if (templateData.id !== data.templateId) {
                console.error('ERREUR: Le template chargé ne correspond pas au templateId!', {
                  expectedTemplateId: data.templateId,
                  loadedTemplateId: templateData.id
                });
              }
              setTemplate(templateData);
            } else {
              console.error('Erreur lors du chargement du template:', templateResponse.status);
            }
          }
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
      // Utiliser l'ID unique pour garantir l'unicité du QR code
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
        // Recharger l'inspection pour mettre à jour l'affichage
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
    // Utiliser normesUrl si disponible, sinon pdfUrl comme fallback
    const normesUrlToUse = inspection.normesUrl || inspection.pdfUrl;
    if (!text || !normesUrlToUse) return text;
    
    // Remplacer les normes par des liens cliquables vers le PDF
    const normePattern = /(EN\s*\d+(?::\d{4})?(?:\s*\+\s*[A-Z]\d+(?::\d{4})?)?)/gi;
    
    return text.replace(normePattern, (match) => {
      return `<a href="/api/inspection-pdf?url=${encodeURIComponent(normesUrlToUse)}" target="_blank" class="text-blue-600 hover:text-blue-800 underline cursor-pointer" title="Télécharger le PDF des normes">${match}</a>`;
    });
  };

  // Fonction pour rendre les documents de référence cliquables
  const renderClickableReferences = (text: string) => {
    if (!text || !inspection.referenceUrl) return text;
    
    // Remplacer les références par des liens cliquables
    const referencePattern = /(notice|procédure|manuel|guide|instruction|référence|document)/gi;
    
    return text.replace(referencePattern, (match) => {
      return `<a href="/api/inspection-pdf?url=${encodeURIComponent(inspection.referenceUrl)}" target="_blank" class="text-blue-600 hover:text-blue-800 underline cursor-pointer" title="Télécharger le PDF">${match}</a>`;
    });
  };

  // Fonction pour rendre la date d'achat cliquable
  const renderClickableDateAchat = (text: string) => {
    if (!text || !inspection.dateAchatUrl) return text;
    
    return `<a href="/api/inspection-pdf?url=${encodeURIComponent(inspection.dateAchatUrl)}" target="_blank" class="text-blue-600 hover:text-blue-800 underline cursor-pointer" title="Télécharger le PDF">${text}</a>`;
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

  // Fonction pour rendre les sections dynamiques du template
  const renderTemplateSections = () => {
    if (!template || !template.structure?.sections || !inspection.templateSections) {
      console.log('Template sections render - Missing data:', {
        hasTemplate: !!template,
        hasStructure: !!template?.structure?.sections,
        hasTemplateSections: !!inspection.templateSections,
        templateSections: inspection.templateSections
      });
      return null;
    }

    // Vérifier que le template correspond bien au templateId de l'inspection
    if (template.id !== inspection.templateId) {
      console.error('ERREUR CRITIQUE: Le template utilisé ne correspond pas au templateId de l\'inspection!', {
        inspectionTemplateId: inspection.templateId,
        templateId: template.id,
        templateName: template.name,
        typeEquipement: inspection.typeEquipement
      });
      return (
        <div className="bg-red-50 border border-red-200 p-4 rounded">
          <p className="text-sm text-red-700">
            Erreur: Le template chargé ({template.name}) ne correspond pas au template de l'inspection.
            Template ID attendu: {inspection.templateId}, Template ID chargé: {template.id}
          </p>
        </div>
      );
    }

    const templateSections = inspection.templateSections as Record<string, any>;
    const templateSectionsKeys = Object.keys(templateSections);
    
    // Créer un map pour accéder rapidement aux sections du template par ID
    const templateSectionsMap = new Map(
      template.structure.sections.map((section: any) => [section.id, section])
    );

    // Si la section "2. OBSERVATIONS PREALABLES" existe dans le template mais pas dans templateSections,
    // et que observationsPrelables existe, fusionner les données
    const observationsSection = template.structure.sections.find((s: any) => 
      s.title && s.title.toLowerCase().includes('observations prealables')
    );
    if (observationsSection && !templateSections[observationsSection.id] && inspection.observationsPrelables) {
      // Mapper observationsPrelables vers les subsections du template en utilisant les labels
      const observationsData: any = {};
      
      // Mapper chaque subsection du template vers observationsPrelables
      observationsSection.subsections.forEach((subsection: any) => {
        const label = subsection.label?.toLowerCase() || '';
        
        // Mapper selon le label de la subsection
        if (label.includes('référence interne') || label.includes('reference interne')) {
          if (inspection.observationsPrelables.referenceInterneMarquee) {
            observationsData[subsection.id] = inspection.observationsPrelables.referenceInterneMarquee;
          }
        } else if (label.includes('lisibilité') || label.includes('numero de serie') || label.includes('norme')) {
          if (inspection.observationsPrelables.lisibiliteNumeroSerie) {
            observationsData[subsection.id] = inspection.observationsPrelables.lisibiliteNumeroSerie;
          }
        } else if (label.includes('durée de vie') || label.includes('duree de vie')) {
          if (inspection.observationsPrelables.dureeVieNonDepassee) {
            observationsData[subsection.id] = inspection.observationsPrelables.dureeVieNonDepassee;
          }
        } else if (label.includes('comparaison') || label.includes('appareil neuf')) {
          if (inspection.observationsPrelables.comparaisonAppareilNeuf) {
            observationsData[subsection.id] = inspection.observationsPrelables.comparaisonAppareilNeuf;
          }
        }
      });
      
      if (Object.keys(observationsData).length > 0) {
        templateSections[observationsSection.id] = observationsData;
        templateSectionsKeys.push(observationsSection.id);
        console.log('Fusionné observationsPrelables dans templateSections pour la section:', observationsSection.id, observationsData);
      }
    }
    
    // Si la section existe déjà dans templateSections, fusionner aussi avec observationsPrelables
    if (observationsSection && templateSections[observationsSection.id] && inspection.observationsPrelables) {
      const existingData = templateSections[observationsSection.id];
      observationsSection.subsections.forEach((subsection: any) => {
        // Si la subsection n'existe pas dans templateSections, essayer de la trouver dans observationsPrelables
        if (!existingData[subsection.id]) {
          const label = subsection.label?.toLowerCase() || '';
          
          if (label.includes('référence interne') || label.includes('reference interne')) {
            if (inspection.observationsPrelables.referenceInterneMarquee) {
              existingData[subsection.id] = inspection.observationsPrelables.referenceInterneMarquee;
            }
          } else if (label.includes('lisibilité') || label.includes('numero de serie') || label.includes('norme')) {
            if (inspection.observationsPrelables.lisibiliteNumeroSerie) {
              existingData[subsection.id] = inspection.observationsPrelables.lisibiliteNumeroSerie;
            }
          } else if (label.includes('durée de vie') || label.includes('duree de vie')) {
            if (inspection.observationsPrelables.dureeVieNonDepassee) {
              existingData[subsection.id] = inspection.observationsPrelables.dureeVieNonDepassee;
            }
          } else if (label.includes('comparaison') || label.includes('appareil neuf')) {
            if (inspection.observationsPrelables.comparaisonAppareilNeuf) {
              existingData[subsection.id] = inspection.observationsPrelables.comparaisonAppareilNeuf;
            }
          }
        }
      });
    }

    console.log('Rendering template sections:', {
      templateId: template.id,
      templateName: template.name,
      typeEquipement: inspection.typeEquipement,
      templateSectionsCount: template.structure.sections.length,
      savedSectionsKeys: templateSectionsKeys,
      templateSections,
      templateStructure: template.structure.sections.map((s: any) => ({
        id: s.id,
        title: s.title,
        subsections: s.subsections.map((sub: any) => ({
          id: sub.id,
          label: sub.label,
          hasStatus: sub.hasStatus,
          hasComment: sub.hasComment
        }))
      }))
    });

    // Itérer uniquement sur les sections qui ont des données sauvegardées
    const validSections = templateSectionsKeys
      .map((sectionId: string) => {
        const section = templateSectionsMap.get(sectionId) as any;
        if (!section || !section.subsections) {
          console.warn(`Section ${sectionId} not found in template structure or missing subsections`);
          return null;
        }
        const sectionData = templateSections[sectionId];
        if (!sectionData || Object.keys(sectionData).length === 0) {
          return null;
        }
        // Vérifier qu'il y a au moins une subsection avec des données sauvegardées
        // Si une subsection est dans sectionData, elle a été sauvegardée et doit être affichée
        const hasSubsectionData = section.subsections.some((subsection: any) => {
          const subsectionData = sectionData[subsection.id];
          return subsectionData !== undefined;
        });
        return hasSubsectionData ? { section, sectionData } : null;
      })
      .filter((item): item is { section: any; sectionData: any } => item !== null);

    if (validSections.length === 0) {
      console.log('No valid sections to render');
      return <div className="text-xs text-gray-500">Aucune section à afficher</div>;
    }

    // Trier les sections selon l'ordre du template pour maintenir la cohérence
    const sortedValidSections = validSections.sort((a, b) => {
      const indexA = template.structure.sections.findIndex((s: any) => s.id === a.section.id);
      const indexB = template.structure.sections.findIndex((s: any) => s.id === b.section.id);
      return indexA - indexB;
    });

    return (
      <>
        {/* Afficher antecedentProduit si présent (section 1, toujours affichée en premier) */}
        {inspection.antecedentProduit && (
          <div className="flex justify-between items-center mb-2 border-b border-gray-200 pb-2">
            <h2 className="text-xs font-bold text-gray-900">
              1. ANTECEDENT DU PRODUIT
            </h2>
            <div className="text-xs text-gray-600">
              Mise en service le {formatDate(inspection.antecedentProduit?.miseEnService) || formatDate(inspection.dateMiseEnService)}
            </div>
          </div>
        )}

        {/* Sections dynamiques du template */}
        {sortedValidSections.map(({ section, sectionData }) => {
      const useGrid = section.useGridLayout || false;
      // Afficher toutes les subsections du template qui ont des données correspondantes
      // Vérifier d'abord les subsections du template, puis aussi les clés dans sectionData
      const subsectionIdsInData = new Set(Object.keys(sectionData));
      const subsectionsWithData = section.subsections.filter((subsection: any) => {
        // Si la subsection est dans sectionData, l'afficher
        const hasData = sectionData[subsection.id] !== undefined;
        if (!hasData && subsection.label && subsection.label.trim() !== '') {
          console.log(`Subsection ${subsection.id} (${subsection.label}) n'est pas dans sectionData`);
        } else if (!hasData && (!subsection.label || subsection.label.trim() === '')) {
          console.log(`Subsection ${subsection.id} (label vide) n'est pas dans sectionData`);
        }
        return hasData;
      });
      
      // Aussi afficher les subsections qui sont dans sectionData mais pas dans le template
      // (au cas où il y aurait des incohérences)
      subsectionIdsInData.forEach((subsectionId) => {
        if (!subsectionsWithData.find((s: any) => s.id === subsectionId)) {
          // Cette subsection est dans les données mais pas dans le template
          // On l'ignore car elle ne peut pas être affichée sans la structure du template
          console.warn(`Subsection ${subsectionId} found in data but not in template structure`);
        }
      });
      
      console.log(`Section ${section.id} (${section.title}):`, {
        totalSubsections: section.subsections.length,
        subsectionsWithData: subsectionsWithData.length,
        sectionDataKeys: Object.keys(sectionData),
        sectionDataValues: Object.keys(sectionData).map(key => ({
          key,
          hasData: sectionData[key] !== undefined && sectionData[key] !== null,
          data: sectionData[key]
        })),
        subsectionsWithDataIds: subsectionsWithData.map((s: any) => s.id),
        allSubsectionIds: section.subsections.map((s: any) => ({ id: s.id, label: s.label })),
        missingSubsections: section.subsections
          .filter((s: any) => sectionData[s.id] === undefined)
          .map((s: any) => ({ id: s.id, label: s.label }))
      });

      return (
        <div key={section.id} className="border-b border-gray-200 pb-2">
          {useGrid ? (
            <div className="grid grid-cols-[45%_55%] gap-2">
              {/* Première colonne : Titre */}
              <div className="text-xs font-bold text-gray-900">
                {section.title}
              </div>
              
              {/* Deuxième colonne : Éléments */}
              <div className="space-y-2">
                {subsectionsWithData.map((subsection: any) => {
                  const subsectionData = sectionData[subsection.id];
                  // Si pas de données pour cette subsection, ne pas l'afficher
                  if (subsectionData === undefined || subsectionData === null) {
                    console.warn(`Subsection ${subsection.id} (${subsection.label}) has no data in sectionData`);
                    return null;
                  }

                  // Si c'est un sous-titre, l'afficher comme titre
                  if (subsection.isSubtitle) {
                    return (
                      <div key={subsection.id} className="border-b border-gray-200 pb-2 mb-2">
                        <div className="text-xs font-medium text-gray-900">
                          {subsection.label || section.title}
                        </div>
                      </div>
                    );
                  }

                  const contentClass = subsection.hasGrayBackground ? 'bg-gray-100 p-1' : '';
                  const status = subsectionData.status || 'V';
                  const comment = subsectionData.comment;
                  const crossedWords = subsectionData.crossedWords || {};
                  const fieldKey = `${section.id}.${subsection.id}`;
                const hasLabel = subsection.label && subsection.label.trim() !== '';

                // Rendre le texte avec mots barrés
                const renderText = () => {
                  if (!subsection.crossableWords || subsection.crossableWords.length === 0) {
                    return subsection.label;
                  }
                  
                  // Pour les templates, les mots barrés peuvent être dans deux endroits :
                  // 1. Dans crossedOutWords (ancien système global)
                  // 2. Dans subsectionData.crossedWords (nouveau système template)
                  const crossedWordsFromData = subsectionData.crossedWords || {};
                  
                  // Si on a des crossedWords dans la subsection, les utiliser pour afficher les mots barrés
                  if (Object.keys(crossedWordsFromData).length > 0) {
                    const text = subsection.label;
                    const words = text.split(/(\s+|\/|\(|\)|-|\.)/);
                    
                    return words.map((word: string, index: number) => {
                      const trimmedWord = word.trim();
                      const isCrossable = subsection.crossableWords.includes(trimmedWord);
                      const isCrossed = isCrossable && crossedWordsFromData[trimmedWord];
                      
                      if (!isCrossable || /^\s+$/.test(word) || /^[\/\(\)\-\.]+$/.test(word)) {
                        return <span key={index}>{word}</span>;
                      }
                      
                      return (
                        <span
                          key={index}
                          className={isCrossed ? 'line-through' : ''}
                        >
                          {word}
                        </span>
                      );
                    });
                  }
                  
                  // Sinon, utiliser l'ancien système avec crossedOutWords global
                  return renderCrossedOutText(subsection.label, fieldKey);
                };

                  return (
                    <div key={subsection.id} className={contentClass}>
                      <div className="flex items-center justify-between gap-2">
                        {hasLabel ? (
                          <>
                            {subsection.isListItem ? (
                              <li className="text-xs text-gray-700 flex-1 list-disc list-inside">
                                {renderText()}
                              </li>
                            ) : (
                              <span className="text-xs text-gray-700 flex-1">{renderText()}</span>
                            )}
                          </>
                        ) : (
                          // Si pas de label, afficher juste un espace pour maintenir la mise en page
                          <span className="text-xs text-gray-700 flex-1">&nbsp;</span>
                        )}
                        {subsection.showStatusButton !== false && subsection.hasStatus && (
                          <StatusIndicator status={status} />
                        )}
                      </div>
                      {comment && (
                        <div className="text-xs text-blue-600 italic ml-4 mt-1">
                          Commentaire: {comment}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-xs font-bold text-gray-900 mb-2">
                {section.title}
              </div>
              {subsectionsWithData.map((subsection: any) => {
                const subsectionData = sectionData[subsection.id];
                if (!subsectionData) return null;

                if (subsection.isSubtitle) {
                  return (
                    <div key={subsection.id} className="border-b border-gray-200 pb-2 mb-2">
                      <div className="text-xs font-medium text-gray-900">
                        {subsection.label || section.title}
                      </div>
                    </div>
                  );
                }

                const contentClass = subsection.hasGrayBackground ? 'bg-gray-100 p-1' : '';
                const status = subsectionData.status || 'V';
                const comment = subsectionData.comment;
                const crossedWords = subsectionData.crossedWords || {};
                const fieldKey = `${section.id}.${subsection.id}`;
                const hasLabel = subsection.label && subsection.label.trim() !== '';

                const renderText = () => {
                  if (!subsection.crossableWords || subsection.crossableWords.length === 0) {
                    return subsection.label;
                  }
                  
                  // Pour les templates, les mots barrés peuvent être dans deux endroits :
                  // 1. Dans crossedOutWords (ancien système global)
                  // 2. Dans subsectionData.crossedWords (nouveau système template)
                  const crossedWordsFromData = subsectionData.crossedWords || {};
                  
                  // Si on a des crossedWords dans la subsection, les utiliser pour afficher les mots barrés
                  if (Object.keys(crossedWordsFromData).length > 0) {
                    const text = subsection.label;
                    const words = text.split(/(\s+|\/|\(|\)|-|\.)/);
                    
                    return words.map((word: string, index: number) => {
                      const trimmedWord = word.trim();
                      const isCrossable = subsection.crossableWords.includes(trimmedWord);
                      const isCrossed = isCrossable && crossedWordsFromData[trimmedWord];
                      
                      if (!isCrossable || /^\s+$/.test(word) || /^[\/\(\)\-\.]+$/.test(word)) {
                        return <span key={index}>{word}</span>;
                      }
                      
                      return (
                        <span
                          key={index}
                          className={isCrossed ? 'line-through' : ''}
                        >
                          {word}
                        </span>
                      );
                    });
                  }
                  
                  // Sinon, utiliser l'ancien système avec crossedOutWords global
                  return renderCrossedOutText(subsection.label, fieldKey);
                };

                return (
                  <div key={subsection.id} className={contentClass}>
                    <div className="flex items-center justify-between gap-2">
                      {hasLabel ? (
                        <>
                          {subsection.isListItem ? (
                            <li className="text-xs text-gray-700 flex-1 list-disc list-inside">
                              {renderText()}
                            </li>
                          ) : (
                            <span className="text-xs text-gray-700 flex-1">{renderText()}</span>
                          )}
                        </>
                      ) : (
                        // Si pas de label, afficher juste un espace pour maintenir la mise en page
                        <span className="text-xs text-gray-700 flex-1">&nbsp;</span>
                      )}
                      {subsection.showStatusButton !== false && subsection.hasStatus && (
                        <StatusIndicator status={status} />
                      )}
                    </div>
                    {comment && (
                      <div className="text-xs text-blue-600 italic ml-4 mt-1">
                        Commentaire: {comment}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    })}
      </>
    );
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
                            // Fallback vers l'icône si l'image n'existe pas
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
                <div className="flex justify-between bg-gray-100 p-2">
                  <span className="text-sm font-medium text-gray-700">Numéro de série:</span>
                  <span className="text-sm text-gray-900 font-bold">{inspection.numeroSerie || '/'}</span>
                </div>
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

              {/* Afficher les sections dynamiques du template si l'inspection utilise un template */}
              {inspection.templateId && template && inspection.templateSections ? (
                <div className="space-y-1">
                  {/* 
                    Pour les inspections avec template, renderTemplateSections() gère TOUTES les sections,
                    y compris antecedentProduit et observationsPrelables.
                    Ne pas les afficher séparément pour éviter la duplication.
                  */}
                  {renderTemplateSections()}
                </div>
              ) : inspection.templateId ? (
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
                  <p className="text-sm text-yellow-700">
                    Template chargé: {template ? 'Oui' : 'Non'}, Template Sections: {inspection.templateSections ? 'Oui' : 'Non'}
                  </p>
                </div>
              ) : (
                <>
                  {/* Affichage classique pour les inspections sans template */}
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="text-xs font-bold text-gray-900">
                     1. ANTECEDENT DU PRODUIT
                    </h2>

                    <div className="text-xs text-gray-600">
                      Mise en service le {formatDate(inspection.antecedentProduit?.miseEnService) || formatDate(inspection.dateMiseEnService)}
                    </div>
                  </div>

                  {/* Points d'inspection - Tableau sans bordure */}
                  <div className="space-y-1">
                
                {/* Observations Préalables */}
                <div className="border-b border-gray-200 pb-2">
                  <div className="grid grid-cols-[45%_55%] gap-2">
                    {/* Première colonne : Titre - 45% */}
                    <div className="text-xs font-bold text-gray-900">
                      2. OBSERVATIONS PREALABLES
                    </div>
                    
                    {/* Deuxième colonne : Éléments - 55% */}
                    <div className="space-y-1">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                         <li> <span className="text-xs text-gray-700 flex-1">Référence Interne marquée et lisible</span></li>
                          <StatusIndicator status={inspection.observationsPrelables?.referenceInterneMarquee?.status || 'V'} />
                        </div>
                        {inspection.observationsPrelables?.referenceInterneMarquee?.comment && (
                          <div className="text-xs text-blue-600 italic ml-4">
                            Commentaire: {inspection.observationsPrelables.referenceInterneMarquee.comment}
                          </div>
                        )}
                        <div className="flex items-center justify-between gap-2">
                          <li> <span className="text-xs text-gray-700 flex-1">{renderCrossedOutText("Lisibilité Numéro de série, de la norme", "observationsPrelables.lisibiliteNumeroSerie")}</span></li>
                          <StatusIndicator status={inspection.observationsPrelables?.lisibiliteNumeroSerie?.status || 'V'} />
                        </div>
                        {inspection.observationsPrelables?.lisibiliteNumeroSerie?.comment && (
                          <div className="text-xs text-blue-600 italic ml-4">
                            Commentaire: {inspection.observationsPrelables.lisibiliteNumeroSerie.comment}
                          </div>
                        )}
                        <div className="flex items-center justify-between gap-2">
                          <li> <span className="text-xs text-gray-700 flex-1">Durée de vie n'est pas dépassée</span></li>
                          <StatusIndicator status={inspection.observationsPrelables?.dureeVieNonDepassee?.status || 'V'} />
                        </div>
                        {inspection.observationsPrelables?.dureeVieNonDepassee?.comment && (
                          <div className="text-xs text-blue-600 italic ml-4">
                            Commentaire: {inspection.observationsPrelables.dureeVieNonDepassee.comment}
                          </div>
                        )}
                      </div>
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
                      <div className="bg-gray-100 p-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs text-gray-700 flex-1">{renderCrossedOutText("Marque/Impact/Fissure/déformation/Trace de salissure / Rayure/Brûlure/ Trace de produits chimique/Usure...", "calotteExterieurInterieur.marqueFissureDeformation")}</span>
                          <StatusIndicator status={inspection.calotteExterieurInterieur?.marqueFissureDeformation?.status || 'V'} />
                        </div>
                        {inspection.calotteExterieurInterieur?.marqueFissureDeformation?.comment && (
                          <div className="text-xs text-blue-600 italic ml-4 mt-1">
                            Commentaire: {inspection.calotteExterieurInterieur.marqueFissureDeformation.comment}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. CALOTIN */}
                <div className="border-b border-gray-200 pb-2">
                  <div className="grid grid-cols-[45%_55%] gap-2">
                    {/* Première colonne : Titre */}
                    <div className="text-xs font-bold text-gray-900">
                   -Fentes et trous accessoires
                    </div>
                    <div className="space-y-2">
                      <div className="bg-gray-100 p-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs text-gray-700 flex-1">{renderCrossedOutText("Déformation/Fissure/Impact ...", "calotteExterieurInterieur.fentesTrousAccessoires")}</span>
                          <StatusIndicator status={inspection.calotteExterieurInterieur?.fentesTrousAccessoires?.status || 'V'} />
                        </div>
                        {inspection.calotteExterieurInterieur?.fentesTrousAccessoires?.comment && (
                          <div className="text-xs text-blue-600 italic ml-4 mt-1">
                            Commentaire: {inspection.calotteExterieurInterieur.fentesTrousAccessoires.comment}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5. CALOTIN */}
                <div className="border-b border-gray-200 pb-2">
                  <div className="grid grid-cols-[45%_55%] gap-2">
                    {/* Première colonne : Titre */}
                    <div className="text-xs font-bold text-gray-900">
                    -Volets aération si il y a, (fonctionnement)
                    </div>
                    <div className="space-y-2">
                      <div className="bg-gray-100 p-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs text-gray-700 flex-1">Volets aération si il y a, (fonctionnement)</span>
                          <StatusIndicator status={inspection.calotteExterieurInterieur?.voletsAeration?.status || 'NA'} />
                        </div>
                        {inspection.calotteExterieurInterieur?.voletsAeration?.comment && (
                          <div className="text-xs text-blue-600 italic ml-4 mt-1">
                            Commentaire: {inspection.calotteExterieurInterieur.voletsAeration.comment}
                          </div>
                        )}
                      </div>
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
                      <div className="bg-gray-100 p-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs text-gray-700 flex-1">{renderCrossedOutText("Marque/Fissure/Déformation/Usure ...", "calotin.otezElementsConfort")}</span>
                          <StatusIndicator status={inspection.calotin?.otezElementsConfort?.status || 'NA'} />
                        </div>
                        {inspection.calotin?.otezElementsConfort?.comment && (
                          <div className="text-xs text-blue-600 italic ml-4 mt-1">
                            Commentaire: {inspection.calotin.otezElementsConfort.comment}
                          </div>
                        )}
                      </div>
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
                      <div className="bg-gray-100 p-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs text-gray-700 flex-1">{renderCrossedOutText("Usure/Coupure/Brûlure/Déformation ...", "coiffe.etatSanglesFixation")}</span>
                          <StatusIndicator status={inspection.coiffe?.etatSanglesFixation?.status || 'V'} />
                        </div>
                        {inspection.coiffe?.etatSanglesFixation?.comment && (
                          <div className="text-xs text-blue-600 italic ml-4 mt-1">
                            Commentaire: {inspection.coiffe.etatSanglesFixation.comment}
                          </div>
                        )}
                      </div>
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
                      <div className="bg-gray-100 p-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs text-gray-700 flex-1">{renderCrossedOutText("Usure/Déformation/Elément manquant/Fixation ...", "tourDeTete.usureDeformationElement")}</span>
                          <StatusIndicator status={inspection.tourDeTete?.usureDeformationElement?.status || 'V'} />
                        </div>
                        {inspection.tourDeTete?.usureDeformationElement?.comment && (
                          <div className="text-xs text-blue-600 italic ml-4 mt-1">
                            Commentaire: {inspection.tourDeTete.usureDeformationElement.comment}
                          </div>
                        )}
                      </div>
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
                      <div className="bg-gray-100 p-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs text-gray-700 flex-1">{renderCrossedOutText("Usure/Déformation/Elément manquant/Fixation ...", "systemeReglage.etatFixations")}</span>
                          <StatusIndicator status={inspection.systemeReglage?.etatFixations?.status || 'V'} />
                        </div>
                        {inspection.systemeReglage?.etatFixations?.comment && (
                          <div className="text-xs text-blue-600 italic ml-4 mt-1">
                            Commentaire: {inspection.systemeReglage.etatFixations.comment}
                          </div>
                        )}
                      </div>
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
                      <div className="bg-gray-100 p-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs text-gray-700 flex-1">{renderCrossedOutText("Usure/Coupure/Brûlure/Déformation ...", "jugulaire.etatSanglesElements")}</span>
                          <StatusIndicator status={inspection.jugulaire?.etatSanglesElements?.status || 'V'} />
                        </div>
                        {inspection.jugulaire?.etatSanglesElements?.comment && (
                          <div className="text-xs text-blue-600 italic ml-4 mt-1">
                            Commentaire: {inspection.jugulaire.etatSanglesElements.comment}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 9. JUGULAIRE */}
                <div className="border-b border-gray-200 pb-2">
                  <div className="grid grid-cols-[45%_55%] gap-2">
                    <div className="text-xs font-bold text-gray-900">
                      - Etat de la boucle de fermeture jugulaire
                    </div>
                    <div className="space-y-2">
                      <div className="bg-gray-100 p-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs text-gray-700 flex-1">{renderCrossedOutText("Casse / Déformation / Fissure / Usure", "jugulaire.etatBoucleFermeture")}</span>
                          <StatusIndicator status={inspection.jugulaire?.etatBoucleFermeture?.status || 'V'} />
                        </div>
                        {inspection.jugulaire?.etatBoucleFermeture?.comment && (
                          <div className="text-xs text-blue-600 italic ml-4 mt-1">
                            Commentaire: {inspection.jugulaire.etatBoucleFermeture.comment}
                          </div>
                        )}
                      </div>
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
                      <div className="bg-gray-100 p-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs text-gray-700 flex-1">Usure/Déformation/Casse ...</span>
                          <StatusIndicator status={inspection.mousseConfort?.usureDeformationCasse?.status || 'V'} />
                        </div>
                        {inspection.mousseConfort?.usureDeformationCasse?.comment && (
                          <div className="text-xs text-blue-600 italic ml-4 mt-1">
                            Commentaire: {inspection.mousseConfort.usureDeformationCasse.comment}
                          </div>
                        )}
                      </div>
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
                      <div className="bg-gray-100 p-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs text-gray-700 flex-1">{renderCrossedOutText("Usure/Déformation/Casse/Elément manquant ...", "crochetsLampe.usureDeformationCasse")}</span>
                          <StatusIndicator status={inspection.crochetsLampe?.usureDeformationCasse?.status || 'V'} />
                        </div>
                        {inspection.crochetsLampe?.usureDeformationCasse?.comment && (
                          <div className="text-xs text-blue-600 italic ml-4 mt-1">
                            Commentaire: {inspection.crochetsLampe.usureDeformationCasse.comment}
                          </div>
                        )}
                      </div>
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
                      <div className="bg-gray-100 p-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs text-gray-700 flex-1">Fonctionnement/Etat ...</span>
                          <StatusIndicator status={inspection.accessoires?.fonctionnementEtat?.status || 'NA'} />
                        </div>
                        {inspection.accessoires?.fonctionnementEtat?.comment && (
                          <div className="text-xs text-blue-600 italic ml-4 mt-1">
                            Commentaire: {inspection.accessoires.fonctionnementEtat.comment}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                  </div>
                </>
              )}

              {/* Signature - Affichée dans tous les cas */}
              <div className="pt-4 bg-gray-100 p-2 mt-4">
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-700 mb-4">Signature Vérificateur / signature</div>
                  
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
  );
}
