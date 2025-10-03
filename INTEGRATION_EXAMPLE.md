# Intégration de la page des sessions

## Utilisation de la page des sessions

La page des sessions est maintenant séparée et accessible à l'URL : `/sessions`

### Fonctionnalités

1. **Page dédiée** : `/sessions` - Contient toutes les sessions avec formulaires d'inscription
2. **Redirection automatique** : Support des paramètres URL pour ouvrir directement une session spécifique
3. **Intégration externe** : Peut être intégrée sur d'autres sites web

### Comment intégrer sur un autre site

#### Option 1 : Redirection simple
```html
<!-- Lien vers toutes les sessions -->
<a href="https://votre-domaine.com/sessions" target="_blank">
  Voir toutes les sessions de formation
</a>
```

#### Option 2 : Redirection vers une session spécifique
```html
<!-- Lien vers une session spécifique (s'ouvre automatiquement) -->
<a href="https://votre-domaine.com/sessions?session=2025_février_03_au_08" target="_blank">
  S'inscrire à la session de février 2025
</a>
```

#### Option 3 : Intégration avec iframe (optionnel)
```html
<iframe 
  src="https://votre-domaine.com/sessions" 
  width="100%" 
  height="800px"
  frameborder="0">
</iframe>
```

### Format des paramètres URL

Pour ouvrir automatiquement une session spécifique, utilisez le paramètre `session` avec le format :
```
/sessions?session=ANNEE_MOIS_DATES
```

Exemples :
- `/sessions?session=2025_février_03_au_08`
- `/sessions?session=2025_juillet_30_juin_au_05_juillet`

### Avantages de cette séparation

1. **Réutilisabilité** : La page peut être intégrée sur plusieurs sites
2. **Performance** : Page d'accueil plus légère
3. **SEO** : URL dédiée pour les inscriptions
4. **Flexibilité** : Possibilité d'ajouter des fonctionnalités spécifiques aux sessions
5. **Maintenance** : Code plus organisé et maintenable

### Structure des fichiers

```
app/(public)/
├── page.tsx              # Page d'accueil (sans sessions)
├── sessions/
│   └── page.tsx          # Page dédiée aux sessions
└── ...
```

### Navigation

- **Page d'accueil** → Bouton "Voir toutes les sessions et s'inscrire" → `/sessions`
- **Page sessions** → Bouton "Retour à l'accueil" → `/`
- **Sessions spécifiques** → URL avec paramètre `?session=...`














