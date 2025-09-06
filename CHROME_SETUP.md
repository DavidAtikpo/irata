# Configuration Chrome/Chromium pour la génération PDF

## 🚀 Déploiement sur Vercel (Recommandé)

### 1. Configuration automatique
Le projet est maintenant configuré pour utiliser `@sparticuz/chromium` qui est optimisé pour Vercel.

### 2. Variables d'environnement
Ajoutez ces variables dans votre dashboard Vercel :

```bash
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
NEXTAUTH_URL=https://votre-domaine.vercel.app
```

### 3. Déploiement
```bash
# Déployer sur Vercel
vercel --prod

# Ou via Git
git push origin main
```

## 🔧 Autres plateformes

### Netlify Functions
```bash
# Installer les dépendances
npm install @sparticuz/chromium puppeteer-core

# Configuration dans netlify.toml
[build.environment]
  PUPPETEER_SKIP_CHROMIUM_DOWNLOAD = "true"
```

### AWS Lambda
```bash
# Utiliser @sparticuz/chromium
npm install @sparticuz/chromium puppeteer-core

# Configuration dans serverless.yml
environment:
  PUPPETEER_SKIP_CHROMIUM_DOWNLOAD: true
```

### Serveur VPS/Dédié
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install google-chrome-stable

# CentOS/RHEL
sudo yum install google-chrome-stable

# Variables d'environnement
export PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome
```

## 📋 Vérification

### Test local
```bash
npm run dev
# Tester la génération PDF via l'interface admin
```

### Test production
```bash
# Vérifier les logs Vercel
vercel logs

# Tester l'endpoint PDF
curl -X GET "https://votre-domaine.vercel.app/api/admin/formulaires-quotidiens/[id]/reponses/[reponseId]/pdf"
```

## 🐛 Dépannage

### Erreur "Chrome not found"
- Vérifiez que `@sparticuz/chromium` est installé
- Vérifiez les variables d'environnement
- Consultez les logs de déploiement

### Timeout
- Augmentez `maxDuration` dans `vercel.json`
- Optimisez le HTML généré
- Réduisez la taille des images

### Mémoire insuffisante
- Réduisez la complexité du PDF
- Utilisez des images plus petites
- Optimisez le CSS

## 📊 Performance

### Optimisations appliquées
- ✅ Chromium optimisé pour serverless
- ✅ Timeout configuré (30s)
- ✅ Arguments Chrome optimisés
- ✅ Gestion d'erreur robuste
- ✅ Fallback HTML automatique

### Métriques attendues
- **Temps de génération** : 2-5 secondes
- **Taille PDF** : 100-500 KB
- **Mémoire utilisée** : 50-100 MB
- **Taux de succès** : >95%
