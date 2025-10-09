# API Admin - Satisfaction Client

## Endpoints disponibles

### GET `/api/admin/customer-satisfaction`

Récupère toutes les réponses de satisfaction client avec filtrage optionnel.

#### Paramètres de requête

- `type` (optionnel) : Filtrer par type de formulaire
  - `ENVIRONMENT_RECEPTION` : Environnement et réception
  - `EQUIPMENT` : Équipements d'entraînement
  - `TRAINING_PEDAGOGY` : Équipe pédagogique et programme

- `session` (optionnel) : Filtrer par session de formation
  - Recherche insensible à la casse et partielle

- `sessions=true` : Récupère la liste de toutes les sessions disponibles

#### Exemples d'utilisation

```javascript
// Récupérer toutes les réponses
GET /api/admin/customer-satisfaction

// Filtrer par type
GET /api/admin/customer-satisfaction?type=EQUIPMENT

// Filtrer par session
GET /api/admin/customer-satisfaction?session=Session%20Janvier%202024

// Combiner les filtres
GET /api/admin/customer-satisfaction?type=TRAINING_PEDAGOGY&session=Session%20Janvier

// Récupérer les sessions disponibles
GET /api/admin/customer-satisfaction?sessions=true
```

#### Réponse

```json
[
  {
    "id": "cmf2ezl7p0002vepg1ekfufw3",
    "traineeName": "Jean Dupont",
    "type": "ENVIRONMENT_RECEPTION",
    "date": "2024-01-15T10:30:00.000Z",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "items": [
      {
        "label": "Accueil par notre chauffeur",
        "rating": "Très satisfaisant",
        "comment": "Excellent service"
      }
    ],
    "suggestions": null,
    "session": "Session Janvier 2024",
    "signature": null,
    "user": {
      "email": "jean.dupont@example.com",
      "nom": "Dupont",
      "prenom": "Jean"
    }
  }
]
```

## Interface Admin

L'interface admin (`/admin/customer-satisfaction`) permet de :

1. **Filtrer par type de formulaire** : Tous, Cadre & Accueil, Équipements, Pédagogie & Formation
2. **Filtrer par session** : Toutes les sessions ou une session spécifique
3. **Voir toutes les réponses** avec les informations utilisateur
4. **Exporter les données** (fonctionnalité existante)

### Fonctionnalités ajoutées

- ✅ Filtrage par session de formation
- ✅ Liste des sessions disponibles
- ✅ Recherche partielle dans les sessions
- ✅ Combinaison des filtres (type + session)

## Sécurité

- Seuls les utilisateurs avec le rôle `ADMIN` peuvent accéder à cette API
- Authentification requise via NextAuth
- Validation des paramètres d'entrée
