import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import puppeteer from 'puppeteer';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    console.log('Body reçu:', body);
    
    const { invoiceId, userId } = body;

    if (!invoiceId || !userId) {
      console.log('Paramètres manquants:', { invoiceId, userId });
      return NextResponse.json({ 
        error: 'ID de facture et ID utilisateur requis',
        received: { invoiceId, userId }
      }, { status: 400 });
    }

        // Récupérer la facture avec toutes les informations nécessaires
    const userInvoices = await prisma.$queryRaw`
      SELECT 
        i.id, i."invoiceNumber", i.amount, i."paymentStatus", i."paidAmount", i."createdAt",
        u.prenom, u.nom, u.email,
        c.adresse,
        d.numero as devis_numero,
        dm.session
      FROM "webirata"."Invoice" i
      JOIN "webirata"."User" u ON i."userId" = u.id
      JOIN "webirata"."Contrat" c ON i."contratId" = c.id
      JOIN "webirata"."Devis" d ON c."devisId" = d.id
      JOIN "webirata"."Demande" dm ON d."demandeId" = dm.id
      WHERE i.id = ${invoiceId} AND i."userId" = ${userId}
    `;
    
    console.log('Résultat de la requête:', userInvoices);
    
    const userInvoice = Array.isArray(userInvoices) && userInvoices.length > 0 ? userInvoices[0] : null;

    if (!userInvoice) {
      return NextResponse.json({ error: 'Facture non trouvée' }, { status: 404 });
    }

    console.log('Facture trouvée:', {
      id: userInvoice.id,
      invoiceNumber: userInvoice.invoiceNumber,
      userName: `${userInvoice.prenom} ${userInvoice.nom}`,
      userEmail: userInvoice.email,
      amount: userInvoice.amount,
      paymentStatus: userInvoice.paymentStatus,
      paidAmount: userInvoice.paidAmount,
      devisNumero: userInvoice.devis_numero,
      session: userInvoice.session,
      userAddress: userInvoice.adresse
    });

    // Vérifier que toutes les données nécessaires sont présentes
    if (!userInvoice.prenom || !userInvoice.nom || !userInvoice.email) {
      console.error('Données utilisateur manquantes:', userInvoice);
      return NextResponse.json({ 
        error: 'Données utilisateur incomplètes',
        details: 'Prénom, nom ou email manquant'
      }, { status: 400 });
    }

    // Construire les données de la facture (comme l'API utilisateur)
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
    };

    // Générer le HTML (comme l'API utilisateur)
    const html = buildHtml(invoiceData, userInvoice.amount);

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

    // Générer le PDF avec gestion d'erreur Puppeteer
    try {
      const browser = await puppeteer.launch(browserConfig);
      const page = await browser.newPage();
      
      await page.setViewport({ width: 1200, height: 1600 });
      await page.setContent(html, { 
        waitUntil: ['networkidle0', 'domcontentloaded'],
        timeout: 30000 
      });
      await new Promise(resolve => setTimeout(resolve, 3000));
      
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

      // Vérifier que le numéro de facture existe et le nettoyer
      const invoiceNumber = userInvoice.invoiceNumber || 'facture';
      const cleanInvoiceNumber = invoiceNumber.toString().replace(/\s+/g, '_');
      
      // Convertir le PDF en ArrayBuffer
      const arrayBuffer = pdf.buffer.slice(pdf.byteOffset, pdf.byteOffset + pdf.byteLength) as ArrayBuffer;
      
      return new NextResponse(arrayBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="facture_${cleanInvoiceNumber}.pdf"`
        }
      });

    } catch (puppeteerError) {
      console.error('Erreur Puppeteer, utilisation de l\'alternative client-side:', puppeteerError);
      
      // Alternative: retourner une réponse JSON avec le HTML pour génération côté client
      return NextResponse.json({
        fallbackToClientSide: true,
        htmlContent: html,
        fileName: `facture_${userInvoice.invoiceNumber || 'facture'}.pdf`,
        invoiceData: {
          invoiceNumber: userInvoice.invoiceNumber,
          userName: `${userInvoice.prenom} ${userInvoice.nom}`,
          amount: userInvoice.amount,
          paidAmount: userInvoice.paidAmount,
          paymentStatus: userInvoice.paymentStatus
        }
      }, { status: 200 });
    }

  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error);
    console.error('Détails de l\'erreur:', {
      message: error instanceof Error ? error.message : 'Erreur inconnue',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { 
        error: 'Erreur lors de la génération du PDF',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

function euro(n: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n);
}

function buildHtml(data: any, originalAmount?: number) {
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
        <div>${data.company.contactName ?? ''}</div>
        <div>${data.company.addressLines.join('<br/>')}</div>
        <div>${data.company.email ?? ''}</div>
        <div>${data.company.phone ?? ''}</div>
        <div>SIRET : ${data.company.siret ?? ''}</div>
        <div>${data.company.invoiceNumberLabel ?? 'FACTURE N°'} ${data.company.invoiceNumber ?? ''}</div>
        <div>${data.company.invoiceDateLabel ?? 'Le'} ${data.company.invoiceDate ?? ''}</div>
      </div>

      <div class="card">
        <div class="title">${data.customer.companyTitle ?? 'Client'}</div>
        <div>${data.customer.addressLines.join('<br/>')}</div>
        <div>${data.customer.siretLabel ?? 'N°SIRET :'} ${data.customer.siret ?? ''}</div>
        <div>${data.customer.convLabel ?? 'N°Convention'} ${data.customer.conv ?? ''}</div>
      </div>
    </div>

    <div class="card" style="margin-top: 12px;">
      <div class="title">Destinataire</div>
      <div>${data.recipient.name}</div>
      <div>${data.recipient.addressLines.join('<br/>')}</div>
      <div>${data.recipient.email ?? ''}</div>
      <div>${data.recipient.phone ?? ''}</div>
    </div>

    <table class="items" style="margin-top: 12px;">
      <thead>
        <tr>
          <th>Référence</th>
          <th>Désignation</th>
          <th>Quantité</th>
          <th>Prix unitaire</th>
          <th>TVA %</th>
          <th>Montant HT</th>
        </tr>
      </thead>
      <tbody>
        ${data.items.map((it: any) => {
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
         ${remainingAmount > 0 ? `
         <tr>
           <td colspan="5" class="text-right" style="color: #dc2626;"><strong>Reste à payer</strong></td>
           <td class="text-right" style="color: #dc2626;"><strong>${euro(remainingAmount)}</strong></td>
         </tr>
         ` : ''}
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
