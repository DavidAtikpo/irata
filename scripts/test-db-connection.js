const { execSync } = require('child_process');
const path = require('path');

console.log('🔍 Test de connexion à la base de données...');

try {
  console.log('📡 Test de la connexion avec prisma db pull...');
  execSync('npx prisma db pull', { 
    cwd: path.join(process.cwd()),
    stdio: 'inherit'
  });
  
  console.log('✅ Connexion réussie !');
  console.log('');
  console.log('🎉 Votre base de données est accessible !');
  console.log('');
  console.log('📋 Vous pouvez maintenant exécuter:');
  console.log('   node scripts/migrate-with-db-push.js');
  
} catch (error) {
  console.error('❌ Échec de la connexion à la base de données');
  console.log('');
  console.log('🔧 Vérifiez les points suivants:');
  console.log('1. Votre variable DATABASE_URL dans le fichier .env');
  console.log('2. La connexion internet');
  console.log('3. Le statut de votre base de données Neon');
  console.log('4. Les paramètres de sécurité (firewall, etc.)');
  console.log('');
  console.log('💡 En attendant, l\'application fonctionne avec les fichiers JSON');
  console.log('   Vous pouvez continuer à utiliser l\'application normalement');
}
