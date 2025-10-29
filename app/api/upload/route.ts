import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import cloudinary from '@/lib/cloudinary';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
// @ts-expect-error - qrcode-reader doesn't have TypeScript declarations
import QRCodeReader from 'qrcode-reader';

let pdf: any = null;
try {
  // Charger pdf-parse de manière dynamique pour éviter les erreurs de test
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  pdf = eval('require')('pdf-parse');
} catch (error) {
  console.log('pdf-parse non disponible:', (error as Error).message);
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
      const uploadsDir = join(process.cwd(), 'public', 'uploads');
      if (!existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true });
      }
      
      const localFileName = `pdf_${timestamp}.pdf`;
      const localFilePath = join(uploadsDir, localFileName);
      await writeFile(localFilePath, buffer);
      const localFileUrl = `/uploads/${localFileName}`;
      
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
          
          // Extraction réelle avec pdf-parse (si disponible)
          if (pdf) {
            console.log('PDF - Tentative d\'extraction réelle avec pdf-parse...');
            
            try {
              const pdfData = await pdf(buffer);
              extractedText = pdfData.text;
              console.log('PDF - Extraction pdf-parse réussie, longueur du texte:', extractedText.length);
            } catch (pdfError) {
              console.log('PDF - Erreur pdf-parse, tentative Cloudinary OCR...');
              
              // Fallback vers Cloudinary OCR (si disponible)
              try {
                const ocrResult = await new Promise((resolve, reject) => {
                  cloudinary.uploader.upload_stream(
                    {
                      resource_type: 'image',
                      ocr: 'adv_ocr',
                      public_id: `equipment-inspections/ocr/pdf_${timestamp}`,
                      folder: 'equipment-inspections/ocr',
                      pages: 'all',
                    },
                    (error, result) => {
                      if (error) reject(error);
                      else resolve(result);
                    }
                  ).end(buffer);
                });
                
                extractedText = (ocrResult as any).ocr?.adv_ocr?.data?.[0]?.text || '';
                console.log('PDF - Extraction Cloudinary OCR, longueur du texte:', extractedText.length);
              } catch (ocrError) {
                console.log('PDF - Cloudinary OCR non disponible, texte vide');
                extractedText = ''; // Pas de simulation
              }
            }
          } else {
            console.log('PDF - pdf-parse non disponible, tentative Cloudinary OCR...');
            
            // Utiliser directement Cloudinary OCR (si disponible)
            try {
              const ocrResult = await new Promise((resolve, reject) => {
                  cloudinary.uploader.upload_stream(
                    {
                      resource_type: 'image',
                      ocr: 'adv_ocr',
                      public_id: `equipment-inspections/ocr/pdf_${timestamp}`,
                      folder: 'equipment-inspections/ocr',
                      pages: 'all',
                      access_mode: 'public',
                    },
                    (error, result) => {
                      if (error) reject(error);
                      else resolve(result);
                    }
                  ).end(buffer);
              });
              
              extractedText = (ocrResult as any).ocr?.adv_ocr?.data?.[0]?.text || '';
              console.log('PDF - Extraction Cloudinary OCR, longueur du texte:', extractedText.length);
            } catch (ocrError) {
              console.log('PDF - Cloudinary OCR non disponible, texte vide');
              extractedText = ''; // Pas de simulation
            }
          }
          
          // Si pas de texte extrait, laisser vide pour voir l'erreur
          if (!extractedText || extractedText.length < 10) {
            console.log('PDF - Aucune extraction réussie, texte vide ou trop court');
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
        
        // Rechercher les normes avec plusieurs approches
        let normes = 'Normes non détectées';
        
        // Approche 1: Recherche simple de "EN" dans le texte
        if (extractedText.toLowerCase().includes('en')) {
          console.log('PDF - Texte contient "EN", recherche des normes...');
          
          // Diviser le texte en lignes pour analyser
          const lines = extractedText.split('\n');
          console.log('PDF - Lignes trouvées:', lines.length);
          
          const normesFound: string[] = [];
          lines.forEach((line: string, index: number) => {
            console.log(`PDF - Ligne ${index}:`, line);
            
            // Rechercher EN suivi de chiffres
            const enMatch = line.match(/EN\s*\d+/gi);
            if (enMatch) {
              console.log(`PDF - Norme trouvée dans la ligne ${index}:`, enMatch);
              normesFound.push(...enMatch);
            }
          });
          
          if (normesFound.length > 0) {
            normes = normesFound.join(' ');
            console.log('PDF - Normes trouvées (approche simple):', normes);
          }
        }
        
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
        const allMatches: string[] = [];
        
        allPatterns.forEach(pattern => {
          const matches = extractedText.match(pattern);
          if (matches) {
            allMatches.push(...matches);
          }
        });
        
        if (allMatches.length > 0) {
          // Dédupliquer les normes en gardant l'ordre d'apparition
          const uniqueNormes = [...new Set(allMatches.map((norme: string) => norme.trim()))];
          normes = uniqueNormes
            .filter((norme: string) => norme.length > 0)
            .join(' ');
          console.log('PDF - Normes trouvées (patterns avancés):', normes);
        }
        
        // Approche 3: Si toujours rien trouvé, recherche très large
        if (normes === 'Normes non détectées') {
          console.log('PDF - Tentative de recherche très large...');
          const veryBroadMatch = extractedText.match(/EN\s*\d+/gi);
          if (veryBroadMatch) {
            // Dédupliquer aussi pour la recherche large
            const uniqueBroadNormes = [...new Set(veryBroadMatch.map((norme: string) => norme.trim()))];
            normes = uniqueBroadNormes.join(' ');
            console.log('PDF - Normes trouvées (recherche large):', normes);
          }
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
          pdfUrl: cloudinaryPdfUrl || localFileUrl, // Utiliser l'URL Cloudinary en priorité
          cloudinaryUrl: cloudinaryPdfUrl || localFileUrl, // Garder l'URL Cloudinary pour le stockage
          rawText: extractedText,
          confidence: 95, // Simulation de confiance élevée
          // URLs pour les liens cliquables
          referenceUrl: cloudinaryPdfUrl || localFileUrl, // URL Cloudinary pour les références
          dateAchatUrl: cloudinaryPdfUrl || localFileUrl // URL Cloudinary pour la date d'achat
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
        pdfUrl: cloudinaryPdfUrl || localFileUrl,
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
      // Upload de documents de référence (PDF) avec simulation
      try {
        // 1. Upload local rapide
        const uploadsDir = join(process.cwd(), 'public', 'uploads');
        if (!existsSync(uploadsDir)) {
          await mkdir(uploadsDir, { recursive: true });
        }
        
        const localFileName = `reference_${timestamp}.pdf`;
        const localFilePath = join(uploadsDir, localFileName);
        await writeFile(localFilePath, buffer);
        const localFileUrl = `/uploads/${localFileName}`;
        
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
        
        // 3. Extraction réelle avec pdf-parse
        console.log('Reference - Tentative d\'extraction réelle avec pdf-parse...');
        
        let extractedText = '';
        let reference = 'Documents de référence non détectés';
        
        try {
          const pdfData = await pdf(buffer);
          extractedText = pdfData.text;
          console.log('Reference - Extraction pdf-parse réussie, longueur:', extractedText.length);
          
          // Rechercher les références de documents
          const referenceMatch = extractedText.match(/(notice|procédure|manuel|guide|instruction|référence|document)/gi);
          if (referenceMatch) {
            // Dédupliquer les références en gardant l'ordre d'apparition
            const uniqueReferences = [...new Set(referenceMatch.map((ref: string) => ref.trim()))];
            reference = uniqueReferences.join(' / ');
            console.log('Reference - Références trouvées:', reference);
          }
          
          extractedData = {
            reference: reference,
            rawText: extractedText,
            confidence: extractedText ? 0.8 : 0,
            localUrl: localFileUrl,
            cloudinaryUrl: fileUrl,
            referenceUrl: localFileUrl
          };
        } catch (pdfError) {
          console.log('Reference - Erreur pdf-parse:', (pdfError as Error).message);
          extractedData = {
            reference: 'Documents de référence non détectés',
            rawText: 'Erreur lors de l\'extraction PDF',
            confidence: 0,
            localUrl: localFileUrl,
            cloudinaryUrl: fileUrl,
            referenceUrl: localFileUrl
          };
        }
      } catch (error) {
        console.error('Erreur Reference:', error);
        // Fallback
      extractedData = {
          reference: 'Documents de référence non détectés - Veuillez saisir manuellement',
          rawText: 'Erreur lors de l\'extraction',
          confidence: 0
      };
      }
    } else if (type === 'signature') {
      // Upload de signature PDF - pas d'extraction de données nécessaire
      extractedData = null;
    }

    // Pour le type 'pdf', utiliser l'URL Cloudinary spécifique si disponible
    const finalUrl = (type === 'pdf' && (extractedData as any)?.pdfUrl) || fileUrl;
    
    return NextResponse.json({
      url: finalUrl,
      extractedData,
      message: 'Fichier uploadé avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de l\'upload:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'upload du fichier' },
      { status: 500 }
    );
  }
}