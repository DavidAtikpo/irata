import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const syllabus = [
  'Planification et gestion',
  'Système IRATA International',
  'Cadre légal',
  'Identification des dangers et évaluation des risques',
  'Sélection de la méthode d\'accès',
  'Sélection du personnel et compétences',
  'Déclaration de méthode de sécurité',
  'Zones de sélection, permis de travail, etc.',
  'Planification des urgences',
  'Premiers secours et tolérance à la suspension',
  'Sélection de l\'équipement',
  'Inspection et maintenance de l\'équipement',
  'Contrôle de pression de l\'équipement',
  'Inspections détaillées et intermédiaires',
  'Assemblage de l\'équipement et vérification mutuelle',
  'Sélection d\'ancrages',
  'Nœuds et manipulation de corde',
  'Système d\'ancrage de base',
  'Formes en Y',
  'Évitement des dangers et protection des cordes',
  'Réancrages',
  'Déviations',
  'Traction sur points d\'insertion',
  'Lignes de travail résistantes',
  'Système d\'arrêt de chute verticale',
  'Lignes tendues',
  'Systèmes de descente',
  'Systèmes de hissage',
  'Hissage croisé',
  'Systèmes de sauvetage complexes (exercice d\'équipe)',
  'Dispositifs de secours',
  'Descente',
  'Montée',
  'Changements de mode',
  'Descente avec dispositifs de montée',
  'Montée avec dispositifs de descente',
  'Déviation simple',
  'Déviation double',
  'Transferts corde à corde',
  'Réancrages niveau 1 (<1.5 m)',
  'Réancrages niveau 2 et 3 (>1.5 m)',
  'Passage des nœuds en milieu de corde',
  'Obstacles de bord en haut',
  'Utilisation des sièges de travail (sièges confort)',
  'Passage des protections en milieu de corde',
  'Escalade aidée mobile horizontale',
  'Escalade aidée fixe horizontale',
  'Escalade aidée verticale',
  'Escalade avec équipement d\'arrêt de chute',
  'Sauvetage en mode descente',
  'Sauvetage en mode montée',
  'Passage d\'une déviation avec victime',
  'Transfert corde à corde avec victime',
  'Passage d\'un petit réancrage avec victime',
  'Sauvetage en milieu de transfert',
  'Passage de nœuds en milieu de corde avec victime',
  'Utilisation de cordes tendues pour le sauvetage',
  'Sauvetage en escalade aidée',
  'Sauvetage avec équipement d\'arrêt de chute',
  'Sauvetage en escalade aidée : liaison courte'
];

const days = ['J1', 'J2', 'J3', 'J4', 'J5'];
const levels = ['Level 1', 'Level 2', 'Level 3'];

async function main() {
  console.log('🌱 Début du seeding des données Trainee Follow Up...');

  try {
    // Récupérer tous les utilisateurs avec le rôle USER
    const users = await prisma.user.findMany({
      where: { role: 'USER' },
      select: { id: true, nom: true, prenom: true }
    });

    console.log(`📋 ${users.length} utilisateurs trouvés`);

    if (users.length === 0) {
      console.log('❌ Aucun utilisateur trouvé. Créez d\'abord des utilisateurs avec le rôle USER.');
      return;
    }

    // Créer des données de niveau pour tous les éléments du programme
    console.log('📊 Création des données de niveau...');
    for (const item of syllabus) {
      for (const level of levels) {
        await prisma.traineeLevelData.upsert({
          where: {
            syllabusItem_level: {
              syllabusItem: item,
              level: level
            }
          },
          update: {},
          create: {
            syllabusItem: item,
            level: level,
            required: Math.random() > 0.3 // 70% des niveaux sont requis
          }
        });
      }
    }

    // Créer des données de progression pour chaque utilisateur
    console.log('📈 Création des données de progression...');
    for (const user of users) {
      for (const item of syllabus) {
        for (const day of days) {
          await prisma.traineeProgress.upsert({
            where: {
              syllabusItem_traineeId_day: {
                syllabusItem: item,
                traineeId: user.id,
                day: day
              }
            },
            update: {},
            create: {
              syllabusItem: item,
              traineeId: user.id,
              day: day,
              completed: Math.random() > 0.6 // 40% des cases sont cochées
            }
          });
        }
      }
    }

    // Créer des signatures pour chaque utilisateur
    console.log('✍️ Création des signatures...');
    for (const user of users) {
      await prisma.traineeSignature.upsert({
        where: { traineeId: user.id },
        update: {},
        create: {
          traineeId: user.id,
          signature: `${user.prenom} ${user.nom}`,
          adminSignature: ''
        }
      });
    }

    console.log('✅ Seeding terminé avec succès !');
    console.log(`📊 Données créées :`);
    console.log(`   - ${syllabus.length} éléments du programme`);
    console.log(`   - ${users.length} utilisateurs`);
    console.log(`   - ${syllabus.length * users.length * days.length} entrées de progression`);
    console.log(`   - ${users.length} signatures`);

  } catch (error) {
    console.error('❌ Erreur lors du seeding:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 