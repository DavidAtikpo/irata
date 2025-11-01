/**
 * Script de test pour l'extraction de texte depuis PDFs
 * Usage: node test-pdf-extraction.js path/to/file.pdf
 */

const fs = require('fs');
const path = require('path');

// Tester l'extraction avec pdfjs-dist
async function testPdfjsDist(buffer) {
  console.log('\n=== TEST PDFJS-DIST ===');
  try {
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
    pdfjsLib.GlobalWorkerOptions.workerSrc = '';
    
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(buffer),
      useSystemFonts: true,
    });
    
    const pdfDocument = await loadingTask.promise;
    console.log('✅ PDF chargé, nombre de pages:', pdfDocument.numPages);
    
    let fullText = '';
    for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
      const page = await pdfDocument.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += pageText + ' ';
      console.log(`Page ${pageNum}: ${pageText.length} caractères`);
    }
    
    console.log('\n✅ PDFJS-DIST RÉUSSI');
    console.log('Texte total:', fullText.length, 'caractères');
    console.log('Aperçu (500 chars):', fullText.substring(0, 500));
    return fullText.trim();
  } catch (error) {
    console.error('❌ PDFJS-DIST ÉCHEC:', error.message);
    return null;
  }
}

// Tester l'extraction avec pdf-parse
async function testPdfParse(buffer) {
  console.log('\n=== TEST PDF-PARSE ===');
  try {
    const pdfParse = require('pdf-parse');
    const pdfData = await pdfParse(buffer);
    
    console.log('✅ PDF-PARSE RÉUSSI');
    console.log('Nombre de pages:', pdfData.numpages);
    console.log('Texte total:', pdfData.text.length, 'caractères');
    console.log('Aperçu (500 chars):', pdfData.text.substring(0, 500));
    return pdfData.text;
  } catch (error) {
    console.error('❌ PDF-PARSE ÉCHEC:', error.message);
    return null;
  }
}

// Fonction principale
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node test-pdf-extraction.js path/to/file.pdf');
    console.log('\nExemple: node test-pdf-extraction.js public/uploads/qr_pdf_1761176497922.pdf');
    process.exit(1);
  }
  
  const filePath = args[0];
  
  if (!fs.existsSync(filePath)) {
    console.error('❌ Fichier introuvable:', filePath);
    process.exit(1);
  }
  
  console.log('📄 Fichier:', filePath);
  const buffer = fs.readFileSync(filePath);
  console.log('📦 Taille:', buffer.length, 'bytes');
  
  // Tester les deux méthodes
  const pdfjsText = await testPdfjsDist(buffer);
  const pdfParseText = await testPdfParse(buffer);
  
  // Comparaison
  console.log('\n=== COMPARAISON ===');
  console.log('pdfjs-dist:', pdfjsText ? `✅ ${pdfjsText.length} chars` : '❌ Échec');
  console.log('pdf-parse:', pdfParseText ? `✅ ${pdfParseText.length} chars` : '❌ Échec');
  
  if (pdfjsText && pdfParseText) {
    console.log('Différence de longueur:', Math.abs(pdfjsText.length - pdfParseText.length), 'chars');
  }
  
  // Extraction de données de test
  if (pdfjsText || pdfParseText) {
    const text = pdfjsText || pdfParseText || '';
    console.log('\n=== EXTRACTION DE DONNÉES ===');
    
    // Patterns de test
    const patterns = {
      produit: /VERTEX\s+VENT/i,
      reference: /A010CA[A-Z0-9]+/i,
      numeroSerie: /SN[:\s]*([A-Z0-9\-\/]+)/i,
      fabricant: /Petzl\s+Distribution/i,
      normes: /EN\s+397:2012/i,
    };
    
    for (const [key, pattern] of Object.entries(patterns)) {
      const match = text.match(pattern);
      console.log(`${key}:`, match ? `✅ ${match[0]}` : '❌ Non détecté');
    }
  }
}

main().catch(console.error);











