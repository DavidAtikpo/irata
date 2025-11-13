# Debug : PDF Cloudinary non accessible

## 🔍 Diagnostic du problème

Le PDF est uploadé sur Cloudinary mais n'est pas accessible. Voici les étapes de diagnostic :

### 1. Vérifier le type de ressource sur Cloudinary

Allez sur votre dashboard Cloudinary et vérifiez :
- Le fichier `qr-generator/pdf_1761235265179` existe-t-il ?
- Quel est son **Resource Type** ? (Raw, Image, Video, Auto)
- Est-il marqué comme **Public** ou **Authenticated** ?

### 2. Tester l'URL directe

Essayez ces URLs dans votre navigateur :

**Option 1 : Raw**
```
https://res.cloudinary.com/dubonservice/raw/upload/qr-generator/pdf_1761235265179.pdf
```

**Option 2 : Image (si traité comme image)**
```
https://res.cloudinary.com/dubonservice/image/upload/qr-generator/pdf_1761235265179.pdf
```

**Option 3 : Sans extension**
```
https://res.cloudinary.com/dubonservice/raw/upload/qr-generator/pdf_1761235265179
```

### 3. Vérifier les paramètres Cloudinary

Dans votre dashboard Cloudinary :
1. **Settings** → **Security**
2. Vérifiez que **"Strict transformations"** est **désactivé**
3. Vérifiez que **"Resource access control"** est sur **"Public"**

### 4. Problèmes courants

#### A. PDF uploadé comme "auto" au lieu de "raw"
**Solution** : Les nouveaux uploads utilisent maintenant `resource_type: 'raw'`

#### B. Fichier privé
**Solution** : On utilise maintenant `access_mode: 'public'`

#### C. Extension manquante
**Solution** : Cloudinary peut nécessiter `.pdf` dans l'URL

#### D. Signature requise
**Solution** : On utilise `sign_url: false`

### 5. Solution alternative : Utiliser signed URLs

Si le problème persiste, on peut générer des URLs signées :

```typescript
const cloudinary = require('cloudinary').v2;

const signedUrl = cloudinary.url('qr-generator/pdf_xxx', {
  resource_type: 'raw',
  type: 'upload',
  secure: true,
  sign_url: true, // ✅ Signer l'URL
});
```

### 6. Vérifier les logs Vercel

Après avoir uploadé un nouveau PDF, vérifiez les logs Vercel pour voir :
- Le `resource_type` utilisé
- Le `secure_url` retourné
- Le `public_id` exact

## 🔧 Actions à faire maintenant

1. **Uploadez un NOUVEAU PDF** après le dernier déploiement
2. **Copiez l'URL** retournée dans "Données extraites"
3. **Testez l'URL** dans votre navigateur
4. **Partagez-moi** :
   - L'URL complète retournée
   - Le message d'erreur exact (401, 404, etc.)
   - Une capture d'écran du fichier sur Cloudinary

## 📋 Checklist de vérification

- [ ] Le fichier existe sur Cloudinary dashboard
- [ ] Le fichier est marqué comme "Public"
- [ ] Resource type = "raw" (pour les nouveaux uploads)
- [ ] L'URL contient `/raw/upload/` (pas `/image/upload/`)
- [ ] L'extension `.pdf` est présente dans l'URL
- [ ] Aucune signature n'est requise
- [ ] "Strict transformations" est désactivé

## 🆘 Si rien ne fonctionne

Dernière solution : Stocker les PDFs ailleurs
- AWS S3
- Vercel Blob Storage
- Autre service de stockage cloud


















