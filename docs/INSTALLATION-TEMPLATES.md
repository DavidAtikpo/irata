# 📦 Installation du Système de Templates Dynamiques

## Étape 1 : Mettre à jour le schéma Prisma

Ouvrez `prisma/schema.prisma` et effectuez les modifications suivantes :

### 1.1 Ajouter le modèle EquipmentTemplate

```prisma
model EquipmentTemplate {
  id          String   @id @default(cuid())
  name        String   @unique
  description String?
  structure   Json
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  createdBy   User     @relation("EquipmentTemplateCreator", fields: [createdById], references: [id])
  createdById String
  
  inspections EquipmentDetailedInspection[] @relation("TemplateInspections")
}
```

### 1.2 Modifier le modèle EquipmentDetailedInspection

Ajoutez ces deux champs au modèle existant :

```prisma
model EquipmentDetailedInspection {
  // ... tous vos champs existants ...
  
  // AJOUTEZ CES DEUX LIGNES :
  templateId     String?
  template       EquipmentTemplate? @relation("TemplateInspections", fields: [templateId], references: [id])
}
```

### 1.3 Modifier le modèle User

Ajoutez ce champ au modèle existant :

```prisma
model User {
  // ... tous vos champs existants ...
  
  // AJOUTEZ CETTE LIGNE :
  equipmentTemplates EquipmentTemplate[] @relation("EquipmentTemplateCreator")
}
```

## Étape 2 : Appliquer les modifications

Dans votre terminal PowerShell, exécutez :

```bash
cd C:\Users\Thecode2\Desktop\New folder\irata
npx prisma db push
```

## Étape 3 : Ajouter un lien dans le menu admin (optionnel)

Si vous avez un menu de navigation admin, ajoutez un lien vers :
```
/admin/equipment-templates
```

## Étape 4 : Tester le système

1. Allez sur : `http://localhost:3000/admin/equipment-templates`
2. Cliquez sur **"Nouveau Template"**
3. Créez votre premier template !

## 🎯 Structure des Fichiers Créés

Voici tous les fichiers créés pour ce système :

```
📁 irata/
├── 📁 app/
│   ├── 📁 (admin)/admin/
│   │   └── 📁 equipment-templates/
│   │       ├── page.tsx                    ← Liste des templates
│   │       ├── 📁 create/
│   │       │   └── page.tsx                ← Créer un template (ÉDITEUR VISUEL)
│   │       └── 📁 [id]/
│   │           └── 📁 edit/
│   │               └── page.tsx            ← Modifier un template
│   └── 📁 api/admin/
│       └── 📁 equipment-templates/
│           ├── route.ts                    ← GET (liste) + POST (créer)
│           └── 📁 [id]/
│               └── route.ts                ← GET + PUT + DELETE
├── 📁 docs/
│   ├── SYSTEME-TEMPLATES-DYNAMIQUES.md     ← Guide complet
│   └── INSTALLATION-TEMPLATES.md           ← Ce fichier
└── 📁 prisma/
    └── schema-template.prisma              ← Modèle à copier
```

## ✅ Vérification

Après installation, vous devriez pouvoir :

1. ✅ Accéder à `/admin/equipment-templates`
2. ✅ Voir la page "Templates d'Équipement"
3. ✅ Cliquer sur "Nouveau Template"
4. ✅ Créer un template avec sections et sous-sections
5. ✅ Sauvegarder le template en base de données

## 🆘 En cas de problème

### Problème 1 : Erreur Prisma
```
Error: Unknown argument `relation`
```

**Solution :** Vérifiez que vous avez bien ajouté les **noms de relation** :
- `@relation("EquipmentTemplateCreator")`
- `@relation("TemplateInspections")`

### Problème 2 : Page 404
```
Cannot GET /admin/equipment-templates
```

**Solution :** Vérifiez que le dossier est bien créé :
```
app/(admin)/admin/equipment-templates/page.tsx
```

### Problème 3 : Erreur "createdById does not exist"
```
Field 'createdById' not found in User model
```

**Solution :** Assurez-vous d'avoir bien exécuté `npx prisma db push`

## 📚 Prochaines Étapes

Après installation :

1. **Créez vos premiers templates** pour vos équipements fréquents
2. **Testez** en créant des inspections avec ces templates
3. **Consultez** le guide complet : `SYSTEME-TEMPLATES-DYNAMIQUES.md`

---

**Besoin d'aide ?** Consultez la documentation complète dans `docs/SYSTEME-TEMPLATES-DYNAMIQUES.md`

