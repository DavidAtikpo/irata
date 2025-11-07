# 🎬 Démonstration : Créer un Template "Corde"

Ce guide vous montre **étape par étape** comment créer votre premier template pour une "Corde".

## 🎯 Objectif

Créer un template "Corde" avec 5 sections :
1. ANTECEDENT DU PRODUIT
2. OBSERVATIONS PREALABLES (3 points)
3. ETAT DE LA GAINE (3 points avec mots barrables)
4. ETAT DE L'AME (1 point)
5. EXTREMITES (2 points)

## 📝 Étapes Détaillées

### Étape 1 : Ouvrir la page de création

1. Allez sur : `http://localhost:3000/admin/equipment-templates`
2. Cliquez sur **"Nouveau Template"**

### Étape 2 : Informations de base

Remplissez :
- **Nom** : `Corde`
- **Description** : `Inspection des cordes d'escalade et de travail en hauteur`

### Étape 3 : Section 1 (automatique)

La section "1. ANTECEDENT DU PRODUIT" est automatique, pas besoin de l'ajouter.

### Étape 4 : Section 2 - OBSERVATIONS PREALABLES

1. Cliquez sur **"Ajouter une section"**
2. Titre : `2. OBSERVATIONS PREALABLES`
3. Cliquez sur **"Ajouter un point d'inspection"**

#### Point 1
- **Texte** : `Référence Interne marquée et lisible`
- **☑️ Status** : Coché
- **☑️ Commentaire** : Coché
- **Mots barrables** : _(vide)_

#### Point 2
- **Texte** : `Numéro de série lisible, ainsi que la norme`
- **☑️ Status** : Coché
- **☑️ Commentaire** : Coché
- **Mots barrables** : _(vide)_

#### Point 3
- **Texte** : `Durée de vie n'est pas dépassée`
- **☑️ Status** : Coché
- **☑️ Commentaire** : Coché
- **Mots barrables** : _(vide)_

### Étape 5 : Section 3 - ETAT DE LA GAINE

1. Cliquez sur **"Ajouter une section"**
2. Titre : `3. ETAT DE LA GAINE`
3. Ajoutez 3 points :

#### Point 1
- **Texte** : `Usure / Coupure / Brûlure`
- **☑️ Status** : Coché
- **☑️ Commentaire** : Coché
- **Mots barrables** : `Usure, Coupure, Brûlure`

#### Point 2
- **Texte** : `Déformation / Gonflement`
- **☑️ Status** : Coché
- **☑️ Commentaire** : Coché
- **Mots barrables** : `Déformation, Gonflement`

#### Point 3
- **Texte** : `Traces de produits chimiques / Traces de peinture`
- **☑️ Status** : Coché
- **☑️ Commentaire** : Coché
- **Mots barrables** : `produits chimiques, peinture`

### Étape 6 : Section 4 - ETAT DE L'AME

1. Cliquez sur **"Ajouter une section"**
2. Titre : `4. ETAT DE L'AME (Vérifier en ouvrant la gaine)`

#### Point 1
- **Texte** : `Visibilité de dommage / Rupture de torons`
- **☑️ Status** : Coché
- **☑️ Commentaire** : Coché
- **Mots barrables** : `dommage, Rupture`

### Étape 7 : Section 5 - EXTREMITES

1. Cliquez sur **"Ajouter une section"**
2. Titre : `5. EXTREMITES`

#### Point 1
- **Texte** : `État des épissures / État des coutures`
- **☑️ Status** : Coché
- **☑️ Commentaire** : Coché
- **Mots barrables** : `épissures, coutures`

#### Point 2
- **Texte** : `Présence de tous les éléments de terminaison`
- **☑️ Status** : Coché
- **☑️ Commentaire** : Coché
- **Mots barrables** : _(vide)_

### Étape 8 : Enregistrer

1. Vérifiez l'aperçu en bas de page
2. Cliquez sur **"Enregistrer le template"**

## ✅ Résultat

Vous avez maintenant un template "Corde" avec :
- **5 sections**
- **10 points d'inspection**
- **Mots barrables** configurés
- **Status et commentaires** activés

## 🎯 Utilisation

Pour créer une inspection de corde :
1. Allez sur `/admin/equipment-detailed-inspections/create`
2. Sélectionnez **"Corde"** dans le menu déroulant
3. Les 5 sections s'affichent automatiquement !
4. Remplissez l'inspection

## 📊 Structure Finale

```
CORDE
├── 1. ANTECEDENT DU PRODUIT (automatique)
├── 2. OBSERVATIONS PREALABLES
│   ├── Référence Interne marquée et lisible [V/NA/X + Comment]
│   ├── Numéro de série lisible [V/NA/X + Comment]
│   └── Durée de vie n'est pas dépassée [V/NA/X + Comment]
├── 3. ETAT DE LA GAINE
│   ├── Usure / Coupure / Brûlure [V/NA/X + Comment] 🖊️
│   ├── Déformation / Gonflement [V/NA/X + Comment] 🖊️
│   └── Traces de produits chimiques [V/NA/X + Comment] 🖊️
├── 4. ETAT DE L'AME
│   └── Visibilité de dommage [V/NA/X + Comment] 🖊️
└── 5. EXTREMITES
    ├── État des épissures / coutures [V/NA/X + Comment] 🖊️
    └── Présence de tous les éléments [V/NA/X + Comment]
```

🖊️ = Mots cliquables pour barrer

## 🚀 Créer d'autres templates

Répétez le même processus pour :
- **Longe** (4 sections)
- **Ancrage** (3 sections)
- **Descendeur** (5 sections)
- **Poulie** (3 sections)
- ... et tous vos autres équipements !

---

**Temps de création d'un template : 5-10 minutes** ⏱️

**Temps économisé vs coder une page : ~2 heures** 🎉

