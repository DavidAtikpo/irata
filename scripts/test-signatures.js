const fs = require('fs').promises;
const path = require('path');

async function testSignatures() {
  console.log('🧪 Test des signatures d\'attendance et Pre-Job Training...\n');

  try {
    // Vérifier le fichier d'attendance
    const dataPath = path.join(process.cwd(), 'data');
    const attendanceFile = path.join(dataPath, 'attendance-signatures.json');
    
    console.log('📁 Vérification du fichier d\'attendance...');
    try {
      const attendanceData = await fs.readFile(attendanceFile, 'utf8');
      const signatures = JSON.parse(attendanceData);
      console.log(`✅ Fichier d'attendance trouvé avec ${signatures.length} signatures`);
      
      if (signatures.length > 0) {
        console.log('📋 Exemples de signatures:');
        signatures.slice(0, 3).forEach((sig, index) => {
          console.log(`  ${index + 1}. ${sig.signatureKey} - ${sig.userId} - ${sig.timestamp}`);
        });
      }
    } catch (error) {
      console.log('❌ Fichier d\'attendance non trouvé ou vide');
    }

    // Vérifier la base de données Pre-Job Training
    console.log('\n🗄️ Vérification de la base de données Pre-Job Training...');
    
    // Simuler une requête à l'API
    const testUserId = 'test-user-id';
    const testDay = 'Lundi';
    const testSignature = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjUwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjx0ZXh0IHg9IjEwIiB5PSIzMCIgZm9udC1mYW1pbHk9ImN1cnNpdmUiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9ImJsdWUiPlRlc3Q8L3RleHQ+PC9zdmc+';
    
    console.log('✅ Test de création de signature Pre-Job Training simulé');
    console.log(`  - Utilisateur: ${testUserId}`);
    console.log(`  - Jour: ${testDay}`);
    console.log(`  - Signature: ${testSignature.substring(0, 50)}...`);

    console.log('\n📝 Instructions pour tester manuellement:');
    console.log('1. Connectez-vous en tant qu\'utilisateur');
    console.log('2. Allez sur la page "Suivi Stagiaire"');
    console.log('3. Cochez un jour (J1-J5)');
    console.log('4. Vérifiez que les signatures d\'attendance sont créées automatiquement');
    console.log('5. Vérifiez que le Pre-Job Training est signé automatiquement');
    console.log('6. Allez sur la page "Pre-Job Training" pour voir les signatures');
    console.log('7. Testez les signatures manuelles en cliquant sur les cases vides');

    console.log('\n🔧 Problèmes potentiels et solutions:');
    console.log('- Si les signatures ne s\'enregistrent pas: vérifiez les permissions du dossier data/');
    console.log('- Si la base de données ne répond pas: vérifiez la connexion Prisma');
    console.log('- Si les signatures automatiques ne fonctionnent pas: vérifiez l\'API trainee-progress');
    console.log('- Si les signatures manuelles ne se sauvegardent pas: vérifiez l\'API pre-job-training-signature');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

testSignatures();
