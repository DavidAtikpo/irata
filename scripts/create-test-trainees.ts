import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function createTestTrainees() {
  try {
    console.log('Création des stagiaires de test...');

    // Créer des utilisateurs stagiaires
    const trainees = [
      {
        email: 'stagiaire1@test.com',
        nom: 'Dupont',
        prenom: 'Jean',
        password: 'password123',
        role: Role.USER
      },
      {
        email: 'stagiaire2@test.com',
        nom: 'Martin',
        prenom: 'Marie',
        password: 'password123',
        role: Role.USER
      },
      {
        email: 'stagiaire3@test.com',
        nom: 'Bernard',
        prenom: 'Pierre',
        password: 'password123',
        role: Role.USER
      },
      {
        email: 'stagiaire4@test.com',
        nom: 'Petit',
        prenom: 'Sophie',
        password: 'password123',
        role: Role.USER
      }
    ];

    const createdTrainees = [];
    for (const trainee of trainees) {
      const user = await prisma.user.upsert({
        where: { email: trainee.email },
        update: {},
        create: trainee
      });
      createdTrainees.push(user);
      console.log(`Stagiaire créé: ${user.prenom} ${user.nom}`);
    }

    // Créer des demandes pour la session "Session Juillet 2025"
    console.log('Création des demandes pour la session...');
    
    for (const trainee of createdTrainees) {
      // Vérifier si la demande existe déjà
      const existingDemande = await prisma.demande.findFirst({
        where: {
          userId: trainee.id,
          session: 'Session Juillet 2025'
        }
      });

      if (!existingDemande) {
        const demande = await prisma.demande.create({
          data: {
            userId: trainee.id,
            session: 'Session Juillet 2025',
            message: `Demande de formation IRATA - ${trainee.prenom} ${trainee.nom}`,
            statut: 'VALIDE'
          }
        });
        console.log(`Demande créée pour ${trainee.prenom} ${trainee.nom}`);
      } else {
        console.log(`Demande déjà existante pour ${trainee.prenom} ${trainee.nom}`);
      }
    }

    // Créer des demandes pour une autre session "Session Août 2025"
    console.log('Création des demandes pour la deuxième session...');
    
    for (const trainee of createdTrainees.slice(0, 2)) { // Seulement les 2 premiers
      // Vérifier si la demande existe déjà
      const existingDemande = await prisma.demande.findFirst({
        where: {
          userId: trainee.id,
          session: 'Session Août 2025'
        }
      });

      if (!existingDemande) {
        const demande = await prisma.demande.create({
          data: {
            userId: trainee.id,
            session: 'Session Août 2025',
            message: `Demande de formation IRATA - ${trainee.prenom} ${trainee.nom}`,
            statut: 'VALIDE'
          }
        });
        console.log(`Demande créée pour ${trainee.prenom} ${trainee.nom} (Session Août)`);
      } else {
        console.log(`Demande déjà existante pour ${trainee.prenom} ${trainee.nom} (Session Août)`);
      }
    }

    console.log('✅ Données de test créées avec succès!');
  } catch (error) {
    console.error('❌ Erreur lors de la création des données de test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestTrainees(); 