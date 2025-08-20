const fs = require('fs');
const path = require('path');

// Créer un fichier PDF de test
function createTestPDF() {
  const testPDFPath = path.join(__dirname, 'test-document.pdf');
  
  // Contenu PDF minimal (en base64)
  const pdfContent = Buffer.from(
    'JVBERi0xLjQKJcOkw7zDtsO8DQoxIDAgb2JqDQo8PA0KL1R5cGUgL0NhdGFsb2cNCi9QYWdlcyAyIDAgUg0KPj4NCmVuZG9iag0KMiAwIG9iag0KPDwNCi9UeXBlIC9QYWdlcw0KL0NvdW50IDENCi9LaWRzIFsgMyAwIFIgXQ0KPj4NCmVuZG9iag0KMyAwIG9iag0KPDwNCi9UeXBlIC9QYWdlDQovUGFyZW50IDIgMCBSDQovUmVzb3VyY2VzIDw8DQovRm9udCA8PA0KL0YxIDQgMCBSDQo+Pg0KPj4NCi9NZWRpYUJveCBbIDAgMCA1OTUgODQyIF0NCi9Db250ZW50cyA1IDAgUg0KPj4NCmVuZG9iag0KNCAwIG9iag0KPDwNCi9UeXBlIC9Gb250DQovU3VidHlwZSAvVHlwZTENCi9CYXNlRm9udCAvSGVsdmV0aWNhDQovRW5jb2RpbmcgL1dpbkFuc2lFbmNvZGluZw0KPj4NCmVuZG9iag0KNSAwIG9iag0KPDwNCi9MZW5ndGggNDQNCj4+DQpzdHJlYW0NCkJUCjcwIDUwIFRECi9GMSAxMiBUZgooSGVsbG8gV29ybGQpIFRqCkVUCmVuZHN0cmVhbQplbmRvYmoNCnhyZWYNCjAgNg0KMDAwMDAwMDAwMCA2NTUzNSBmDQowMDAwMDAwMDEwIDAwMDAwIG4NCjAwMDAwMDAwNzkgMDAwMDAgbg0KMDAwMDAwMDE3MyAwMDAwMCBuDQowMDAwMDAwMzAxIDAwMDAwIG4NCjAwMDAwMDAzODAgMDAwMDAgbg0KdHJhaWxlcg0KPDwNCi9TaXplIDYNCi9Sb290IDEgMCBSDQo+Pg0Kc3RhcnR4cmVmDQo0OTINCiUlRU9G',
    'base64'
  );
  
  fs.writeFileSync(testPDFPath, pdfContent);
  console.log('✅ Fichier PDF de test créé:', testPDFPath);
  return testPDFPath;
}

// Test de l'API de téléversement
async function testUploadAPI() {
  const testPDFPath = createTestPDF();
  
  try {
    console.log('🔍 Test de l\'API de téléversement...');
    
    // Créer FormData
    const FormData = require('form-data');
    const form = new FormData();
    
    form.append('file', fs.createReadStream(testPDFPath));
    form.append('nom', 'Document de test');
    form.append('description', 'Document de test pour diagnostiquer les problèmes de téléversement');
    form.append('type', 'formation');
    form.append('public', 'true');
    
    console.log('📤 Tentative de téléversement vers Cloudinary...');
    
    // Test Cloudinary
    const response1 = await fetch('http://localhost:3000/api/admin/documents/upload', {
      method: 'POST',
      body: form,
      headers: {
        // Ajouter les headers d'authentification si nécessaire
        'Cookie': 'next-auth.session-token=your-session-token'
      }
    });
    
    console.log('Status Cloudinary:', response1.status);
    
    if (response1.ok) {
      const result1 = await response1.json();
      console.log('✅ Téléversement Cloudinary réussi:', result1);
    } else {
      const error1 = await response1.json();
      console.log('❌ Erreur Cloudinary:', error1);
      
      // Test fallback local
      console.log('📤 Tentative de téléversement local...');
      
      const form2 = new FormData();
      form2.append('file', fs.createReadStream(testPDFPath));
      form2.append('nom', 'Document de test (local)');
      form2.append('description', 'Document de test stocké localement');
      form2.append('type', 'formation');
      form2.append('public', 'true');
      
      const response2 = await fetch('http://localhost:3000/api/admin/documents/upload/local', {
        method: 'POST',
        body: form2,
        headers: {
          'Cookie': 'next-auth.session-token=your-session-token'
        }
      });
      
      console.log('Status Local:', response2.status);
      
      if (response2.ok) {
        const result2 = await response2.json();
        console.log('✅ Téléversement local réussi:', result2);
      } else {
        const error2 = await response2.json();
        console.log('❌ Erreur local:', error2);
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    // Nettoyer le fichier de test
    if (fs.existsSync(testPDFPath)) {
      fs.unlinkSync(testPDFPath);
      console.log('🧹 Fichier de test supprimé');
    }
  }
}

// Vérifier les variables d'environnement
function checkEnvironment() {
  console.log('🔍 Vérification de l\'environnement...');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? '✅ Configuré' : '❌ Manquant');
  console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? '✅ Configuré' : '❌ Manquant');
  console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '✅ Configuré' : '❌ Manquant');
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Configuré' : '❌ Manquant');
  console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? '✅ Configuré' : '❌ Manquant');
}

// Exécuter les tests
async function runTests() {
  console.log('🚀 Démarrage des tests de téléversement...\n');
  
  checkEnvironment();
  console.log('');
  
  await testUploadAPI();
  
  console.log('\n✅ Tests terminés');
}

runTests().catch(console.error);
