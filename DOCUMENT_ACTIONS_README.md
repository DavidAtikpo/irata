# Système d'Accusé de Réception des Documents

## Vue d'ensemble

Ce système permet de suivre automatiquement les actions des utilisateurs sur les documents :
- **RECEIVED** : Document reçu (accusé de réception automatique)
- **OPENED** : Document ouvert/consulté
- **DOWNLOADED** : Document téléchargé

## Fonctionnalités

### Pour les Utilisateurs
- **Accusé de réception automatique** : Enregistré dès qu'un document est affiché
- **Suivi des ouvertures** : Enregistré à chaque consultation du document
- **Suivi des téléchargements** : Enregistré à chaque téléchargement
- **Transparence** : L'utilisateur peut voir ses propres actions

### Pour les Administrateurs
- **Tableau de bord complet** avec statistiques détaillées
- **Suivi par document** : Voir qui a fait quoi sur chaque document
- **Suivi par utilisateur** : Voir l'activité de chaque utilisateur
- **Métriques en temps réel** : Accusés de réception, ouvertures, téléchargements

## Structure de la Base de Données

### Nouvelle Table : DocumentAction
```sql
CREATE TABLE "webirata"."DocumentAction" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "documentId" TEXT NOT NULL REFERENCES "webirata"."Document"("id") ON DELETE CASCADE,
  "userId" TEXT NOT NULL REFERENCES "webirata"."User"("id") ON DELETE CASCADE,
  "action" "webirata"."DocumentActionType" NOT NULL,
  "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "ipAddress" TEXT,
  "userAgent" TEXT
);

-- Index unique pour éviter les doublons
CREATE UNIQUE INDEX "DocumentAction_documentId_userId_action_key" 
ON "webirata"."DocumentAction"("documentId", "userId", "action");
```

### Nouvel Enum : DocumentActionType
```sql
CREATE TYPE "webirata"."DocumentActionType" AS ENUM (
  'RECEIVED',    -- Document reçu
  'OPENED',      -- Document ouvert
  'DOWNLOADED'   -- Document téléchargé
);
```

## Installation et Migration

### 1. Mettre à jour le schéma Prisma
```bash
# Le schéma a déjà été mis à jour avec les nouvelles tables
# Régénérer le client Prisma
npx prisma generate
```

### 2. Exécuter la migration
```bash
# Exécuter le script de migration
node scripts/migrate-document-actions.js
```

### 3. Vérifier l'installation
```bash
# Vérifier que la table a été créée
npx prisma studio
```

## API Endpoints

### Enregistrer une action
```http
POST /api/documents/{documentId}/action
Content-Type: application/json

{
  "action": "RECEIVED" | "OPENED" | "DOWNLOADED"
}
```

### Récupérer les actions d'un document
```http
GET /api/documents/{documentId}/action
```

### Statistiques admin
```http
GET /api/admin/documents/statistics
```

## Utilisation

### Côté Utilisateur
Les actions sont enregistrées automatiquement :
1. **RECEIVED** : Quand la page des documents se charge
2. **OPENED** : Quand l'utilisateur clique sur "Ouvrir"
3. **DOWNLOADED** : Quand l'utilisateur clique sur "Télécharger"

### Côté Admin
1. Aller sur `/admin/documents`
2. Cliquer sur "Statistiques détaillées"
3. Voir les métriques et le suivi des actions

## Sécurité

- **Authentification requise** : Toutes les API nécessitent une session valide
- **Autorisation** : Seuls les admins peuvent voir les statistiques complètes
- **Validation** : Vérification des permissions d'accès aux documents
- **Audit trail** : Enregistrement de l'IP et de l'User-Agent

## Monitoring

### Métriques Disponibles
- Nombre total de documents
- Nombre total d'utilisateurs
- Nombre d'accusés de réception
- Nombre de documents ouverts
- Nombre de téléchargements
- Détail des actions par document
- Détail des actions par utilisateur

### Tableau de Bord
- **Vue d'ensemble** : Statistiques globales
- **Suivi par document** : Actions détaillées sur chaque document
- **Suivi par utilisateur** : Activité de chaque utilisateur
- **Filtres** : Par type, date, statut

## Maintenance

### Nettoyage des Données
```sql
-- Supprimer les anciennes actions (optionnel)
DELETE FROM "webirata"."DocumentAction" 
WHERE "timestamp" < NOW() - INTERVAL '1 year';
```

### Optimisation
- Index sur `documentId`, `userId`, `action`
- Index sur `timestamp` pour les requêtes temporelles
- Contraintes de clé étrangère avec CASCADE

## Dépannage

### Problèmes Courants
1. **Table non créée** : Exécuter le script de migration
2. **Erreurs de contrainte** : Vérifier l'intégrité des données
3. **Performance lente** : Vérifier les index de la base de données

### Logs
- Vérifier la console du navigateur pour les erreurs côté client
- Vérifier les logs du serveur pour les erreurs côté serveur
- Utiliser Prisma Studio pour inspecter la base de données

## Évolutions Futures

- **Notifications** : Alertes en temps réel pour les nouvelles actions
- **Rapports** : Export PDF/Excel des statistiques
- **Analytics avancés** : Graphiques et tendances
- **Intégration** : Webhooks vers d'autres systèmes
- **Rétention** : Politique de conservation des données d'audit
