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

    return NextResponse.json(inspections);
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
    
    // Collecter toutes les sections JSON dynamiques (sections du template)
    const jsonSections: Record<string, any> = {
      ...(antecedentProduit && { antecedentProduit }),
      ...(observationsPrelables && { observationsPrelables }),
      ...(etatSangles && { etatSangles }),
      ...(pointsAttache && { pointsAttache }),
      ...(etatBouclesReglages && { etatBouclesReglages }),
      ...(etatElementsConfort && { etatElementsConfort }),
      ...(etatConnecteurTorseCuissard && { etatConnecteurTorseCuissard }),
      ...(bloqueurCroll && { bloqueurCroll }),
      ...(verificationCorps && { verificationCorps }),
      ...(verificationDoigt && { verificationDoigt }),
      ...(verificationBague && { verificationBague }),
      ...(calotteExterieurInterieur && { calotteExterieurInterieur }),
      ...(calotin && { calotin }),
      ...(coiffe && { coiffe }),
      ...(tourDeTete && { tourDeTete }),
      ...(systemeReglage && { systemeReglage }),
      ...(jugulaire && { jugulaire }),
      ...(mousseConfort && { mousseConfort }),
      ...(crochetsLampe && { crochetsLampe }),
      ...(accessoires && { accessoires }),
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

    // Parcourir le reste pour séparer les scalaires des objets JSON (sections dynamiques)
    Object.keys(rest).forEach(key => {
      if (scalarFields.includes(key)) {
        baseFields[key] = rest[key];
      } else if (rest[key] !== null && typeof rest[key] === 'object' && !Array.isArray(rest[key])) {
        // C'est probablement une section JSON dynamique du template
        dynamicJsonSections[key] = rest[key];
      }
    });

    // Fusionner toutes les sections JSON
    const allJsonSections = { ...jsonSections, ...dynamicJsonSections };
    
    const inspection = await prisma.equipmentDetailedInspection.create({
      data: {
        // Champs de base (scalaires)
        ...baseFields,
        etat: baseFields.etat || body.etat || 'INVALID',
        status: baseFields.status || body.status || 'DRAFT',
        // Template utilisé (optionnel)
        ...(templateId && { templateId }),
        // Toutes les sections JSON (connues + dynamiques du template)
        ...allJsonSections,
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
