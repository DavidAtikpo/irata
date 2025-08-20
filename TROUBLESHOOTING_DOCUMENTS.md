# Guide de dépannage - Téléversement de documents

## Problèmes courants et solutions

### 1. Modal de téléversement ne s'affiche pas

**Problème :** Le bouton "Nouveau document" ne fonctionne pas ou le modal ne s'affiche pas.

**Solution :** 
- ✅ **Résolu** : Le modal de téléversement a été ajouté au code
- Vérifiez que vous êtes connecté en tant qu'administrateur
- Vérifiez la console du navigateur pour les erreurs JavaScript

### 2. Erreur Cloudinary

**Problème :** Erreur lors du téléversement vers Cloudinary.

**Solutions :**

#### a) Vérifier la configuration Cloudinary
```bash
# Exécuter le script de test
node scripts/test-cloudinary.js
```

#### b) Vérifier les variables d'environnement
Assurez-vous que ces variables sont définies dans votre fichier `.env.local` :
```env
CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret
```

#### c) Vérifier les permissions Cloudinary
- Connectez-vous à votre compte Cloudinary
- Vérifiez que votre compte a les permissions d'upload
- Vérifiez les limites de votre plan (nombre d'uploads, taille des fichiers)

### 3. Erreur de stockage local

**Problème :** Erreur lors du téléversement en stockage local.

**Solutions :**

#### a) Vérifier les permissions du dossier
```bash
# Vérifier que le dossier existe et a les bonnes permissions
ls -la public/uploads/documents/
```

#### b) Créer le dossier manuellement si nécessaire
```bash
mkdir -p public/uploads/documents
chmod 755 public/uploads/documents
```

### 4. Erreur d'authentification

**Problème :** Erreur 401 (Non autorisé) lors du téléversement.

**Solutions :**
- Vérifiez que vous êtes connecté en tant qu'administrateur
- Vérifiez que votre session n'a pas expiré
- Reconnectez-vous si nécessaire

### 5. Erreur de type de fichier

**Problème :** Erreur "Seuls les fichiers PDF sont autorisés".

**Solutions :**
- Assurez-vous que le fichier est bien un PDF
- Vérifiez l'extension du fichier (.pdf)
- Essayez avec un autre fichier PDF

## Tests de diagnostic

### Test complet du système
```bash
# Exécuter le test complet
node scripts/test-document-upload.js
```

### Test Cloudinary uniquement
```bash
# Exécuter le test Cloudinary
node scripts/test-cloudinary.js
```

## Logs et débogage

### Vérifier les logs du serveur
```bash
# Démarrer le serveur en mode développement avec logs détaillés
npm run dev
```

### Vérifier les logs de l'API
Les erreurs sont maintenant loggées avec plus de détails dans :
- `app/api/admin/documents/upload/route.ts`
- `app/api/admin/documents/upload/local/route.ts`

### Vérifier la console du navigateur
- Ouvrir les outils de développement (F12)
- Aller dans l'onglet Console
- Reproduire l'erreur et vérifier les messages

## Solutions de contournement

### 1. Utilisation du stockage local uniquement
Si Cloudinary pose problème, le système bascule automatiquement vers le stockage local.

### 2. Upload manuel
En cas de problème persistant, vous pouvez :
1. Placer le fichier PDF dans `public/uploads/documents/`
2. Ajouter manuellement l'entrée dans la base de données

### 3. Vérification de la base de données
```sql
-- Vérifier les documents existants
SELECT * FROM Document ORDER BY createdAt DESC LIMIT 10;
```

## Contact et support

Si les problèmes persistent :
1. Vérifiez les logs d'erreur
2. Exécutez les scripts de test
3. Documentez les étapes pour reproduire le problème
4. Contactez l'équipe de développement avec les informations collectées

## Mise à jour du système

Le système a été mis à jour avec :
- ✅ Modal de téléversement ajouté
- ✅ Gestion d'erreur améliorée
- ✅ Messages d'erreur plus détaillés
- ✅ Fallback automatique vers le stockage local
- ✅ Scripts de test et de diagnostic
