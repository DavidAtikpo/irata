/**
 * Google Cloud Vision API pour OCR
 * Gratuit: 1000 requêtes/mois
 * Documentation: https://cloud.google.com/vision/docs/ocr
 */

import vision, { ImageAnnotatorClient } from '@google-cloud/vision';

// Configuration du client
let visionClient: ImageAnnotatorClient | null = null;

function getVisionClient(): ImageAnnotatorClient | null {
  // Vérifier si les credentials sont configurés
  if (!process.env.GOOGLE_CLOUD_CREDENTIALS && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.warn('⚠️ Google Cloud Vision non configuré. Variables manquantes: GOOGLE_CLOUD_CREDENTIALS ou GOOGLE_APPLICATION_CREDENTIALS');
    return null;
  }
  
  if (!visionClient) {
    try {
      // Si GOOGLE_CLOUD_CREDENTIALS est un JSON string
      if (process.env.GOOGLE_CLOUD_CREDENTIALS) {
        const credentials = JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS);
        visionClient = new ImageAnnotatorClient({ credentials });
        console.log('✅ Google Cloud Vision initialisé avec GOOGLE_CLOUD_CREDENTIALS');
      } else {
        // Sinon utiliser GOOGLE_APPLICATION_CREDENTIALS (chemin vers fichier JSON)
        visionClient = new ImageAnnotatorClient();
        console.log('✅ Google Cloud Vision initialisé avec GOOGLE_APPLICATION_CREDENTIALS');
      }
    } catch (error) {
      console.error('❌ Erreur initialisation Google Cloud Vision:', error);
      return null;
    }
  }
  
  return visionClient;
}

/**
 * Extraire le texte d'une image ou PDF avec Google Vision OCR
 */
export async function extractTextWithGoogleVision(buffer: Buffer): Promise<string> {
  const client = getVisionClient();
  
  if (!client) {
    throw new Error('Google Cloud Vision non configuré');
  }
  
  try {
    console.log('=== GOOGLE CLOUD VISION OCR ===');
    console.log('Taille du buffer:', buffer.length, 'bytes');
    
    // Appeler l'API Vision pour l'OCR
    const [result] = await client.textDetection({
      image: { content: buffer },
    });
    
    const detections = result.textAnnotations;
    
    if (!detections || detections.length === 0) {
      console.warn('⚠️ Aucun texte détecté par Google Vision');
      return '';
    }
    
    // Le premier élément contient tout le texte
    const fullText = detections[0]?.description || '';
    
    console.log('✅ Google Vision OCR réussi');
    console.log('Texte extrait:', fullText.length, 'caractères');
    console.log('Aperçu (500 chars):', fullText.substring(0, 500));
    
    return fullText;
    
  } catch (error: any) {
    console.error('❌ Erreur Google Vision OCR:', error.message || error);
    throw new Error(`Google Vision OCR échec: ${error.message || 'Erreur inconnue'}`);
  }
}

/**
 * Vérifier si Google Vision est disponible
 */
export function isGoogleVisionAvailable(): boolean {
  return !!getVisionClient();
}

/**
 * Convertir un PDF en image puis faire l'OCR
 * (pour les PDFs scannés)
 */
export async function extractTextFromPDFWithVision(pdfBuffer: Buffer): Promise<string> {
  console.log('=== CONVERSION PDF → IMAGE POUR OCR ===');
  
  try {
    // Pour un PDF, on peut soit :
    // 1. Envoyer directement le PDF (Google Vision supporte les PDFs)
    // 2. Convertir en image d'abord
    
    // Google Vision supporte directement les PDFs !
    return await extractTextWithGoogleVision(pdfBuffer);
    
  } catch (error: any) {
    console.error('❌ Erreur conversion PDF pour Vision:', error.message);
    throw error;
  }
}

