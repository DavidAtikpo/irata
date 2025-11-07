# 🆕 Nouvelle Méthode : Page Dynamique pour Créer des Équipements

## 🎯 Le Problème

Avant :
- ❌ Une page séparée pour chaque type d'équipement (harnais, mousqueton, casque...)
- ❌ Code dupliqué partout
- ❌ Pour ajouter un nouveau type = créer une nouvelle page complète
- ❌ **Difficulté d'ajout** pour 12+ nouveaux types d'équipements

## ✅ La Solution

Maintenant :
- ✅ **UNE SEULE PAGE** pour créer tous les types d'équipements
- ✅ Section "Identification équipement" **commune à tous**
- ✅ Section "Vie de l'équipement" **dynamique selon le type**
- ✅ Pour ajouter un nouveau type = **modifier 1 seul fichier de configuration**

## 📁 Structure

```
config/
└── equipment-types.ts          ← Ajouter vos types ici (1 seul fichier!)

app/(admin)/admin/equipment-detailed-inspections/
└── create/
    └── page.tsx                ← Page unique pour TOUS les types

components/equipment/
├── EquipmentIdentification.tsx          ← Identification (commune)
└── EquipmentInspectionSections.tsx      ← Vie de l'équipement (dynamique)
```

## 🚀 Comment ça marche ?

### 1. Tester la nouvelle page

Cliquez sur le bouton **"🆕 Créer Équipement (Dynamique)"** dans la liste des inspections.

### 2. Sélectionner un type d'équipement

Dans le formulaire, vous verrez un menu déroulant avec tous les types disponibles :
- Harnais de Suspension
- Mousqueton Triple Action
- Casque

**Quand vous changez le type, les sections d'inspection s'adaptent automatiquement !**

### 3. Remplir le formulaire

**Section 1 : Identification équipement** (identique pour tous)
- Référence interne
- N° de série
- Date de fabrication
- Date d'achat
- etc.

**Section 2 : Vie de l'équipement** (change selon le type)
- Harnais → Sangles, Points d'attache, Boucles, etc.
- Mousqueton → Vérification Corps, Doigt, Bague
- Casque → Calotte, Calotin, Coiffe, Jugulaire, etc.

## ➕ Ajouter un nouveau type d'équipement

### Exemple : Ajouter une "Corde"

**Étape 1 :** Ouvrir `config/equipment-types.ts`

**Étape 2 :** Copier un exemple existant et le modifier :

```typescript
const cordeConfig: EquipmentConfig = {
  name: 'Corde',
  defaultInspectionData: {
    antecedentProduit: { miseEnService: '', comment: '' },
    observationsPrelables: {
      referenceInterneMarquee: { status: 'V', comment: '' },
      lisibiliteNumeroSerie: { status: 'V', comment: '' },
      dureeVieNonDepassee: { status: 'V', comment: '' },
    },
    // Sections spécifiques à la corde
    etatGaine: {
      usureCoupure: { status: 'V', comment: '' },
      deformationGonflement: { status: 'V', comment: '' },
    },
    etatAme: {
      visibiliteDommage: { status: 'V', comment: '' },
    },
  },
  sections: [
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
      ],
    },
  ],
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

**Étape 3 :** Ajouter à l'export :

```typescript
export const equipmentConfig: Record<string, EquipmentConfig> = {
  'Harnais de Suspension': harnaisConfig,
  'Mousqueton Triple Action': mousquetonConfig,
  'Casque': casqueConfig,
  'Corde': cordeConfig,  // ← Ajouter ici !
};
```

**Étape 4 :** Terminé ! La "Corde" apparaît maintenant dans le menu déroulant.

## 📊 Comparaison

### Ancienne méthode
```
12 nouveaux types = 12 nouvelles pages = 12 fois le même code
→ ~24,000 lignes de code dupliqué
```

### Nouvelle méthode
```
12 nouveaux types = 12 configurations dans 1 seul fichier
→ ~2,000 lignes de code
```

**Économie de ~22,000 lignes de code !**

## 🔧 Migration progressive

Pour le moment, **les deux méthodes coexistent** :

- **Nouvelle méthode** : Bouton "🆕 Créer Équipement (Dynamique)"
- **Ancienne méthode** : Boutons "Harnais (ancienne)", "Mousqueton (ancienne)", etc.

Vous pouvez :
1. Tester la nouvelle page
2. Comparer avec les anciennes
3. Une fois satisfait, on pourra supprimer les anciennes pages

## 📚 Documentation complète

Pour plus de détails, consultez :
- `docs/AJOUTER-EQUIPEMENT.md` - Guide complet étape par étape
- `config/equipment-types.ts` - Voir les exemples existants

## 🎨 Avantages

1. **Gain de temps énorme** pour ajouter 12+ types
2. **Code maintenable** : 1 seul fichier à modifier
3. **Cohérence garantie** : toutes les inspections suivent le même format
4. **Flexibilité** : chaque type garde ses sections spécifiques
5. **Évolutivité** : facile d'ajouter de nouveaux types à l'avenir

## 💡 Utilisation recommandée

1. **Utilisez la nouvelle page** pour créer vos prochaines inspections
2. **Ajoutez vos 12+ nouveaux types** dans `equipment-types.ts`
3. **Testez** et comparez avec les anciennes pages
4. Une fois validé, on pourra **supprimer les anciennes pages**

---

**Questions ?** Consultez le guide complet : `docs/AJOUTER-EQUIPEMENT.md`

