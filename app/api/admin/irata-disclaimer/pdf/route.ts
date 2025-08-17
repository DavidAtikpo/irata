import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { promises as fs } from 'fs';
import { join } from 'path';
import puppeteer from 'puppeteer';

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

    // Générer le HTML du document complet
    const htmlContent = generateIrataHTML(submission, irataNo);

    // Générer le PDF avec Puppeteer
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      }
    });

    await browser.close();

    return new NextResponse(Buffer.from(pdf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="IRATA_Disclaimer_${submission.name?.replace(/\s+/g, '_') || 'Document'}_${submission.id}.pdf"`
      }
    });

  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la génération du PDF' },
      { status: 500 }
    );
  }
}

function generateIrataHTML(submission: any, irataNo: string): string {
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
          padding: 20px;
          background-color: #fafafa;
        }
        .document {
          background: white;
          padding: 30px;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
                 .header-image {
           margin-bottom: 20px;
         }
         .header-image img {
           width: 100%;
           height: auto;
           display: block;
         }
        .body-images {
          margin: 20px 0;
        }
        .body-images img {
          max-width: 100%;
          height: auto;
          display: block;
          margin: 10px 0;
        }
        .signature-table {
          width: 100%;
          border-collapse: collapse;
          margin: 30px 0;
          border: 1px solid black;
        }
        .signature-table td {
          border: 1px solid black;
          padding: 8px;
          vertical-align: top;
        }
        .signature-table input {
          width: 100%;
          border: none;
          outline: none;
          background: transparent;
          font-size: 12px;
        }
        .signature-cell {
          height: 60px;
          text-align: center;
          vertical-align: middle;
        }
        .signature-image {
          max-height: 50px;
          max-width: 100%;
        }
        .footer-line {
          border-bottom: 3px solid #3365BE;
          margin: 30px 0;
        }
        .footer-text {
          text-align: center;
          font-size: 10px;
          color: #666;
          letter-spacing: 1px;
          padding: 10px 0;
        }
        .status-badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 10px;
          font-weight: bold;
          margin-left: 10px;
        }
        .status-pending { background-color: #fef3c7; color: #92400e; }
        .status-signed { background-color: #dbeafe; color: #1e40af; }
        .status-sent { background-color: #dcfce7; color: #166534; }
      </style>
    </head>
    <body>
      <div class="document">
                 <!-- Header image -->
         <div class="header-image">
           <img src="/header declaimer.png" alt="IRATA Disclaimer Header" style="width: 100%; height: auto;">
         </div>

         <!-- Body content images -->
         <div class="body-images">
           <img src="/corps1.png" alt="IRATA Disclaimer Body Content Part 1" style="width: 100%; height: auto;">
           <img src="/corps2.png" alt="IRATA Disclaimer Body Content Part 2" style="width: 100%; height: auto;">
         </div>

        <!-- Tableau de signature -->
        <table class="signature-table">
          <tr>
            <td style="width: 15%;"><strong>Name:</strong></td>
            <td style="width: 50%;">
              <input type="text" value="${submission.name || ''}" readonly>
            </td>
            <td style="width: 15%;"><strong>IRATA No:</strong></td>
            <td style="width: 20%;">
              <input type="text" value="${irataNo || ''}" readonly>
            </td>
          </tr>
          <tr>
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
        <div class="footer-text">
          UNCONTROLLED WHEN PRINTED
        </div>

        <!-- Informations de statut -->
        <div style="margin-top: 20px; font-size: 10px; color: #666;">
          <p><strong>Status:</strong> 
            <span class="status-badge status-${submission.status || 'pending'}">
              ${submission.status === 'pending' ? 'En attente' : 
                submission.status === 'signed' ? 'Signé par admin' : 
                submission.status === 'sent' ? 'Envoyé à l\'utilisateur' : 'En attente'}
            </span>
          </p>
          ${submission.adminSignedAt ? `<p><strong>Signé par admin le:</strong> ${new Date(submission.adminSignedAt).toLocaleDateString('fr-FR')}</p>` : ''}
          <p><strong>Document ID:</strong> ${submission.id}</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
