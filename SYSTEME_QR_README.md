# Système QR Code - Documentation Complète

## 📋 Vue d'ensemble

Ce document décrit les deux systèmes QR code implémentés dans l'application CI.DES :

1. **Système de Diplômes** - Pour gérer et distribuer les diplômes IRATA
2. **Système d'Inspection d'Équipement** - Pour automatiser le remplissage des formulaires d'inspection

---

## 🎓 Système 1 : Gestion des Diplômes

### Fonctionnalités

- L'admin génère un diplôme pour un stagiaire
- Un code QR unique est créé automatiquement
- Le stagiaire reçoit un email avec le lien vers son diplôme
- Le diplôme est accessible via QR code (scan mobile)
- Téléchargement du PDF du diplôme
- Vérification d'authenticité

### APIs Créées

#### 1. `POST /api/admin/diplomes/generate`
Génère un nouveau diplôme avec QR code unique.

**Body:**
```json
{
  "stagiaireId": "string",
  "nom": "string",
  "prenom": "string",
  "formation": "string",
  "session": "string",
  "dateObtention": "2025-01-15",
  "photoUrl": "string (optional)",
  "pdfUrl": "string (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Diplôme généré avec succès",
  "diplome": {
    "id": "...",
    "qrCode": "...",
    "url": "https://www.a-finpart.com/diplome/abc123xyz"
  }
}
```

#### 2. `GET /api/diplomes/[code]`
Récupère un diplôme par son code QR (page publique).

**URL:** `/api/diplomes/abc123xyz`

**Response:**
```json
{
  "id": "...",
  "qrCode": "abc123xyz",
  "nom": "Dupont",
  "prenom": "Jean",
  "formation": "IRATA Niveau 1",
  "session": "10. 2025 / octobre: du 06 au 10",
  "dateObtention": "2025-10-11",
  "photoUrl": "...",
  "pdfUrl": "...",
  "stagiaire": {...},
  "generePar": {...}
}
```

#### 3. `GET /api/admin/diplomes`
Liste tous les diplômes générés (réservé admin).

#### 4. `POST /api/admin/diplomes/send-email`
Envoie un email au stagiaire avec le QR code.

**Body:**
```json
{
  "diplomeId": "string"
}
```

### Pages Créées

#### `/diplome/[code]` - Page publique d'affichage
- Interface élégante avec badge de vérification
- Photo du stagiaire
- Toutes les informations du diplôme
- Bouton de téléchargement PDF
- Code de vérification

---

## 🔧 Système 2 : Inspection d'Équipement

### Fonctionnalités

- Upload d'un PDF de déclaration UE ou notice d'équipement
- Extraction automatique des données (OCR Cloudinary)
- Génération d'un QR code unique
- Stockage en base de données
- Page publique pour consulter les infos et télécharger le PDF
- **Pré-remplissage automatique** du formulaire d'inspection

### APIs Créées

#### 1. `POST /api/qr-generator` (Modifié)
Analyse un PDF/image, extrait les données, génère un QR code et stocke en DB.

**Body (FormData):**
- `file`: PDF ou image
- `type`: "pdf" ou "image"

**Response:**
```json
{
  "url": "https://cloudinary.com/...",
  "extractedData": {
    "produit": "Casque VERTEX",
    "reference": "A010AA01",
    "numeroSerie": "12345",
    "normes": "EN 397, EN 12492",
    "fabricant": "PETZL",
    "dateControle": "15/01/2025",
    "signataire": "Jean Dupont",
    "qrCode": "xyz789abc456",
    "equipmentUrl": "https://www.a-finpart.com/equipment/xyz789abc456",
    "equipmentId": "..."
  },
  "message": "Fichier analysé et QR code généré avec succès"
}
```

#### 2. `GET /api/equipment/[code]`
Récupère les données d'un équipement par son code QR (page publique).

**URL:** `/api/equipment/xyz789abc456`

**Response:**
```json
{
  "id": "...",
  "qrCode": "xyz789abc456",
  "produit": "Casque VERTEX",
  "referenceInterne": "A010AA01-12345",
  "numeroSerie": "12345",
  "normes": "EN 397, EN 12492",
  "fabricant": "PETZL",
  "dateControle": "15/01/2025",
  "signataire": "Jean Dupont",
  "pdfUrl": "https://cloudinary.com/...",
  "cloudinaryPublicId": "...",
  "createdBy": {...},
  "createdAt": "..."
}
```

### Pages Créées

#### `/equipment/[code]` - Page publique de consultation
- Affiche toutes les données de l'équipement
- Badge de vérification
- Bouton pour télécharger le PDF original
- **Bouton "Remplir formulaire d'inspection"** qui redirige vers le formulaire avec pré-remplissage automatique

#### `/admin/equipment-detailed-inspections/nouveau` (Modifié)
- Détecte les paramètres URL `?qrCode=xyz789&prefill=true`
- Charge automatiquement les données de l'équipement depuis l'API
- Pré-remplit les champs du formulaire
- Affiche un message de confirmation

---

## 🗄️ Modèles de Base de Données (Prisma)

### Modèle `Diplome`
```prisma
model Diplome {
  id              String   @id @default(cuid())
  qrCode          String   @unique
  stagiaireId     String
  stagiaire       User     @relation("DiplomasStagiaire", fields: [stagiaireId], references: [id])
  
  nom             String
  prenom          String
  formation       String
  session         String
  dateObtention   DateTime
  photoUrl        String?
  pdfUrl          String?
  
  genereParId     String
  generePar       User     @relation("DiplomasGeneratedBy", fields: [genereParId], references: [id])
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@schema("webirata")
}
```

### Modèle `EquipmentQR`
```prisma
model EquipmentQR {
  id                  String   @id @default(cuid())
  qrCode              String   @unique
  
  produit             String?
  referenceInterne    String?
  numeroSerie         String?
  normes              String?
  fabricant           String?
  dateControle        String?
  signataire          String?
  
  pdfUrl              String
  cloudinaryPublicId  String
  
  createdById         String
  createdBy           User     @relation("EquipmentQRCreatedBy", fields: [createdById], references: [id])
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
  
  @@schema("webirata")
}
```

---

## 🚀 Étapes pour Activer les Systèmes

### ⚠️ IMPORTANT : Migration Prisma Requise

Avant d'utiliser les systèmes, vous devez exécuter la migration Prisma :

```bash
cd irata
npx prisma migrate dev --name add_diplome_and_equipment_qr_models
```

Cette commande va :
1. Créer les tables `Diplome` et `EquipmentQR` dans la base de données
2. Ajouter les relations dans la table `User`
3. Créer les index et contraintes uniques

---

## 📱 Workflow Complet - Inspection d'Équipement

### Étape 1 : Générer le QR Code
1. L'admin va sur `/qr-generator`
2. Upload le PDF de déclaration UE ou la notice de l'équipement
3. Le système extrait automatiquement les données (OCR)
4. Un QR code unique est généré et affiché
5. Les données sont stockées en base de données

### Étape 2 : Scan du QR Code
1. Le technicien scanne le QR code avec son téléphone
2. Il est redirigé vers `/equipment/[code]`
3. Il voit toutes les informations de l'équipement
4. Il peut télécharger le PDF original
5. Il clique sur **"Remplir formulaire d'inspection"**

### Étape 3 : Remplissage Automatique
1. Le technicien est redirigé vers `/admin/equipment-detailed-inspections/nouveau?qrCode=xyz&prefill=true`
2. Le formulaire charge automatiquement les données depuis l'API
3. Les champs suivants sont pré-remplis :
   - Référence interne
   - Numéro de série
   - Normes et certificat
   - Fabricant
   - Date de contrôle
   - Signataire
   - URL du PDF
4. Un message de confirmation s'affiche en haut du formulaire
5. Le technicien complète le reste du formulaire et soumet

---

## 📧 Email pour les Diplômes

L'email envoyé aux stagiaires contient :
- Un message de félicitations personnalisé
- Les informations du diplôme (formation, session)
- Le code de vérification QR
- Un lien direct vers le diplôme en ligne
- Instructions pour télécharger le PDF
- Design professionnel et responsive

---

## ✅ Checklist d'Implémentation

### Système de Diplômes
- [x] Modèle Prisma `Diplome`
- [x] API de génération `/api/admin/diplomes/generate`
- [x] API de récupération `/api/diplomes/[code]`
- [x] API de liste `/api/admin/diplomes`
- [x] API d'envoi email `/api/admin/diplomes/send-email`
- [x] Page publique `/diplome/[code]`
- [x] Fonction email `sendDiplomeEmail`
- [ ] Page admin de gestion `/admin/stagiaires`
- [ ] Migration Prisma exécutée

### Système d'Inspection d'Équipement
- [x] Modèle Prisma `EquipmentQR`
- [x] Modification de l'API `/api/qr-generator`
- [x] API de récupération `/api/equipment/[code]`
- [x] Page publique `/equipment/[code]`
- [x] Pré-remplissage dans `/admin/equipment-detailed-inspections/nouveau`
- [x] Messages de confirmation et loading
- [ ] Migration Prisma exécutée

---

## 🔒 Sécurité et Authentification

- **Diplômes** : Pages publiques accessibles via QR code sans authentification
- **Inspection** : Pages publiques mais le formulaire d'inspection nécessite un login admin
- **Génération** : Toutes les APIs de génération sont protégées (admin uniquement)
- **Codes QR uniques** : Utilisation de `nanoid(12)` pour générer des codes sécurisés (12 caractères)

---

## 📞 Support

Pour toute question ou problème, consultez :
- Les logs de la console pour le debugging
- Les APIs retournent des messages d'erreur détaillés
- Le code est bien commenté et documenté

---

**Auteur** : Système CI.DES  
**Date** : Octobre 2025  
**Version** : 1.0

