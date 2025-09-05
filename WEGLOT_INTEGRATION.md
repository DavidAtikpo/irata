# Intégration Weglot - Guide de Configuration

## Vue d'ensemble

Weglot a été intégré dans l'application Next.js pour permettre la traduction automatique des pages en anglais. L'intégration utilise l'API Weglot avec la clé fournie.

## Fichiers modifiés/créés

### 1. `app/components/WeglotScript.tsx`
- Composant qui charge le script Weglot
- Utilise Next.js Script pour une optimisation des performances
- Configuration centralisée via `lib/weglot.ts`

### 2. `lib/weglot.ts`
- Configuration centralisée de Weglot
- Options avancées pour l'intégration
- Fonctions utilitaires pour la gestion des langues

### 3. `app/components/LanguageSelector.tsx`
- Sélecteur de langue personnalisé
- Interface utilisateur pour changer de langue
- Intégration avec l'API Weglot

### 4. `app/layout.tsx`
- Intégration du composant WeglotScript
- Métadonnées multilingues pour le SEO

## Configuration

### Clé API
```typescript
apiKey: 'wg_e97ec5714272b275569ce52f31c49ce26'
```

### Langues supportées
- **Langue originale** : Français (fr)
- **Langues de destination** : Anglais (en), Portugais (pt), Allemand (de)

### Options configurées
- Détection automatique de la langue : Activée
- Sélecteur de langue : Activé (position bottom-right)
- Traduction des images : Activée
- Éléments exclus : `.no-translate`

## Utilisation

### Sélecteur de langue automatique
Weglot affiche automatiquement un sélecteur de langue en bas à droite de la page.

### Sélecteur de langue personnalisé
Pour utiliser le sélecteur personnalisé, importez le composant :

```tsx
import LanguageSelector from '../components/LanguageSelector';

// Dans votre composant
<LanguageSelector className="my-custom-class" />
```

### Exclure des éléments de la traduction
Ajoutez la classe `no-translate` aux éléments que vous ne voulez pas traduire :

```tsx
<div className="no-translate">
  Ce contenu ne sera pas traduit
</div>
```

## Fonctionnalités

1. **Traduction automatique** : Toutes les pages sont automatiquement traduites
2. **Détection de langue** : Détection automatique basée sur la langue du navigateur
3. **SEO optimisé** : Métadonnées multilingues pour les moteurs de recherche
4. **Performance** : Chargement optimisé avec Next.js Script
5. **Interface utilisateur** : Sélecteur de langue intégré

## Test

Pour tester l'intégration :

1. Lancez l'application : `npm run dev`
2. Ouvrez le navigateur et naviguez vers votre site
3. Vérifiez que le sélecteur de langue apparaît en bas à droite
4. Testez le changement de langue entre français et anglais
5. Vérifiez que le contenu se traduit correctement

## Personnalisation

### Modifier les langues supportées
Éditez `lib/weglot.ts` :

```typescript
destinationLanguages: ['en', 'pt', 'de', 'es', 'it'], // Ajouter d'autres langues
```

### Changer la position du sélecteur
Modifiez `languageSelectorPosition` dans `lib/weglot.ts` :

```typescript
languageSelectorPosition: 'top-right', // ou 'bottom-left', etc.
```

### Personnaliser le style du sélecteur
Modifiez les classes CSS dans `LanguageSelector.tsx` selon vos besoins.

## Support

Pour toute question ou problème avec l'intégration Weglot, consultez :
- [Documentation Weglot](https://developers.weglot.com/)
- [Guide d'intégration Next.js](https://developers.weglot.com/nextjs)
