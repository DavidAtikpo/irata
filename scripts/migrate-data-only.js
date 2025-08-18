const { PrismaClient } = require('@prisma/client');
const fs = require('fs').promises;
const path = require('path');

const prisma = new PrismaClient();

async function migrateDataOnly() {
  try {
    console.log('🚀 Migration des données JSON vers la base de données existante...');

    // Vérifier la connexion à la base de données
    console.log('🔍 Vérification de la connexion...');
    await prisma.$connect();
    console.log('✅ Connexion à la base de données établie');

    // Lire le fichier JSON
    const jsonPath = path.join(process.cwd(), 'data', 'irata-disclaimer-submissions.json');
    const jsonData = await fs.readFile(jsonPath, 'utf8');
    const submissions = JSON.parse(jsonData);

    console.log(`📊 ${submissions.length} soumissions trouvées dans le fichier JSON`);

    // Vérifier si la table existe déjà
    const existingCount = await prisma.irataDisclaimerSubmission.count();
    console.log(`📊 ${existingCount} soumissions déjà dans la base de données`);

    if (existingCount > 0) {
      console.log('⚠️  Des données existent déjà dans la base de données');
      console.log('💡 Voulez-vous continuer ? Cela pourrait créer des doublons');
      return;
    }

    // Migrer chaque soumission
    let migratedCount = 0;
    for (const submission of submissions) {
      try {
        // Convertir le statut
        let status = 'PENDING';
        if (submission.status === 'signed') {
          status = 'SIGNED';
        } else if (submission.status === 'sent') {
          status = 'SENT';
        }

        // Créer la soumission
        await prisma.irataDisclaimerSubmission.create({
          data: {
            id: submission.id,
            name: submission.name,
            address: submission.address,
            signature: submission.signature,
            session: submission.session,
            irataNo: submission.irataNo,
            userId: submission.user?.id || null,
            adminSignature: submission.adminSignature,
            adminSignedAt: submission.adminSignedAt ? new Date(submission.adminSignedAt) : null,
            adminName: submission.adminName,
            status: status,
            createdAt: new Date(submission.createdAt),
            updatedAt: new Date()
          }
        });

        migratedCount++;
        console.log(`✅ Soumission ${submission.id} migrée (${migratedCount}/${submissions.length})`);
      } catch (error) {
        console.error(`❌ Erreur lors de la migration de la soumission ${submission.id}:`, error.message);
      }
    }

    console.log(`🎉 Migration terminée ! ${migratedCount} soumissions migrées avec succès`);

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter la migration
migrateDataOnly();
