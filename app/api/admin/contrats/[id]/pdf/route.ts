import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from 'lib/prisma';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { existsSync } from 'node:fs';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'ADMIN') {
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
        user: {
          select: {
            email: true,
            nom: true,
            prenom: true,
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

    const isConvention = Boolean(
      contrat.entrepriseNom ||
      contrat.entrepriseAdresse ||
      contrat.entrepriseTelephone ||
      contrat.devis?.demande?.entreprise ||
      ((contrat.devis?.demande as any)?.typeInscription || '').toLowerCase() === 'entreprise'
    );

    const numeroPrefix = isConvention ? 'CI.ICE' : 'CI.ICP';
    const displayNumero = contrat.numero
      || (contrat.devis?.numero ? contrat.devis.numero.replace(/^CI\.DEV/i, numeroPrefix) : '');
    const displayReference = contrat.reference
      || (contrat.devis?.referenceAffaire ? contrat.devis.referenceAffaire.replace(/^CI\.DEV/i, numeroPrefix) : '');

    // Générer le HTML du contrat/convention
    const html = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${isConvention ? 'Convention' : 'Contrat'} de formation - ${contrat.devis.demande.session}</title>
        <style>
          body {
            font-family: Inter, Arial, Helvetica, sans-serif;
            font-size: 15px;
            margin: 0;
            padding: 20px;
            color: #333;
            line-height: 1.5;
          }
          .container { max-width: 900px; margin: 0 auto; }
          .header {
            margin-bottom: 10px;
            padding-bottom: 10px;
          }
          .header-row { display: flex; gap: 16px; align-items: flex-start; }
          .header-row img { width: 80px; height: 80px; object-fit: contain; }
          .info-table { width: 100%; border-collapse: collapse; }
          .info-table td { border: 1px solid #d1d5db; padding: 8px; font-size: 10px; }
          .info-table .th { font-weight: 600; color: #1f2937; background: #f9fafb; }
          .info-table .title-cell { font-weight: 700; text-decoration: underline; color: #111827; }
          .section {
            margin-bottom: 15px;
          }
          .section-title {
            font-size: 14px;
            font-weight: bold;
            color: #111827;
            margin-bottom: 5px;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 20px;
          }
          .info-item {
            background-color:#ffffff;
            padding: 2px;
          }
          .info-label {
            font-weight: bold;
            color: #666;
            font-size: 10px;
            text-transform: uppercase;
            margin-bottom: 5px;
          }
          .info-value {
            font-size: 12px;
            color: #333;
          }
          .center { text-align: center; }
          .muted { color: #6b7280; font-style: italic; }
          .numbers { display: flex; justify-content: space-between; font-size: 10px; margin-top: 6px; }
          .signature-section {
            margin-top: 10px;
            border-top: 1px solid #e5e7eb;
            padding-top: 10px;
          }
          .signature-box {
            padding: 5px;
            margin-top: 5px;
            min-height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .footer {
            margin-top: 10px;
            font-size: 10px;
            color: #666;
            border-top: 1px solid #e5e7eb;
            padding-top: 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .status-badge {
            display: inline-block;
            padding: 5px 10px;
            border-radius: 15px;
            font-size: 10px;
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
          ul { padding-left: 18px; }
          li { margin-bottom: 6px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="header-row">
              <img src="${process.env.NEXTAUTH_URL || 'https://www.a-finpart.com'}/logo.png" alt="CI.DES Logo" style="height: 70px;">
              <table class="info-table">
                <tbody>
                  <tr>
                    <td class="th">Titre</td>
                    <td class="th">Code Number</td>
                    <td class="th">Revision</td>
                    <td class="th">Creation date</td>
                  </tr>
                  <tr>
                    <td class="title-cell">${isConvention ? 'CI.DES AGREEMENT SERVICE CONVENTION' : 'CI.DES AGREEMENT SERVICE CONTRACT'}</td>
                    <td class="title-cell">ENR-CIDESA-RH 023</td>
                    <td class="title-cell">02</td>
                    <td class="title-cell">29/07/2024</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="center">
            <h2 class="section-title" style="border: none; margin-bottom: 6px;">${isConvention ? 'CONVENTION' : 'CONTRAT'} DE FORMATION PROFESSIONNELLE</h2>
            <div class="muted">En application des articles L. 6353-3 à L. 6353-7 du Code du Travail</div>
            <div class="numbers">
              ${displayNumero ? `<div><strong>Numéro:</strong> ${displayNumero}</div>` : ''}
              ${displayReference ? `<div><strong>Référence:</strong> ${displayReference}</div>` : ''}
            </div>
          </div>

        <div class="section">
          <h2 class="section-title">A. Organisme de Formation :</h2>
          <div class="info-item">
            <div class="info-value">La société CI.DES sasu, immatriculée sous le numéro SIREN-SIRET : 878407899 00011,</div>
            <div class="info-value">représentée par Monsieur Laurent ARDOUIN, gérant de la société et du centre de formation cordiste</div>
            <div class="info-value">À l'adresse « Chez Chagneau » 17 270 Boresse et Martron France</div>
            <div class="info-value">Déclaration d'activité enregistrée sous le n° : En cours auprès du Préfet de la région Nouvelle-Aquitaine</div>
            <div class="muted">(Ci-après dénommé le centre de formation).</div>
          </div>
        </div>

        <div class="section">
          <h2 class="section-title">B. ${isConvention ? 'Si Entreprise Cocontractante :' : 'Si Particulier Cocontractant :'}</h2>
          ${isConvention ? `
            <div class="info-grid">
              <div class="info-item" style="grid-column: 1 / span 2">
                <div class="info-label">Nom de l'entreprise</div>
                <div class="info-value">${contrat.entrepriseNom || '—'}</div>
              </div>
              <div class="info-item" style="grid-column: 1 / span 2">
                <div class="info-label">Adresse de l'entreprise</div>
                <div class="info-value">${contrat.entrepriseAdresse || contrat.adresse || '—'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Code postal</div>
                <div class="info-value">${contrat.entrepriseCodePostal || contrat.codePostal || '—'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Ville</div>
                <div class="info-value">${contrat.entrepriseVille || contrat.ville || '—'}</div>
              </div>
              <div class="info-item" style="grid-column: 1 / span 2">
                <div class="info-label">Téléphone de l'entreprise</div>
                <div class="info-value">${contrat.entrepriseTelephone || '—'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Nom du signataire</div>
                <div class="info-value">${contrat.nom} ${contrat.prenom}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Email</div>
                <div class="info-value">${contrat.user.email}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Date de signature</div>
                <div class="info-value">${new Date(contrat.dateSignature).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
              </div>
            </div>
          ` : `
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">NOM</div>
                <div class="info-value">${contrat.nom}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Prénom</div>
                <div class="info-value">${contrat.prenom}</div>
              </div>
              <div class="info-item" style="grid-column: 1 / span 2">
                <div class="info-label">Adresse</div>
                <div class="info-value">${contrat.adresse}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Profession</div>
                <div class="info-value">${contrat.profession || 'Non renseigné'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Téléphone</div>
                <div class="info-value">${contrat.telephone || '—'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Email</div>
                <div class="info-value">${contrat.user.email}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Date de signature</div>
                <div class="info-value">${new Date(contrat.dateSignature).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
              </div>
            </div>
          `}
          <div class="muted">(Ci-après dénommé le stagiaire).</div>
        </div>

        <div class="section">
          <h2 class="section-title">Article 1 - Objet :</h2>
          <div class="info-value">En exécution du présent ${isConvention ? 'convention' : 'contrat'}, l'organisme de formation s'engage à organiser l'action de formation intitulée :</div>
          <div class="info-value"><strong>« Formation Cordiste IRATA - ${contrat.devis.demande.session} »</strong></div>
        </div>

        <div class="section">
          <h2 class="section-title">Article 2 - Nature et caractéristique des actions de formation :</h2>
          <ul>
            <li>L'action de formation entre dans la catégorie des actions de « développement de compétences avec accès à des niveaux de qualifications » prévue par l'article L. 6313-1 du code du travail.</li>
            <li>Elle a pour objectif de qualifié et certifié le stagiaire comme Technicien cordiste apte à exercer des interventions cordiste et apte à évoluer sur cordes en sécurité.</li>
            <li>Sa durée est fixée à : 5 jours soit 40 heures ${contrat.devis.dateFormation ? `à compter du ${new Date(contrat.devis.dateFormation).toLocaleDateString('fr-FR')}` : ''}</li>
            <li>Programme de formation (voir Manuel Stagiaire)</li>
            <li>Sanction de la formation : CERTIFICATION IRATA si aptitude reconnu l'hors de l'examen</li>
          </ul>
        </div>

        <div class="section">
          <h2 class="section-title">Article 3 - Niveau de connaissances préalables nécessaire :</h2>
          <div class="info-value">Afin de suivre au mieux l'action de formation susvisée et obtenir la ou les qualifications auxquelles elle prépare, le stagiaire est informé qu'il est nécessaire de posséder, avant l'entrée en formation, le niveau de connaissances suivant :</div>
          <div class="info-value"><strong>« Être majeur, en bonne condition mentale et physique ».</strong></div>
        </div>

        <div class="section">
          <h2 class="section-title">Article 4 - Délai de rétractation</h2>
          <div class="info-value">Le stagiaire est informé qu'il dispose d'un délai de rétractation de 10 jours (14 jours si le ${isConvention ? 'convention' : 'contrat'} est conclu à distance ou hors établissement), à compter de la date de la conclusion du présent ${isConvention ? 'convention' : 'contrat'}.</div>
          <div class="info-value">Le cas échéant, le stagiaire informe l'organisme de formation par lettre recommandée avec accusé de réception.</div>
          <div class="info-value">Aucune somme ne peut être exigée du stagiaire qui a exercé son droit de rétractation dans les délais prévus.</div>
        </div>

        <div class="section">
          <h2 class="section-title">Article 5 - Dispositions financières</h2>
          <div class="info-value">Le prix de l'action de formation est fixé à : <strong>${(contrat.devis.montant || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Euros net</strong></div>
          <div class="info-value">Le stagiaire s'engage à payer la prestation selon les modalités de paiement suivantes :</div>
          <ul>
            <li>Après un délai de rétractation mentionné à l'article 5 du présent ${isConvention ? 'convention' : 'contrat'}, le stagiaire effectue un premier versement d'un montant de 350 euros.</li>
            <li>Le paiement du solde, à la charge du stagiaire, est échelonné au fur et à mesure du déroulement de l'action de formation, selon le calendrier ci-dessous :</li>
            <li>900 euros le premier jour de formation et 100 euros au deuxième jour de formation</li>
          </ul>
        </div>

        <div class="section">
          <h2 class="section-title">Article 6 - Interruption du stage</h2>
          <div class="info-value">En cas de cessation anticipée de la formation du fait de l'organisme de formation ou l'abandon du stage par le stagiaire pour un autre motif que la force majeure dûment reconnue, le présent ${isConvention ? 'convention' : 'contrat'} est résilié selon les modalités financières suivantes :</div>
          <ul>
            <li>Paiement des heures réellement suivies selon règle du prorata temporis</li>
            <li>Versement à titre de dédommagement pour les heures non suivies du fait du stagiaire : 900 euros</li>
          </ul>
          <div class="info-value">Si le stagiaire est empêché de suivre la formation par suite de force majeure dûment reconnue, le ${isConvention ? 'convention' : 'contrat'} de formation professionnelle est résilié. Dans ce cas, seules les prestations effectivement dispensées sont dues au prorata temporis de leur valeur prévue au présent ${isConvention ? 'convention' : 'contrat'}.</div>
        </div>

        <div class="section">
          <h2 class="section-title">Article 7 - Cas de différend :</h2>
          <div class="info-value">Si une contestation ou un différend n'ont pu être réglés à l'amiable, le tribunal de Saintes sera compétent pour régler le litige.</div>
        </div>

        <div class="signature-section">
          <h2 class="section-title">Signatures</h2>
          <div style="display:flex; gap: 20px;">
            <div style="flex:1;">
              <div class="info-label">Signature du stagiaire</div>
              <div class="signature-box">
                ${contrat.signature ? `<img src="${contrat.signature}" alt="Signature stagiaire" style="max-width: 120px; max-height: 30px;" />` : 'Signature électronique'}
              </div>
              <div class="muted" style="margin-top:8px;">${contrat.prenom} ${contrat.nom}</div>
            </div>
            <div style="flex:1;">
              <div class="info-label">Signature de l'administrateur</div>
              <div class="signature-box">
                ${contrat.adminSignature ? `<img src="${contrat.adminSignature}" alt="Signature admin" style="max-width: 120px; max-height: 30px;" />` : 'Non signée'}
              </div>
              <div class="muted" style="margin-top:8px;">CI.DES</div>
            </div>
          </div>
        </div>
        </div>
      </body>
      </html>
    `;

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
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      },
      displayHeaderFooter: true,
      footerTemplate: `
        <div style="font-size: 9px; color: #6b7280; text-align: center; width: 100%; padding: 5px 15mm; background-color: white; border-top: 1px solid #e5e7eb;">
          <div style="display: flex; justify-content: space-between; align-items: center; width: 180mm; margin: 0 auto;">
            <div style="flex: 1; font-weight: 500;">
              CI.DES - Contrats
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

    const fileName = `${isConvention ? 'convention' : 'contrat'}_${contrat.devis.numero}.pdf`;

    // Convertir le PDF en ArrayBuffer
    const pdfArrayBuffer = pdfBuffer.buffer.slice(pdfBuffer.byteOffset, pdfBuffer.byteOffset + pdfBuffer.byteLength);
    
    return new NextResponse(pdfArrayBuffer as ArrayBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
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
