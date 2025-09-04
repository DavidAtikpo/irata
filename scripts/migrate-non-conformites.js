const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrateNonConformites() {
  try {
    console.log('🚀 Début de la migration des non-conformités...');

    // Vérifier la connexion à la base de données
    await prisma.$connect();
    console.log('✅ Connexion à la base de données établie');

    // Vérifier si les tables existent déjà
    const existingTables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'webirata' 
      AND table_name IN ('NonConformite', 'ActionCorrective', 'NonConformiteDocument', 'ActionCorrectiveDocument', 'NonConformiteCommentaire', 'ActionCorrectiveCommentaire')
    `;

    if (existingTables.length > 0) {
      console.log('⚠️  Certaines tables existent déjà:', existingTables.map(t => t.table_name));
      console.log('🔄 Suppression des tables existantes...');
      
      // Supprimer les tables dans l'ordre inverse des dépendances
      await prisma.$executeRaw`DROP TABLE IF EXISTS "webirata"."ActionCorrectiveCommentaire" CASCADE`;
      await prisma.$executeRaw`DROP TABLE IF EXISTS "webirata"."NonConformiteCommentaire" CASCADE`;
      await prisma.$executeRaw`DROP TABLE IF EXISTS "webirata"."ActionCorrectiveDocument" CASCADE`;
      await prisma.$executeRaw`DROP TABLE IF EXISTS "webirata"."NonConformiteDocument" CASCADE`;
      await prisma.$executeRaw`DROP TABLE IF EXISTS "webirata"."ActionCorrective" CASCADE`;
      await prisma.$executeRaw`DROP TABLE IF EXISTS "webirata"."NonConformite" CASCADE`;
      
      // Supprimer les énumérations
      await prisma.$executeRaw`DROP TYPE IF EXISTS "webirata"."ActionCorrectiveEfficacite" CASCADE`;
      await prisma.$executeRaw`DROP TYPE IF EXISTS "webirata"."ActionCorrectivePriorite" CASCADE`;
      await prisma.$executeRaw`DROP TYPE IF EXISTS "webirata"."ActionCorrectiveStatut" CASCADE`;
      await prisma.$executeRaw`DROP TYPE IF EXISTS "webirata"."ActionCorrectiveType" CASCADE`;
      await prisma.$executeRaw`DROP TYPE IF EXISTS "webirata"."NonConformiteStatut" CASCADE`;
      await prisma.$executeRaw`DROP TYPE IF EXISTS "webirata"."NonConformiteGravite" CASCADE`;
      await prisma.$executeRaw`DROP TYPE IF EXISTS "webirata"."NonConformiteType" CASCADE`;
    }

    console.log('📝 Application du schéma Prisma...');
    
    // Générer et appliquer le client Prisma
    const { execSync } = require('child_process');
    execSync('npx prisma generate', { stdio: 'inherit' });
    execSync('npx prisma db push', { stdio: 'inherit' });

    console.log('✅ Migration terminée avec succès !');
    
    // Vérifier que les tables ont été créées
    const newTables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'webirata' 
      AND table_name IN ('NonConformite', 'ActionCorrective', 'NonConformiteDocument', 'ActionCorrectiveDocument', 'NonConformiteCommentaire', 'ActionCorrectiveCommentaire')
    `;
    
    console.log('📊 Tables créées:', newTables.map(t => t.table_name));

    // Créer quelques données de test (optionnel)
    if (process.argv.includes('--seed')) {
      console.log('🌱 Création de données de test...');
      await seedTestData();
    }

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function seedTestData() {
  try {
    // Récupérer un utilisateur admin pour les tests
    const admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (!admin) {
      console.log('⚠️  Aucun utilisateur admin trouvé, création de données de test ignorée');
      return;
    }

    // Créer une non-conformité de test
    const nonConformite = await prisma.nonConformite.create({
      data: {
        numero: 'NC-0001-2024',
        titre: 'Équipement de sécurité défaillant',
        description: 'Corde de sécurité présentant des signes d\'usure excessive sur une section de 2 mètres',
        type: 'SECURITE',
        gravite: 'CRITIQUE',
        lieu: 'Atelier de formation',
        detecteurId: admin.id,
        responsableId: admin.id,
        dateEcheance: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 jours
      }
    });

    // Créer une action corrective de test
    await prisma.actionCorrective.create({
      data: {
        nonConformiteId: nonConformite.id,
        titre: 'Remplacement immédiat de la corde',
        description: 'Remplacer la corde défaillante par une nouvelle corde certifiée',
        type: 'CORRECTION_IMMEDIATE',
        priorite: 'CRITIQUE',
        responsableId: admin.id,
        dateEcheance: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 jours
      }
    });

    console.log('✅ Données de test créées');
  } catch (error) {
    console.error('❌ Erreur lors de la création des données de test:', error);
  }
}

// Exécuter la migration
if (require.main === module) {
  migrateNonConformites()
    .then(() => {
      console.log('🎉 Migration terminée avec succès !');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Échec de la migration:', error);
      process.exit(1);
    });
}

module.exports = { migrateNonConformites };
