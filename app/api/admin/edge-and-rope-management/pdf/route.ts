import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from 'lib/prisma';
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    const body = await req.json();
    const { recordId, userId } = body;

    if (!recordId || !userId) {
      return NextResponse.json({ message: 'ID du record et ID utilisateur requis' }, { status: 400 });
    }

    // Récupérer le Toolbox Talk avec la signature de l'utilisateur spécifique
    const record = await prisma.toolboxTalkRecord.findUnique({
      where: { id: recordId },
      include: {
        signatures: {
          where: { userId },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                nom: true,
                prenom: true
              }
            }
          }
        }
      }
    });

    if (!record) {
      return NextResponse.json({ message: 'Toolbox Talk non trouvé' }, { status: 404 });
    }

    const userSignature = record.signatures[0];
    if (!userSignature) {
      return NextResponse.json({ message: 'Signature utilisateur non trouvée' }, { status: 404 });
    }

    const user = userSignature.user;
    const userName = `${user.prenom || ''} ${user.nom || ''}`.trim();

    // Générer le HTML complet avec les 15 images + Toolbox Talk
    const html = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Edge and Rope Management - Document Complet</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background: white;
            color: #333;
            line-height: 1.4;
          }
          .page {
            page-break-after: always;
            margin: 0;
            padding: 0;
          }
          .page:last-child {
            page-break-after: avoid;
          }
          .image-container {
            width: 100%;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: white;
          }
          .image-container img {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
          }
          .toolbox-section {
            padding: 10px;
            background: white;
            font-size: 11px;
          }
          .header {
            text-align: center;
            margin-bottom: 15px;
            border-bottom: 1px solid #2563eb;
            padding-bottom: 8px;
          }
          .header h1 {
            color: #1e40af;
            margin: 0 0 5px 0;
            font-size: 16px;
          }
          .header p {
            margin: 0;
            color: #6b7280;
            font-size: 10px;
          }
          .form-section {
            margin-bottom: 15px;
          }
          .form-title {
            font-size: 12px;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 8px;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 2px;
          }
          .form-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-bottom: 10px;
          }
          .form-field {
            margin-bottom: 8px;
          }
          .form-field label {
            display: block;
            font-weight: bold;
            margin-bottom: 2px;
            color: #374151;
            font-size: 10px;
          }
          .form-field .value {
            padding: 4px 6px;
            border: 1px solid #d1d5db;
            border-radius: 2px;
            background: #f9fafb;
            min-height: 15px;
            font-size: 10px;
          }
          .matters-table {
            width: 100%;
            border-collapse: collapse;
            margin: 10px 0;
            font-size: 9px;
          }
          .matters-table th,
          .matters-table td {
            border: 1px solid #d1d5db;
            padding: 4px;
            text-align: left;
          }
          .matters-table th {
            background: #f3f4f6;
            font-weight: bold;
            font-size: 9px;
          }
          .signature-section {
            margin: 15px 0;
            padding: 10px;
            border: 1px solid #d1d5db;
            border-radius: 4px;
            background: #f9fafb;
          }
          .signature-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-top: 8px;
          }
          .signature-box {
            text-align: center;
            padding: 8px;
            border: 1px solid #d1d5db;
            border-radius: 2px;
            background: white;
            min-height: 50px;
            display: flex;
            flex-direction: column;
            justify-content: center;
          }
          .signature-img {
            max-width: 120px;
            max-height: 35px;
            margin: 0 auto;
          }
          .footer {
            margin-top: 15px;
            text-align: center;
            font-size: 8px;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
            padding-top: 8px;
          }
        </style>
      </head>
      <body>
        <!-- Pages 1-8: Images du document Edge and Rope Management (2 images par page) -->
        ${Array.from({ length: 8 }, (_, i) => {
          const image1 = i * 2 + 1;
          const image2 = i * 2 + 2;
          return `
            <div class="page">
              <div class="image-container" style="height: 50vh;">
                <img src="${process.env.NEXTAUTH_URL || 'https://www.a-finpart.com'}/EdgeAndRope/Edge and Rope Management ${image1}.png" alt="Edge and Rope Management - Page ${image1}" />
              </div>
              <div class="image-container" style="height: 50vh;">
                <img src="${process.env.NEXTAUTH_URL || 'https://www.a-finpart.com'}/EdgeAndRope/Edge and Rope Management ${image2}.png" alt="Edge and Rope Management - Page ${image2}" />
              </div>
            </div>
          `;
        }).join('')}
        
        <!-- Page 9: Dernière image seule -->
        <div class="page">
          <div class="image-container">
            <img src="${process.env.NEXTAUTH_URL || 'https://www.a-finpart.com'}/EdgeAndRope/Edge and Rope Management 15.png" alt="Edge and Rope Management - Page 15" />
          </div>
        </div>

        <!-- Page 16: Toolbox Talk Record Form -->
        <div class="page toolbox-section">
          <div class="header">
            <h1>TOOLBOX TALK - RECORD FORM</h1>
            <p>Document signé par: ${userName} (${user.email})</p>
            <p>Date de signature: ${new Date(userSignature.signedAt).toLocaleDateString('fr-FR')}</p>
          </div>

          <div class="form-section">
            <div class="form-title">Informations de la session</div>
            <div class="form-grid">
              <div class="form-field">
                <label>Site:</label>
                <div class="value">${record.site}</div>
              </div>
              <div class="form-field">
                <label>Date:</label>
                <div class="value">${new Date(record.date).toLocaleDateString('fr-FR')}</div>
              </div>
              <div class="form-field">
                <label>Topic:</label>
                <div class="value">${record.topic}</div>
              </div>
              <div class="form-field">
                <label>Reason:</label>
                <div class="value">${record.reason}</div>
              </div>
              <div class="form-field">
                <label>Start Time:</label>
                <div class="value">${record.startTime}</div>
              </div>
              <div class="form-field">
                <label>Finish Time:</label>
                <div class="value">${record.finishTime}</div>
              </div>
            </div>
          </div>

          <div class="form-section">
            <div class="form-title">Matters Raised</div>
            <table class="matters-table">
              <thead>
                <tr>
                  <th>Matters raised by employees</th>
                  <th>Action taken as a result</th>
                </tr>
              </thead>
              <tbody>
                ${Array.isArray(record.mattersRaised) && record.mattersRaised.length > 0 ? 
                  record.mattersRaised.map((matter: any) => `
                    <tr>
                      <td>${matter.matter || '-'}</td>
                      <td>${matter.action || '-'}</td>
                    </tr>
                  `).join('') : 
                  '<tr><td colspan="2">Aucune matière soulevée</td></tr>'
                }
              </tbody>
            </table>
          </div>

          <div class="form-section">
            <div class="form-title">Comments</div>
            <div class="form-field">
              <div class="value" style="min-height: 60px;">${record.comments || 'Aucun commentaire'}</div>
            </div>
          </div>

          <div class="signature-section">
            <div class="form-title">Signatures</div>
            <div class="signature-grid">
              <div>
                <h4>Talk Leader (Admin)</h4>
                <div class="signature-box">
                  <div><strong>${record.adminName}</strong></div>
                  ${record.adminSignature ? `<img src="${record.adminSignature}" alt="Signature Admin" class="signature-img" />` : '<div>Non signé</div>'}
                  <div style="margin-top: 5px; font-size: 12px;">${new Date(record.publishedAt || record.createdAt).toLocaleDateString('fr-FR')}</div>
                </div>
              </div>
              <div>
                <h4>Participant</h4>
                <div class="signature-box">
                  <div><strong>${userName}</strong></div>
                  <img src="${userSignature.signature}" alt="Signature Utilisateur" class="signature-img" />
                  <div style="margin-top: 5px; font-size: 12px;">${new Date(userSignature.signedAt).toLocaleDateString('fr-FR')}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="footer">
            <p>UNCONTROLLED WHEN PRINTED</p>
            <p>Document généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Configuration Puppeteer (identique au devis)
    const isProd = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
    let executablePath: string | undefined;

    if (isProd) {
      executablePath = await chromium.executablePath();
    } else if (process.platform === 'win32') {
      const candidates = [
        'C:/Program Files/Google/Chrome/Application/chrome.exe',
        'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
        'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
        'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
      ];
      for (const p of candidates) {
        if (existsSync(p)) { executablePath = p; break; }
      }
    } else {
      const candidates = [
        '/usr/bin/google-chrome',
        '/usr/bin/chromium-browser',
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      ];
      for (const p of candidates) {
        if (existsSync(p)) { executablePath = p; break; }
      }
    }

    if (!executablePath) {
      return NextResponse.json(
        { message: 'Navigateur non trouvé pour la génération PDF. Installez Chrome/Edge localement.' },
        { status: 500 }
      );
    }

    const args = isProd ? chromium.args : ['--no-sandbox', '--disable-setuid-sandbox'];
    const browser = await puppeteer.launch({
      args,
      headless: true,
      executablePath,
      defaultViewport: { width: 1200, height: 1600 },
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '10mm',
        right: '10mm',
        bottom: '10mm',
        left: '10mm'
      },
      displayHeaderFooter: true,
      headerTemplate: `
        <div style="font-size: 10px; color: #6b7280; text-align: center; width: 100%; padding: 5px 15mm; background-color: white; border-bottom: 1px solid #e5e7eb;">
          <div style="display: flex; justify-content: space-between; align-items: center; width: 180mm; margin: 0 auto;">
            <div style="flex: 1; font-weight: 600; color: #1e40af;">
              CI.DES - Edge and Rope Management
            </div>
            <div style="flex: 2; text-align: center; font-size: 9px;">
              <div>Document complet avec Toolbox Talk</div>
            </div>
            <div style="flex: 1; text-align: right; font-size: 9px;">
              ${new Date().toLocaleDateString('fr-FR')}
            </div>
          </div>
        </div>
      `,
      footerTemplate: `
        <div style="font-size: 9px; color: #6b7280; text-align: center; width: 100%; padding: 5px 15mm; background-color: white; border-top: 1px solid #e5e7eb;">
          <div style="display: flex; justify-content: space-between; align-items: center; width: 180mm; margin: 0 auto;">
            <div style="flex: 1; font-weight: 500;">
              CI.DES - Edge and Rope Management
            </div>
            <div style="flex: 2; text-align: center;">
              <div style="margin: 1px 0;">CI.DES sasu · Capital 2 500 Euros</div>
              <div style="margin: 1px 0;">SIRET : 87840789900011 · VAT : FR71878407899</div>
              <div style="margin: 1px 0;">Page <span class="pageNumber"></span> sur <span class="totalPages"></span></div>
            </div>
            <div style="flex: 1; text-align: right; display: flex; align-items: center; justify-content: flex-end;">
              <span>© 2025 CI.DES</span>
            </div>
          </div>
        </div>
      `
    });

    await browser.close();

    const fileName = `edge-and-rope-management-complet-${userName.replace(/\s+/g, '-').toLowerCase()}-${record.site.replace(/\s+/g, '-').toLowerCase()}-${new Date(record.date).toISOString().split('T')[0]}.pdf`;

    // Convertir le PDF en ArrayBuffer
    const pdfArrayBuffer = pdfBuffer.buffer.slice(pdfBuffer.byteOffset, pdfBuffer.byteOffset + pdfBuffer.byteLength);
    
    return new NextResponse(pdfArrayBuffer as ArrayBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': pdfArrayBuffer.byteLength.toString(),
      },
    });

  } catch (error) {
    console.error('Erreur lors de la génération PDF:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la génération du PDF' },
      { status: 500 }
    );
  }
}
