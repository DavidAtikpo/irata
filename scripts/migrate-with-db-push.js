const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Migration avec prisma db push pour la production...');
console.log('⚠️  Ce script applique directement les changements du schéma');

try {
  // 1. Générer le client Prisma avec le schéma actuel
  console.log('🔧 Étape 1: Génération du client Prisma...');
  execSync('npx prisma generate', { 
    cwd: path.join(process.cwd()),
    stdio: 'inherit'
  });
  
  // 2. Appliquer les changements du schéma directement
  console.log('📝 Étape 2: Application des changements du schéma...');
  execSync('npx prisma db push', { 
    cwd: path.join(process.cwd()),
    stdio: 'inherit'
  });
  
  // 3. Régénérer le client après les changements
  console.log('🔧 Étape 3: Régénération du client Prisma...');
  execSync('npx prisma generate', { 
    cwd: path.join(process.cwd()),
    stdio: 'inherit'
  });
  
  console.log('✅ Migration terminée avec succès !');
  console.log('');
  console.log('📋 PROCHAINES ÉTAPES:');
  console.log('1. Migrez les données JSON: node scripts/migrate-data-only.js');
  console.log('2. Testez l\'application');
  console.log('');
  console.log('🎉 Votre base de données est maintenant prête !');
  
} catch (error) {
  console.error('❌ Erreur lors de la migration:', error);
  console.log('💡 Vérifiez votre variable d\'environnement DATABASE_URL');
  process.exit(1);
}
