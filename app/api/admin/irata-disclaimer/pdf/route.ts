import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { promises as fs } from 'fs';
import { join } from 'path';
import puppeteer from 'puppeteer';
import { readFileSync, existsSync } from 'fs';

const DATA_PATH = join(process.cwd(), 'data');
const FILE_PATH = join(DATA_PATH, 'irata-disclaimer-submissions.json');

async function ensureDataFile() {
  try {
    await fs.mkdir(DATA_PATH, { recursive: true });
    try {
      await fs.access(FILE_PATH);
    } catch {
      await fs.writeFile(FILE_PATH, JSON.stringify([]), 'utf8');
    }
  } catch (err) {
    console.error('Error ensuring data file:', err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session as any).user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { submissionId, irataNo } = await request.json();

    await ensureDataFile();

    // Lire le fichier JSON des soumissions
    const raw = await fs.readFile(FILE_PATH, 'utf8');
    const submissions = JSON.parse(raw || '[]');

    // Trouver la soumission
    const submission = submissions.find((s: any) => s.id === submissionId);
    if (!submission) {
      return NextResponse.json({ error: 'Soumission non trouvée' }, { status: 404 });
    }

    // Générer le HTML du document complet avec les images en base64
    const htmlContent = await generateIrataHTML(submission, irataNo);

    try {
      // Configuration Puppeteer pour production
      const isProduction = process.env.NODE_ENV === 'production';
      
      const browserConfig = {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--disable-software-rasterizer',
          '--disable-extensions',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',
          '--disable-features=TranslateUI,VizDisplayCompositor',
          '--disable-ipc-flooding-protection',
          '--memory-pressure-off',
          '--max_old_space_size=4096',
          '--no-zygote',
          '--single-process'
        ],
        ...(isProduction && {
          executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium-browser'
        }),
        timeout: 30000
      };

      const browser = await puppeteer.launch(browserConfig);
      const page = await browser.newPage();
      
      // Configurer la page pour le rendu
      await page.setViewport({ width: 1200, height: 1600 });
      
      await page.setContent(htmlContent, { 
        waitUntil: ['networkidle0', 'domcontentloaded'],
        timeout: 30000 
      });
      
      // Attendre que le contenu soit complètement chargé
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '10mm',
          right: '10mm',
          bottom: '10mm',
          left: '10mm'
        }
      });

      await browser.close();

      // Convertir le PDF en ArrayBuffer pour une meilleure compatibilité
      const arrayBuffer = pdf.buffer.slice(pdf.byteOffset, pdf.byteOffset + pdf.byteLength) as ArrayBuffer;
      
      return new NextResponse(arrayBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="IRATA_Disclaimer_${submission.name?.replace(/\s+/g, '_') || 'Document'}_${submission.id}.pdf"`
        }
      });

    } catch (puppeteerError) {
      console.error('Erreur Puppeteer, utilisation de l\'alternative client-side:', puppeteerError);
      
      // Alternative: retourner une réponse JSON avec le HTML pour génération côté client
      return NextResponse.json({
        fallbackToClientSide: true,
        htmlContent,
        fileName: `IRATA_Disclaimer_${submission.name?.replace(/\s+/g, '_') || 'Document'}_${submission.id}.pdf`,
        submission,
        irataNo
      }, { status: 200 });
    }

  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error);
              console.error('Environment:', {
       NODE_ENV: process.env.NODE_ENV,
       PUPPETEER_EXECUTABLE_PATH: process.env.PUPPETEER_EXECUTABLE_PATH
     });
     
     return NextResponse.json(
       { 
         error: 'Erreur lors de la génération du PDF',
         details: error instanceof Error ? error.message : 'Erreur inconnue',
         stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined,
         fallbackToClientSide: true
       },
       { status: 500 }
     );
  }
}

async function generateIrataHTML(submission: any, irataNo: string): Promise<string> {
  // Convertir les images en base64
  const publicPath = join(process.cwd(), 'public');
  
  let headerImageBase64 = '';
  let corps1ImageBase64 = '';
  let corps2ImageBase64 = '';
  
  try {
    const headerImagePath = join(publicPath, 'header declaimer.png');
    const corps1ImagePath = join(publicPath, 'corps1.png');
    const corps2ImagePath = join(publicPath, 'corps2.png');
    
    // Vérifier si les fichiers existent
    if (existsSync(headerImagePath)) {
      headerImageBase64 = readFileSync(headerImagePath).toString('base64');
    } else {
      console.warn('Fichier header declaimer.png non trouvé');
    }
    
    if (existsSync(corps1ImagePath)) {
      corps1ImageBase64 = readFileSync(corps1ImagePath).toString('base64');
    } else {
      console.warn('Fichier corps1.png non trouvé');
    }
    
    if (existsSync(corps2ImagePath)) {
      corps2ImageBase64 = readFileSync(corps2ImagePath).toString('base64');
    } else {
      console.warn('Fichier corps2.png non trouvé');
    }
  } catch (error) {
    console.error('Erreur lors de la lecture des images:', error);
  }
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>IRATA Disclaimer</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 1px;
          background-color: white;
          font-size: 10px;
          line-height: 1.3;
        }
        .document {
          background: white;
          padding: 1px;
          box-shadow: none;
          min-height: 95vh;
          width: 100%;
        }
        .header-image {
          margin-bottom: 1px;
        }
        .header-image img {
          width: 100%;
          height: 10px;
          object-fit: contain;
          display: block;
        }
        .header-image h2 {
          margin: 8px 0;
          font-size: 14px;
          text-align: center;
          color: #3365BE;
        }
        .body-images {
          margin: 1px 0;
        }
        .body-images img {
          width: 100%;
          height: 40px;
          object-fit: contain;
          display: block;
          margin: 2px 0;
        }
        .body-images p {
          margin: 6px 0;
          font-size: 8px;
          line-height: 1.3;
        }
        .signature-table {
          width: 100%;
          border-collapse: collapse;
          margin: 3px 0;
          border: 1px solid black;
          font-size: 13px;
        }
        .signature-table td {
          border: 1px solid black;
          padding: 1px;
          vertical-align: middle;
        }
        .name-address-row {
          height: 30px;
        }
        .signature-table input {
          width: 100%;
          border: none;
          outline: none;
          background: transparent;
          font-size: 13px;
          padding: 0;
        }
        .signature-cell {
          height: 20px;
          text-align: center;
          vertical-align: middle;
        }
        .signature-image {
          max-height: 20px;
          padding: 0;
          max-width: 100%;
        }
        .footer-line {
          border-bottom: 2px solid #3365BE;
          margin-top: 10px;
          margin-bottom: 0px;
        }
        .footer-text {
          text-align: center;
          font-size: 10px;
          color: #666;
          letter-spacing: 1px;

        }
        .status-badge {
          display: inline-block;
          padding: 2px 4px;
          border-radius: 8px;
          font-size: 6px;
          font-weight: bold;
          margin-left: 5px;
        }
        .status-pending { background-color: #fef3c7; color: #92400e; }
        .status-signed { background-color: #dbeafe; color: #1e40af; }
        .status-sent { background-color: #dcfce7; color: #166534; }
        @page {
          margin: 10mm;
          size: A4;
        }
      </style>
    </head>
    <body>
      <div class="document">
        <!-- Header image -->
        ${headerImageBase64 ? `
        <div class="header-image">
          <img src="data:image/png;base64,${headerImageBase64}" alt="IRATA Disclaimer Header" style="width: 100%; height: auto;">
        </div>
        ` : '<div class="header-image"><h2 style="text-align: center; color: #3365BE; margin: 20px 0;">IRATA DISCLAIMER</h2></div>'}

        <!-- Body content images -->
        ${corps1ImageBase64 && corps2ImageBase64 ? `
        <div class="body-images">
          <img src="data:image/png;base64,${corps1ImageBase64}" alt="IRATA Disclaimer Body Content Part 1" style="width: 100%; height: auto;">
          <img src="data:image/png;base64,${corps2ImageBase64}" alt="IRATA Disclaimer Body Content Part 2" style="width: 100%; height: auto;">
        </div>
        ` : `
        <div class="body-images">
          <p style="margin: 20px 0; line-height: 1.6;">
            <strong>Risk and Disclaimer of Liability</strong><br><br>
            I understand that rope access activities involve inherent risks including, but not limited to, permanent disability and death due to falls and collisions. I acknowledge that I am engaging in these activities at my own risk and I release all providers from any liability, claims, demands, and expenses related to IRATA certification.
          </p>
          <p style="margin: 20px 0; line-height: 1.6;">
            <strong>By signing this declaration, I warrant and acknowledge that:</strong><br>
            a) All information given is correct and will be relied upon.<br>
            b) Engaging in rope access activities is not detrimental to my health or that of others.<br>
            c) A member company or assessor can exclude me based on health, fitness, or attitude to safety.<br>
            d) This disclaimer remains legally binding even if declarations are untrue, and I accept all risks.<br>
            e) I will advise IRATA of any health changes and cease activities unless approved by a doctor.
          </p>
        </div>
        `}

        <!-- Tableau de signature -->
        <table class="signature-table" ;">
          <tr class="name-address-row">
            <td style="width: 15%;"><strong>Name:</strong></td>
            <td style="width: 50%;">
              <input type="text" value="${submission.name || ''}" readonly>
            </td>
            <td style="width: 15%;"><strong>IRATA No:</strong></td>
            <td style="width: 20%; ">
              <input type="text" value="${irataNo || ''}" readonly>
            </td>
          </tr>
          <tr class="name-address-row">
            <td style="width: 15%;"><strong>Address:</strong></td>
            <td colspan="3" style="width: 85%;">
              <input type="text" value="${submission.address || ''}" readonly>
            </td>
          </tr>
          <tr>
            <td style="width: 15%;"><strong>Signature:</strong></td>
            <td style="width: 50%;" class="signature-cell">
             ${submission.signature ? `<img src="${submission.signature}" class="signature-image" alt="Signature">` : ''} 
            </td>
            <td style="width: 15%;"><strong>Date:</strong></td>
            <td style="width: 20%;">
              <input type="text" value="${new Date(submission.createdAt).toLocaleDateString('en-GB')}" readonly>
            </td>
          </tr>
        </table>

        <!-- Ligne de séparation -->
        <div class="footer-line"></div>

        <!-- Footer -->
        <div class="footer-text" style="padding-top: 0px;">
          UNCONTROLLED WHEN PRINTED
        </div>


      </div>
    </body>
    </html>
  `;
}
