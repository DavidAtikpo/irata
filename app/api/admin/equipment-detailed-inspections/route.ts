import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const inspections = await prisma.equipmentDetailedInspection.findMany({
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Filtrer les sections de l'ancien système pour les inspections avec template
    const filteredInspections = inspections.map(inspection => {
      if (inspection.templateId) {
        const sectionsToRemove = [
          'etatSangles', 'pointsAttache', 'etatBouclesReglages', 'etatElementsConfort',
          'etatConnecteurTorseCuissard', 'bloqueurCroll', 'verificationCorps',
          'verificationDoigt', 'verificationBague', 'calotteExterieurInterieur',
          'calotin', 'coiffe', 'tourDeTete', 'systemeReglage', 'jugulaire',
          'mousseConfort', 'crochetsLampe', 'accessoires'
        ];

        const filtered: any = { ...inspection };
        sectionsToRemove.forEach(section => {
          delete filtered[section];
        });

        return filtered;
      }
      return inspection;
    });

    return NextResponse.json(filteredInspections);
  } catch (error) {
    console.error('Erreur lors de la récupération des inspections:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des inspections' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    
    // Log pour déboguer
    if (body.templateId) {
      const sectionsToCheck = [
        'verificationBague', 'verificationCorps', 'verificationDoigt',
        'etatSangles', 'pointsAttache', 'calotteExterieurInterieur'
      ];
      const foundOldSections = sectionsToCheck.filter(section => body[section]);
      if (foundOldSections.length > 0) {
        console.error('⚠️ Old system sections found in request body:', foundOldSections);
      }
    }
    
    // Extraire les champs qui ne doivent pas être directement sauvegardés
    const { 
      inspectionData, 
      nature, 
      reference, 
      type, 
      normes, 
      date, 
      signataire, 
      crossedOutWords, 
      crossedOutItems,
      templateId, // Template utilisé (optionnel)
      // Extraire les champs spécifiques au harnais pour les sauvegarder
      etatSangles,
      pointsAttache,
      etatBouclesReglages,
      etatElementsConfort,
      etatConnecteurTorseCuissard,
      bloqueurCroll,
      // Extraire les champs spécifiques au mousqueton pour les sauvegarder
      verificationCorps,
      verificationDoigt,
      verificationBague,
      // Extraire les champs connus du modèle Prisma
      antecedentProduit,
      observationsPrelables,
      calotteExterieurInterieur,
      calotin,
      coiffe,
      tourDeTete,
      systemeReglage,
      jugulaire,
      mousseConfort,
      crochetsLampe,
      accessoires,
      // Extraire toutes les autres sections dynamiques du template (qui seront dans le reste)
      ...rest 
    } = body;
    
    // Si un templateId est présent, on ignore les sections JSON connues de l'ancien système
    // (sauf antecedentProduit et observationsPrelables qui sont communs)
    const sectionsToIgnoreWhenUsingTemplate = [
      'etatSangles', 'pointsAttache', 'etatBouclesReglages', 'etatElementsConfort',
      'etatConnecteurTorseCuissard', 'bloqueurCroll', 'verificationCorps',
      'verificationDoigt', 'verificationBague', 'calotteExterieurInterieur',
      'calotin', 'coiffe', 'tourDeTete', 'systemeReglage', 'jugulaire',
      'mousseConfort', 'crochetsLampe', 'accessoires'
    ];

    // Collecter toutes les sections JSON dynamiques (sections du template)
    // Si un templateId est présent, ne pas inclure les sections de l'ancien système
    const jsonSections: Record<string, any> = {
      ...(antecedentProduit && { antecedentProduit }),
      ...(observationsPrelables && { observationsPrelables }),
      // Ne pas inclure les sections de l'ancien système si on utilise un template
      ...(!templateId && etatSangles && { etatSangles }),
      ...(!templateId && pointsAttache && { pointsAttache }),
      ...(!templateId && etatBouclesReglages && { etatBouclesReglages }),
      ...(!templateId && etatElementsConfort && { etatElementsConfort }),
      ...(!templateId && etatConnecteurTorseCuissard && { etatConnecteurTorseCuissard }),
      ...(!templateId && bloqueurCroll && { bloqueurCroll }),
      ...(!templateId && verificationCorps && { verificationCorps }),
      ...(!templateId && verificationDoigt && { verificationDoigt }),
      ...(!templateId && verificationBague && { verificationBague }),
      ...(!templateId && calotteExterieurInterieur && { calotteExterieurInterieur }),
      ...(!templateId && calotin && { calotin }),
      ...(!templateId && coiffe && { coiffe }),
      ...(!templateId && tourDeTete && { tourDeTete }),
      ...(!templateId && systemeReglage && { systemeReglage }),
      ...(!templateId && jugulaire && { jugulaire }),
      ...(!templateId && mousseConfort && { mousseConfort }),
      ...(!templateId && crochetsLampe && { crochetsLampe }),
      ...(!templateId && accessoires && { accessoires }),
    };

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

    // Extraire les champs de base (scalaires) du reste
    const baseFields: Record<string, any> = {};
    const dynamicJsonSections: Record<string, any> = {};

    // Liste des sections JSON connues (pour les équipements spécifiques - ancien système)
    const knownJsonSections = [
      'antecedentProduit', 'observationsPrelables', 'etatSangles', 'pointsAttache',
      'etatBouclesReglages', 'etatElementsConfort', 'etatConnecteurTorseCuissard',
      'bloqueurCroll', 'verificationCorps', 'verificationDoigt', 'verificationBague',
      'calotteExterieurInterieur', 'calotin', 'coiffe', 'tourDeTete', 'systemeReglage',
      'jugulaire', 'mousseConfort', 'crochetsLampe', 'accessoires'
    ];

    // Parcourir le reste pour séparer les scalaires des objets JSON (sections dynamiques)
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
        
        // Si c'est une section JSON connue, l'ajouter à jsonSections
        if (knownJsonSections.includes(key)) {
          jsonSections[key] = rest[key];
        } else {
          // Sinon, c'est une section JSON dynamique du template
          dynamicJsonSections[key] = rest[key];
        }
      }
    });

    // Fusionner toutes les sections JSON connues (pas les sections dynamiques du template)
    const allJsonSections = { ...jsonSections };
    
    // Stocker toutes les sections dynamiques du template dans un seul champ JSON
    const templateSectionsData = Object.keys(dynamicJsonSections).length > 0 
      ? dynamicJsonSections 
      : null;
    
    // Log pour diagnostiquer
    if (templateId) {
      console.log('📝 Creating inspection with template:', {
        templateId,
        typeEquipement: body.typeEquipement,
        dynamicSections: Object.keys(dynamicJsonSections),
        dynamicSectionsCount: Object.keys(dynamicJsonSections).length,
        observationsPrelables: !!observationsPrelables,
        antecedentProduit: !!antecedentProduit,
        // Afficher le contenu de chaque section dynamique
        dynamicSectionsContent: Object.keys(dynamicJsonSections).map(sectionId => ({
          sectionId,
          subsectionsCount: Object.keys(dynamicJsonSections[sectionId]).length,
          subsectionIds: Object.keys(dynamicJsonSections[sectionId])
        }))
      });
    }
    
    const inspection = await prisma.equipmentDetailedInspection.create({
      data: {
        // Champs de base (scalaires)
        ...baseFields,
        etat: baseFields.etat || body.etat || 'INVALID',
        status: baseFields.status || body.status || 'DRAFT',
        // Template utilisé (optionnel)
        ...(templateId && { templateId }),
        // Toutes les sections JSON connues (pour les équipements spécifiques)
        ...allJsonSections,
        // Sections dynamiques du template (stockées dans un seul champ JSON)
        ...(templateSectionsData && { templateSections: templateSectionsData }),
        // Inclure les données de mots barrés
        ...(crossedOutWords && { crossedOutWords }),
        ...(crossedOutItems && { crossedOutItems }),
        createdById: session.user.id,
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

    return NextResponse.json(inspection, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de l\'inspection:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'inspection' },
      { status: 500 }
    );
  }
}
