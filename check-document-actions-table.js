const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDocumentActionsTable() {
  try {
    console.log('🔍 Vérification de la table DocumentAction...');
    
    // Vérifier si la table existe
    const tableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'webirata' 
        AND table_name = 'DocumentAction'
      );
    `;
    
    if (tableExists[0].exists) {
      console.log('✅ Table DocumentAction existe');
      
      // Compter les enregistrements
      const count = await prisma.$queryRaw`
        SELECT COUNT(*) as count FROM "webirata"."DocumentAction";
      `;
      console.log(`📊 Nombre d'enregistrements: ${count[0].count}`);
      
      // Vérifier la structure
      const columns = await prisma.$queryRaw`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'webirata' 
        AND table_name = 'DocumentAction'
        ORDER BY ordinal_position;
      `;
      
      console.log('🏗️ Structure de la table:');
      columns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
      
    } else {
      console.log('❌ Table DocumentAction n\'existe pas');
      console.log('💡 Exécutez: node scripts/migrate-document-actions.js');
    }
    
  } catch (error) {
    console.error('💥 Erreur lors de la vérification:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDocumentActionsTable();
