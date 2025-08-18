const fs = require('fs');
const path = require('path');

console.log('🧹 Nettoyage du schéma Prisma pour SQLite...');

try {
  const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
  let schemaContent = fs.readFileSync(schemaPath, 'utf8');
  
  // Supprimer toutes les références aux schémas
  schemaContent = schemaContent.replace(/@@schema\("webirata"\)/g, '');
  
  // Écrire le schéma nettoyé
  fs.writeFileSync(schemaPath, schemaContent, 'utf8');
  
  console.log('✅ Schéma Prisma nettoyé avec succès !');
} catch (error) {
  console.error('❌ Erreur lors du nettoyage du schéma:', error);
  process.exit(1);
}
