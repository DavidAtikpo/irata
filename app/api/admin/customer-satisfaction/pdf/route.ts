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
        padding: 20px;
        background: white;
        color: #333;
        line-height: 1.4;
      }
      .header {
        text-align: center;
        margin-bottom: 30px;
        border-bottom: 2px solid #2563eb;
        padding-bottom: 20px;
      }
      .header h1 {
        color: #2563eb;
        margin: 0;
        font-size: 24px;
      }
      .header h2 {
        color: #666;
        margin: 10px 0 0 0;
        font-size: 18px;
        font-weight: normal;
      }
      .form-section {
        margin-bottom: 40px;
        page-break-inside: avoid;
      }
      .form-header {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        padding: 15px;
        margin-bottom: 20px;
      }
      .form-title {
        font-size: 18px;
        font-weight: bold;
        color: #1e40af;
        margin: 0 0 10px 0;
      }
      .form-info {
        display: flex;
        justify-content: space-between;
        font-size: 12px;
        color: #666;
      }
      .items-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 20px;
      }
      .items-table th,
      .items-table td {
        border: 1px solid #d1d5db;
        padding: 8px;
        text-align: left;
        vertical-align: top;
      }
      .items-table th {
        background: #f3f4f6;
        font-weight: bold;
        font-size: 12px;
      }
      .items-table td {
        font-size: 11px;
      }
      .rating {
        font-weight: bold;
        color: #059669;
      }
      .suggestions {
        margin-top: 15px;
        padding: 10px;
        background: #f9fafb;
        border-left: 4px solid #3b82f6;
      }
      .suggestions h4 {
        margin: 0 0 8px 0;
        font-size: 14px;
        color: #1e40af;
      }
      .signature-section {
        margin-top: 20px;
        text-align: center;
      }
      .signature-box {
        border: 1px solid #d1d5db;
        padding: 20px;
        margin: 10px 0;
        background: #f9fafb;
        min-height: 100px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .signature-img {
        max-width: 200px;
        max-height: 80px;
      }
      .signature-status {
        font-size: 12px;
        margin-top: 5px;
        font-weight: bold;
      }
      .signed {
        color: #059669;
      }
      .not-signed {
        color: #dc2626;
      }
      .footer {
        margin-top: 30px;
        padding-top: 20px;
        border-top: 1px solid #e5e7eb;
        font-size: 10px;
        color: #6b7280;
        text-align: center;
      }
      .page-break {
        page-break-before: always;
      }
    </style>
  </head>
  <body>
    <div class="header">
      <h1>CI.DES - FORMULAIRES D'ENQUÊTE DE SATISFACTION CLIENT</h1>
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

    <div class="footer">
      <p>CI.DES sasu Capital 2 500 Euros | SIRET : 87840789900011 | VAT : FR71878407899</p>
      <p>Page générée le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
    </div>
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
    
    const pdfBuffer = await page.pdf({ 
      format: 'A4', 
      printBackground: true, 
      margin: { top: '15mm', left: '10mm', right: '10mm', bottom: '15mm' },
      displayHeaderFooter: false
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
