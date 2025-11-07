/**
 * EXEMPLES DE CONFIGURATION POUR 12+ TYPES D'ÉQUIPEMENTS
 * 
 * Ce fichier contient des exemples de configuration pour différents types d'équipements.
 * Copiez et adaptez ces exemples dans equipment-types.ts
 */

import { EquipmentConfig } from './equipment-types';

// 1. CORDE (ROPE)
export const cordeConfigExample: EquipmentConfig = {
  name: 'Corde',
  defaultInspectionData: {
    antecedentProduit: { miseEnService: '', comment: '' },
    observationsPrelables: {
      referenceInterneMarquee: { status: 'V', comment: '' },
      lisibiliteNumeroSerie: { status: 'V', comment: '' },
      dureeVieNonDepassee: { status: 'V', comment: '' },
    },
    etatGaine: {
      usureCoupure: { status: 'V', comment: '' },
      deformationGonflement: { status: 'V', comment: '' },
      tracesProduitChimique: { status: 'V', comment: '' },
    },
    etatAme: {
      visibiliteDommage: { status: 'V', comment: '' },
    },
    extremites: {
      etatEpissures: { status: 'V', comment: '' },
      etatCoutures: { status: 'V', comment: '' },
    },
  },
  sections: [
    {
      id: 'etatGaine',
      title: '3. ETAT DE LA GAINE',
      subsections: [
        { id: 'usureCoupure', label: 'Usure / Coupure / Brûlure', field: 'etatGaine.usureCoupure', defaultStatus: 'V' },
        { id: 'deformationGonflement', label: 'Déformation / Gonflement', field: 'etatGaine.deformationGonflement', defaultStatus: 'V' },
        { id: 'tracesProduitChimique', label: 'Traces de produits chimiques', field: 'etatGaine.tracesProduitChimique', defaultStatus: 'V' },
      ],
    },
    {
      id: 'etatAme',
      title: '4. ETAT DE L\'AME',
      subsections: [
        { id: 'visibiliteDommage', label: 'Visibilité de dommage', field: 'etatAme.visibiliteDommage', defaultStatus: 'V' },
      ],
    },
  ],
  prepareSubmitData: (formData: any) => ({
    ...formData,
    etatGaine: formData.inspectionData.etatGaine,
    etatAme: formData.inspectionData.etatAme,
    extremites: formData.inspectionData.extremites,
    antecedentProduit: formData.inspectionData.antecedentProduit,
    observationsPrelables: formData.inspectionData.observationsPrelables,
  }),
};

// 2. LONGE (LANYARD)
export const longeConfigExample: EquipmentConfig = {
  name: 'Longe',
  defaultInspectionData: {
    antecedentProduit: { miseEnService: '', comment: '' },
    observationsPrelables: {
      referenceInterneMarquee: { status: 'V', comment: '' },
      lisibiliteNumeroSerie: { status: 'V', comment: '' },
      dureeVieNonDepassee: { status: 'V', comment: '' },
    },
    etatSangles: {
      coupureUsure: { status: 'V', comment: '' },
      etatCoutures: { status: 'V', comment: '' },
    },
    connecteurs: {
      etatMousquetons: { status: 'V', comment: '' },
      fonctionnementDoigts: { status: 'V', comment: '' },
    },
    absorbeur: {
      integrite: { status: 'V', comment: '' },
      indicateurChute: { status: 'V', comment: '' },
    },
  },
  sections: [
    {
      id: 'etatSangles',
      title: '3. ETAT DES SANGLES',
      subsections: [
        { id: 'coupureUsure', label: 'Coupure / Usure / Brûlure', field: 'etatSangles.coupureUsure', defaultStatus: 'V' },
        { id: 'etatCoutures', label: 'État des coutures', field: 'etatSangles.etatCoutures', defaultStatus: 'V' },
      ],
    },
  ],
  prepareSubmitData: (formData: any) => ({
    ...formData,
    etatSangles: formData.inspectionData.etatSangles,
    connecteurs: formData.inspectionData.connecteurs,
    absorbeur: formData.inspectionData.absorbeur,
    antecedentProduit: formData.inspectionData.antecedentProduit,
    observationsPrelables: formData.inspectionData.observationsPrelables,
  }),
};

// 3. ANCRAGE (ANCHOR POINT)
export const ancrageConfigExample: EquipmentConfig = {
  name: 'Ancrage',
  defaultInspectionData: {
    antecedentProduit: { miseEnService: '', comment: '' },
    observationsPrelables: {
      referenceInterneMarquee: { status: 'V', comment: '' },
      lisibiliteNumeroSerie: { status: 'V', comment: '' },
      dureeVieNonDepassee: { status: 'V', comment: '' },
    },
    etatStructure: {
      fissuresDeformation: { status: 'V', comment: '' },
      corrosion: { status: 'V', comment: '' },
      soliditeFixation: { status: 'V', comment: '' },
    },
    pointsFixation: {
      etatBoulons: { status: 'V', comment: '' },
      serrageCorrect: { status: 'V', comment: '' },
    },
  },
  sections: [
    {
      id: 'etatStructure',
      title: '3. ETAT DE LA STRUCTURE',
      subsections: [
        { id: 'fissuresDeformation', label: 'Fissures / Déformation', field: 'etatStructure.fissuresDeformation', defaultStatus: 'V' },
        { id: 'corrosion', label: 'Corrosion', field: 'etatStructure.corrosion', defaultStatus: 'V' },
        { id: 'soliditeFixation', label: 'Solidité de la fixation', field: 'etatStructure.soliditeFixation', defaultStatus: 'V' },
      ],
    },
  ],
  prepareSubmitData: (formData: any) => ({
    ...formData,
    etatStructure: formData.inspectionData.etatStructure,
    pointsFixation: formData.inspectionData.pointsFixation,
    antecedentProduit: formData.inspectionData.antecedentProduit,
    observationsPrelables: formData.inspectionData.observationsPrelables,
  }),
};

// 4. DESCENDEUR (DESCENDER)
export const descendeurConfigExample: EquipmentConfig = {
  name: 'Descendeur',
  defaultInspectionData: {
    antecedentProduit: { miseEnService: '', comment: '' },
    observationsPrelables: {
      referenceInterneMarquee: { status: 'V', comment: '' },
      lisibiliteNumeroSerie: { status: 'V', comment: '' },
      dureeVieNonDepassee: { status: 'V', comment: '' },
    },
    etatCorps: {
      fissuresDeformation: { status: 'V', comment: '' },
      usureCanaux: { status: 'V', comment: '' },
      corrosion: { status: 'V', comment: '' },
    },
    mecanisme: {
      fonctionnementPoignee: { status: 'V', comment: '' },
      blocageFreinage: { status: 'V', comment: '' },
    },
  },
  sections: [
    {
      id: 'etatCorps',
      title: '3. ETAT DU CORPS',
      subsections: [
        { id: 'fissuresDeformation', label: 'Fissures / Déformation', field: 'etatCorps.fissuresDeformation', defaultStatus: 'V' },
        { id: 'usureCanaux', label: 'Usure des canaux de passage de corde', field: 'etatCorps.usureCanaux', defaultStatus: 'V' },
      ],
    },
  ],
  prepareSubmitData: (formData: any) => ({
    ...formData,
    etatCorps: formData.inspectionData.etatCorps,
    mecanisme: formData.inspectionData.mecanisme,
    antecedentProduit: formData.inspectionData.antecedentProduit,
    observationsPrelables: formData.inspectionData.observationsPrelables,
  }),
};

// 5. BLOQUEUR/POIGNÉE D'ASCENSION (ASCENDER)
export const bloqueurConfigExample: EquipmentConfig = {
  name: 'Bloqueur',
  defaultInspectionData: {
    antecedentProduit: { miseEnService: '', comment: '' },
    observationsPrelables: {
      referenceInterneMarquee: { status: 'V', comment: '' },
      lisibiliteNumeroSerie: { status: 'V', comment: '' },
      dureeVieNonDepassee: { status: 'V', comment: '' },
    },
    etatCorps: {
      fissuresDeformation: { status: 'V', comment: '' },
      corrosion: { status: 'V', comment: '' },
    },
    came: {
      etatDents: { status: 'V', comment: '' },
      fonctionnementRessort: { status: 'V', comment: '' },
    },
  },
  sections: [
    {
      id: 'came',
      title: '3. CAME DE BLOCAGE',
      subsections: [
        { id: 'etatDents', label: 'État des dents', field: 'came.etatDents', defaultStatus: 'V' },
        { id: 'fonctionnementRessort', label: 'Fonctionnement du ressort', field: 'came.fonctionnementRessort', defaultStatus: 'V' },
      ],
    },
  ],
  prepareSubmitData: (formData: any) => ({
    ...formData,
    etatCorps: formData.inspectionData.etatCorps,
    came: formData.inspectionData.came,
    antecedentProduit: formData.inspectionData.antecedentProduit,
    observationsPrelables: formData.inspectionData.observationsPrelables,
  }),
};

// 6. POULIE (PULLEY)
export const poulieConfigExample: EquipmentConfig = {
  name: 'Poulie',
  defaultInspectionData: {
    antecedentProduit: { miseEnService: '', comment: '' },
    observationsPrelables: {
      referenceInterneMarquee: { status: 'V', comment: '' },
      lisibiliteNumeroSerie: { status: 'V', comment: '' },
      dureeVieNonDepassee: { status: 'V', comment: '' },
    },
    etatFlasque: {
      fissuresDeformation: { status: 'V', comment: '' },
      corrosion: { status: 'V', comment: '' },
    },
    roulement: {
      rotationLibre: { status: 'V', comment: '' },
      bruitAnormal: { status: 'V', comment: '' },
      usure: { status: 'V', comment: '' },
    },
  },
  sections: [
    {
      id: 'roulement',
      title: '3. ROULEMENT',
      subsections: [
        { id: 'rotationLibre', label: 'Rotation libre', field: 'roulement.rotationLibre', defaultStatus: 'V' },
        { id: 'bruitAnormal', label: 'Bruit anormal', field: 'roulement.bruitAnormal', defaultStatus: 'V' },
        { id: 'usure', label: 'Usure', field: 'roulement.usure', defaultStatus: 'V' },
      ],
    },
  ],
  prepareSubmitData: (formData: any) => ({
    ...formData,
    etatFlasque: formData.inspectionData.etatFlasque,
    roulement: formData.inspectionData.roulement,
    antecedentProduit: formData.inspectionData.antecedentProduit,
    observationsPrelables: formData.inspectionData.observationsPrelables,
  }),
};

/**
 * LISTE DES AUTRES TYPES POSSIBLES À AJOUTER
 * 
 * 7. ABSORBEUR D'ÉNERGIE (Energy Absorber)
 * 8. SAC DE TRANSPORT (Transport Bag)
 * 9. GANTS (Gloves)
 * 10. PROTÈGE-CORDE (Rope Protector)
 * 11. TRÉPIED (Tripod)
 * 12. POTENCE (Davit Arm)
 * 13. ÉCHELLE (Ladder)
 * 14. HARNAIS ANTICHUTE (Fall Arrest Harness)
 * 15. DISPOSITIF D'ANCRAGE TEMPORAIRE (Temporary Anchor Device)
 * 
 * Pour chaque type, suivez la même structure :
 * - defaultInspectionData (valeurs par défaut)
 * - sections (sections d'inspection spécifiques)
 * - prepareSubmitData (préparation des données pour l'API)
 */

