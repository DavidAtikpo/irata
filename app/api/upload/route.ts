import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import cloudinary from '@/lib/cloudinary';
import { ImageAnnotatorClient } from '@google-cloud/vision';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
// @ts-expect-error - qrcode-reader doesn't have TypeScript declarations
import QRCodeReader from 'qrcode-reader';

// Import statique de pdf-parse comme dans qr-generator (fonctionne en production)
// @ts-expect-error - pdf-parse does not have type definitions
import pdf from 'pdf-parse';

// Initialisation Google Vision (utilisé en priorité en production pour OCR d'images)
let vision: ImageAnnotatorClient | null = null;
try {
  const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  if (credentialsJson) {
    vision = new ImageAnnotatorClient({ credentials: JSON.parse(credentialsJson) as any });
    console.log('✅ Google Vision initialisé');
  } else {
    console.log('ℹ️ GOOGLE_APPLICATION_CREDENTIALS_JSON non défini');
  }
} catch (visionInitError) {
  console.error('❌ Erreur initialisation Google Vision:', (visionInitError as Error).message);
  vision = null;
}

async function extractTextWithVision(buffer: Buffer): Promise<string> {
  try {
    if (!vision) return '';
    const [result] = await vision.textDetection({ image: { content: buffer } as any });
    const annotations = result.textAnnotations || [];
    if (annotations.length === 0) return '';
    // Le premier élément contient tout le texte détecté
    return annotations[0].description || '';
  } catch (e) {
    console.error('Vision OCR - erreur:', (e as Error).message);
    return '';
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
    }

    // Convertir le fichier en buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Générer un nom de fichier unique pour Cloudinary
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `equipment-inspections/${type}_${timestamp}`;

    // Upload vers Cloudinary
    // Pour le type 'pdf', ne pas faire d'upload initial car il y aura un upload spécifique plus tard
    // Utiliser 'raw' pour les signatures et dateAchat, 'auto' pour les autres types
    let fileUrl: string | null = null;
    
    if (type !== 'pdf') {
      const resourceType = (type === 'signature' || type === 'dateAchat') ? 'raw' : 'auto';
      
      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            resource_type: resourceType,
            public_id: fileName,
            access_mode: 'public',
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(buffer);
      });

      fileUrl = (uploadResult as any).secure_url;
    }

    // Extraction de données selon le type
    let extractedData = null;

    if (type === 'qrcode') {
      // Upload local du QR code pour traitement côté client
      try {
        const uploadsDir = join(process.cwd(), 'public', 'uploads');
        if (!existsSync(uploadsDir)) {
          await mkdir(uploadsDir, { recursive: true });
        }
        
        const localFileName = `qrcode_${timestamp}.${fileExtension}`;
        const localFilePath = join(uploadsDir, localFileName);
        await writeFile(localFilePath, buffer);
        const localFileUrl = `/uploads/${localFileName}`;
        
        console.log('QR Code - Uploadé localement:', localFileUrl);
        
        // Retourner l'URL pour traitement côté client
        // L'extraction sera faite côté frontend avec une bibliothèque compatible
        extractedData = {
          // Champs d'inspection existants
          referenceInterne: '',
          numeroSerie: '',
          dateFabrication: '',
          typeEquipement: '',
          
          // Nouveaux champs du QR Generator
          fabricant: '',
          nature: '',
          reference: '',
          type: '',
          normes: '',
          date: '',
          signataire: '',
          
          // Champs de mapping pour compatibilité
          normesCertificat: '',
          documentsReference: '', // Ne pas mapper reference vers documentsReference
          dateAchat: '',
          
          rawText: 'QR Code uploadé - extraction côté client requise',
          confidence: 0,
          localFileUrl: localFileUrl
        };
        
      } catch (qrError) {
        console.error('Erreur QR Code:', qrError);
      extractedData = {
          // Champs d'inspection existants
          referenceInterne: '',
          numeroSerie: '',
          dateFabrication: '',
          typeEquipement: '',
          
          // Nouveaux champs du QR Generator
          fabricant: '',
          nature: '',
          reference: '',
          type: '',
          normes: '',
          date: '',
          signataire: '',
          
          // Champs de mapping pour compatibilité
          normesCertificat: '',
          documentsReference: '', // Ne pas mapper reference vers documentsReference
          dateAchat: '',
          
          rawText: 'Erreur lors de l\'upload QR',
          confidence: 0
        };
      }
    } else if (type === 'pdf') {
      // Extraction rapide de PDF avec upload local + OCR Cloudinary
      // Déclarer les variables en dehors du try pour qu'elles soient accessibles dans le catch
      let localFileUrl: string | null = null;
      
      // Essayer d'uploader localement (fonctionne seulement en local, pas en production)
      try {
        const uploadsDir = join(process.cwd(), 'public', 'uploads');
        if (!existsSync(uploadsDir)) {
          await mkdir(uploadsDir, { recursive: true });
        }
        
        const localFileName = `pdf_${timestamp}.pdf`;
        const localFilePath = join(uploadsDir, localFileName);
        await writeFile(localFilePath, buffer);
        localFileUrl = `/uploads/${localFileName}`;
      } catch (localError) {
        // En production (Vercel, etc.), l'écriture locale peut échouer - ce n'est pas grave
        console.log('PDF - Upload local non disponible (normal en production):', (localError as Error).message);
        localFileUrl = null;
      }
      
      let extractedText = '';
      let cloudinaryPdfUrl: string | null = null;
      
      try {
        // 2. Upload vers Cloudinary et extraction réelle
        
        try {
          // Upload vers Cloudinary pour stockage
          const cloudinaryResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
              {
                resource_type: 'raw',
                public_id: `equipment-inspections/pdf/${type}_${timestamp}`,
                folder: 'equipment-inspections/pdf',
                access_mode: 'public',
              },
              (error, result) => {
                if (error) reject(error);
                else resolve(result);
              }
            ).end(buffer);
          });
          
          // Extraire l'URL Cloudinary du résultat
          cloudinaryPdfUrl = (cloudinaryResult as any).secure_url;
          
          // Extraction simplifiée (comme qr-generator qui fonctionne)
          console.log('PDF - Extraction avec pdf-parse...');
          try {
            const pdfData = await pdf(buffer);
            extractedText = pdfData.text;
            console.log('PDF - Extraction réussie, longueur du texte:', extractedText.length);
          } catch (pdfError) {
            console.error('PDF - Erreur extraction:', pdfError);
            extractedText = '';
          }
          
        } catch (cloudinaryError) {
          console.error('Erreur Cloudinary OCR:', cloudinaryError);
          // Pas de fallback - laisser vide pour voir l'erreur
          extractedText = '';
        }
        
        // Debug: Afficher le texte extrait pour diagnostiquer
        console.log('PDF - Texte extrait complet:', extractedText);
        console.log('PDF - Longueur du texte:', extractedText.length);
        
        // Fonction pour normaliser et dédupliquer les normes
        const normalizeAndDeduplicateNormes = (matches: string[]): string => {
          // Map pour stocker les normes dédupliquées (clé = numéro de base, valeur = version complète avec année)
          const normesMap = new Map<string, string>();
          
          matches.forEach((norme: string) => {
            const trimmed = norme.trim();
            if (!trimmed) return;
            
            // Extraire le numéro de base (ex: "EN 361" de "EN 361: 2002")
            const baseMatch = trimmed.match(/^(EN|ISO|CE|NF)\s*(\d+)/i);
            if (!baseMatch) return;
            
            const prefix = baseMatch[1].toUpperCase();
            const number = baseMatch[2];
            const baseKey = `${prefix} ${number}`;
            
            // Normaliser le format : EN 361: 2002 ou EN 361 : 2002 → EN 361: 2002
            let normalized = trimmed
              .replace(/\s*:\s*/g, ': ') // Normaliser les espaces autour des deux-points
              .replace(/\s+/g, ' ') // Normaliser les espaces multiples
              .trim();
            
            // Si on a une année, s'assurer qu'elle est bien formatée
            const yearMatch = normalized.match(/:\s*(\d{4})/);
            if (yearMatch) {
              normalized = normalized.replace(/:\s*\d{4}/, `: ${yearMatch[1]}`);
            }
            
            // Si cette norme n'existe pas encore, la garder
            if (!normesMap.has(baseKey)) {
              normesMap.set(baseKey, normalized);
            } else {
              // Si elle existe déjà, garder la version avec l'année si disponible
              const existing = normesMap.get(baseKey) || '';
              if (normalized.includes(':') && !existing.includes(':')) {
                normesMap.set(baseKey, normalized);
              }
            }
          });
          
          // Retourner les normes dédupliquées
          return Array.from(normesMap.values()).join(' ');
        };
        
        // Rechercher les normes avec plusieurs approches
        let normes = 'Normes non détectées';
        const allNormesMatches: string[] = [];
        
        // Pattern 1: EN 397 :2012 + A1 :2012
        const pattern1 = /(?:EN|ISO|CE|NF)\s*\d+\s*:\s*\d{4}\s*\+\s*[A-Z]\d+\s*:\s*\d{4}/gi;
        // Pattern 2: EN 12492 :2012
        const pattern2 = /(?:EN|ISO|CE|NF)\s*\d+\s*:\s*\d{4}/gi;
        // Pattern 3: EN 397:2012+A1:2012 (sans espaces)
        const pattern3 = /(?:EN|ISO|CE|NF)\s*\d+:\d{4}\+[A-Z]\d+:\d{4}/gi;
        // Pattern 4: EN 397:2012 (sans espaces)
        const pattern4 = /(?:EN|ISO|CE|NF)\s*\d+:\d{4}/gi;
        // Pattern 5: EN 397 (juste le numéro)
        const pattern5 = /(?:EN|ISO|CE|NF)\s*\d+/gi;
        
        const allPatterns = [pattern1, pattern2, pattern3, pattern4, pattern5];
        
        allPatterns.forEach(pattern => {
          const matches = extractedText.match(pattern);
          if (matches) {
            allNormesMatches.push(...matches);
          }
        });
        
        // Si toujours rien trouvé, recherche très large
        if (allNormesMatches.length === 0) {
          console.log('PDF - Tentative de recherche très large...');
          const veryBroadMatch = extractedText.match(/EN\s*\d+/gi);
          if (veryBroadMatch) {
            allNormesMatches.push(...veryBroadMatch);
          }
        }
        
        if (allNormesMatches.length > 0) {
          // Normaliser et dédupliquer les normes
          normes = normalizeAndDeduplicateNormes(allNormesMatches);
          console.log('PDF - Normes trouvées et dédupliquées:', normes);
        }
        
        // Rechercher les références de documents
        const referenceMatch = extractedText.match(/(notice|procédure|manuel|guide|instruction|référence)/gi);
        let reference = 'Documents de référence non détectés';
        if (referenceMatch) {
          // Dédupliquer les références en gardant l'ordre d'apparition
          const uniqueReferences = [...new Set(referenceMatch.map((ref: string) => ref.trim()))];
          reference = uniqueReferences.join(' / ');
        }
        
        // Rechercher la date de fabrication (plus spécifique)
        const dateFabricationMatch = extractedText.match(/Date de fabrication:\s*(\d{4})/i);
        const dateFabrication = dateFabricationMatch ? dateFabricationMatch[1] : 'Date non détectée';
        
        // Rechercher la date d'achat (plus spécifique)
        const dateAchatMatch = extractedText.match(/Date d'achat:\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i);
        let dateAchat = 'Date non détectée';
        if (dateAchatMatch) {
          const rawDate = dateAchatMatch[1];
          if (rawDate.includes('/')) {
            const [day, month, year] = rawDate.split('/');
            const fullYear = year.length === 2 ? `20${year}` : year;
            dateAchat = `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
          } else {
            dateAchat = rawDate;
          }
        }
        
        // Rechercher le numéro de série (plus spécifique)
        const numeroSerieMatch = extractedText.match(/Numéro de série:\s*(SN[A-Z0-9]+)/i);
        const numeroSerie = numeroSerieMatch ? numeroSerieMatch[1] : 'Numéro non détecté';
        
        // Rechercher la référence interne
        const referenceInterneMatch = extractedText.match(/Référence interne:\s*(CI\.CA\s*[A-Z0-9\s]+?)(?=\s*Type|$)/i);
        let referenceInterne = referenceInterneMatch ? referenceInterneMatch[1].trim() : 'CI.CA 24 000';
        
        // Concaténer le numéro de série à la référence interne si les deux sont détectés
        if (numeroSerie !== 'Numéro non détecté') {
          referenceInterne = `${referenceInterne} ${numeroSerie}`;
        }
        
        // Rechercher le type d'équipement
        const typeEquipementMatch = extractedText.match(/Type d'équipement:\s*([A-Za-z\s]+)/i);
        const typeEquipement = typeEquipementMatch ? typeEquipementMatch[1].trim() : 'Casque';
        
        extractedData = {
          referenceInterne: referenceInterne,
          numeroSerie: numeroSerie,
          dateFabrication: dateFabrication,
          typeEquipement: typeEquipement,
          normes: normes,
          reference: reference,
          dateAchat: dateAchat,
          pdfUrl: cloudinaryPdfUrl || localFileUrl || '', // Utiliser l'URL Cloudinary en priorité
          cloudinaryUrl: cloudinaryPdfUrl || localFileUrl || '', // Garder l'URL Cloudinary pour le stockage
          rawText: extractedText,
          confidence: 95, // Simulation de confiance élevée
          // URLs pour les liens cliquables
          referenceUrl: cloudinaryPdfUrl || localFileUrl || '', // URL Cloudinary pour les références
          dateAchatUrl: cloudinaryPdfUrl || localFileUrl || '' // URL Cloudinary pour la date d'achat
        };
      } catch (ocrError) {
        console.error('Erreur OCR PDF:', ocrError);
        // Fallback vers une extraction manuelle ou simulation
        extractedData = {
          normes: 'Normes non détectées - Veuillez saisir manuellement',
          reference: 'Documents de référence non détectés',
          dateFabrication: 'Date non détectée',
          dateAchat: 'Date non détectée',
          numeroSerie: 'Numéro non détecté',
          pdfUrl: cloudinaryPdfUrl || localFileUrl || '',
          rawText: 'Erreur lors de l\'extraction OCR',
          confidence: 0
        };
      }
    } else if (type === 'dateAchat') {
      // Extraction de date d'achat depuis un PDF avec la même procédure que les normes
      try {
        // 1. Upload local rapide
        const uploadsDir = join(process.cwd(), 'public', 'uploads');
        if (!existsSync(uploadsDir)) {
          await mkdir(uploadsDir, { recursive: true });
        }
        
        const localFileName = `dateAchat_${timestamp}.pdf`;
        const localFilePath = join(uploadsDir, localFileName);
        await writeFile(localFilePath, buffer);
        const localFileUrl = `/uploads/${localFileName}`;
        
        // 2. Upload vers Cloudinary pour stockage
        const cloudinaryResult = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            {
              resource_type: 'raw',
              public_id: `equipment-inspections/dateAchat/${type}_${timestamp}`,
              folder: 'equipment-inspections/dateAchat',
              access_mode: 'public',
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          ).end(buffer);
        });
        
        // 3. Extraction réelle selon le type de fichier
        console.log('DateAchat - Type de fichier:', file.type);
        
        let extractedText = '';
        let extractedDate = null;
        
        if (file.type === 'application/pdf') {
          // Si c'est un PDF, utiliser pdf-parse
          console.log('DateAchat - Tentative d\'extraction PDF avec pdf-parse...');
          try {
            const pdfData = await pdf(buffer);
            extractedText = pdfData.text;
            console.log('DateAchat - Extraction PDF réussie, longueur:', extractedText.length);
            console.log('DateAchat - Texte complet extrait:', extractedText);
          } catch (pdfError) {
            console.log('DateAchat - Erreur pdf-parse:', (pdfError as Error).message);
            extractedText = '';
          }
        } else {
          // Si c'est une image, utiliser Cloudinary OCR (même si ça peut échouer)
          console.log('DateAchat - Tentative d\'extraction image avec Cloudinary OCR...');
          try {
            const ocrResult = await new Promise((resolve, reject) => {
              cloudinary.uploader.upload_stream(
                {
                  resource_type: 'image',
                  ocr: 'adv_ocr',
                  public_id: `equipment-inspections/ocr/dateAchat_${timestamp}`,
                  access_mode: 'public',
                },
                (error, result) => {
                  if (error) reject(error);
                  else resolve(result);
                }
              ).end(buffer);
            });
            
            extractedText = (ocrResult as any).ocr?.adv_ocr?.data?.[0]?.text || '';
            console.log('DateAchat - Extraction OCR réussie, longueur:', extractedText.length);
            console.log('DateAchat - Texte complet extrait:', extractedText);
          } catch (ocrError) {
            console.log('DateAchat - Erreur OCR (abonnement requis):', (ocrError as Error).message);
            extractedText = '';
          }
        }
        
        // Rechercher la date d'achat avec plusieurs patterns
        const datePatterns = [
          // Patterns standards
          /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/g,
          /(\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2})/g,
          /(\d{1,2}\s+(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\s+\d{2,4})/gi,
          /(\d{2,4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2})/g,
          // Patterns plus larges pour capturer plus de formats
          /(\d{1,2}\s*[\/\-\.]\s*\d{1,2}\s*[\/\-\.]\s*\d{2,4})/g,
          /(\d{2,4}\s*[\/\-\.]\s*\d{1,2}\s*[\/\-\.]\s*\d{1,2})/g,
          // Patterns pour dates avec espaces
          /(\d{1,2}\s+\d{1,2}\s+\d{2,4})/g,
          /(\d{2,4}\s+\d{1,2}\s+\d{1,2})/g,
          // Patterns très larges pour capturer toute séquence de chiffres
          /(\d{1,4}[^\d]*\d{1,2}[^\d]*\d{1,4})/g,
          // Patterns pour années seules (2020, 2021, etc.)
          /(20\d{2})/g,
          // Patterns pour mois/année (03/2024, 03-2024)
          /(\d{1,2}[\/\-]20\d{2})/g,
          // Patterns pour jour/mois/année sans séparateur (15032024)
          /(\d{1,2}\d{2}20\d{2})/g,
          // Patterns pour dates en format américain (MM/DD/YYYY)
          /(\d{1,2}\/\d{1,2}\/20\d{2})/g
        ];

        for (let i = 0; i < datePatterns.length; i++) {
          const pattern = datePatterns[i];
          const matches = extractedText.match(pattern);
          console.log(`DateAchat - Pattern ${i + 1} testé:`, pattern.toString(), 'Résultat:', matches);
          
          if (matches && matches.length > 0) {
            const rawDate = matches[0];
            console.log('DateAchat - Date trouvée avec pattern', i + 1, ':', rawDate);
            
            // Convertir le format de date détecté
            if (rawDate.includes('/')) {
              const parts = rawDate.split('/');
              if (parts.length === 3) {
                const [day, month, year] = parts;
                const fullYear = year.length === 2 ? `20${year}` : year;
                extractedDate = `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                break;
              } else if (parts.length === 2) {
                // Format MM/YYYY
                const [month, year] = parts;
                const fullYear = year.length === 2 ? `20${year}` : year;
                extractedDate = `${fullYear}-${month.padStart(2, '0')}-01`;
                break;
              }
            } else if (rawDate.includes('-')) {
              extractedDate = rawDate;
              break;
            } else if (rawDate.includes('.')) {
              const parts = rawDate.split('.');
              if (parts.length === 3) {
                const [day, month, year] = parts;
                const fullYear = year.length === 2 ? `20${year}` : year;
                extractedDate = `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                break;
              }
            } else if (/^\d{8}$/.test(rawDate)) {
              // Format DDMMYYYY (15032024)
              const day = rawDate.substring(0, 2);
              const month = rawDate.substring(2, 4);
              const year = rawDate.substring(4, 8);
              extractedDate = `${year}-${month}-${day}`;
              break;
            } else if (/^\d{4}$/.test(rawDate) && rawDate.startsWith('20')) {
              // Juste l'année (2024)
              extractedDate = `${rawDate}-01-01`;
              break;
            }
          }
        }
        
        extractedData = {
          dateAchat: extractedDate || 'Date non détectée',
          rawText: extractedText,
          confidence: extractedText ? 0.8 : 0,
          localUrl: localFileUrl,
          cloudinaryUrl: fileUrl,
          dateAchatUrl: fileUrl
        };
      } catch (error) {
        console.error('Erreur DateAchat:', error);
        // Fallback
        extractedData = {
          dateAchat: 'Date non détectée - Veuillez saisir manuellement',
          rawText: 'Erreur lors de l\'extraction',
          confidence: 0,
          localUrl: fileUrl,
          cloudinaryUrl: fileUrl,
          dateAchatUrl: fileUrl
        };
      }
    } else if (type === 'reference') {
      // Upload de documents de référence (PDF)
      try {
        // 1. Upload local (optionnel) – ignoré en environnement read-only
        let localFileUrl: string | null = null;
        try {
          const uploadsDir = join(process.cwd(), 'public', 'uploads');
          if (!existsSync(uploadsDir)) {
            await mkdir(uploadsDir, { recursive: true });
          }
          const localFileName = `reference_${timestamp}.pdf`;
          const localFilePath = join(uploadsDir, localFileName);
          await writeFile(localFilePath, buffer);
          localFileUrl = `/uploads/${localFileName}`;
        } catch (fsErr) {
          console.warn('Reference - Ecriture locale indisponible (serverless):', (fsErr as Error).message);
          localFileUrl = null;
        }
        
        // 2. Upload vers Cloudinary pour stockage
        const cloudinaryResult = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            {
              resource_type: 'raw',
              public_id: `equipment-inspections/reference/${type}_${timestamp}`,
              folder: 'equipment-inspections/reference',
              access_mode: 'public',
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          ).end(buffer);
        });
        const referenceCloudUrl = (cloudinaryResult as any).secure_url as string | undefined;
        
        // 3. Extraction réelle: préférer Google Vision pour images, pdf-parse pour PDF
        console.log('Reference - Tentative d\'extraction réelle (Vision/pdf-parse)...');
        
        let extractedText = '';
        let reference = '';
        
        try {
          // Extraction simplifiée (comme qr-generator qui fonctionne)
          console.log('Reference - Extraction avec pdf-parse...');
          const pdfData = await pdf(buffer);
          extractedText = pdfData.text;
          console.log('Reference - Extraction réussie, longueur:', extractedText.length);
          
          // Extraction spécifique: ligne titre complète avec code (ex: TECHNICAL NOTICE ... A0040300B (240918))
          const lines = extractedText.split('\n').map((l: string) => l.trim()).filter((l: string) => l.length > 0);
          // 1) Chercher une ligne contenant 'TECHNICAL' et 'NOTICE' et un code entre parenthèses
          let candidate = lines.find((l: string) => /TECHNICAL/i.test(l) && /NOTICE/i.test(l) && /\([^)]+\)/.test(l));
          // 2) Sinon, chercher une ligne avec un code style A0040300B (240918)
          if (!candidate) {
            candidate = lines.find((l: string) => /[A-Z0-9]{5,}\s*\([0-9]{6,8}\)/.test(l));
          }
          // 3) Sinon, combiner la ligne précédente en titre + ligne code
          if (!candidate) {
            for (let i = 1; i < lines.length; i++) {
              if (/[A-Z0-9]{5,}\s*\([0-9]{6,8}\)/.test(lines[i])) {
                const prev = lines[i - 1];
                if (prev && prev.length > 3) {
                  candidate = `${prev} ${lines[i]}`;
                  break;
                }
              }
            }
          }
          reference = candidate || '';
          if (!reference) {
            reference = 'document detecte';
          }
          
          extractedData = {
            reference: reference,
            rawText: extractedText,
            confidence: extractedText ? 0.8 : 0,
            localUrl: localFileUrl || undefined,
            cloudinaryUrl: referenceCloudUrl || fileUrl || undefined,
            referenceUrl: referenceCloudUrl || undefined
          };
        } catch (pdfError) {
          console.log('Reference - Erreur pdf-parse:', (pdfError as Error).message);
          extractedData = {
            reference: 'document detecte',
            rawText: 'Erreur lors de l\'extraction PDF',
            confidence: 0,
            localUrl: localFileUrl || undefined,
            cloudinaryUrl: referenceCloudUrl || fileUrl || undefined,
            referenceUrl: referenceCloudUrl || undefined
          };
        }
      } catch (error) {
        console.error('Erreur Reference:', error);
        // Fallback
      extractedData = {
          reference: 'document detecte',
          rawText: 'Erreur lors de l\'extraction',
          confidence: 0
      };
      }
    } else if (type === 'signature') {
      // Upload de signature PDF - pas d'extraction de données nécessaire
      extractedData = null;
    }

    // Pour le type 'pdf' et 'reference', utiliser l'URL Cloudinary spécifique si disponible
    const finalUrl =
      (type === 'pdf' && (extractedData as any)?.pdfUrl) ||
      (type === 'reference' && (extractedData as any)?.referenceUrl) ||
      fileUrl;
    
    if (!finalUrl && (type === 'pdf' || type === 'reference')) {
      // Si aucune URL n'a été générée pour le PDF, il y a eu un problème
      console.error('Upload - Aucune URL générée pour le fichier type:', type);
      return NextResponse.json(
        { error: 'Erreur lors de l\'upload du fichier vers Cloudinary' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      url: finalUrl,
      extractedData,
      message: 'Fichier uploadé avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de l\'upload:', error);
    console.error('Erreur détaillée:', {
      message: (error as Error).message,
      stack: (error as Error).stack,
      name: (error as Error).name
    });
    return NextResponse.json(
      { 
        error: 'Erreur lors de l\'upload du fichier',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
}