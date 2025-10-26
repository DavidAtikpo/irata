const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createLaurentDemande() {
  try {
    console.log('🔍 Recherche de Laurent Cides...');
    
    // Trouver Laurent Cides par email
    const laurent = await prisma.user.findUnique({
      where: { email: 'pmcides@gmail.com' },
      select: { id: true, nom: true, prenom: true, email: true }
    });

    if (!laurent) {
      console.log('❌ Laurent Cides non trouvé');
      return;
    }

    console.log('✅ Laurent Cides trouvé:', laurent);

    // Créer une demande pour Laurent avec la session souhaitée
    console.log('📝 Création d\'une demande pour Laurent Cides...');
    
    const nouvelleDemande = await prisma.demande.create({
      data: {
        userId: laurent.id,
        session: '2025 octobre du 20 au 24 (Examen 25)',
        message: 'Demande créée automatiquement pour assigner Laurent Cides à la session',
        statut: 'EN_ATTENTE', // Statut par défaut
        typeInscription: 'personnel',
        entreprise: null
      }
    });

    console.log('✅ Demande créée avec succès!');
    console.log('📋 Détails de la demande:');
    console.log(`  - ID: ${nouvelleDemande.id}`);
    console.log(`  - Session: ${nouvelleDemande.session}`);
    console.log(`  - Statut: ${nouvelleDemande.statut}`);
    console.log(`  - Créé: ${nouvelleDemande.createdAt.toISOString()}`);

  } catch (error) {
    console.error('❌ Erreur lors de la création de la demande:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script
createLaurentDemande();
