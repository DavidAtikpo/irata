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

    // Récupérer le contrat avec les détails du devis
    const contrat = await prisma.contrat.findUnique({
      where: { id },
      include: {
        devis: {
          include: {
            demande: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    if (!contrat) {
      return NextResponse.json(
        { message: 'Contrat non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier que le contrat appartient à l'utilisateur
    if (contrat.userId !== session.user.id) {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Générer le HTML du contrat
    const html = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Contrat de formation - ${contrat.devis.demande.session}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
            line-height: 1.6;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 20px;
          }
          .logo {
            width: 80px;
            height: 80px;
            margin: 0 auto 10px;
            background-color: #2563eb;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 24px;
          }
          .title {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
            margin: 0;
          }
          .subtitle {
            font-size: 16px;
            color: #666;
            margin: 5px 0 0 0;
          }
          .section {
            margin-bottom: 25px;
          }
          .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 5px;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 20px;
          }
          .info-item {
            background-color: #f9fafb;
            padding: 10px;
            border-radius: 5px;
            border-left: 3px solid #2563eb;
          }
          .info-label {
            font-weight: bold;
            color: #666;
            font-size: 12px;
            text-transform: uppercase;
            margin-bottom: 5px;
          }
          .info-value {
            font-size: 14px;
            color: #333;
          }
          .signature-section {
            margin-top: 40px;
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
          }
          .signature-box {
            border: 1px solid #d1d5db;
            padding: 15px;
            margin-top: 10px;
            min-height: 80px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
          }
          .status-badge {
            display: inline-block;
            padding: 5px 10px;
            border-radius: 15px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
          }
          .status-validated {
            background-color: #dcfce7;
            color: #166534;
          }
          .status-signed {
            background-color: #dbeafe;
            color: #1e40af;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">CI</div>
          <h1 class="title">CI.DES Formation</h1>
          <p class="subtitle">Contrat de formation professionnelle</p>
        </div>

        <div class="section">
          <h2 class="section-title">Informations du contrat</h2>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Numéro de contrat</div>
              <div class="info-value">#${contrat.id.slice(-6)}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Numéro de devis</div>
              <div class="info-value">#${contrat.devis.numero}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Session de formation</div>
              <div class="info-value">${contrat.devis.demande.session}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Montant</div>
              <div class="info-value">${contrat.devis.montant.toLocaleString('fr-FR')} €</div>
            </div>
            <div class="info-item">
              <div class="info-label">Date de signature</div>
              <div class="info-value">${new Date(contrat.dateSignature).toLocaleDateString('fr-FR')}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Statut</div>
              <div class="info-value">
                <span class="status-badge ${contrat.statut === 'VALIDE' ? 'status-validated' : 'status-signed'}">
                  ${contrat.statut === 'VALIDE' ? 'Validé' : contrat.statut === 'SIGNE' ? 'Signé' : contrat.statut}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2 class="section-title">Informations du stagiaire</h2>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Nom complet</div>
              <div class="info-value">${contrat.prenom} ${contrat.nom}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Adresse</div>
              <div class="info-value">${contrat.adresse}</div>
            </div>
            ${contrat.profession ? `
            <div class="info-item">
              <div class="info-label">Profession</div>
              <div class="info-value">${contrat.profession}</div>
            </div>
            ` : ''}
            <div class="info-item">
              <div class="info-label">Email</div>
              <div class="info-value">${contrat.devis.demande.user.email}</div>
            </div>
          </div>
        </div>

        ${contrat.devis.dateFormation ? `
        <div class="section">
          <h2 class="section-title">Détails de la formation</h2>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Date de formation</div>
              <div class="info-value">${new Date(contrat.devis.dateFormation).toLocaleDateString('fr-FR')}</div>
            </div>
          </div>
        </div>
        ` : ''}

        <div class="signature-section">
          <h2 class="section-title">Signature</h2>
          <div class="signature-box">
            ${contrat.signature ? `<img src="${contrat.signature}" alt="Signature" style="max-width: 200px; max-height: 60px;" />` : 'Signature électronique'}
          </div>
          <p style="font-size: 12px; color: #666; margin-top: 10px;">
            Signature du stagiaire : ${contrat.prenom} ${contrat.nom}
          </p>
        </div>

        <div class="footer">
          <p><strong>CI.DES sasu</strong> - Capital 2 500 Euros</p>
          <p>SIRET: 87840789900011 - VAT: FR71878407899</p>
          <p>250501 CI.DES 2504SS03 11 Florent MIRBEAU Contrat Formation Professionnelle</p>
          <p style="margin-top: 10px; font-size: 10px; color: #999;">
            Document généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}
          </p>
        </div>
      </body>
      </html>
    `;

    // Générer le PDF avec Puppeteer
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setContent(html);
    
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

    // Retourner le PDF
    return new NextResponse(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="contrat_${contrat.devis.numero}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la génération du PDF' },
      { status: 500 }
    );
  }
} 