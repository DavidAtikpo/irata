import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import puppeteer from 'puppeteer';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'USER') {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Récupérer le contrat et le devis associé
    const contrat = await prisma.contrat.findUnique({
      where: { id },
      include: {
        devis: true,
      },
    });

    if (!contrat || !contrat.devis) {
      return NextResponse.json({ message: 'Contrat ou devis introuvable' }, { status: 404 });
    }

    // Vérifier que le contrat appartient à l'utilisateur connecté
    if (contrat.userId !== session.user.id) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    // Vérifier statut validé pour autoriser la facture
    if (contrat.statut !== 'VALIDE') {
      return NextResponse.json({ message: 'Facture disponible après validation du contrat' }, { status: 403 });
    }

    const devis = contrat.devis as any;

    const qty = Number(devis.quantite || 1);
    const unitPrice = Number(devis.prixUnitaire || 0);
    const tva = Number(devis.tva || 0);
    const totalHT = qty * unitPrice;
    const totalTVA = (totalHT * tva) / 100;
    const totalTTC = totalHT + totalTVA;

    // Générer HTML de facture
    const html = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Facture ${devis.numero}</title>
        <style>
          body { font-family: Arial, sans-serif; color:#111827; margin:0; padding:24px; }
          .header { display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; }
          .brand { font-weight:bold; color:#111827; }
          .meta { font-size:12px; color:#374151; }
          .title { font-size:20px; font-weight:bold; margin:16px 0 8px; }
          .grid { display:grid; grid-template-columns: 1fr 1fr; gap:16px; }
          .card { background:#fff; border:1px solid #e5e7eb; border-radius:8px; padding:12px; }
          table { width:100%; border-collapse:collapse; margin-top:12px; }
          th, td { border:1px solid #e5e7eb; padding:8px; font-size:12px; }
          th { background:#f9fafb; text-align:left; }
          .totals { margin-top:12px; width:100%; }
          .totals td { border:none; padding:4px 0; font-size:13px; }
          .right { text-align:right; }
          .footer { margin-top:24px; text-align:center; font-size:11px; color:#6b7280; border-top:1px solid #e5e7eb; padding-top:12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="brand">CI.DES</div>
            <div class="meta">SIRET: 87840789900011 · VAT: FR71878407899</div>
          </div>
          <div class="meta">
            <div><strong>FACTURE N°</strong> ${devis.numero}</div>
            <div><strong>Le</strong> ${new Date().toLocaleDateString('fr-FR')}</div>
          </div>
        </div>

        <div class="grid">
          <div class="card">
            <div class="title">Émetteur</div>
            <div>CI.DES</div>
            <div>CHEZ CHAGNEAU</div>
            <div>17270 BORESSE-ET-MARTRON</div>
            <div>admin38@cides.fr</div>
          </div>
          <div class="card">
            <div class="title">Destinataire</div>
            <div>${session.user.prenom || ''} ${session.user.nom || ''}</div>
            <div>${contrat.adresse || ''}</div>
            <div>${session.user.email}</div>
            <div style="margin-top:8px; font-size:12px;"><strong>Stagiaire</strong>: ${session.user.prenom || ''} ${session.user.nom || ''}</div>
          </div>
        </div>

        <div class="title">Détails</div>
        <table>
          <thead>
            <tr>
              <th>Référence</th>
              <th>Désignation</th>
              <th class="right">Quantité</th>
              <th class="right">PU HT</th>
              <th class="right">TVA %</th>
              <th class="right">Montant HT</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>CI.IFF</td>
              <td>${devis.designation || 'Prestation de formation'}</td>
              <td class="right">${qty.toFixed(2)}</td>
              <td class="right">${unitPrice.toFixed(2)} €</td>
              <td class="right">${tva.toFixed(2)}</td>
              <td class="right">${totalHT.toFixed(2)} €</td>
            </tr>
          </tbody>
        </table>

        <table class="totals">
          <tr>
            <td class="right" style="width:80%">Total HT</td>
            <td class="right" style="width:20%"><strong>${totalHT.toFixed(2)} €</strong></td>
          </tr>
          <tr>
            <td class="right">TVA</td>
            <td class="right"><strong>${totalTVA.toFixed(2)} €</strong></td>
          </tr>
          <tr>
            <td class="right">Total TTC</td>
            <td class="right"><strong>${totalTTC.toFixed(2)} €</strong></td>
          </tr>
        </table>

        <div class="footer">
          CI.DES sasu · Capital 2 500 Euros · SIRET : 87840789900011 · VAT : FR71878407899 · Page 1 sur 1
        </div>
      </body>
      </html>
    `;

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
    
    const pdf = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();

    const arrayBuffer = pdf.buffer.slice(pdf.byteOffset, pdf.byteOffset + pdf.byteLength) as ArrayBuffer;
    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="facture_${devis.numero}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Erreur génération facture:', error);
    return NextResponse.json({ message: 'Erreur lors de la génération de la facture' }, { status: 500 });
  }
}
