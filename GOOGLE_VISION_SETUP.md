# 🚀 Configuration Google Cloud Vision OCR (GRATUIT)

## ✅ Avantages

- **1000 requêtes gratuites par mois** (suffisant pour la plupart des usages)
- ✅ OCR très précis (meilleur que Tesseract)
- ✅ Supporte les PDFs scannés et les images
- ✅ Compatible avec Vercel
- ✅ Pas de dépendances binaires
- ✅ Multi-langue (40+ langues)

## 📋 Étapes de configuration

### 1. Créer un projet Google Cloud

1. Allez sur https://console.cloud.google.com/
2. Cliquez sur "Créer un projet" ou sélectionnez un projet existant
3. Notez le **Project ID** (ex: `mon-projet-ocr`)

### 2. Activer l'API Vision

1. Dans le menu, allez sur **APIs & Services** > **Library**
2. Recherchez "Cloud Vision API"
3. Cliquez sur "ENABLE" (Activer)
4. ✅ L'API est maintenant active !

### 3. Créer une clé de service (Service Account)

1. Allez sur **APIs & Services** > **Credentials**
2. Cliquez sur **Create Credentials** > **Service Account**
3. Remplissez les informations :
   - **Name**: `ocr-service-account`
   - **Role**: `Cloud Vision AI Service Agent` ou `Owner`
4. Cliquez sur **Done**

### 4. Générer la clé JSON

1. Dans la liste des Service Accounts, cliquez sur le compte que vous venez de créer
2. Allez dans l'onglet **Keys**
3. Cliquez sur **Add Key** > **Create new key**
4. Sélectionnez **JSON**
5. Téléchargez le fichier JSON (ex: `mon-projet-ocr-abc123.json`)
6. ⚠️ **NE PARTAGEZ JAMAIS CE FICHIER** (contient des credentials sensibles)

### 5. Configurer les variables d'environnement

#### Option A : Pour Vercel (Production)

1. Allez sur https://vercel.com/dashboard
2. Sélectionnez votre projet
3. Allez dans **Settings** > **Environment Variables**
4. Ajoutez la variable :
   - **Name**: `GOOGLE_CLOUD_CREDENTIALS`
   - **Value**: Copiez **tout le contenu** du fichier JSON téléchargé
   - **Environments**: Production, Preview, Development
5. Cliquez sur **Save**
6. **Redéployez** votre application pour que les changements prennent effet

#### Option B : Pour développement local

Créez un fichier `.env.local` à la racine du projet :

```env
# Google Cloud Vision OCR
GOOGLE_CLOUD_CREDENTIALS='{"type":"service_account","project_id":"mon-projet-ocr","private_key_id":"abc123...","private_key":"-----BEGIN PRIVATE KEY-----\n...","client_email":"ocr-service-account@mon-projet-ocr.iam.gserviceaccount.com","client_id":"123456789","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"..."}'
```

⚠️ **Important** : Le JSON doit être sur **une seule ligne** et entouré de guillemets simples.

Ou utilisez le chemin vers le fichier :

```env
GOOGLE_APPLICATION_CREDENTIALS=./google-cloud-credentials.json
```

### 6. Vérifier la configuration

Créez un script de test :

```javascript
// test-google-vision.js
const vision = require('@google-cloud/vision');
const fs = require('fs');

async function test() {
  try {
    const credentials = JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS);
    const client = new vision.ImageAnnotatorClient({ credentials });
    
    // Tester avec un PDF
    const pdfPath = 'public/uploads/qr_pdf_1761176497922.pdf';
    const buffer = fs.readFileSync(pdfPath);
    
    const [result] = await client.textDetection({ image: { content: buffer } });
    const text = result.textAnnotations?.[0]?.description || '';
    
    console.log('✅ Google Vision fonctionne !');
    console.log('Texte extrait:', text.substring(0, 500));
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

test();
```

Exécutez :
```bash
node test-google-vision.js
```

## 💰 Tarification

### Plan gratuit
- ✅ **1,000 requêtes/mois** (Text Detection)
- Parfait pour les petits sites et tests

### Au-delà du gratuit
- **$1.50** pour 1,000 requêtes supplémentaires (1-5M)
- **$0.60** pour 1,000 requêtes (5M+)

### Exemple de coût
- 100 PDFs/jour × 30 jours = 3,000 requêtes/mois
- **1,000 gratuites** + 2,000 payantes = **$3/mois** 💰

👉 Beaucoup moins cher que Cloudinary OCR ($89/mois) !

## 🔒 Sécurité

### ⚠️ Bonnes pratiques

1. **NE JAMAIS** committer le fichier JSON dans Git
2. Ajoutez-le au `.gitignore` :
   ```
   google-cloud-credentials.json
   *.json
   ```
3. Utilisez des variables d'environnement
4. Limitez les permissions du Service Account
5. Activez la rotation des clés régulièrement

### Permissions minimales recommandées

Pour le Service Account, utilisez le rôle :
- `Cloud Vision AI Service Agent` (minimum requis)

Au lieu de :
- ❌ `Owner` ou `Editor` (trop de permissions)

## 📊 Monitoring

### Voir l'utilisation

1. Allez sur https://console.cloud.google.com/
2. **APIs & Services** > **Dashboard**
3. Sélectionnez **Cloud Vision API**
4. Consultez les métriques :
   - Nombre de requêtes
   - Latence
   - Erreurs

### Configurer des alertes

1. **APIs & Services** > **Quotas**
2. Sélectionnez Cloud Vision API
3. Configurez des alertes à 80% et 100% du quota gratuit

## 🧪 Test de l'intégration

### Test 1 : PDF scanné

```bash
# Devrait maintenant fonctionner avec Google Vision
curl -X POST https://www.a-finpart.com/api/qr-generator \
  -F "file=@certificat_scanne.pdf" \
  -F "type=pdf"
```

### Test 2 : Image JPG/PNG

```bash
# Devrait fonctionner avec Google Vision
curl -X POST https://www.a-finpart.com/api/qr-generator \
  -F "file=@certificat.jpg" \
  -F "type=image"
```

## 🆘 Résolution des problèmes

### Erreur : "Google Cloud Vision non configuré"

**Cause** : Variable d'environnement manquante

**Solution** :
1. Vérifiez que `GOOGLE_CLOUD_CREDENTIALS` est définie sur Vercel
2. Redéployez l'application après l'ajout de la variable
3. Vérifiez que le JSON est valide (utilisez https://jsonlint.com/)

### Erreur : "PERMISSION_DENIED"

**Cause** : Service Account n'a pas les permissions

**Solution** :
1. Vérifiez que l'API Vision est activée
2. Ajoutez le rôle `Cloud Vision AI Service Agent` au Service Account
3. Attendez 1-2 minutes pour la propagation

### Erreur : "INVALID_ARGUMENT"

**Cause** : Format de fichier non supporté ou trop gros

**Solution** :
1. Vérifiez la taille du fichier (< 10 MB pour le plan gratuit)
2. Supporté : PDF, PNG, JPG, GIF, BMP, WEBP, TIFF
3. Compressez le fichier si nécessaire

## 📖 Documentation officielle

- https://cloud.google.com/vision/docs/ocr
- https://cloud.google.com/vision/docs/pdf
- https://cloud.google.com/vision/pricing

## ✨ Prochaines étapes

1. ✅ Configurer Google Cloud Vision
2. ✅ Ajouter la variable d'environnement sur Vercel
3. ✅ Redéployer l'application
4. ✅ Tester avec votre PDF scanné
5. 🎉 Profiter de l'OCR gratuit !

---

**Note** : Une fois configuré, le système utilisera automatiquement Google Vision pour les PDFs scannés, avec un fallback vers Cloudinary OCR si disponible.















