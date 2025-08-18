const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Migration complète vers la base de données...');

try {
  // 0. Nettoyer le schéma pour SQLite
  console.log('🧹 Étape 0: Nettoyage du schéma Prisma...');
  execSync('node scripts/clean-schema.js', { 
    cwd: path.join(process.cwd()),
    stdio: 'inherit'
  });
  
  // 1. Créer la migration de base de données
  console.log('📝 Étape 1: Création de la migration...');
  execSync('npx prisma migrate dev --name add-irata-disclaimer', { 
    cwd: path.join(process.cwd()),
    stdio: 'inherit'
  });
  
  // 2. Générer le client Prisma
  console.log('🔧 Étape 2: Génération du client Prisma...');
  execSync('npx prisma generate', { 
    cwd: path.join(process.cwd()),
    stdio: 'inherit'
  });
  
  // 3. Migrer les données JSON
  console.log('📊 Étape 3: Migration des données JSON...');
  execSync('node scripts/migrate-irata-disclaimer.js', { 
    cwd: path.join(process.cwd()),
    stdio: 'inherit'
  });
  
  console.log('✅ Migration complète terminée avec succès !');
  console.log('🎉 Toutes les données sont maintenant dans la base de données !');
  
} catch (error) {
  console.error('❌ Erreur lors de la migration:', error);
  process.exit(1);
}
