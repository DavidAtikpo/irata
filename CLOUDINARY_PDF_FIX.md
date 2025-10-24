# Fix Cloudinary PDF Access (Error 401)

## 🐛 Problème

Lorsqu'on essaie d'accéder à un PDF uploadé sur Cloudinary, on obtient une erreur **HTTP 401 (Unauthorized)**.

### Exemple d'erreur
```
https://res.cloudinary.com/dubonservice/image/upload/v1761225789/qr-generator/pdf_1761225789423.pdf
→ HTTP ERROR 401
```

## 🔍 Causes

1. **Fichiers privés par défaut** : Cloudinary peut rendre certains fichiers privés
2. **Mauvais type de ressource** : Les PDFs doivent être traités comme `image` dans l'URL
3. **Doublon dans le chemin** : Le dossier `qr-generator` était dupliqué dans le `public_id`

## ✅ Solutions appliquées

### 1. Forcer l'accès public lors de l'upload

```typescript
cloudinary.uploader.upload_stream(
  {
    resource_type: 'auto',
    public_id: fileName,
    folder: 'qr-generator',
    type: 'upload',
    access_mode: 'public', // ✅ Rendre le fichier public
    invalidate: true, // Invalider le cache CDN
  },
  // ...
)
```

### 2. Générer l'URL correcte pour les PDFs

```typescript
const isPdfFile = type === 'pdf' || file.name.toLowerCase().endsWith('.pdf');
if (isPdfFile) {
  fileUrl = cloudinary.url(cloudinaryPublicId, {
    resource_type: 'image', // ⚠️ Important : PDFs = image
    type: 'upload',
    secure: true,
    sign_url: false, // Pas de signature pour fichiers publics
  });
}
```

### 3. Éviter les doublons dans le chemin

**Avant** :
```typescript
const fileName = `qr-generator/${type}_${timestamp}`;
// Résultait en : qr-generator/qr-generator/pdf_xxx.pdf
```

**Après** :
```typescript
const fileName = `${type}_${timestamp}`;
// Résulte en : qr-generator/pdf_xxx.pdf ✅
```

## 🧪 Tests

Après le déploiement, vérifiez :

1. ✅ Upload d'un PDF
2. ✅ L'URL Cloudinary est accessible sans erreur 401
3. ✅ Le PDF s'affiche correctement dans l'iframe
4. ✅ Le chemin ne contient pas de doublon

## 📚 Ressources

- [Cloudinary Upload Parameters](https://cloudinary.com/documentation/image_upload_api_reference#upload_optional_parameters)
- [Cloudinary Access Control](https://cloudinary.com/documentation/control_access_to_media_assets)
- [PDF Delivery](https://cloudinary.com/documentation/image_transformations#delivering_pdf_files)

## 🔗 Fichiers modifiés

- `irata/app/api/qr-generator/route.ts` : Logique d'upload et génération d'URL

## ⚠️ Note importante

Sur **Vercel (environnement serverless)**, on ne peut pas sauvegarder de fichiers localement.
Tous les fichiers doivent être stockés sur Cloudinary ou un autre service cloud.

```typescript
// ❌ NE PAS FAIRE sur Vercel
await writeFile(localFilePath, buffer); // EROFS: read-only file system

// ✅ FAIRE : Uploader directement sur Cloudinary
cloudinary.uploader.upload_stream(...)
```


