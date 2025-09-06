import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

type InvoiceLineItem = {
  reference: string;
  designation: string;
  quantity: number;
  unitPrice: number;
  tva: number;
  imageUrl?: string;
};

type InvoiceData = {
  title: string;
  codeNumberLabel?: string;
  codeNumber?: string;
  revisionLabel?: string;
  revision?: string | number;
  creationDateLabel?: string;
  creationDate?: string;
  company: {
    name: string;
    contactName?: string;
    addressLines: string[];
    email?: string;
    phone?: string;
    siret?: string;
    nif?: string;
    invoiceNumberLabel?: string;
    invoiceNumber?: string;
    invoiceDateLabel?: string;
    invoiceDate?: string;
  };
  customer: {
    name?: string;
    addressLines: string[];
    email?: string;
    phone?: string;
    siretLabel?: string;
    siret?: string;
    convLabel?: string;
    conv?: string;
    companyTitle?: string;
  };
  recipient: {
    name: string;
    addressLines: string[];
    email?: string;
    phone?: string;
  };
  items: InvoiceLineItem[];
  footerLeft?: string;
  footerRight?: string;
  showQr?: boolean;
  trainee?: { fullName?: string; email?: string };
};

function euro(n: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n);
}

function buildHtml(data: InvoiceData) {
  const logoUrl = `${process.env.NEXTAUTH_URL || ''}/logo.png`;
  const totalHT = data.items.reduce((s, it) => s + it.quantity * it.unitPrice, 0);
  const totalTVA = data.items.reduce((s, it) => s + (it.quantity * it.unitPrice * it.tva) / 100, 0);
  const totalTTC = totalHT + totalTVA;

  return `<!DOCTYPE html>
  <html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Facture ${data.company.invoiceNumber ?? ''}</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 24px; color: #111827; }
      .header { display:flex; align-items:flex-start; gap:16px; margin-bottom:16px; }
      .logo { width:60px; height:60px; object-fit:contain; }
      table { border-collapse: collapse; width: 100%; }
      .meta th, .meta td { border: 1px solid #e5e7eb; padding: 6px 8px; font-size: 12px; }
      .meta th { background: #f9fafb; text-align:left; }
      .grid { display:grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 12px; }
      .card { border:1px solid #e5e7eb; border-radius:6px; padding:10px; font-size:12px; }
      .title { font-weight:600; margin-bottom:6px; font-size:12px; }
      .items th, .items td { border:1px solid #e5e7eb; padding:6px 8px; font-size:12px; }
      .items th { background:#f9fafb; text-align:left; }
      .text-right { text-align:right; }
      .footer { margin-top:18px; text-align:center; font-size:11px; color:#6b7280; border-top:1px solid #e5e7eb; padding-top:10px; }
    </style>
  </head>
  <body>
    <div class="header">
      <img class="logo" src="${logoUrl}" alt="CI.DES Logo" />
      <table class="meta">
        <tbody>
          <tr>
            <th>Titre</th>
            <th>${data.codeNumberLabel ?? 'Numéro de code'}</th>
            <th>${data.revisionLabel ?? 'Révision'}</th>
            <th>${data.creationDateLabel ?? 'Création date'}</th>
          </tr>
          <tr>
            <td>${data.title}</td>
            <td>${data.codeNumber ?? ''}</td>
            <td>${data.revision ?? ''}</td>
            <td>${data.creationDate ?? ''}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="grid">
      <div class="card">
        <div class="title">${data.company.name}</div>
        ${data.company.contactName ? `<div>${data.company.contactName}</div>` : ''}
        ${(data.company.addressLines || []).map(l => `<div>${l}</div>`).join('')}
        ${data.company.email ? `<div>Email: ${data.company.email}</div>` : ''}
        ${data.company.phone ? `<div>Port: ${data.company.phone}</div>` : ''}
        ${data.company.siret ? `<div>SIRET: ${data.company.siret}</div>` : ''}
        <div style="margin-top:6px;">
          <strong>${data.company.invoiceNumberLabel ?? 'FACTURE N°'}</strong> ${data.company.invoiceNumber ?? ''}
        </div>
        ${data.company.invoiceDate ? `<div><strong>${data.company.invoiceDateLabel ?? 'Le'}</strong> ${data.company.invoiceDate}</div>` : ''}
      </div>
      <div class="card">
        <div class="title">${data.customer.companyTitle ?? 'Client'}</div>
        ${(data.customer.addressLines || []).map(l => `<div>${l}</div>`).join('')}
        ${data.customer.siret ? `<div>${data.customer.siretLabel ?? 'N°SIRET:'} <strong>${data.customer.siret}</strong></div>` : ''}
        ${data.customer.conv ? `<div>${data.customer.convLabel ?? 'N°Convention:'} <strong>${data.customer.conv}</strong></div>` : ''}
        ${data.trainee?.fullName ? `<div style="margin-top:6px;"><strong>Stagiaire:</strong> ${data.trainee.fullName}</div>` : ''}
        ${data.trainee?.email ? `<div><strong>Email:</strong> ${data.trainee.email}</div>` : ''}
      </div>
    </div>

    <div class="card" style="margin-top:12px; text-align:center;">
      <div class="title">${data.recipient.name}</div>
      ${(data.recipient.addressLines || []).map(l => `<div>${l}</div>`).join('')}
      ${data.recipient.phone ? `<div>Port: ${data.recipient.phone}</div>` : ''}
      ${data.recipient.email ? `<div>Email: ${data.recipient.email}</div>` : ''}
    </div>

    <table class="items" style="margin-top:12px;">
      <thead>
        <tr>
          <th>Référence</th>
          <th>désignation</th>
          <th class="text-right">Quantité</th>
          <th class="text-right">pU Vente</th>
          <th class="text-right">TVA</th>
          <th class="text-right">Montant HT</th>
        </tr>
      </thead>
      <tbody>
        ${data.items.map(it => {
          const montantHT = it.quantity * it.unitPrice;
          return `<tr>
            <td>${it.reference}</td>
            <td>${(it.designation || '').replace(/\n/g, '<br/>')}</td>
            <td class="text-right">${it.quantity.toFixed(2)}</td>
            <td class="text-right">${euro(it.unitPrice)}</td>
            <td class="text-right">${it.tva.toFixed(2)} %</td>
            <td class="text-right">${euro(montantHT)}</td>
          </tr>`;
        }).join('')}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="5" class="text-right"><strong>Total HT</strong></td>
          <td class="text-right"><strong>${euro(totalHT)}</strong></td>
        </tr>
        <tr>
          <td colspan="5" class="text-right">Total TVA</td>
          <td class="text-right">${euro(totalTVA)}</td>
        </tr>
        <tr>
          <td colspan="5" class="text-right"><strong>Total TTC</strong></td>
          <td class="text-right"><strong>${euro(totalTTC)}</strong></td>
        </tr>
      </tfoot>
    </table>

    <div class="footer">
      <div><strong>CI.DES sasu</strong> · Capital 2 500 Euros</div>
      <div>SIRET : 87840789900011 · VAT : FR71878407899</div>
      <div>${data.footerRight ?? 'Page 1 sur 1'}</div>
    </div>
  </body>
  </html>`;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }
    const settings = await prisma.settings.findUnique({ where: { id: '1' } });
    const template = ((settings?.company as any)?.invoiceTemplate ?? null) as InvoiceData | null;
    if (!template) {
      return NextResponse.json({ message: 'Aucun modèle de facture' }, { status: 404 });
    }
    const html = buildHtml(template);
    
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
    
    await page.setViewport({ width: 1200, height: 1600 });
    await page.setContent(html, { 
      waitUntil: ['networkidle0', 'domcontentloaded'],
      timeout: 30000 
    });
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const pdf = await page.pdf({ 
      format: 'A4', 
      printBackground: true, 
      margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' } 
    });
    await browser.close();
    const arrayBuffer = pdf.buffer.slice(pdf.byteOffset, pdf.byteOffset + pdf.byteLength) as ArrayBuffer;
    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="facture_modele.pdf"',
      },
    });
  } catch (error) {
    console.error('Erreur génération PDF (GET):', error);
    return NextResponse.json({ message: 'Erreur lors de la génération du PDF' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const isInternalCall = req.headers.get('X-Internal-Call') === 'true';
    
    if (!session || (session.user.role !== 'ADMIN' && !isInternalCall)) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }
    const data = (await req.json()) as InvoiceData;
    const html = buildHtml(data);
    
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
    
    await page.setViewport({ width: 1200, height: 1600 });
    await page.setContent(html, { 
      waitUntil: ['networkidle0', 'domcontentloaded'],
      timeout: 30000 
    });
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const pdf = await page.pdf({ 
      format: 'A4', 
      printBackground: true, 
      margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' } 
    });
    await browser.close();
    const arrayBuffer = pdf.buffer.slice(pdf.byteOffset, pdf.byteOffset + pdf.byteLength) as ArrayBuffer;
    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="facture_modele.pdf"',
      },
    });
  } catch (error) {
    console.error('Erreur génération PDF (POST):', error);
    return NextResponse.json({ message: 'Erreur lors de la génération du PDF' }, { status: 500 });
  }
}






