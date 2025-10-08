import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { PrismaClient } from '@prisma/client';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { invoiceId } = await request.json();

    if (!invoiceId) {
      return NextResponse.json({ error: 'ID de facture requis' }, { status: 400 });
    }

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Récupérer la facture avec toutes les informations nécessaires (comme l'admin)
    const userInvoices = await prisma.$queryRaw`
      SELECT 
        i.id, i."invoiceNumber", i.amount, i."paymentStatus", i."paidAmount", i."paymentMethod", i.notes, i."createdAt", i."updatedAt",
        u.prenom, u.nom, u.email,
        c.adresse,
        d.numero as devis_numero, d.designation, d.quantite, d.unite, d."prixUnitaire", d.tva, d.montant as devis_montant,
        dm.session
      FROM "webirata"."Invoice" i
      JOIN "webirata"."User" u ON i."userId" = u.id
      JOIN "webirata"."Contrat" c ON i."contratId" = c.id
      JOIN "webirata"."Devis" d ON c."devisId" = d.id
      JOIN "webirata"."Demande" dm ON d."demandeId" = dm.id
      WHERE i.id = ${invoiceId} AND i."userId" = ${user.id}
    `;
    
    const userInvoice = Array.isArray(userInvoices) && userInvoices.length > 0 ? userInvoices[0] : null;

    if (!userInvoice) {
      return NextResponse.json({ error: 'Facture non trouvée' }, { status: 404 });
    }

    // Construire les données de la facture (comme l'admin)
    const invoiceData = {
      title: 'TRAME BDC DEVIS FACTURE',
      codeNumberLabel: 'Numéro de code',
      codeNumber: 'ENR-CIDFA-COMP 002',
      revisionLabel: 'Révision',
      revision: '00',
      creationDateLabel: 'Création date',
      creationDate: new Date().toLocaleDateString('fr-FR'),
      company: {
        name: 'CI.DES',
        contactName: 'CHEZ CHAGNEAU',
        addressLines: ['17270 BORESSE-ET-MARTRON', 'admin38@cides.fr'],
        siret: '87840789900011',
        invoiceNumberLabel: 'FACTURE N°',
        invoiceNumber: userInvoice.invoiceNumber,
        invoiceDateLabel: 'Le',
        invoiceDate: new Date(userInvoice.createdAt).toLocaleDateString('fr-FR'),
      },
      customer: {
        companyTitle: 'FRANCE TRAVAIL DR BRETAGNE',
        addressLines: ['Adresses :'],
        siretLabel: 'N°SIRET :',
        siret: '13000548108070',
        convLabel: 'N°Convention (Enregistrement)',
        conv: '41C27G263296',
        name: '',
        email: '',
        phone: '',
      },
      recipient: {
        name: `Monsieur ${userInvoice.prenom} ${userInvoice.nom}`,
        addressLines: [userInvoice.adresse || 'Adresse non spécifiée'],
        phone: '',
        email: userInvoice.email
      },
      items: [
        {
          reference: 'CI.IFF',
          designation: `Formation Cordiste IRATA\nDevis #${userInvoice.devis_numero}\nSession: ${userInvoice.session || 'Non spécifiée'}${userInvoice.paymentStatus === 'PARTIAL' ? '\n(Paiement partiel)' : ''}`,
          quantity: 1,
          unitPrice: userInvoice.paymentStatus === 'PARTIAL' ? userInvoice.paidAmount : userInvoice.amount,
          tva: 0,
        }
      ],
      footerRight: 'Page 1 sur 1',
      showQr: true,
      paymentStatus: userInvoice.paymentStatus,
    };

    // Générer le HTML avec toutes les données (même fonction que l'admin)
    const html = buildHtml(invoiceData, userInvoice.amount, userInvoice);

    // Configuration Puppeteer comme dans l'admin
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

    // Générer le PDF comme dans l'admin
    const args = isProd ? chromium.args : ['--no-sandbox', '--disable-setuid-sandbox'];
    const browser = await puppeteer.launch({
      args,
      headless: true,
      executablePath,
      defaultViewport: { width: 1240, height: 1754 },
    });
    const page = await browser.newPage();

    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdf = await page.pdf({ 
      format: 'A4', 
      printBackground: true, 
      margin: { top: '4mm', left: '4mm', right: '4mm', bottom: '4mm' }, 
      scale: 0.96 
    });
    await browser.close();

    // Vérifier que le numéro de facture existe et le nettoyer
    const invoiceNumber = userInvoice.invoiceNumber || 'facture';
    const cleanInvoiceNumber = invoiceNumber.toString().replace(/\s+/g, '_');
    
    // Convertir le PDF en ArrayBuffer comme dans l'admin
    const pdfArrayBuffer = pdf.buffer.slice(pdf.byteOffset, pdf.byteOffset + pdf.byteLength);
    return new NextResponse(pdfArrayBuffer as ArrayBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="facture_${cleanInvoiceNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la génération du PDF' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

function euro(n: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n);
}

function buildHtml(data: any, originalAmount?: number, invoiceData?: any) {
  const logoUrl = `${process.env.NEXTAUTH_URL || 'https://www.a-finpart.com'}/logo.png`;
  const totalHT = data.items.reduce((s: number, it: any) => s + it.quantity * it.unitPrice, 0);
  const totalTVA = data.items.reduce((s: number, it: any) => s + (it.quantity * it.unitPrice * it.tva) / 100, 0);
  const totalTTC = totalHT + totalTVA;
  const remainingAmount = originalAmount ? originalAmount - totalTTC : 0;

  return `<!DOCTYPE html>
  <html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Facture ${data.company.invoiceNumber ?? ''}</title>
    <style>
      * { box-sizing: border-box; }
      body { 
        font-family: Inter, Arial, Helvetica, sans-serif; 
        margin: 0; 
        padding: 12px; 
        color: #111827; 
        font-size: 11px;
        line-height: 1.3;
        max-height: 148mm; /* Demi-page A4 */
        overflow: hidden;
      }
      .container { 
        display: flex; 
        flex-direction: column; 
        height: 100%;
        gap: 4px;
      }
      .header { 
        display: flex; 
        align-items: flex-start; 
        gap: 8px; 
        margin-bottom: 4px; 
      }
      .logo { 
        width: 40px; 
        height: 40px; 
        object-fit: contain; 
        flex-shrink: 0;
      }
      .header-info {
        flex: 1;
        font-size: 10px;
      }
      .header-info table { 
        border-collapse: collapse; 
        width: 100%; 
      }
      .header-info th, .header-info td { 
        border: 1px solid #d1d5db; 
        padding: 2px 4px; 
        font-size: 9px; 
      }
      .header-info th { 
        background: #f3f4f6; 
        text-align: left; 
        font-weight: 600;
      }
      .main-content {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 6px;
        flex: 1;
      }
      .card { 
        border: 1px solid #d1d5db; 
        border-radius: 4px; 
        padding: 6px; 
        font-size: 10px; 
        background: #fafafa;
      }
      .card-title { 
        font-weight: 600; 
        margin-bottom: 3px; 
        font-size: 10px; 
        color: #374151;
        border-bottom: 1px solid #e5e7eb;
        padding-bottom: 2px;
      }
      .card-content {
        font-size: 9px;
        line-height: 1.1;
      }
      .items-table { 
        border-collapse: collapse; 
        width: 100%; 
        font-size: 9px;
        margin-top: 4px;
      }
      .items-table th, .items-table td { 
        border: 1px solid #d1d5db; 
        padding: 2px 3px; 
        font-size: 8px; 
      }
      .items-table th { 
        background: #f3f4f6; 
        text-align: left; 
        font-weight: 600;
      }
      .text-right { text-align: right; }
      .text-center { text-align: center; }
      .footer { 
        margin-top: 4px; 
        text-align: center; 
        font-size: 8px; 
        color: #6b7280; 
        border-top: 1px solid #d1d5db; 
        padding-top: 3px; 
        flex-shrink: 0;
      }
      .status-badge {
        display: inline-block;
        padding: 1px 4px;
        border-radius: 3px;
        font-size: 8px;
        font-weight: 600;
        text-transform: uppercase;
      }
      .status-paid { background: #dcfce7; color: #166534; }
      .status-partial { background: #fef3c7; color: #92400e; }
      .status-pending { background: #fee2e2; color: #dc2626; }
      .payment-info {
        background: #f0f9ff;
        border: 1px solid #0ea5e9;
        border-radius: 3px;
        padding: 3px;
        margin-top: 2px;
        font-size: 8px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <img class="logo" src="${logoUrl}" alt="CI.DES Logo" />
        <div class="header-info">
          <table>
            <tbody>
              <tr>
                <th>Titre</th>
                <th>Code</th>
                <th>Révision</th>
                <th>Date</th>
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
      </div>

      <div class="main-content">
        <div class="card">
          <div class="card-title">${data.company.name}</div>
          <div class="card-content">
            <div>${data.company.contactName ?? ''}</div>
            <div>${data.company.addressLines.join('<br/>')}</div>
            <div>SIRET : ${data.company.siret ?? ''}</div>
            <div><strong>${data.company.invoiceNumberLabel ?? 'FACTURE N°'} ${data.company.invoiceNumber ?? ''}</strong></div>
            <div>${data.company.invoiceDateLabel ?? 'Le'} ${data.company.invoiceDate ?? ''}</div>
          </div>
        </div>

        <div class="card">
          <div class="card-title">Destinataire</div>
          <div class="card-content">
            <div><strong>${data.recipient.name}</strong></div>
            <div>${data.recipient.addressLines.join('<br/>')}</div>
            <div>${data.recipient.email ?? ''}</div>
            ${invoiceData?.paymentMethod ? `<div>Méthode: ${invoiceData.paymentMethod}</div>` : ''}
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-title">Détails de la formation</div>
        <div class="card-content">
          <div><strong>Devis:</strong> ${invoiceData?.devis_numero || 'N/A'}</div>
          <div><strong>Session:</strong> ${invoiceData?.session || 'Non spécifiée'}</div>
          <div><strong>Désignation:</strong> ${invoiceData?.designation || 'Formation Cordiste IRATA'}</div>
          ${invoiceData?.notes ? `<div><strong>Notes:</strong> ${invoiceData.notes}</div>` : ''}
        </div>
      </div>

      <table class="items-table">
        <thead>
          <tr>
            <th>Réf.</th>
            <th>Désignation</th>
            <th>Qté</th>
            <th>Prix HT</th>
            <th>TVA</th>
            <th>Total HT</th>
          </tr>
        </thead>
        <tbody>
          ${data.items.map((it: any) => {
            const montantHT = it.quantity * it.unitPrice;
            return `<tr>
              <td>${it.reference}</td>
              <td>${(it.designation || '').replace(/\n/g, '<br/>')}</td>
              <td class="text-center">${it.quantity}</td>
              <td class="text-right">${euro(it.unitPrice)}</td>
              <td class="text-center">${it.tva}%</td>
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
            <td colspan="5" class="text-right">TVA</td>
            <td class="text-right">${euro(totalTVA)}</td>
          </tr>
          <tr style="background: #f3f4f6;">
            <td colspan="5" class="text-right"><strong>TOTAL TTC</strong></td>
            <td class="text-right"><strong>${euro(totalTTC)}</strong></td>
          </tr>
          ${remainingAmount > 0 ? `
          <tr>
            <td colspan="5" class="text-right" style="color: #dc2626;"><strong>Reste à payer</strong></td>
            <td class="text-right" style="color: #dc2626;"><strong>${euro(remainingAmount)}</strong></td>
          </tr>
          ` : ''}
        </tfoot>
      </table>

      <div class="payment-info">
        <div><strong>Statut:</strong> 
          <span class="status-badge ${invoiceData?.paymentStatus === 'PAID' ? 'status-paid' : invoiceData?.paymentStatus === 'PARTIAL' ? 'status-partial' : 'status-pending'}">
            ${invoiceData?.paymentStatus === 'PAID' ? 'Payée' : invoiceData?.paymentStatus === 'PARTIAL' ? 'Partiel' : 'En attente'}
          </span>
        </div>
        ${invoiceData?.paymentStatus === 'PARTIAL' && invoiceData?.paidAmount ? `
          <div><strong>Montant payé:</strong> ${euro(invoiceData.paidAmount)}</div>
        ` : ''}
        <div><strong>Créé le:</strong> ${new Date(invoiceData?.createdAt || Date.now()).toLocaleDateString('fr-FR')}</div>
        <div><strong>Mis à jour:</strong> ${new Date(invoiceData?.updatedAt || Date.now()).toLocaleDateString('fr-FR')}</div>
      </div>

      <div class="footer">
        <div><strong>CI.DES sasu</strong> · Capital 2 500 Euros · SIRET : 87840789900011</div>
        <div>VAT : FR71878407899 · ${data.footerRight ?? 'Page 1 sur 1'}</div>
      </div>
    </div>
  </body>
  </html>`;
}
