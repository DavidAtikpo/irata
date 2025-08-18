const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Migration sécurisée pour la production...');

try {
  // 1. Vérifier la connexion à la base de données
  console.log('🔍 Étape 1: Vérification de la connexion à la base de données...');
  execSync('npx prisma db pull', { 
    cwd: path.join(process.cwd()),
    stdio: 'inherit'
  });
  
  // 2. Créer une migration sécurisée
  console.log('📝 Étape 2: Création de la migration sécurisée...');
  execSync('npx prisma migrate dev --name add-irata-disclaimer-production --create-only', { 
    cwd: path.join(process.cwd()),
    stdio: 'inherit'
  });
  
  // 3. Vérifier la migration avant application
  console.log('🔍 Étape 3: Vérification de la migration...');
  execSync('npx prisma migrate status', { 
    cwd: path.join(process.cwd()),
    stdio: 'inherit'
  });
  
  console.log('✅ Migration créée avec succès !');
  console.log('⚠️  IMPORTANT: Vérifiez le fichier de migration dans prisma/migrations/');
  console.log('📋 Pour appliquer la migration: npx prisma migrate deploy');
  console.log('🔧 Pour générer le client: npx prisma generate');
  
} catch (error) {
  console.error('❌ Erreur lors de la migration:', error);
  console.log('💡 Vérifiez votre variable d\'environnement DATABASE_URL');
  process.exit(1);
}
