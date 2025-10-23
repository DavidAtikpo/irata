/**
 * Script de test local pour Google Cloud Vision
 * Usage: node test-google-vision-local.js
 */

require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');

async function testGoogleVision() {
  console.log('\n=== TEST GOOGLE CLOUD VISION LOCAL ===\n');
  
  // Vérifier les variables d'environnement
  console.log('1. Vérification des variables d\'environnement:');
  const hasCredentials = !!process.env.GOOGLE_CLOUD_CREDENTIALS;
  const hasAppCredentials = !!process.env.GOOGLE_APPLICATION_CREDENTIALS;
  
  console.log(`   GOOGLE_CLOUD_CREDENTIALS: ${hasCredentials ? '✅ Configuré' : '❌ Non configuré'}`);
  console.log(`   GOOGLE_APPLICATION_CREDENTIALS: ${hasAppCredentials ? '✅ Configuré' : '❌ Non configuré'}`);
  
  if (!hasCredentials && !hasAppCredentials) {
    console.error('\n❌ Aucune variable d\'environnement configurée !');
    console.log('💡 Configurez GOOGLE_CLOUD_CREDENTIALS dans .env.local\n');
    return;
  }
  
  // Charger la bibliothèque
  console.log('\n2. Chargement de @google-cloud/vision:');
  let vision;
  try {
    vision = require('@google-cloud/vision');
    console.log('   ✅ Bibliothèque chargée');
  } catch (error) {
    console.error('   ❌ Erreur:', error.message);
    console.log('   💡 Exécutez: npm install @google-cloud/vision');
    return;
  }
  
  // Initialiser le client
  console.log('\n3. Initialisation du client:');
  let client;
  try {
    if (process.env.GOOGLE_CLOUD_CREDENTIALS) {
      const credentials = JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS);
      client = new vision.ImageAnnotatorClient({ credentials });
      console.log('   ✅ Client initialisé avec GOOGLE_CLOUD_CREDENTIALS');
      console.log(`   Project ID: ${credentials.project_id}`);
      console.log(`   Client Email: ${credentials.client_email}`);
    } else {
      client = new vision.ImageAnnotatorClient();
      console.log('   ✅ Client initialisé avec GOOGLE_APPLICATION_CREDENTIALS');
    }
  } catch (error) {
    console.error('   ❌ Erreur:', error.message);
    return;
  }
  
  // Tester avec un PDF
  console.log('\n4. Test OCR avec le PDF:');
  const pdfPath = path.join(__dirname, 'public', 'uploads', 'qr_pdf_1761176497922.pdf');
  
  if (!fs.existsSync(pdfPath)) {
    console.error(`   ❌ Fichier non trouvé: ${pdfPath}`);
    console.log('   💡 Uploadez d\'abord un PDF via l\'interface');
    return;
  }
  
  console.log(`   Fichier: ${path.basename(pdfPath)}`);
  const fileSize = fs.statSync(pdfPath).size;
  console.log(`   Taille: ${(fileSize / (1024 * 1024)).toFixed(2)} MB`);
  
  try {
    const buffer = fs.readFileSync(pdfPath);
    console.log('   📄 Fichier lu, envoi à Google Vision...');
    
    const [result] = await client.textDetection({
      image: { content: buffer },
    });
    
    const detections = result.textAnnotations;
    
    if (!detections || detections.length === 0) {
      console.log('   ⚠️ Aucun texte détecté par Google Vision');
      console.log('   Le PDF est probablement scanné et Google Vision n\'a pas pu extraire le texte');
    } else {
      const fullText = detections[0]?.description || '';
      console.log(`   ✅ Texte extrait: ${fullText.length} caractères`);
      console.log('\n   Aperçu (500 premiers caractères):');
      console.log('   ' + '-'.repeat(60));
      console.log('   ' + fullText.substring(0, 500).replace(/\n/g, '\n   '));
      console.log('   ' + '-'.repeat(60));
      
      // Tester les regex d'extraction
      console.log('\n5. Test d\'extraction de données:');
      const produit = fullText.match(/VERTEX\s+VENT/i)?.[0];
      const reference = fullText.match(/A010CA[A-Z0-9]+/i)?.[0];
      const fabricant = fullText.match(/Petzl\s+Distribution/i)?.[0];
      
      console.log(`   Produit: ${produit || '❌ Non détecté'}`);
      console.log(`   Référence: ${reference || '❌ Non détecté'}`);
      console.log(`   Fabricant: ${fabricant || '❌ Non détecté'}`);
    }
    
    console.log('\n✅ TEST TERMINÉ AVEC SUCCÈS !\n');
    
  } catch (error) {
    console.error('\n   ❌ Erreur lors de l\'appel à Google Vision:');
    console.error('   ', error.message);
    if (error.code) console.error('   Code:', error.code);
    if (error.details) console.error('   Détails:', error.details);
    console.log('\n');
  }
}

testGoogleVision().catch(console.error);

