const fs = require('fs').promises;
const path = require('path');

async function resetSignatures() {
  console.log('🔄 Réinitialisation des signatures de test...\n');

  try {
    const dataPath = path.join(process.cwd(), 'data');
    const attendanceFile = path.join(dataPath, 'attendance-signatures.json');
    
    // Sauvegarder l'ancien fichier
    try {
      const oldData = await fs.readFile(attendanceFile, 'utf8');
      const backupFile = path.join(dataPath, 'attendance-signatures.backup.json');
      await fs.writeFile(backupFile, oldData, 'utf8');
      console.log('✅ Sauvegarde créée: attendance-signatures.backup.json');
    } catch (error) {
      console.log('ℹ️ Aucun fichier existant à sauvegarder');
    }

    // Créer un fichier d'attendance vide
    await fs.writeFile(attendanceFile, JSON.stringify([], null, 2), 'utf8');
    console.log('✅ Fichier d\'attendance réinitialisé');

    console.log('\n📝 Prochaines étapes:');
    console.log('1. Redémarrez le serveur de développement');
    console.log('2. Testez les signatures d\'attendance');
    console.log('3. Testez les signatures Pre-Job Training');
    console.log('4. Vérifiez que les signatures automatiques fonctionnent');

  } catch (error) {
    console.error('❌ Erreur lors de la réinitialisation:', error);
  }
}

resetSignatures();
