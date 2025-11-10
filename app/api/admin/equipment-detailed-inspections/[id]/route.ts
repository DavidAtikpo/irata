import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id } = await params;
    const inspection = await prisma.equipmentDetailedInspection.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
          },
        },
        template: {
          select: {
            id: true,
            name: true,
            description: true,
            structure: true,
          },
        },
      },
    });

    if (!inspection) {
      return NextResponse.json({ error: 'Inspection non trouvée' }, { status: 404 });
    }

    // Si l'inspection utilise un template, filtrer les sections de l'ancien système
    if (inspection.templateId) {
      // Log pour diagnostiquer
      console.log('📖 Loading inspection with template:', {
        inspectionId: inspection.id,
        templateId: inspection.templateId,
        templateSections: inspection.templateSections ? Object.keys(inspection.templateSections as any) : [],
        templateSectionsContent: inspection.templateSections 
          ? Object.keys(inspection.templateSections as any).map(sectionId => ({
              sectionId,
              subsectionsCount: Object.keys((inspection.templateSections as any)[sectionId] || {}).length,
              subsectionIds: Object.keys((inspection.templateSections as any)[sectionId] || {})
            }))
          : [],
        hasObservationsPrelables: !!inspection.observationsPrelables,
        hasAntecedentProduit: !!inspection.antecedentProduit
      });
      
      // Vérifier que le template inclus correspond bien au templateId
      if (inspection.template && inspection.template.id !== inspection.templateId) {
        console.error('⚠️ Template mismatch detected:', {
          inspectionTemplateId: inspection.templateId,
          includedTemplateId: inspection.template.id,
          includedTemplateName: inspection.template.name
        });
        // Charger le bon template
        const correctTemplate = await prisma.equipmentTemplate.findUnique({
          where: { id: inspection.templateId },
          select: {
            id: true,
            name: true,
            description: true,
            structure: true,
          },
        });
        if (correctTemplate) {
          console.log('✅ Correct template loaded:', {
            templateId: correctTemplate.id,
            templateName: correctTemplate.name
          });
          inspection.template = correctTemplate;
        } else {
          console.error('❌ Template not found:', inspection.templateId);
        }
      }

      const sectionsToRemove = [
        'etatSangles', 'pointsAttache', 'etatBouclesReglages', 'etatElementsConfort',
        'etatConnecteurTorseCuissard', 'bloqueurCroll', 'verificationCorps',
        'verificationDoigt', 'verificationBague', 'calotteExterieurInterieur',
        'calotin', 'coiffe', 'tourDeTete', 'systemeReglage', 'jugulaire',
        'mousseConfort', 'crochetsLampe', 'accessoires'
      ];

      // Créer une copie de l'inspection sans les sections de l'ancien système
      const filteredInspection: any = { ...inspection };
      sectionsToRemove.forEach(section => {
        delete filteredInspection[section];
      });

      return NextResponse.json(filteredInspection);
    }

    return NextResponse.json(inspection);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'inspection:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'inspection' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    
    // Extraire les champs qui ne doivent pas être directement sauvegardés
    const { 
      inspectionData, 
      createdById, 
      createdAt, 
      updatedAt, 
      createdBy,
      id: bodyId,
      // Remove QR code related fields that are not in the Prisma model
      nature,
      reference,
      type,
      normes,
      date,
      signataire,
      // Extract known JSON sections
      antecedentProduit,
      observationsPrelables,
      etatSangles,
      pointsAttache,
      etatBouclesReglages,
      etatElementsConfort,
      etatConnecteurTorseCuissard,
      bloqueurCroll,
      verificationCorps,
      verificationDoigt,
      verificationBague,
      calotteExterieurInterieur,
      calotin,
      coiffe,
      tourDeTete,
      systemeReglage,
      jugulaire,
      mousseConfort,
      crochetsLampe,
      accessoires,
      crossedOutWords,
      crossedOutItems,
      templateId,
      template, // Template object (ne pas sauvegarder)
      ...rest 
    } = body;
    
    // Liste des champs scalaires (non-JSON) connus
    const scalarFields = [
      'referenceInterne', 'typeEquipement', 'fabricant', 'numeroSerie',
      'numeroSerieTop', 'numeroSerieCuissard', 'numeroSerieNonEtiquete',
      'dateFabrication', 'dateAchat', 'dateMiseEnService', 'dateInspectionDetaillee',
      'numeroKit', 'taille', 'longueur', 'normesCertificat', 'documentsReference',
      'consommation', 'attribution', 'commentaire', 'photo', 'qrCode',
      'pdfUrl', 'normesUrl', 'dateAchatImage', 'verificateurSignature',
      'verificateurSignaturePdf', 'verificateurDigitalSignature', 'verificateurNom',
      'dateSignature', 'etat', 'status', 'createdById', 'createdAt', 'updatedAt'
    ];

    // Liste des sections JSON connues
    const knownJsonSections = [
      'antecedentProduit', 'observationsPrelables', 'etatSangles', 'pointsAttache',
      'etatBouclesReglages', 'etatElementsConfort', 'etatConnecteurTorseCuissard',
      'bloqueurCroll', 'verificationCorps', 'verificationDoigt', 'verificationBague',
      'calotteExterieurInterieur', 'calotin', 'coiffe', 'tourDeTete', 'systemeReglage',
      'jugulaire', 'mousseConfort', 'crochetsLampe', 'accessoires'
    ];

    // Séparer les champs scalaires des sections JSON dynamiques
    const baseFields: Record<string, any> = {};
    const dynamicJsonSections: Record<string, any> = {};
    const jsonSections: Record<string, any> = {};

    // Si un templateId est présent, on ignore les sections JSON connues de l'ancien système
    // (sauf antecedentProduit et observationsPrelables qui sont communs)
    const sectionsToIgnoreWhenUsingTemplate = [
      'etatSangles', 'pointsAttache', 'etatBouclesReglages', 'etatElementsConfort',
      'etatConnecteurTorseCuissard', 'bloqueurCroll', 'verificationCorps',
      'verificationDoigt', 'verificationBague', 'calotteExterieurInterieur',
      'calotin', 'coiffe', 'tourDeTete', 'systemeReglage', 'jugulaire',
      'mousseConfort', 'crochetsLampe', 'accessoires'
    ];

    // Collecter les sections JSON connues
    // Toujours inclure antecedentProduit et observationsPrelables
    if (antecedentProduit) jsonSections.antecedentProduit = antecedentProduit;
    if (observationsPrelables) jsonSections.observationsPrelables = observationsPrelables;
    
    // Ne pas inclure les sections de l'ancien système si on utilise un template
    if (!templateId) {
      if (etatSangles) jsonSections.etatSangles = etatSangles;
      if (pointsAttache) jsonSections.pointsAttache = pointsAttache;
      if (etatBouclesReglages) jsonSections.etatBouclesReglages = etatBouclesReglages;
      if (etatElementsConfort) jsonSections.etatElementsConfort = etatElementsConfort;
      if (etatConnecteurTorseCuissard) jsonSections.etatConnecteurTorseCuissard = etatConnecteurTorseCuissard;
      if (bloqueurCroll) jsonSections.bloqueurCroll = bloqueurCroll;
      if (verificationCorps) jsonSections.verificationCorps = verificationCorps;
      if (verificationDoigt) jsonSections.verificationDoigt = verificationDoigt;
      if (verificationBague) jsonSections.verificationBague = verificationBague;
      if (calotteExterieurInterieur) jsonSections.calotteExterieurInterieur = calotteExterieurInterieur;
      if (calotin) jsonSections.calotin = calotin;
      if (coiffe) jsonSections.coiffe = coiffe;
      if (tourDeTete) jsonSections.tourDeTete = tourDeTete;
      if (systemeReglage) jsonSections.systemeReglage = systemeReglage;
      if (jugulaire) jsonSections.jugulaire = jugulaire;
      if (mousseConfort) jsonSections.mousseConfort = mousseConfort;
      if (crochetsLampe) jsonSections.crochetsLampe = crochetsLampe;
      if (accessoires) jsonSections.accessoires = accessoires;
    }

    // Parcourir le reste pour séparer les scalaires des objets JSON dynamiques
    Object.keys(rest).forEach(key => {
      if (scalarFields.includes(key)) {
        baseFields[key] = rest[key];
      } else if (rest[key] !== null && typeof rest[key] === 'object' && !Array.isArray(rest[key])) {
        // Si on utilise un template, ignorer les sections de l'ancien système
        if (templateId && sectionsToIgnoreWhenUsingTemplate.includes(key)) {
          // Ignorer cette section - elle ne doit pas être sauvegardée
          console.log(`Ignoring old system section '${key}' because templateId is present`);
          return;
        }
        
        if (knownJsonSections.includes(key)) {
          jsonSections[key] = rest[key];
        } else {
          // Section JSON dynamique du template
          dynamicJsonSections[key] = rest[key];
        }
      }
    });

    // Traiter dateSignature : convertir chaîne vide en null
    if (baseFields.dateSignature === '' || baseFields.dateSignature === undefined) {
      baseFields.dateSignature = null;
    }

    // Stocker toutes les sections dynamiques du template dans un seul champ JSON
    const templateSectionsData = Object.keys(dynamicJsonSections).length > 0 
      ? dynamicJsonSections 
      : undefined;
    
    const inspection = await prisma.equipmentDetailedInspection.update({
      where: { id },
      data: {
        ...baseFields,
        // Sections JSON connues
        ...jsonSections,
        // Sections dynamiques du template
        ...(templateSectionsData !== undefined && { templateSections: templateSectionsData }),
        // Template ID
        ...(templateId !== undefined && { templateId }),
        // Mots barrés
        ...(crossedOutWords !== undefined && { crossedOutWords }),
        ...(crossedOutItems !== undefined && { crossedOutItems }),
      },
      include: {
        createdBy: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(inspection);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'inspection:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de l\'inspection', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id } = await params;
    await prisma.equipmentDetailedInspection.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Inspection supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'inspection:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l\'inspection' },
      { status: 500 }
    );
  }
}
