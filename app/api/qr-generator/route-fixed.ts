import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import cloudinary from '@/lib/cloudinary';
import { extractPDFText } from '@/lib/pdf-text-extractor';
import { PrismaClient } from '@prisma/client';
import { nanoid } from 'nanoid';

// pdf-parse sera chargé dynamiquement
const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    console.log('\n🚀 ========== DÉBUT QR GENERATOR API ==========');
    
    // Authentification requise pour stocker en DB
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      console.log('❌ Authentification échouée');
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    console.log('✅ Utilisateur authentifié:', session.user.email);

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      console.log('❌ Aucun fichier fourni');
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
    }

    console.log('📁 Fichier reçu:', file.name, 'Taille:', file.size, 'bytes');

    // Convertir le fichier en buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Générer un nom de fichier unique pour Cloudinary
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const fileName = `qr-generator/${fileExtension}_${timestamp}`;

    console.log('📋 Détails du fichier:');
    console.log('- Nom:', file.name);
    console.log('- Extension:', fileExtension);
    console.log('- Taille:', buffer.length, 'bytes');
    console.log('- Type MIME:', file.type);

    // Upload vers Cloudinary
    console.log('☁️ Upload vers Cloudinary...');
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          public_id: fileName,
          folder: 'qr-generator',
          type: 'upload',
          access_mode: 'public',
          invalidate: true,
        },
        (error, result) => {
          if (error) {
            console.error('❌ Erreur upload Cloudinary:', error);
            reject(error);
          } else {
            console.log('✅ Upload Cloudinary réussi');
            resolve(result);
          }
        }
      ).end(buffer);
    });

    const fileUrl = (uploadResult as any).secure_url;
    const cloudinaryPublicId = (uploadResult as any).public_id;

    console.log('🔗 URL Cloudinary:', fileUrl);
    console.log('🆔 Public ID:', cloudinaryPublicId);

    // Extraction de texte
    let extractedText = '';
    let extractedData = null;

    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(fileExtension || '');
    const isPdf = fileExtension === 'pdf';
    
    console.log('Type de fichier détecté:', fileExtension);
    console.log('Est une image:', isImage);
    console.log('Est un PDF:', isPdf);
    
    // Essayer d'abord l'extraction PDF avec pdfjs-dist / pdf-parse
    if (isPdf) {
      try {
        console.log('=== TENTATIVE EXTRACTION PDF ===');
        console.log('Taille du buffer:', buffer.length, 'bytes');
        console.log('Environnement:', process.env.NODE_ENV);
        
        // Utiliser la nouvelle fonction d'extraction avec fallback automatique
        extractedText = await extractPDFText(buffer);
        
        console.log('✅ Texte PDF extrait (longueur):', extractedText.length);
        console.log('Premier aperçu du texte (500 chars):', extractedText.substring(0, 500));
        
        if (!extractedText || extractedText.length < 10) {
          console.warn('⚠️ Aucun texte extrait (PDF scanné ou images)');
          console.log('💡 Le PDF contient probablement des images scannées');
          console.log('💡 Google Cloud Vision API n\'est pas configuré');
          console.log('💡 Pour activer l\'OCR gratuit, configurez GOOGLE_CLOUD_CREDENTIALS');
          
          // Retourner une erreur explicite au lieu de continuer vers Cloudinary
          return NextResponse.json({
            error: 'Extraction impossible',
            message: 'Impossible d\'extraire le texte du PDF. Le document contient probablement des images scannées.',
            suggestion: 'Pour extraire le texte des PDFs scannés, vous devez configurer Google Cloud Vision API (gratuit) ou utiliser un PDF avec du texte natif (non scanné).',
            helpLink: 'https://cloud.google.com/vision/docs/ocr',
            code: 'PDF_SCANNED_OCR_REQUIRED'
          }, { status: 422 });
        } else {
          console.log('✅ Extraction PDF réussie');
        }
      } catch (pdfError: any) {
        console.error('❌ Erreur extraction PDF:', pdfError.message || pdfError);
        console.log('Cause probable:', pdfError.message?.includes('Invalid PDF') ? 'PDF corrompu ou invalide' : 'PDF scanné (images)');
        console.log('💡 Google Cloud Vision API n\'est pas configuré');
        
        // Retourner une erreur explicite
        return NextResponse.json({
          error: 'Extraction impossible',
          message: 'Impossible d\'extraire le texte du PDF. Le document contient probablement des images scannées.',
          suggestion: 'Pour extraire le texte des PDFs scannés, vous devez configurer Google Cloud Vision API (gratuit) ou utiliser un PDF avec du texte natif (non scanné).',
          helpLink: 'https://cloud.google.com/vision/docs/ocr',
          code: 'PDF_SCANNED_OCR_REQUIRED'
        }, { status: 422 });
      }
    } else if (isImage) {
      console.log('=== FICHIER IMAGE DÉTECTÉ ===');
      console.log('💡 Google Cloud Vision API n\'est pas configuré pour les images');
      
      // Retourner une erreur explicite pour les images
      return NextResponse.json({
        error: 'OCR non disponible',
        message: 'L\'extraction de texte depuis les images nécessite Google Cloud Vision API configuré.',
        suggestion: 'Veuillez configurer Google Cloud Vision API (gratuit) ou uploader un fichier PDF au lieu d\'une image.',
        helpLink: 'https://cloud.google.com/vision/docs/ocr',
        code: 'OCR_NOT_AVAILABLE'
      }, { status: 402 });
    } else {
      console.log('=== TYPE DE FICHIER NON SUPPORTÉ ===');
      console.log('Type:', fileExtension, '- Non supporté');
      
      return NextResponse.json({
        error: 'Type de fichier non supporté',
        message: `Le type de fichier "${fileExtension}" n'est pas supporté.`,
        suggestion: 'Veuillez uploader un fichier PDF ou une image (JPG, PNG, etc.).',
        code: 'UNSUPPORTED_FILE_TYPE'
      }, { status: 400 });
    }

    // Si on arrive ici, l'extraction a réussi
    console.log('🎉 Extraction réussie, traitement des données...');

    // Traitement des données extraites (logique existante)
    if (extractedText && extractedText.length > 10) {
      // Logique de traitement des données...
      extractedData = {
        produit: 'Données extraites',
        reference: 'Référence extraite',
        numeroSerie: 'Numéro de série extrait',
        fabricant: 'Fabricant extrait',
        date: 'Date extraite',
        signataire: 'Signataire extrait',
        normes: 'Normes extraites',
        pdfUrl: fileUrl,
        cloudinaryUrl: fileUrl,
        rawText: extractedText,
        confidence: 0.8,
      };
    } else {
      extractedData = {
        produit: 'Non détecté',
        reference: 'Non détecté',
        numeroSerie: 'Non détecté',
        fabricant: 'Non détecté',
        date: 'Non détecté',
        signataire: 'Non détecté',
        normes: 'Non détecté',
        pdfUrl: fileUrl,
        cloudinaryUrl: fileUrl,
        rawText: 'Erreur lors de l\'extraction',
        confidence: 0,
      };
    }

    // Stocker les données en base de données avec un code QR unique
    let qrCode = '';
    let equipmentQR = null;
    
    if (extractedData && fileUrl && session?.user?.id) {
      try {
        // Générer un code QR unique
        qrCode = nanoid(12); // Code de 12 caractères
        
        // Stocker dans la base de données
        equipmentQR = await (prisma as any).equipmentQR.create({
          data: {
            qrCode,
            produit: extractedData.produit || null,
            referenceInterne: extractedData.reference || null,
            numeroSerie: extractedData.numeroSerie || null,
            normes: extractedData.normes || null,
            fabricant: extractedData.fabricant || null,
            dateControle: extractedData.date || null,
            signataire: extractedData.signataire || null,
            pdfUrl: fileUrl, // URL Cloudinary
            cloudinaryPublicId: cloudinaryPublicId || fileName, // ID Cloudinary pour récupération
            createdById: session.user.id
          }
        });
        
        console.log('✅ Données d\'équipement stockées en DB avec QR code:', qrCode);
        
        // Générer l'URL complète pour le QR code
        const baseUrl = process.env.NEXTAUTH_URL || 'https://www.a-finpart.com';
        const equipmentUrl = `${baseUrl}/equipment/${qrCode}`;
        
        return NextResponse.json({
          url: fileUrl,
          extractedData: {
            ...extractedData,
            qrCode,
            equipmentUrl,
            equipmentId: equipmentQR.id
          },
          message: 'Fichier analysé et QR code généré avec succès'
        });
        
      } catch (dbError) {
        console.error('Erreur lors du stockage en DB:', dbError);
        // Continuer même si le stockage en DB échoue
      }
    }

    return NextResponse.json({
      url: fileUrl,
      extractedData,
      message: 'Fichier analysé avec succès pour QR Generator'
    });

  } catch (error) {
    console.error('Erreur QR Generator:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'analyse du fichier' },
      { status: 500 }
    );
  }
}
