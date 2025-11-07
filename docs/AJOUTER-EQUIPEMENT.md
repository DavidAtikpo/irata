# Guide : Ajouter un Nouveau Type d'Équipement

Ce guide explique comment ajouter facilement un nouveau type d'équipement au système d'inspection.

## Architecture

Le système utilise une architecture **dynamique et configurable** :

```
📁 config/
  └── equipment-types.ts    ← Configuration de tous les types d'équipements

📁 app/(admin)/admin/equipment-detailed-inspections/
  └── create/
      └── page.tsx          ← Page unique pour créer N'IMPORTE QUEL équipement

📁 components/equipment/
  ├── EquipmentIdentification.tsx         ← Section commune (identification)
  └── EquipmentInspectionSections.tsx     ← Sections dynamiques (vie de l'équipement)
```

## ✅ Avantages

- ✅ **1 seule page** pour créer tous les types d'équipements
- ✅ **Section Identification** commune à tous
- ✅ **Sections d'inspection** spécifiques à chaque type
- ✅ Ajout d'un nouveau type = **modifier 1 seul fichier** (equipment-types.ts)
- ✅ Aucune duplication de code

## 📝 Comment ajouter un nouveau type d'équipement ?

### Étape 1 : Ouvrir le fichier de configuration

Ouvrez le fichier : `config/equipment-types.ts`

### Étape 2 : Définir la configuration du nouveau type

```typescript
// Exemple : Ajouter une "Corde"
const cordeConfig: EquipmentConfig = {
  name: 'Corde',
  
  // Définir les valeurs par défaut des données d'inspection
  defaultInspectionData: {
    antecedentProduit: { miseEnService: '', comment: '' },
    observationsPrelables: {
      referenceInterneMarquee: { status: 'V', comment: '' },
      lisibiliteNumeroSerie: { status: 'V', comment: '' },
      dureeVieNonDepassee: { status: 'V', comment: '' },
    },
    // Ajouter VOS sections spécifiques
    etatGaine: {
      usureCoupure: { status: 'V', comment: '' },
      deformationGonflement: { status: 'V', comment: '' },
    },
    etatAme: {
      visibiliteDommage: { status: 'V', comment: '' },
    },
  },
  
  // Définir les sections qui s'afficheront dans le formulaire
  sections: [
    {
      id: 'observationsPrelables',
      title: '2. OBSERVATIONS PREALABLES',
      subsections: [
        { 
          id: 'referenceInterneMarquee', 
          label: 'Référence Interne marquée et lisible', 
          field: 'observationsPrelables.referenceInterneMarquee', 
          defaultStatus: 'V' 
        },
        // ... autres sous-sections
      ],
    },
    {
      id: 'etatGaine',
      title: '3. ETAT DE LA GAINE',
      subsections: [
        { 
          id: 'usureCoupure', 
          label: 'Usure / Coupure / Brûlure', 
          field: 'etatGaine.usureCoupure', 
          defaultStatus: 'V' 
        },
        { 
          id: 'deformationGonflement', 
          label: 'Déformation / Gonflement', 
          field: 'etatGaine.deformationGonflement', 
          defaultStatus: 'V' 
        },
      ],
    },
    {
      id: 'etatAme',
      title: '4. ETAT DE L\'AME',
      subsections: [
        { 
          id: 'visibiliteDommage', 
          label: 'Visibilité de dommage', 
          field: 'etatAme.visibiliteDommage', 
          defaultStatus: 'V' 
        },
      ],
    },
  ],
  
  // Préparer les données pour l'envoi à l'API
  prepareSubmitData: (formData: any) => {
    return {
      ...formData,
      etatGaine: formData.inspectionData.etatGaine,
      etatAme: formData.inspectionData.etatAme,
      antecedentProduit: formData.inspectionData.antecedentProduit,
      observationsPrelables: formData.inspectionData.observationsPrelables,
    };
  },
};
```

### Étape 3 : Ajouter le type à l'export

À la fin du fichier `equipment-types.ts`, ajoutez votre nouveau type :

```typescript
export const equipmentConfig: Record<string, EquipmentConfig> = {
  'Harnais de Suspension': harnaisConfig,
  'Mousqueton Triple Action': mousquetonConfig,
  'Casque': casqueConfig,
  'Corde': cordeConfig,  // ← Ajouter ici
  // Ajoutez tous vos nouveaux types ici
};
```

### Étape 4 : C'est terminé ! 🎉

Votre nouveau type d'équipement est maintenant disponible dans la page de création.

## 🔧 Utilisation

### Créer un équipement

1. Aller sur : `/admin/equipment-detailed-inspections/create`
2. Sélectionner le type d'équipement dans le menu déroulant
3. Remplir la section **Identification** (commune)
4. Remplir la section **Vie de l'équipement** (spécifique au type)
5. Soumettre le formulaire

### Ajouter un bouton de raccourci (optionnel)

Si vous voulez un bouton direct pour un type spécifique, modifiez :
`app/(admin)/admin/equipment-detailed-inspections/page.tsx`

```tsx
<button
  onClick={() => router.push('/admin/equipment-detailed-inspections/create?type=Corde')}
  className="inline-flex items-center px-1.5 py-0.5 border border-transparent rounded text-[10px] font-medium text-white bg-purple-600 hover:bg-purple-700"
>
  <PlusIcon className="h-3 w-3 mr-1" />
  Nouvelle Corde
</button>
```

## 📋 Types d'équipements à ajouter (exemple)

Voici des exemples de types que vous pouvez ajouter :

1. **Corde** (Rope)
2. **Longe** (Lanyard)
3. **Ancrage** (Anchor)
4. **Descendeur** (Descender)
5. **Bloqueur** (Ascender)
6. **Poulie** (Pulley)
7. **Absorbeur d'énergie** (Energy Absorber)
8. **Sac de transport** (Transport Bag)
9. **Gants** (Gloves)
10. **Protège-corde** (Rope Protector)
11. **Trépied** (Tripod)
12. **Potence** (Davit Arm)

## 🔍 Structure des sections d'inspection

Chaque type d'équipement peut avoir ses propres sections. Structure typique :

```
1. ANTECEDENT DU PRODUIT (automatique)
2. OBSERVATIONS PREALABLES (recommandé pour tous)
3. [Section spécifique 1] - Ex: ETAT DE LA GAINE
4. [Section spécifique 2] - Ex: ETAT DE L'AME
5. [Section spécifique 3] - Ex: EXTREMITES
...
```

Chaque section contient des **sous-sections** avec :
- **Label** : Le texte affiché
- **Status** : V (Valide), NA (Non Applicable), X (Invalide)
- **Comment** : Commentaire optionnel

## 📊 Mise à jour du schéma Prisma (si nécessaire)

Si votre nouveau type nécessite des champs spéciaux dans la base de données, ajoutez-les au modèle Prisma :

```prisma
model EquipmentDetailedInspection {
  // ... champs existants
  
  // Nouveau type : Corde
  etatGaine Json?
  etatAme Json?
}
```

Puis exécutez :
```bash
npx prisma db push
```

## ✅ Avantages de cette approche

1. **Maintenabilité** : Un seul fichier à modifier
2. **Évolutivité** : Ajout facile de nouveaux types
3. **Cohérence** : Toutes les inspections suivent le même format
4. **Réutilisabilité** : Section Identification commune
5. **Flexibilité** : Chaque type a ses sections spécifiques

## 🆘 Support

Pour toute question, consultez :
- `config/equipment-types.ts` - Voir les exemples existants
- `components/equipment/` - Composants réutilisables
- `app/(admin)/admin/equipment-detailed-inspections/create/page.tsx` - Page dynamique

