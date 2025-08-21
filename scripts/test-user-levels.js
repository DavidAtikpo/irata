const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testUserLevels() {
  console.log('🧪 Test des niveaux des utilisateurs...\n');

  try {
    // Récupérer tous les utilisateurs avec leur niveau
    const users = await prisma.user.findMany({
      where: {
        role: 'USER' // Seulement les utilisateurs (pas les admins)
      },
      select: {
        id: true,
        email: true,
        nom: true,
        prenom: true,
        niveau: true
      }
    });

    console.log(`📋 ${users.length} utilisateurs trouvés\n`);

    // Afficher les informations de chaque utilisateur
    users.forEach((user, index) => {
      const fullName = [user.prenom, user.nom].filter(Boolean).join(' ').trim() || user.email;
      console.log(`${index + 1}. ${fullName}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Niveau: ${user.niveau || 'Non défini'}`);
      console.log(`   Index dans Pre-Job Training: ${(parseInt(user.niveau || '1') - 1)}`);
      console.log('');
    });

    // Statistiques par niveau
    const levelStats = {};
    users.forEach(user => {
      const level = user.niveau || 'Non défini';
      levelStats[level] = (levelStats[level] || 0) + 1;
    });

    console.log('📊 Statistiques par niveau:');
    Object.entries(levelStats).forEach(([level, count]) => {
      console.log(`   Niveau ${level}: ${count} utilisateur(s)`);
    });

    console.log('\n✅ Test terminé !');
    console.log('\n📝 Instructions pour tester le Pre-Job Training:');
    console.log('1. Connectez-vous avec différents utilisateurs');
    console.log('2. Allez sur la page "Pre-Job Training"');
    console.log('3. Vérifiez que le nom apparaît dans la bonne case de niveau');
    console.log('4. Vérifiez que les signatures automatiques fonctionnent');

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testUserLevels();
