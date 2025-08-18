const { execSync } = require('child_process');
const path = require('path');

console.log('🔄 Génération du client Prisma...');

try {
  // Générer le client Prisma
  execSync('npx prisma generate', { 
    cwd: path.join(process.cwd()),
    stdio: 'inherit'
  });
  
  console.log('✅ Client Prisma généré avec succès !');
} catch (error) {
  console.error('❌ Erreur lors de la génération du client Prisma:', error);
  process.exit(1);
}
