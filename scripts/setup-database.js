const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Configuration de la base de données...');

try {
  // Créer une nouvelle migration
  console.log('📝 Création de la migration...');
  execSync('npx prisma migrate dev --name add-irata-disclaimer', { 
    cwd: path.join(process.cwd()),
    stdio: 'inherit'
  });
  
  // Générer le client Prisma
  console.log('🔧 Génération du client Prisma...');
  execSync('npx prisma generate', { 
    cwd: path.join(process.cwd()),
    stdio: 'inherit'
  });
  
  console.log('✅ Base de données configurée avec succès !');
} catch (error) {
  console.error('❌ Erreur lors de la configuration de la base de données:', error);
  process.exit(1);
}
