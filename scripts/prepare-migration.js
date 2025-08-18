const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Préparation de la migration pour la production...');
console.log('⚠️  Ce script prépare la migration sans se connecter à la base de données');

try {
  // 1. Générer le client Prisma avec le schéma actuel
  console.log('🔧 Étape 1: Génération du client Prisma...');
  execSync('npx prisma generate', { 
    cwd: path.join(process.cwd()),
    stdio: 'inherit'
  });
  
  // 2. Créer la migration (sans l'appliquer)
  console.log('📝 Étape 2: Création de la migration...');
  execSync('npx prisma migrate dev --name add-irata-disclaimer-production --create-only', { 
    cwd: path.join(process.cwd()),
    stdio: 'inherit'
  });
  
  console.log('✅ Migration préparée avec succès !');
  console.log('');
  console.log('📋 PROCHAINES ÉTAPES (quand la DB sera accessible):');
  console.log('1. Vérifiez le fichier de migration dans prisma/migrations/');
  console.log('2. Testez la connexion: npx prisma db pull');
  console.log('3. Appliquez la migration: npx prisma migrate deploy');
  console.log('4. Régénérez le client: npx prisma generate');
  console.log('5. Migrez les données JSON: node scripts/migrate-data-only.js');
  console.log('');
  console.log('💡 Pour tester la connexion à la base de données:');
  console.log('   npx prisma db pull');
  
} catch (error) {
  console.error('❌ Erreur lors de la préparation:', error);
  console.log('💡 Vérifiez votre variable d\'environnement DATABASE_URL');
  process.exit(1);
}
