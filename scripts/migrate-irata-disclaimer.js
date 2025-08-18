const { PrismaClient } = require('@prisma/client');
const fs = require('fs').promises;
const path = require('path');

const prisma = new PrismaClient();

async function migrateIrataDisclaimerData() {
  try {
    console.log('🚀 Début de la migration des données IRATA Disclaimer...');

    // Lire le fichier JSON
    const jsonPath = path.join(process.cwd(), 'data', 'irata-disclaimer-submissions.json');
    const jsonData = await fs.readFile(jsonPath, 'utf8');
    const submissions = JSON.parse(jsonData);

    console.log(`📊 ${submissions.length} soumissions trouvées dans le fichier JSON`);

    // Migrer chaque soumission
    for (const submission of submissions) {
      try {
        // Convertir le statut
        let status = 'PENDING';
        if (submission.status === 'signed') {
          status = 'SIGNED';
        } else if (submission.status === 'sent') {
          status = 'SENT';
        }

        // Créer ou mettre à jour la soumission
        const result = await prisma.irataDisclaimerSubmission.upsert({
          where: { id: submission.id },
          update: {
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
            updatedAt: new Date()
          },
          create: {
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

        console.log(`✅ Soumission ${submission.id} migrée avec succès`);
      } catch (error) {
        console.error(`❌ Erreur lors de la migration de la soumission ${submission.id}:`, error.message);
      }
    }

    console.log('🎉 Migration terminée avec succès !');

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter la migration
migrateIrataDisclaimerData();
