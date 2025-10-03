import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from 'lib/prisma';
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const devis = await prisma.devis.findUnique({
      where: { id },
      include: {
        demande: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!devis) {
      return NextResponse.json(
        { message: 'Devis non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier que le devis appartient à l'utilisateur
    if (devis.userId !== session?.user?.id) {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Générer un PDF via HTML pour refléter la page UI
    const isProd = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
    let executablePath: string | undefined;

    if (isProd) {
      // In serverless/production, rely on @sparticuz/chromium
      executablePath = await chromium.executablePath();
    } else if (process.platform === 'win32') {
      // Try common Windows paths for Chrome/Edge
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
      // Linux/mac local
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
      defaultViewport: { width: 1240, height: 1754 },
    });
    const page = await browser.newPage();

    const formatISOToFr = (value?: string | Date | null) => {
      if (!value) return '-';
      try {
        if (value instanceof Date) {
          return value.toLocaleDateString('fr-FR');
        }
        return new Date(value).toLocaleDateString('fr-FR');
      } catch {
        return typeof value === 'string' ? value : '-';
      }
    };
    const sessionText = devis.demande?.session || '';
    const montant = (devis.montant || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const pu = (devis.prixUnitaire || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Devis ${devis.numero}</title>
  <style>
    body{font-family: Arial, Helvetica, sans-serif; color:#111827;}
    .container{max-width:900px;margin:24px auto;padding:24px;background:#ffffff;}
    .muted{color:rgb(0, 0, 0);}
    .section{background:#ffffff; border-top:3px solid rgb(99, 100, 102); margin: 7px 0px 7px 0px; padding: 0px 5px 0px 5px;}
    .legend{font-size:18px;font-weight:700;}
    table{width:100%;border-collapse:collapse  }
    th,td{border:1px solid rgb(35, 36, 37);padding:8px;text-align:left}
    th{background:#e5e7eb}
    .headerRow{display:flex;align-items:center;justify-content:space-between}
    .badge{display:inline-block;padding:2px 6px;border-radius:9999px;background:#e5e7eb;color:#111827;font-size:12px}
    .h1{font-size:20px;font-weight:800;margin:0}
    .mt8{margin-top:8px}
    .mt16{margin-top:16px}
    .mt24{margin-top:24px}
    .grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
    .input{background:#fff;border:1px solid rgb(141, 141, 141);border-radius:6px;padding:8px}
    .footer{margin-top:24px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:12px;color:#6b7280;display:flex;justify-content:space-between;align-items:center}
    .center{text-align:center}
    .right{text-align:right}
  </style>
 </head>
 <body>
  <div class="container">
    <div class="headerRow">
       <img src="${process.env.NEXTAUTH_URL || 'https://www.a-finpart.com'}/logo.png" alt="CI.DES Logo" style="height: 70px;">
      <table>
        <tbody>
          <tr>
            <td class="input"><strong>Titre</strong></td>
            <td class="input"><strong>Numéro de code</strong></td>
            <td class="input"><strong>Révision</strong></td>
            <td class="input"><strong>Création date</strong></td>
          </tr>
          <tr>
            <td class="input">TRAME DE DEVIS</td>
            <td class="input">ENR-CIFRA-COMP 00X</td>
            <td class="input">00</td>
            <td class="input">${new Date().toLocaleDateString('fr-FR')}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="section">
      <div class="legend">Informations principales</div>
      <div class="grid">
        <div>
          <div class="muted">Numéro</div>
          <div class="input">${devis.numero}</div>
        </div>
        <div>
          <div class="muted">Notre référence</div>
          <div class="input">${devis.referenceAffaire || '-'}</div>
        </div>
        <div>
          <div class="muted">Client</div>
          <div class="input">${devis.client}</div>
        </div>
        <div>
          <div class="muted">Email</div>
          <div class="input">${devis.mail}</div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="legend">Adresses</div>
      <div class="grid">
        <div>
          <div class="muted">Adresse de facturation</div>
          <div class="input">CI.DES chez chagneau 17270 BORESSE-ET-MARTRON France</div>
        </div>
        <div>
          <div class="muted">Adresse de livraison</div>
          <div class="input">${devis.adresseLivraison || ''}</div>
        </div>
        <div>
          <div class="muted">Date de formation</div>
          <div class="input">${formatISOToFr(devis.dateFormation)}${devis.dateExamen ? ' au ' + formatISOToFr(devis.dateExamen) : ''} ${!devis.dateFormation && sessionText ? sessionText : ''}</div>
        </div>
        <div>
          <div class="muted">Date examen</div>
          <div class="input">${formatISOToFr(devis.dateExamen)}</div>
        </div>
        ${devis.entreprise ? `<div><div class="muted">Entreprise</div><div class="input">${devis.entreprise}</div></div>` : ''}
        <div>
          <div class="muted">SIRET / NIF</div>
          <div class="input">${devis.siret || ''}</div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="legend">Informations administratives</div>
      <div class="grid">
        <div>
          <div class="muted">Numéro NDA</div>
          <div class="input">${devis.numNDA || ''}</div>
        </div>
        <div>
          <div class="muted">Centre Irata</div>
          <div class="input">${devis.suiviPar || ''}</div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="legend">Désignation</div>
      <table>
        <thead>
          <tr>
            <th>Désignation</th>
            <th>Quantité</th>
            <th>Unité</th>
            <th>Prix unitaire HT</th>
            <th>Prix total HT</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${devis.designation}</td>
            <td>${devis.quantite}</td>
            <td>${devis.unite}</td>
            <td>${pu} €</td>
            <td>${montant} €</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="section">
      <div class="legend">Informations bancaires</div>
      <div class="grid">
        <div><div class="muted">IBAN</div><div class="input">${devis.iban || ''}</div></div>
        <div><div class="muted">BIC</div><div class="input">${devis.bic || ''}</div></div>
        <div><div class="muted">Banque</div><div class="input">${devis.banque || ''}</div></div>
        <div><div class="muted">Intitulé du compte</div><div class="input">${devis.intituleCompte || ''}</div></div>
      </div>
    </div>

    <div class="section">
      <div class="legend">Signature</div>
      <div>
        <div class="muted">Signature: Administration</div>
        ${devis.signature && devis.signature.startsWith('data:image/') ? `<img src="${devis.signature}" alt="Signature" style="height:64px;background:#ffffff;border:1px solid #e5e7eb"/>` : `<div style="height:64px;border:2px dashed #d1d5db;border-radius:8px;background:#f9fafb;display:flex;align-items:center;justify-content:center;color:#9ca3af;">Aucune signature</div>`}
      </div>
    </div>

    <div class="footer">
      <div>${devis.numero} Trame</div>
      <div class="center">
        <div>CI.DES sasu  Capital 2 500 Euros</div>
        <div>SIRET : 87840789900011  VAT : FR71878407899</div>
        <div>Page 1 sur 2</div>
      </div>
      <div><img src="${process.env.NEXTAUTH_URL || 'https://www.a-finpart.com'}/logo.png" alt="CI.DES Logo" style="height:32px;width:32px"> </div>
       
    </div>
  </div>
 </body>
 </html>`;

    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdf = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '4mm', left: '4mm', right: '4mm', bottom: '4mm' }, scale: 0.96 });
    await browser.close();

    const pdfArrayBuffer = pdf.buffer.slice(pdf.byteOffset, pdf.byteOffset + pdf.byteLength);
    return new NextResponse(pdfArrayBuffer as ArrayBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="devis_${devis.numero}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Erreur lors de la génération du PDF du devis:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la génération du PDF du devis' },
      { status: 500 }
    );
  }
} 