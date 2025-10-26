import { NextRequest, NextResponse } from 'next/server';
import { ImageAnnotatorClient } from '@google-cloud/vision';
import { v2 as cloudinary } from 'cloudinary';
import { prisma } from 'lib/prisma';

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configuration Google Vision API
const vision = new ImageAnnotatorClient({
  credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON || '{}'),
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
    }

    // Vérifier la taille du fichier (limite Cloudinary gratuite: 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({
        error: 'Fichier trop volumineux',
        suggestion: 'Compressez le PDF avant de l\'uploader. Taille max: 10MB',
        helpLink: 'https://www.ilovepdf.com/compress_pdf'
      }, { status: 400 });
    }

    // Upload du fichier vers Cloudinary
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const dataUri = `data:${file.type};base64,${base64}`;

    const uploadResult = await cloudinary.uploader.upload(dataUri, {
      resource_type: 'auto',
      folder: 'irata-equipment',
      public_id: `equipment-${Date.now()}`,
    });

    console.log('Fichier uploadé sur Cloudinary:', uploadResult.secure_url);

    let extractedData: any = {};

    if (type === 'pdf') {
      // Pour les PDFs, utiliser Google Vision API pour l'OCR
      try {
        const [result] = await vision.textDetection({
          image: {
            source: {
              imageUri: uploadResult.secure_url
            }
          }
        });

        const detections = result.textAnnotations;
        const fullText = detections?.[0]?.description || '';

        console.log('Texte extrait par OCR:', fullText);

        // Parser les données extraites
        extractedData = parseEquipmentData(fullText);
        extractedData.rawText = fullText;
        extractedData.pdfUrl = uploadResult.secure_url;

        // Générer un code QR unique
        const qrCode = generateQRCode();
        extractedData.qrCode = qrCode;

        // Sauvegarder en base de données
        await saveEquipmentToDatabase(extractedData, qrCode, uploadResult.secure_url);

        // Générer l'URL de l'équipement
        const equipmentUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/qr-equipment/${qrCode}`;
        extractedData.equipmentUrl = equipmentUrl;

      } catch (ocrError) {
        console.error('Erreur OCR:', ocrError);
        return NextResponse.json({
          error: 'Erreur lors de l\'extraction OCR du PDF',
          suggestion: 'Vérifiez que le PDF contient du texte lisible et non des images scannées',
          code: 'OCR_ERROR'
        }, { status: 500 });
      }

    } else {
      // Pour les images, utiliser Google Vision API directement
      try {
        const [result] = await vision.textDetection({
          image: {
            source: {
              imageUri: uploadResult.secure_url
            }
          }
        });

        const detections = result.textAnnotations;
        const fullText = detections?.[0]?.description || '';

        extractedData = parseEquipmentData(fullText);
        extractedData.rawText = fullText;
        extractedData.pdfUrl = uploadResult.secure_url;

        const qrCode = generateQRCode();
        extractedData.qrCode = qrCode;

        await saveEquipmentToDatabase(extractedData, qrCode, uploadResult.secure_url);

        const equipmentUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/qr-equipment/${qrCode}`;
        extractedData.equipmentUrl = equipmentUrl;

      } catch (ocrError) {
        console.error('Erreur OCR:', ocrError);
        return NextResponse.json({
          error: 'Erreur lors de l\'extraction OCR de l\'image',
          suggestion: 'Vérifiez que l\'image contient du texte lisible',
          code: 'OCR_ERROR'
        }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: true,
      extractedData,
      message: `${type === 'pdf' ? 'PDF' : 'Image'} analysé avec succès !`
    });

  } catch (error) {
    console.error('Erreur lors du traitement du fichier:', error);
    return NextResponse.json({
      error: 'Erreur interne du serveur',
      suggestion: 'Vérifiez la configuration des services Google Vision et Cloudinary'
    }, { status: 500 });
  }
}

// Fonction pour parser les données d'équipement
function parseEquipmentData(text: string) {
  const data: any = {};

  // Patterns de recherche pour différents champs
  const patterns = {
    nature: /nature[:\s]*([^\n\r]+)/i,
    produit: /produit[:\s]*([^\n\r]+)/i,
    reference: /référence[:\s]*([^\n\r]+)|ref[:\s]*([^\n\r]+)/i,
    numeroSerie: /numéro\s+de\s+série[:\s]*([^\n\r]+)|n°\s+série[:\s]*([^\n\r]+)/i,
    type: /type[:\s]*([^\n\r]+)/i,
    normes: /normes?[:\s]*([^\n\r]+)|certificat[:\s]*([^\n\r]+)/i,
    fabricant: /fabricant[:\s]*([^\n\r]+)|manufacturer[:\s]*([^\n\r]+)/i,
    date: /date[:\s]*([^\n\r]+)|contrôle[:\s]*([^\n\r]+)/i,
    signataire: /signataire[:\s]*([^\n\r]+)|signé\s+par[:\s]*([^\n\r]+)/i,
  };

  // Extraire les données avec les patterns
  Object.entries(patterns).forEach(([key, pattern]) => {
    const match = text.match(pattern);
    if (match) {
      data[key] = match[1] || match[2] || match[3] || '';
    }
  });

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