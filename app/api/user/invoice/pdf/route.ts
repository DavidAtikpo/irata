import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { PrismaClient } from '@prisma/client';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { readFileSync } from 'fs';
import { join } from 'path';

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

    // Récupérer la facture avec vérification d'autorisation
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        userId: user.id, // Vérifier que la facture appartient à l'utilisateur
      },
      include: {
        contrat: {
          include: {
            devis: true,
          },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Facture non trouvée' }, { status: 404 });
    }

    // Charger le logo en base64
    let logoBase64 = '';
    try {
      const logoPath = join(process.cwd(), 'public', 'logo.png');
      const logoBuffer = readFileSync(logoPath);
      logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;
    } catch (error) {
      console.warn('Logo non trouvé, utilisation d\'un placeholder');
      logoBase64 = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjUwIiB2aWV3Qm94PSIwIDAgMjAwIDUwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iNTAiIGZpbGw9IiM2QjcyOEYiLz48dGV4dCB4PSIxMDAiIHk9IjMwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5DSURFUyBMb2dvPC90ZXh0Pjwvc3ZnPg==';
    }

    // Générer le HTML pour le PDF avec le même format que l'aperçu
    const totalHT = invoice.amount;
    const totalTVA = 0; // TVA à 0%
    const totalTTC = totalHT + totalTVA;

    const html = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Facture ${invoice.invoiceNumber}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 2cm;
          }
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            display: flex;
            align-items: flex-start;
            margin-bottom: 20px;
          }
          .logo {
            width: 60px;
            height: 60px;
            margin-right: 16px;
          }
          .info-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
          }
          .info-table td {
            border: 1px solid #e5e7eb;
            padding: 6px 8px;
          }
          .info-table th {
            border: 1px solid #e5e7eb;
            padding: 6px 8px;
            background: #f9fafb;
            font-weight: bold;
            text-align: left;
          }
          .grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin: 24px 0;
          }
          .card {
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            padding: 12px;
            font-size: 11px;
          }
          .card-title {
            font-weight: 600;
            margin-bottom: 6px;
            font-size: 12px;
          }
          .recipient {
            text-align: center;
            margin: 24px 0;
            font-size: 12px;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
            margin: 24px 0;
          }
          .items-table th,
          .items-table td {
            border: 1px solid #e5e7eb;
            padding: 6px 8px;
          }
          .items-table th {
            background: #f9fafb;
            font-weight: bold;
            text-align: left;
          }
          .text-right {
            text-align: right;
          }
          .text-center {
            text-align: center;
          }
          .totals {
            margin-top: 24px;
          }
          .footer {
            margin-top: 32px;
            text-align: center;
            font-size: 10px;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
            padding-top: 12px;
          }
          .whitespace-pre-line {
            white-space: pre-line;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Header with Logo and Info Table -->
          <div class="header">
            <img src="${logoBase64}" alt="CI.DES Logo" class="logo">
            <table class="info-table">
              <tbody>
                <tr>
                  <th>Titre</th>
                  <th>Numéro de code</th>
                  <th>Révision</th>
                  <th>Création date</th>
                </tr>
                <tr>
                  <td>TRAME BDC DEVIS FACTURE</td>
                  <td>ENR-CIDFA-COMP 002</td>
                  <td>00</td>
                  <td>${new Date().toLocaleDateString('fr-FR')}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Company / Customer blocks -->
          <div class="grid">
            <div class="card">
              <div class="card-title">CI.DES</div>
              <div>CHEZ CHAGNEAU</div>
              <div>17270 BORESSE-ET-MARTRON</div>
              <div>admin38@cides.fr</div>
              <div>SIRET: 87840789900011</div>
              <div style="margin-top: 8px;">
                <strong>FACTURE N°</strong> ${invoice.invoiceNumber}
              </div>
              <div>
                <strong>Le</strong> ${new Date(invoice.createdAt).toLocaleDateString('fr-FR')}
              </div>
            </div>

            <div class="card">
              <div class="card-title">FRANCE TRAVAIL DR BRETAGNE</div>
              <div>Adresses :</div>
              <div><strong>N°SIRET:</strong> 13000548108070</div>
              <div><strong>N°Convention:</strong> 41C27G263296</div>
              <div style="margin-top: 8px;">
                <strong>Stagiaire:</strong> ${invoice.contrat.nom} ${invoice.contrat.prenom}
              </div>
              <div>
                <strong>Email:</strong> ${user.email}
              </div>
            </div>
          </div>

          <!-- Recipient -->
          <div class="recipient">
            <div style="font-weight: 600;">Monsieur ${invoice.contrat.nom} ${invoice.contrat.prenom}</div>
            <div>Adresse de l'utilisateur</div>
            <div>Email: ${user.email}</div>
          </div>

          <!-- Items Table -->
          <table class="items-table">
            <thead>
              <tr>
                <th>Référence</th>
                <th>Désignation</th>
                <th class="text-right">Quantité</th>
                <th class="text-right">Prix unitaire</th>
                <th class="text-right">TVA</th>
                <th class="text-right">Montant HT</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>CI.IFF</td>
                                 <td class="whitespace-pre-line">Formation Cordiste IRATA
${invoice.contrat?.devis?.numero ? `Devis #${invoice.contrat.devis.numero}` : ''}</td>
                <td class="text-right">1.00</td>
                <td class="text-right">${invoice.amount.toFixed(2)} €</td>
                <td class="text-right">0.00 %</td>
                <td class="text-right">${invoice.amount.toFixed(2)} €</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colspan="5" class="text-right"><strong>Total HT</strong></td>
                <td class="text-right"><strong>${totalHT.toFixed(2)} €</strong></td>
              </tr>
              <tr>
                <td colspan="5" class="text-right">Total TVA</td>
                <td class="text-right">${totalTVA.toFixed(2)} €</td>
              </tr>
              <tr style="background-color: #f3f4f6;">
                <td colspan="5" class="text-right"><strong>Total TTC</strong></td>
                <td class="text-right"><strong>${totalTTC.toFixed(2)} €</strong></td>
              </tr>
              ${invoice.paymentStatus === 'PARTIAL' && invoice.paidAmount ? `
              <tr style="color: #dc2626;">
                <td colspan="5" class="text-right"><strong>Reste à payer</strong></td>
                <td class="text-right"><strong>${(invoice.amount - invoice.paidAmount).toFixed(2)} €</strong></td>
              </tr>
              ` : ''}
            </tfoot>
          </table>

          <!-- Footer -->
          <div class="footer">
            <div><strong>CI.DES sasu</strong> · Capital 2 500 Euros</div>
            <div>SIRET : 87840789900011 · VAT : FR71878407899</div>
            <div style="margin-top: 8px;">Page 1 sur 1</div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Générer le PDF avec Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '2cm',
        right: '2cm',
        bottom: '3cm',
        left: '2cm',
      },
      displayHeaderFooter: false,
    });

    await browser.close();

    // Retourner le PDF
    return new NextResponse(Buffer.from(pdf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="facture_${invoice.invoiceNumber.replace(/\s+/g, '_')}.pdf"`,
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
