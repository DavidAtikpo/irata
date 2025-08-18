const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Migration sécurisée pour la production...');
console.log('⚠️  Ce script va préserver toutes les données existantes');

try {
  // 1. Vérifier la connexion et récupérer le schéma actuel
  console.log('🔍 Étape 1: Vérification de la connexion et récupération du schéma...');
  execSync('npx prisma db pull', { 
    cwd: path.join(process.cwd()),
    stdio: 'inherit'
  });
  
  // 2. Générer le client Prisma avec le schéma actuel
  console.log('🔧 Étape 2: Génération du client Prisma...');
  execSync('npx prisma generate', { 
    cwd: path.join(process.cwd()),
    stdio: 'inherit'
  });
  
  // 3. Créer la migration (sans l'appliquer)
  console.log('📝 Étape 3: Création de la migration...');
  execSync('npx prisma migrate dev --name add-irata-disclaimer-production --create-only', { 
    cwd: path.join(process.cwd()),
    stdio: 'inherit'
  });
  
  // 4. Vérifier le statut des migrations
  console.log('🔍 Étape 4: Vérification du statut des migrations...');
  execSync('npx prisma migrate status', { 
    cwd: path.join(process.cwd()),
    stdio: 'inherit'
  });
  
  console.log('✅ Migration créée avec succès !');
  console.log('');
  console.log('📋 PROCHAINES ÉTAPES:');
  console.log('1. Vérifiez le fichier de migration dans prisma/migrations/');
  console.log('2. Appliquez la migration: npx prisma migrate deploy');
  console.log('3. Régénérez le client: npx prisma generate');
  console.log('4. Migrez les données JSON: node scripts/migrate-data-only.js');
  console.log('');
  console.log('⚠️  IMPORTANT: Sauvegardez votre base de données avant d\'appliquer la migration !');
  
} catch (error) {
  console.error('❌ Erreur lors de la migration:', error);
  console.log('💡 Vérifiez votre variable d\'environnement DATABASE_URL');
  process.exit(1);
}
