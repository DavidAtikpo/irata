const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('🔍 Vérification de la base de données...');
    
    // Vérifier si la table DocumentAction existe
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'webirata' 
      AND table_name = 'DocumentAction';
    `;
    
    if (tables.length > 0) {
      console.log('✅ Table DocumentAction existe');
      
      // Compter les enregistrements
      const count = await prisma.$queryRaw`
        SELECT COUNT(*) as count FROM "webirata"."DocumentAction";
      `;
      console.log(`📊 Nombre d'actions enregistrées: ${count[0].count}`);
      
      // Voir les dernières actions
      const actions = await prisma.$queryRaw`
        SELECT * FROM "webirata"."DocumentAction" 
        ORDER BY timestamp DESC 
        LIMIT 5;
      `;
      
      console.log('📝 Dernières actions:');
      actions.forEach(action => {
        console.log(`  - ${action.action} par ${action.userId} sur ${action.documentId} à ${action.timestamp}`);
      });
      
    } else {
      console.log('❌ Table DocumentAction n\'existe pas');
      console.log('💡 Exécutez la migration: node scripts/migrate-document-actions.js');
    }
    
  } catch (error) {
    console.error('💥 Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
