const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Migration automatique quand la base de données sera prête...');

try {
  // 1. Tester la connexion
  console.log('🔍 Étape 1: Test de la connexion à la base de données...');
  execSync('npx prisma db pull', { 
    cwd: path.join(process.cwd()),
    stdio: 'inherit'
  });
  
  console.log('✅ Connexion réussie !');
  
  // 2. Générer le client Prisma
  console.log('🔧 Étape 2: Génération du client Prisma...');
  execSync('npx prisma generate', { 
    cwd: path.join(process.cwd()),
    stdio: 'inherit'
  });
  
  // 3. Appliquer les changements avec db push
  console.log('📝 Étape 3: Application des changements du schéma...');
  execSync('npx prisma db push', { 
    cwd: path.join(process.cwd()),
    stdio: 'inherit'
  });
  
  // 4. Régénérer le client après les changements
  console.log('🔧 Étape 4: Régénération du client Prisma...');
  execSync('npx prisma generate', { 
    cwd: path.join(process.cwd()),
    stdio: 'inherit'
  });
  
  // 5. Migrer les données JSON
  console.log('📊 Étape 5: Migration des données JSON...');
  execSync('node scripts/migrate-data-only.js', { 
    cwd: path.join(process.cwd()),
    stdio: 'inherit'
  });
  
  console.log('🎉 Migration complète terminée avec succès !');
  console.log('');
  console.log('✅ Votre application utilise maintenant la base de données');
  console.log('✅ Toutes les données JSON ont été migrées');
  console.log('✅ Vous pouvez supprimer les fichiers JSON si vous le souhaitez');
  
} catch (error) {
  console.error('❌ Échec de la migration:', error.message);
  console.log('');
  console.log('💡 L\'application continue de fonctionner avec les fichiers JSON');
  console.log('🔧 Pour tester la connexion plus tard: node scripts/test-db-connection.js');
  console.log('🚀 Pour migrer quand la DB sera prête: node scripts/migrate-when-ready.js');
}
