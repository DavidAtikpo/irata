/**
 * Extraction de texte depuis PDFs avec pdfjs-dist
 * Compatible avec Vercel et environnements serverless
 */

import { extractTextFromPDFWithVision, isGoogleVisionAvailable } from './google-vision-ocr';

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    console.log('=== EXTRACTION PDF AVEC PDFJS-DIST ===');
    console.log('Taille du buffer:', buffer.length, 'bytes');
    
    // Dynamically import pdfjs-dist
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
    
    // Important: Disable worker for serverless environment
    pdfjsLib.GlobalWorkerOptions.workerSrc = '';
    
    // Load PDF document
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(buffer),
      useSystemFonts: true,
      standardFontDataUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.9.155/standard_fonts/',
    });
    
    const pdfDocument = await loadingTask.promise;
    console.log('✅ PDF chargé, nombre de pages:', pdfDocument.numPages);
    
    let fullText = '';
    
    // Extract text from each page
    for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
      const page = await pdfDocument.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      // Combine text items
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      
      fullText += pageText + ' ';
      console.log(`Page ${pageNum}: ${pageText.length} caractères extraits`);
    }
    
    console.log('✅ Texte total extrait:', fullText.length, 'caractères');
    return fullText.trim();
    
  } catch (error: any) {
    console.error('❌ Erreur pdfjs-dist:', error.message || error);
    throw new Error(`Échec extraction PDF: ${error.message || 'Erreur inconnue'}`);
  }
}

/**
 * Fallback avec pdf-parse (pour environnements locaux)
 */
export async function extractTextFromPDFLegacy(buffer: Buffer): Promise<string> {
  try {
    console.log('=== EXTRACTION PDF AVEC PDF-PARSE (LEGACY) ===');
    
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require('pdf-parse');
    const pdfData = await pdfParse(buffer, { max: 0 });
    
    console.log('✅ pdf-parse réussi:', pdfData.text.length, 'caractères');
    return pdfData.text || '';
    
  } catch (error: any) {
    console.error('❌ Erreur pdf-parse:', error.message || error);
    throw new Error(`Échec extraction PDF (legacy): ${error.message || 'Erreur inconnue'}`);
  }
}

/**
 * Méthode principale avec fallback automatique
 * Ordre: pdfjs-dist → pdf-parse → Google Vision OCR
 */
export async function extractPDFText(buffer: Buffer): Promise<string> {
  // 1. Essayer d'abord pdf-parse (plus rapide et fonctionne pour les PDFs natifs)
  try {
    const text = await extractTextFromPDFLegacy(buffer);
    if (text && text.length > 50) { // Au moins 50 caractères pour être valide
      console.log('✅ Extraction réussie avec pdf-parse');
      return text;
    } else if (text && text.length > 0) {
      console.warn('⚠️ pdf-parse a extrait très peu de texte:', text.length, 'chars');
      console.log('Le PDF est probablement scanné (images). Tentative OCR...');
    }
  } catch (error) {
    console.warn('⚠️ pdf-parse a échoué, tentative avec pdfjs-dist...');
  }
  
  // 2. Fallback vers pdfjs-dist
  try {
    const text = await extractTextFromPDF(buffer);
    if (text && text.length > 50) {
      console.log('✅ Extraction réussie avec pdfjs-dist (fallback)');
      return text;
    }
  } catch (error) {
    console.warn('⚠️ pdfjs-dist a échoué');
  }
  
  // 3. Si tout échoue et que Google Vision est disponible, utiliser l'OCR
  if (isGoogleVisionAvailable()) {
    try {
      console.log('💡 Tentative OCR avec Google Cloud Vision (PDF scanné)...');
      const text = await extractTextFromPDFWithVision(buffer);
      if (text && text.length > 10) {
        console.log('✅ Extraction réussie avec Google Vision OCR');
        return text;
      }
    } catch (error: any) {
      console.error('❌ Google Vision OCR a échoué:', error.message);
    }
  } else {
    console.warn('⚠️ Google Vision OCR non disponible (credentials manquants)');
    console.log('💡 Configurez GOOGLE_CLOUD_CREDENTIALS pour activer l\'OCR gratuit');
  }
  
  throw new Error('Impossible d\'extraire le texte du PDF. Le document est peut-être scanné et nécessite OCR.');
}

