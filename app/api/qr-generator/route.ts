import { NextRequest, NextResponse } from 'next/server';
import { ImageAnnotatorClient } from '@google-cloud/vision';
import { v2 as cloudinary } from 'cloudinary';
import { prisma } from 'lib/prisma';
const pdf = require('pdf-parse');

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configuration Google Vision API
let vision: ImageAnnotatorClient | null = null;

try {
  const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  if (credentialsJson) {
    vision = new ImageAnnotatorClient({
      credentials: JSON.parse(credentialsJson),
    });
    console.log('✅ Google Vision initialisé avec succès');
  } else {
    console.warn('⚠️ GOOGLE_APPLICATION_CREDENTIALS_JSON non trouvé');
  }
} catch (error) {
  console.error('❌ Erreur initialisation Google Vision:', error);
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({
        error: 'Fichier trop volumineux',
        suggestion: 'Compressez le PDF avant de l\'uploader. Taille max: 10MB',
        helpLink: 'https://www.ilovepdf.com/compress_pdf'
      }, { status: 400 });
    }

    // Upload du fichier vers Cloudinary
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    const dataUri = `data:${file.type};base64,${base64}`;

    const uploadResult = await cloudinary.uploader.upload(dataUri, {
      resource_type: 'raw',
      folder: 'irata-equipment',
      public_id: `equipment-${Date.now()}`,
      access_mode: 'public',
      use_filename: true,
      unique_filename: true,
    });

    console.log('Fichier uploadé sur Cloudinary:', uploadResult.secure_url);

    let extractedData: any = {};

    // Extraction OCR pour les PDFs
    let fullText = '';
    if (type === 'pdf') {
      try {
        console.log('🧾 Extraction OCR du PDF...');
        const pdfData = await pdf(buffer);
        fullText = pdfData.text;
        console.log('Texte extrait:', fullText.length, 'caractères');
      } catch (pdfError) {
        console.error('Erreur extraction PDF:', pdfError);
      }
    }

    // Parser les données extraites
    if (fullText) {
      extractedData = parseEquipmentData(fullText);
      extractedData.rawText = fullText;
    } else {
      // Mode fallback si pas d'extraction
      console.log('Mode fallback: création d\'équipement avec données de base');
      extractedData = {
        produit: 'Équipement',
        reference: 'REF-' + Date.now(),
        numeroSerie: 'S/N-' + Date.now(),
        type: 'Type à définir',
        normes: 'Normes à définir',
        fabricant: 'Fabricant à définir',
        date: new Date().toLocaleDateString('fr-FR'),
        signataire: 'Signataire à définir',
        rawText: 'Les données doivent être saisies manuellement',
      };
    }
    
    const qrCode = generateQRCode();
    extractedData.pdfUrl = uploadResult.secure_url;
    extractedData.qrCode = qrCode;

    await saveEquipmentToDatabase(extractedData, qrCode, uploadResult.secure_url);
    
    const equipmentUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/qr-equipment/${qrCode}`;
    extractedData.equipmentUrl = equipmentUrl;

    return NextResponse.json({
      success: true,
      extractedData,
      message: `${type === 'pdf' ? 'PDF' : 'Image'} uploadé avec succès !`
    });

  } catch (error) {
    console.error('Erreur lors du traitement du fichier:', error);
    return NextResponse.json({
      error: 'Erreur interne du serveur',
      suggestion: 'Vérifiez la configuration des services Cloudinary et Prisma'
    }, { status: 500 });
  }
}

// Fonction pour parser les données d'équipement
function parseEquipmentData(text: string) {
  const data: any = {};

  const patterns = {
    nature: /nature[:\s]*([^\n\r]+)/i,
    produit: /product:\s*([^\n\r]+)|product[:\s]*([^\n\r]+)/i,
    reference: /reference:\s*([^\n\r]+)|reference[:\s]*([^\n\r]+)/i,
    numeroSerie: /numéro\s+de\s+série[:\s]*([^\n\r]+)|n°\s+série[:\s]*([^\n\r]+)|serial number[:\s]*([^\n\r]+)/i,
    type: /type[:\s]*([^\n\r]+)/i,
    normes: /normes?[:\s]*([^\n\r]+)|certificat[:\s]*([^\n\r]+)|applicable standards?[:\s]*([^\n\r]+)/i,
    fabricant: /manufacturer:\s*([^\n\r]+)|manufacturer[:\s]*([^\n\r]+)/i,
    date: /date[:\s]*([^\n\r]+)|contrôle[:\s]*([^\n\r]+)/i,
    signataire: /signataire[:\s]*([^\n\r]+)|signé\s+par[:\s]*([^\n\r]+)|declares[:\s]*([^\n\r]+)/i,
  };

  Object.entries(patterns).forEach(([key, pattern]) => {
    const match = text.match(pattern);
    if (match) {
      data[key] = (match[1] || match[2] || match[3] || '').trim();
    }
  });

  console.log('📋 Données parsées:', data);
  return data;
}

// Fonction pour générer un code QR unique
function generateQRCode(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `EQ-${timestamp}-${random}`.toUpperCase();
}

// Fonction pour sauvegarder l'équipement en base de données
async function saveEquipmentToDatabase(data: any, qrCode: string, pdfUrl: string) {
  try {
    await prisma.equipment.create({
      data: {
        qrCode,
        produit: data.produit || 'Non détecté',
        referenceInterne: data.reference || 'Non détecté',
        numeroSerie: data.numeroSerie || 'Non détecté',
        typeEquipement: data.type || 'Non détecté',
        normesCertificat: data.normes || 'Non détecté',
        fabricant: data.fabricant || 'Non détecté',
        dateControle: data.date || 'Non détecté',
        signataire: data.signataire || 'Non détecté',
        pdfUrl,
        rawText: data.rawText || '',
        createdAt: new Date(),
      }
    });
    console.log('Équipement sauvegardé en base:', qrCode);
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error);
    throw error;
  }
}