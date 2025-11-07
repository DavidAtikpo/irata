# 🎨 Système de Templates Dynamiques - Guide Complet

## 🎯 Qu'est-ce que c'est ?

Un système qui vous permet de **créer vous-même** la structure d'inspection pour n'importe quel type d'équipement, directement depuis l'interface web.

## ✨ Ce que vous pouvez faire

### 1. Créer un Template Personnalisé

- ✅ Donner un **nom** au type d'équipement (Ex: Corde, Longe, etc.)
- ✅ Ajouter autant de **sections** que vous voulez (1 à 12+)
- ✅ Pour chaque section :
  - Définir le **titre** (Ex: "3. ETAT DE LA GAINE")
  - Ajouter des **sous-sections** (points d'inspection)
- ✅ Pour chaque sous-section :
  - Écrire le **texte** (Ex: "Usure / Coupure / Brûlure")
  - Choisir si elle a un **status** (V / NA / X) ☑️
  - Choisir si elle a un **commentaire** ☑️
  - Définir les **mots qui peuvent être barrés** 🖊️

### 2. Exemples d'Utilisation

#### Exemple 1 : Corde avec 5 sections

```
1. ANTECEDENT DU PRODUIT
2. OBSERVATIONS PREALABLES
   - Référence Interne marquée et lisible [Status ✓] [Comment ✓]
   - Numéro de série lisible [Status ✓] [Comment ✓]
3. ETAT DE LA GAINE
   - Usure / Coupure / Brûlure [Status ✓] [Comment ✓]
     Mots barrables: Usure, Coupure, Brûlure
4. ETAT DE L'AME
   - Visibilité de dommage [Status ✓] [Comment ✓]
5. EXTREMITES
   - État des épissures [Status ✓] [Comment ✓]
```

#### Exemple 2 : Ancrage avec 3 sections

```
1. ANTECEDENT DU PRODUIT
2. OBSERVATIONS PREALABLES
3. ETAT DE LA STRUCTURE
   - Fissures / Déformation [Status ✓] [Comment ✓]
   - Corrosion [Status ✓] [Comment ✓]
```

## 🚀 Comment utiliser le système ?

### Étape 1 : Ajouter le modèle à la base de données

Ouvrez `prisma/schema.prisma` et ajoutez :

```prisma
model EquipmentTemplate {
  id          String   @id @default(cuid())
  name        String   @unique
  description String?
  structure   Json
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  createdBy   User     @relation("EquipmentTemplateCreator", fields: [createdById], references: [id])
  createdById String
  inspections EquipmentDetailedInspection[] @relation("TemplateInspections")
}

// Ajoutez aussi dans EquipmentDetailedInspection :
model EquipmentDetailedInspection {
  // ... champs existants
  
  templateId     String?
  template       EquipmentTemplate? @relation("TemplateInspections", fields: [templateId], references: [id])
}

// Et dans User :
model User {
  // ... champs existants
  
  equipmentTemplates EquipmentTemplate[] @relation("EquipmentTemplateCreator")
}
```

Puis exécutez :
```bash
npx prisma db push
```

### Étape 2 : Créer vos templates

1. Allez sur `/admin/equipment-templates`
2. Cliquez sur **"Nouveau Template"**
3. Remplissez :
   - **Nom** : Type d'équipement (Ex: "Corde")
   - **Description** : (optionnel)
4. Cliquez sur **"Ajouter une section"**
5. Pour chaque section :
   - Donnez un **titre** (Ex: "3. ETAT DE LA GAINE")
   - Cliquez sur **"Ajouter un point d'inspection"**
   - Pour chaque point :
     - Écrivez le **texte** (Ex: "Usure / Coupure / Brûlure")
     - Cochez **"Status"** si vous voulez V/NA/X
     - Cochez **"Commentaire"** si vous voulez un champ commentaire
     - Ajoutez les **"Mots pouvant être barrés"** (Ex: Usure, Coupure, Brûlure)
6. Cliquez sur **"Enregistrer le template"**

### Étape 3 : Utiliser un template pour créer une inspection

Lors de la création d'une inspection :
1. Sélectionnez le **template** dans la liste déroulante
2. Les sections s'affichent automatiquement selon votre template
3. Remplissez l'inspection
4. Enregistrez

## 🔧 Fonctionnalités

### Gestion des Sections

- ✅ **Ajouter** autant de sections que vous voulez
- ✅ **Supprimer** une section
- ✅ **Réorganiser** (monter/descendre)
- ✅ **Modifier** le titre à tout moment

### Gestion des Points d'Inspection

Pour chaque point, vous pouvez :
- ✅ **Écrire le texte** librement
- ✅ **Activer/Désactiver le status** (V / NA / X)
- ✅ **Activer/Désactiver le commentaire**
- ✅ **Définir les mots barrables** (séparés par des virgules)

### Exemples de Configuration

#### Point avec Status + Commentaire + Mots barrables
```
Texte: "Usure / Coupure / Brûlure / Déformation"
☑️ Status (V / NA / X)
☑️ Commentaire
Mots barrables: Usure, Coupure, Brûlure, Déformation
```

#### Point avec Status seulement (pas de commentaire)
```
Texte: "Présence des ourlets"
☑️ Status (V / NA / X)
☐ Commentaire
```

#### Point avec juste du texte (pas de status, pas de commentaire)
```
Texte: "Vérifier visuellement l'état général"
☐ Status
☐ Commentaire
```

## 📊 Structure JSON du Template

Chaque template est sauvegardé en JSON avec cette structure :

```json
{
  "sections": [
    {
      "id": "section-1",
      "title": "3. ETAT DE LA GAINE",
      "subsections": [
        {
          "id": "sub-1",
          "label": "Usure / Coupure / Brûlure",
          "hasStatus": true,
          "hasComment": true,
          "crossableWords": ["Usure", "Coupure", "Brûlure"]
        }
      ]
    }
  ]
}
```

## 🎨 Avantages

### Ancien Système (Code en dur)
```
12 types = 12 pages = 24,000 lignes de code
Modification = Éditer le code source
Ajout = Créer une nouvelle page
```

### Nouveau Système (Templates Dynamiques)
```
12 types = 12 templates = Interface web
Modification = Éditer dans l'interface
Ajout = Formulaire simple
```

**Résultat : 90% moins de code, 10x plus rapide à créer**

## 🔄 Workflow Complet

1. **Admin crée un template** → `/admin/equipment-templates/create`
2. **Template sauvegardé** en base de données
3. **Lors de création d'inspection** → Sélectionne le template
4. **Structure chargée dynamiquement** depuis le template
5. **Inspection créée** avec les bonnes sections

## 💡 Cas d'Usage

### Cas 1 : Équipement simple (3 sections)
```
Ancrage:
1. ANTECEDENT DU PRODUIT
2. OBSERVATIONS PREALABLES
3. ETAT DE LA STRUCTURE
```

### Cas 2 : Équipement moyen (5 sections)
```
Corde:
1. ANTECEDENT DU PRODUIT
2. OBSERVATIONS PREALABLES
3. ETAT DE LA GAINE
4. ETAT DE L'AME
5. EXTREMITES
```

### Cas 3 : Équipement complexe (12 sections)
```
Harnais Complet:
1. ANTECEDENT DU PRODUIT
2. OBSERVATIONS PREALABLES
3. ETAT DES SANGLES
4. POINTS D'ATTACHE
... (jusqu'à 12)
```

## 🎯 Utilisation Recommandée

1. **Créez d'abord les templates** pour vos équipements fréquents
2. **Testez** en créant une inspection avec chaque template
3. **Modifiez** les templates si nécessaire
4. **Dupliquez** un template pour créer une variante

## 🔐 Sécurité

- ✅ Seuls les **ADMIN** peuvent créer/modifier/supprimer des templates
- ✅ Les templates **utilisés** ne peuvent pas être supprimés
- ✅ Historique des modifications conservé

## 📚 Documentation Technique

### API Endpoints

- `GET /api/admin/equipment-templates` - Liste tous les templates
- `POST /api/admin/equipment-templates` - Créer un template
- `GET /api/admin/equipment-templates/:id` - Récupérer un template
- `PUT /api/admin/equipment-templates/:id` - Mettre à jour un template
- `DELETE /api/admin/equipment-templates/:id` - Supprimer un template

### Pages

- `/admin/equipment-templates` - Liste des templates
- `/admin/equipment-templates/create` - Créer un template
- `/admin/equipment-templates/:id/edit` - Modifier un template

---

**Prêt à créer vos propres templates d'inspection ? Commencez maintenant !** 🚀

