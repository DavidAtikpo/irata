import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from 'lib/prisma';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { existsSync } from 'fs';

type SatisfactionResponse = {
  id: string;
  traineeName?: string | null;
  type: 'ENVIRONMENT_RECEPTION' | 'EQUIPMENT' | 'TRAINING_PEDAGOGY';
  date: string;
  createdAt: string;
  items: Array<{
    label: string;
    rating: string;
    comment?: string;
  }>;
  suggestions?: string | null;
  session?: string | null;
  signature?: string | null;
  user?: {
    email?: string | null;
    nom?: string | null;
    prenom?: string | null;
  } | null;
};

const typeLabels: Record<string, string> = {
  ENVIRONMENT_RECEPTION: 'Environnement et réception',
  EQUIPMENT: 'Équipements d\'entraînement',
  TRAINING_PEDAGOGY: 'Équipe pédagogique et programme',
};

function buildHtml(userResponses: SatisfactionResponse[], userEmail: string) {
  const firstResponse = userResponses[0];
  const userName = firstResponse.user?.nom || firstResponse.user?.prenom ? 
    [firstResponse.user?.prenom, firstResponse.user?.nom].filter(Boolean).join(' ') : 
    userEmail;

  return `
  <!DOCTYPE html>
  <html lang="fr">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Formulaires de Satisfaction Client - ${userName}</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
        background: white;
        color: #333;
        line-height: 1.4;
      }
      .headerRow {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 20px;
        padding: 5px 0;
        border-bottom: 2px solid #2563eb;
      }
      .headerRow table {
        border-collapse: collapse;
        font-size: 12px;
      }
      .headerRow td {
        border: 1px solid #d1d5db;
        padding: 6px 8px;
        text-align: center;
        font-size: 11px;
      }
      .headerRow .input {
        background: #f9fafb;
        font-weight: 600;
      }
      .headerRow .value {
        background: white;
      }
      .headerInfo {
        text-align: center;
        margin: 10px 0;
      }
      .headerInfo h2 {
        color: #666;
        margin: 0 0 5px 0;
        font-size: 16px;
        font-weight: normal;
      }
      .headerInfo p {
        margin: 0;
        font-size: 12px;
        color: #6b7280;
      }
      .form-section {
        margin-bottom: 30px;
        page-break-inside: avoid;
      }
      .form-header {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        padding: 12px;
        margin-bottom: 15px;
      }
      .form-title {
        font-size: 16px;
        font-weight: bold;
        color: #1e40af;
        margin: 0 0 8px 0;
      }
      .form-info {
        display: flex;
        justify-content: space-between;
        font-size: 11px;
        color: #666;
      }
      .items-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 15px;
      }
      .items-table th,
      .items-table td {
        border: 1px solid #d1d5db;
        padding: 6px;
        text-align: left;
        vertical-align: top;
      }
      .items-table th {
        background: #f3f4f6;
        font-weight: bold;
        font-size: 11px;
      }
      .items-table td {
        font-size: 10px;
      }
      .rating {
        font-weight: bold;
        color: #059669;
      }
      .suggestions {
        margin-top: 12px;
        padding: 8px;
        background: #f9fafb;
        border-left: 4px solid #3b82f6;
      }
      .suggestions h4 {
        margin: 0 0 6px 0;
        font-size: 12px;
        color: #1e40af;
      }
      .signature-section {
        margin-top: 8px;
        text-align: center;
      }
      .signature-box {
        padding: 15px;
        margin: 8px 0;
        background: #f9fafb;
        min-height: 40px;
        display: flex;
      }
      .signature-img {
        max-width: 100px;
        max-height: 40px;
      }
      .signature-status {
        font-size: 11px;
        margin-top: 4px;
        font-weight: bold;
      }
      .signed {
        color: #059669;
      }
      .not-signed {
        color: #dc2626;
      }
      .page-break {
        page-break-before: always;
      }
    </style>
  </head>
  <body>
    <div class="headerRow">
      <img src="${process.env.NEXTAUTH_URL || 'https://www.a-finpart.com'}/logo.png" alt="CI.DES Logo" style="height: 60px;">
      <table>
        <tbody>
          <tr>
            <td class="input"><strong>Titre</strong></td>
            <td class="input"><strong>Numéro de code</strong></td>
            <td class="input"><strong>Révision</strong></td>
            <td class="input"><strong>Création date</strong></td>
          </tr>
          <tr>
            <td class="value">FORMULAIRES D'ENQUÊTE DE SATISFACTION CLIENT</td>
            <td class="value">ENR-CIFRA-QHSE 007</td>
            <td class="value">00</td>
            <td class="value">${new Date().toLocaleDateString('fr-FR')}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="headerInfo">
      <h2>${userName}</h2>
      <p>Session: ${firstResponse.session || 'Non spécifiée'} | Date: ${new Date(firstResponse.createdAt || firstResponse.date).toLocaleDateString('fr-FR')}</p>
    </div>

    ${userResponses.map((response, index) => `
      <div class="form-section ${index > 0 ? 'page-break' : ''}">
        <div class="form-header">
          <div class="form-title">${typeLabels[response.type]}</div>
          <div class="form-info">
            <span>Code: ENR-CIFRA-QHSE 007</span>
            <span>Révision: 00</span>
            <span>Date: ${new Date(response.createdAt || response.date).toLocaleDateString('fr-FR')}</span>
          </div>
        </div>

        <div style="margin-bottom: 15px;">
          <strong>Nom du stagiaire:</strong> ${response.traineeName || '-'}<br>
          <strong>Session:</strong> ${response.session || '-'}
        </div>

        <table class="items-table">
          <thead>
            <tr>
              <th style="width: 50%;">Élément</th>
              <th style="width: 25%;">Note</th>
              <th style="width: 25%;">Commentaire</th>
            </tr>
          </thead>
          <tbody>
            ${response.items?.map(item => `
              <tr>
                <td>${item.label}</td>
                <td class="rating">${item.rating}</td>
                <td>${item.comment || '-'}</td>
              </tr>
            `).join('') || ''}
          </tbody>
        </table>

        ${response.suggestions ? `
          <div class="suggestions">
            <h4>Suggestions et remarques</h4>
            <p>${response.suggestions}</p>
          </div>
        ` : ''}

        <div class="signature-section">
          <h4>Signature du stagiaire</h4>
          <div class="signature-box">
            ${response.signature ? `
              <img src="${response.signature}" alt="Signature" class="signature-img" />
            ` : `
              <span style="color: #9ca3af;">Aucune signature</span>
            `}
          </div>
          <div class="signature-status ${response.signature ? 'signed' : 'not-signed'}">
            ${response.signature ? '✓ Formulaire signé' : '⚠ Formulaire non signé'}
          </div>
        </div>
      </div>
    `).join('')}
  </body>
  </html>`;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session?.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { userEmail } = await request.json();

    if (!userEmail) {
      return NextResponse.json(
        { message: 'Email utilisateur requis' },
        { status: 400 }
      );
    }

    // Récupérer toutes les réponses de l'utilisateur
    const responses = await prisma.customerSatisfactionResponse.findMany({
      where: {
        user: {
          email: userEmail
        }
      },
      orderBy: {
        type: 'asc'
      },
      include: {
        user: {
          select: {
            email: true,
            nom: true,
            prenom: true,
          },
        },
      },
    });

    if (responses.length === 0) {
      return NextResponse.json(
        { message: 'Aucune réponse trouvée pour cet utilisateur' },
        { status: 404 }
      );
    }

    // Convertir les données pour correspondre au type SatisfactionResponse
    const formattedResponses: SatisfactionResponse[] = responses.map(response => ({
      id: response.id,
      traineeName: response.traineeName,
      type: response.type,
      date: response.date.toISOString(),
      createdAt: response.createdAt.toISOString(),
      items: Array.isArray(response.items) ? response.items as Array<{
        label: string;
        rating: string;
        comment?: string;
      }> : [],
      suggestions: response.suggestions,
      session: response.session,
      signature: response.signature,
      user: response.user,
    }));

    const html = buildHtml(formattedResponses, userEmail);

    // Configuration Puppeteer
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
        { message: 'Navigateur non trouvé pour la génération PDF' },
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
    
    // Calculer le nombre de pages approximatif
    const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
    const pageHeight = 1123; // Hauteur A4 en pixels (297mm)
    const totalPages = Math.ceil(bodyHeight / pageHeight);
    
    const pdfBuffer = await page.pdf({ 
      format: 'A4', 
      printBackground: true, 
      margin: { top: '20mm', left: '15mm', right: '15mm', bottom: '30mm' },
      displayHeaderFooter: true,
      headerTemplate: `
        <div style="font-size: 10px; color: #6b7280; text-align: center; width: 100%; padding: 5px 15mm; background-color: white; border-bottom: 1px solid #e5e7eb;">
          <div style="display: flex; justify-content: space-between; align-items: center; width: 180mm; margin: 0 auto;">
            <div style="flex: 1; font-weight: 600; color: #1e40af;">
              CI.DES - Satisfaction Client
            </div>
            <div style="flex: 2; text-align: center; font-size: 9px;">
              <div>Formulaires d'enquête de satisfaction client</div>
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
              CI.DES - Satisfaction Client
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

    const fileName = `satisfaction-client-${userEmail.replace('@', '-').replace('.', '-')}-${new Date().toISOString().split('T')[0]}.pdf`;

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
