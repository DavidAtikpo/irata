const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrateDocumentActions() {
  try {
    console.log('🚀 Début de la migration des actions de documents...');

    // Vérifier la connexion à la base de données
    await prisma.$connect();
    console.log('✅ Connexion à la base de données établie');

    // Créer l'enum DocumentActionType s'il n'existe pas
    try {
      await prisma.$executeRaw`
        DO $$ BEGIN
          CREATE TYPE "webirata"."DocumentActionType" AS ENUM ('RECEIVED', 'OPENED', 'DOWNLOADED');
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
      `;
      console.log('✅ Enum DocumentActionType créé ou déjà existant');
    } catch (error) {
      console.log('⚠️ Erreur lors de la création de l\'enum:', error.message);
    }

    // Créer la table DocumentAction
    try {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "webirata"."DocumentAction" (
          "id" TEXT NOT NULL,
          "documentId" TEXT NOT NULL,
          "userId" TEXT NOT NULL,
          "action" "webirata"."DocumentActionType" NOT NULL,
          "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "ipAddress" TEXT,
          "userAgent" TEXT,
          CONSTRAINT "DocumentAction_pkey" PRIMARY KEY ("id")
        );
      `;
      console.log('✅ Table DocumentAction créée ou déjà existante');
    } catch (error) {
      console.log('⚠️ Erreur lors de la création de la table:', error.message);
    }

    // Créer l'index unique sur documentId, userId et action
    try {
      await prisma.$executeRaw`
        CREATE UNIQUE INDEX IF NOT EXISTS "DocumentAction_documentId_userId_action_key" 
        ON "webirata"."DocumentAction"("documentId", "userId", "action");
      `;
      console.log('✅ Index unique créé ou déjà existant');
    } catch (error) {
      console.log('⚠️ Erreur lors de la création de l\'index:', error.message);
    }

    // Créer les contraintes de clé étrangère
    try {
      await prisma.$executeRaw`
        ALTER TABLE "webirata"."DocumentAction" 
        ADD CONSTRAINT "DocumentAction_documentId_fkey" 
        FOREIGN KEY ("documentId") REFERENCES "webirata"."Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      `;
      console.log('✅ Contrainte de clé étrangère documentId créée ou déjà existante');
    } catch (error) {
      console.log('⚠️ Erreur lors de la création de la contrainte documentId:', error.message);
    }

    try {
      await prisma.$executeRaw`
        ALTER TABLE "webirata"."DocumentAction" 
        ADD CONSTRAINT "DocumentAction_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "webirata"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      `;
      console.log('✅ Contrainte de clé étrangère userId créée ou déjà existante');
    } catch (error) {
      console.log('⚠️ Erreur lors de la création de la contrainte userId:', error.message);
    }

    // Vérifier que la table a été créée correctement
    const tableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'webirata' 
        AND table_name = 'DocumentAction'
      );
    `;

    if (tableExists[0].exists) {
      console.log('✅ Table DocumentAction vérifiée avec succès');
      
      // Compter le nombre de lignes
      const count = await prisma.$queryRaw`
        SELECT COUNT(*) as count FROM "webirata"."DocumentAction";
      `;
      console.log(`📊 Table DocumentAction contient ${count[0].count} enregistrements`);
    } else {
      console.log('❌ Table DocumentAction n\'a pas été créée correctement');
    }

    console.log('🎉 Migration des actions de documents terminée avec succès !');

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter la migration
migrateDocumentActions()
  .catch((error) => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });
