// Configuration pour tous les types d'équipements
// Chaque type définit ses sections d'inspection spécifiques

export interface InspectionPoint {
  status: 'V' | 'NA' | 'X';
  comment?: string;
}

export interface EquipmentConfig {
  name: string;
  defaultInspectionData: any;
  sections: InspectionSection[];
  prepareSubmitData: (formData: any) => any;
}

export interface InspectionSection {
  id: string;
  title: string;
  subsections: InspectionSubsection[];
}

export interface InspectionSubsection {
  id: string;
  label: string;
  field: string;
  defaultStatus: 'V' | 'NA' | 'X';
  type?: 'text' | 'checkbox' | 'status';
}

// Configuration pour Harnais de Suspension
const harnaisConfig: EquipmentConfig = {
  name: 'Harnais de Suspension',
  defaultInspectionData: {
    antecedentProduit: { miseEnService: '', comment: '' },
    observationsPrelables: {
      referenceInterneMarquee: { status: 'V', comment: '' },
      lisibiliteNumeroSerie: { status: 'V', comment: '' },
      dureeVieNonDepassee: { status: 'V', comment: '' },
    },
    etatSangles: {
      ceintureCuisseBretelles: { status: 'V', comment: '' },
      etatCouturesSecurite: { status: 'V', comment: '' },
      presenceOurlets: { status: 'V', comment: '' },
    },
    pointsAttache: {
      metalliques: { status: 'V', comment: '' },
      textiles: { status: 'V', comment: '' },
      plastiques: { status: 'V', comment: '' },
      indicateurArretChute: { status: 'V', comment: '' },
    },
    etatBouclesReglages: {
      fonctionnementBoucles: { status: 'V', comment: '' },
      passageSangles: { status: 'V', comment: '' },
    },
    etatElementsConfort: {
      mousses: { status: 'V', comment: '' },
      passantsElastiques: { status: 'V', comment: '' },
      elastiquesCuisses: { status: 'V', comment: '' },
      portesMateriels: { status: 'V', comment: '' },
    },
    etatConnecteurTorseCuissard: {
      corpsMousqueton: { status: 'NA', comment: '' },
      doigtMousqueton: { status: 'NA', comment: '' },
      bagueVerrouillage: { status: 'NA', comment: '' },
    },
    bloqueurCroll: {
      corpsTrousConnexion: { status: 'V', comment: '' },
      gachette: { status: 'V', comment: '' },
      taquetSecurite: { status: 'V', comment: '' },
      fonctionnel: { status: 'V', comment: '' },
    },
  },
  sections: [
    {
      id: 'observationsPrelables',
      title: '2. OBSERVATIONS PREALABLES',
      subsections: [
        { id: 'referenceInterneMarquee', label: 'Référence Interne marquée et lisible', field: 'observationsPrelables.referenceInterneMarquee', defaultStatus: 'V' },
        { id: 'lisibiliteNumeroSerie', label: 'Lisibilité Numéro de série, de la norme', field: 'observationsPrelables.lisibiliteNumeroSerie', defaultStatus: 'V' },
        { id: 'dureeVieNonDepassee', label: 'Durée de vie n\'est pas dépassée', field: 'observationsPrelables.dureeVieNonDepassee', defaultStatus: 'V' },
      ],
    },
    {
      id: 'etatSangles',
      title: '3. ETAT DES SANGLES DE',
      subsections: [
        { id: 'ceintureCuisseBretelles', label: 'Coupure/Gonflement/Usure Dommage dus à l\'utilisation...', field: 'etatSangles.ceintureCuisseBretelles', defaultStatus: 'V' },
        { id: 'etatCouturesSecurite', label: 'Fil distendu, usé ou coupé...', field: 'etatSangles.etatCouturesSecurite', defaultStatus: 'V' },
        { id: 'presenceOurlets', label: 'Présence des ourlets', field: 'etatSangles.presenceOurlets', defaultStatus: 'V' },
      ],
    },
    // ... autres sections
  ],
  prepareSubmitData: (formData: any) => {
    return {
      ...formData,
      etatSangles: formData.inspectionData.etatSangles,
      pointsAttache: formData.inspectionData.pointsAttache,
      etatBouclesReglages: formData.inspectionData.etatBouclesReglages,
      etatElementsConfort: formData.inspectionData.etatElementsConfort,
      etatConnecteurTorseCuissard: formData.inspectionData.etatConnecteurTorseCuissard,
      bloqueurCroll: formData.inspectionData.bloqueurCroll,
      antecedentProduit: formData.inspectionData.antecedentProduit,
      observationsPrelables: formData.inspectionData.observationsPrelables,
    };
  },
};

// Configuration pour Mousqueton Triple Action
const mousquetonConfig: EquipmentConfig = {
  name: 'Mousqueton Triple Action',
  defaultInspectionData: {
    antecedentProduit: { miseEnService: '', comment: '' },
    observationsPrelables: {
      referenceInterneMarquee: { status: 'V', comment: '' },
      lisibiliteNumeroSerie: { status: 'V', comment: '' },
      dureeVieNonDepassee: { status: 'V', comment: '' },
      comparaisonAppareilNeuf: { status: 'V', comment: '' },
    },
    verificationCorps: {
      marqueFissure: { status: 'V', comment: '' },
      usureCordeAncrages: { status: 'V', comment: '' },
      etatBec: { status: 'V', comment: '' },
    },
    verificationDoigt: {
      marqueUsure: { status: 'V', comment: '' },
      proprete: { status: 'V', comment: '' },
      etatRivet: { status: 'V', comment: '' },
      ouvertureManuelle: { status: 'V', comment: '' },
      fermetureAutomatique: { status: 'V', comment: '' },
    },
    verificationBague: {
      marqueUsure: { status: 'V', comment: '' },
      deverrouillage: { status: 'V', comment: '' },
      verrouillageAutomatique: { status: 'V', comment: '' },
    },
  },
  sections: [
    {
      id: 'observationsPrelables',
      title: '2. OBSERVATIONS PREALABLES',
      subsections: [
        { id: 'referenceInterneMarquee', label: 'Référence Interne marquée et lisible', field: 'observationsPrelables.referenceInterneMarquee', defaultStatus: 'V' },
        { id: 'lisibiliteNumeroSerie', label: 'Numéro de série lisible, ainsi que la norme', field: 'observationsPrelables.lisibiliteNumeroSerie', defaultStatus: 'V' },
        { id: 'dureeVieNonDepassee', label: 'Durée de vie n\'est pas dépassée', field: 'observationsPrelables.dureeVieNonDepassee', defaultStatus: 'V' },
        { id: 'comparaisonAppareilNeuf', label: 'Comparez avec un appareil neuf l\'absence de modification ou perte d\'un élément', field: 'observationsPrelables.comparaisonAppareilNeuf', defaultStatus: 'V' },
      ],
    },
    {
      id: 'verificationCorps',
      title: '3. VERIFICATION CORPS',
      subsections: [
        { id: 'marqueFissure', label: 'Marque / Fissure / Déformation / Corrosion', field: 'verificationCorps.marqueFissure', defaultStatus: 'V' },
        { id: 'usureCordeAncrages', label: 'Profondeur des marques - une usure de plus d\'un mm de profondeur / Apparition d\'arêtes tranchantes', field: 'verificationCorps.usureCordeAncrages', defaultStatus: 'V' },
        { id: 'etatBec', label: 'Marques, Usure, Fissures, Déformation,...', field: 'verificationCorps.etatBec', defaultStatus: 'V' },
      ],
    },
    {
      id: 'verificationDoigt',
      title: '4. VERIFICATION DU DOIGT',
      subsections: [
        { id: 'marqueUsure', label: 'Marque / Usure / Fissure / Déformation / Corrosion...', field: 'verificationDoigt.marqueUsure', defaultStatus: 'V' },
        { id: 'proprete', label: 'Propreté des liaisons doigt/corps...', field: 'verificationDoigt.proprete', defaultStatus: 'V' },
        { id: 'etatRivet', label: 'craquelure / Déformation / Corrosion / Jeu...', field: 'verificationDoigt.etatRivet', defaultStatus: 'V' },
        { id: 'ouvertureManuelle', label: 'Ouverture manuelle complète', field: 'verificationDoigt.ouvertureManuelle', defaultStatus: 'V' },
        { id: 'fermetureAutomatique', label: 'Efficacité ressort de rappel...', field: 'verificationDoigt.fermetureAutomatique', defaultStatus: 'V' },
      ],
    },
    {
      id: 'verificationBague',
      title: '5. VERIFICATION DE LA BAGUE',
      subsections: [
        { id: 'marqueUsure', label: 'Marque / Usure / Fissure / Déformation / Corrosion / Jeu...', field: 'verificationBague.marqueUsure', defaultStatus: 'V' },
        { id: 'deverrouillage', label: 'Déverrouillage manuel ou automatique...', field: 'verificationBague.deverrouillage', defaultStatus: 'V' },
        { id: 'verrouillageAutomatique', label: 'Verrouillage automatique', field: 'verificationBague.verrouillageAutomatique', defaultStatus: 'V' },
      ],
    },
  ],
  prepareSubmitData: (formData: any) => {
    return {
      ...formData,
      verificationCorps: formData.inspectionData.verificationCorps,
      verificationDoigt: formData.inspectionData.verificationDoigt,
      verificationBague: formData.inspectionData.verificationBague,
      antecedentProduit: formData.inspectionData.antecedentProduit,
      observationsPrelables: formData.inspectionData.observationsPrelables,
    };
  },
};

// Configuration pour Casque
const casqueConfig: EquipmentConfig = {
  name: 'Casque',
  defaultInspectionData: {
    antecedentProduit: { miseEnService: '' },
    observationsPrelables: {
      referenceInterneMarquee: { status: 'V', comment: '' },
      lisibiliteNumeroSerie: { status: 'V', comment: '' },
      dureeVieNonDepassee: { status: 'V', comment: '' },
    },
    calotteExterieurInterieur: {
      marqueFissureDeformation: { status: 'V', comment: '' },
      fentesTrousAccessoires: { status: 'V', comment: '' },
      voletsAeration: { status: 'NA', comment: '' },
    },
    calotin: {
      otezElementsConfort: { status: 'NA', comment: '' },
    },
    coiffe: {
      etatSanglesFixation: { status: 'V', comment: '' },
    },
    tourDeTete: {
      usureDeformationElement: { status: 'V', comment: '' },
    },
    systemeReglage: {
      etatFixations: { status: 'V', comment: '' },
    },
    jugulaire: {
      etatSanglesElements: { status: 'V', comment: '' },
      etatBoucleFermeture: { status: 'V', comment: '' },
    },
    mousseConfort: {
      usureDeformationCasse: { status: 'V', comment: '' },
    },
    crochetsLampe: {
      usureDeformationCasse: { status: 'V', comment: '' },
    },
    accessoires: {
      fonctionnementEtat: { status: 'NA', comment: '' },
    },
  },
  sections: [
    {
      id: 'calotteExterieurInterieur',
      title: '3. CALOTTE (Coque)',
      subsections: [
        { id: 'marqueFissureDeformation', label: 'Marque/Impact/Fissure/déformation...', field: 'calotteExterieurInterieur.marqueFissureDeformation', defaultStatus: 'V' },
        { id: 'fentesTrousAccessoires', label: 'Déformation/Fissure/Impact...', field: 'calotteExterieurInterieur.fentesTrousAccessoires', defaultStatus: 'V' },
        { id: 'voletsAeration', label: 'Volets aération si il y a, (fonctionnement)', field: 'calotteExterieurInterieur.voletsAeration', defaultStatus: 'NA' },
      ],
    },
    // ... autres sections
  ],
  prepareSubmitData: (formData: any) => {
    return {
      ...formData,
      calotteExterieurInterieur: formData.inspectionData.calotteExterieurInterieur,
      calotin: formData.inspectionData.calotin,
      coiffe: formData.inspectionData.coiffe,
      tourDeTete: formData.inspectionData.tourDeTete,
      systemeReglage: formData.inspectionData.systemeReglage,
      jugulaire: formData.inspectionData.jugulaire,
      mousseConfort: formData.inspectionData.mousseConfort,
      crochetsLampe: formData.inspectionData.crochetsLampe,
      accessoires: formData.inspectionData.accessoires,
      antecedentProduit: formData.inspectionData.antecedentProduit,
      observationsPrelables: formData.inspectionData.observationsPrelables,
    };
  },
};

// Ajouter facilement de nouveaux types d'équipements ici
export const equipmentConfig: Record<string, EquipmentConfig> = {
  'Harnais de Suspension': harnaisConfig,
  'Mousqueton Triple Action': mousquetonConfig,
  'Casque': casqueConfig,
  // Ajoutez ici vos 12+ nouveaux types d'équipements
  // 'Corde': cordeConfig,
  // 'Ancrage': ancrageConfig,
  // 'Longe': longeConfig,
  // etc...
};

// Liste des types disponibles
export const equipmentTypes = Object.keys(equipmentConfig);

