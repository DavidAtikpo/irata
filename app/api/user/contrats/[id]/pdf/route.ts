import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from 'lib/prisma';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { execSync } from 'node:child_process';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'USER') {
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

    // S'assurer que le contrat est validé et signé par l'admin avant téléchargement
    if (contrat.statut !== 'VALIDE' || !contrat.adminSignature) {
      return NextResponse.json(
        { message: "Le document n'est disponible qu'après validation et signature admin." },
        { status: 403 }
      );
    }

    const isConvention = Boolean(
      (contrat as any).entrepriseNom ||
      (contrat as any).entrepriseAdresse ||
      (contrat as any).entrepriseTelephone ||
      (contrat.devis?.demande as any)?.entreprise ||
      (((contrat.devis?.demande as any)?.typeInscription || '').toLowerCase() === 'entreprise')
    );

    const numeroPrefix = isConvention ? 'CI.ICE' : 'CI.ICP';
    const displayNumero = (contrat as any).numero
      || (contrat.devis?.numero ? contrat.devis.numero.replace(/^CI\.DEV/i, numeroPrefix) : '');
    const displayReference = (contrat as any).reference
      || (contrat.devis?.referenceAffaire ? contrat.devis.referenceAffaire.replace(/^CI\.DEV/i, numeroPrefix) : '');

    // Générer le HTML du contrat/convention avec structure alignée à la page
    const html = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${isConvention ? 'Convention' : 'Contrat'} de formation - ${contrat.devis.demande.session}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
            line-height: 1.6;
          }
          .container { max-width: 900px; margin: 0 auto; }
          .header {
            margin-bottom: 24px;
            padding-bottom: 10px;
          }
          .header-row { display: flex; gap: 16px; align-items: flex-start; }
          .header-row img { width: 80px; height: 80px; object-fit: contain; }
          .info-table { width: 100%; border-collapse: collapse; }
          .info-table td { border: 1px solid #d1d5db; padding: 8px; font-size: 12px; }
          .info-table .th { font-weight: 600; color: #1f2937; background: #f9fafb; }
          .info-table .title-cell { font-weight: 700; text-decoration: underline; color: #111827; }
          .section {
            margin-bottom: 25px;
          }
          .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #111827;
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
          .center { text-align: center; }
          .muted { color: #6b7280; font-style: italic; }
          .numbers { display: flex; justify-content: space-between; font-size: 12px; margin-top: 6px; }
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
          ul { padding-left: 18px; }
          li { margin-bottom: 6px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="header-row">
              <img src="${process.env.NEXT_PUBLIC_BASE_URL || ''}/logo.png" alt="Logo CI.DES" />
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
          <div class="info-item" style="border-left-color:#111827">
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
                <div class="info-value">${(contrat as any).entrepriseNom || '—'}</div>
              </div>
              <div class="info-item" style="grid-column: 1 / span 2">
                <div class="info-label">Adresse de l'entreprise</div>
                <div class="info-value">${(contrat as any).entrepriseAdresse || (contrat as any).adresse || '—'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Code postal</div>
                <div class="info-value">${(contrat as any).entrepriseCodePostal || (contrat as any).codePostal || '—'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Ville</div>
                <div class="info-value">${(contrat as any).entrepriseVille || (contrat as any).ville || '—'}</div>
              </div>
              <div class="info-item" style="grid-column: 1 / span 2">
                <div class="info-label">Téléphone de l'entreprise</div>
                <div class="info-value">${(contrat as any).entrepriseTelephone || '—'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Nom du signataire</div>
                <div class="info-value">${(contrat as any).nom} ${(contrat as any).prenom}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Email</div>
                <div class="info-value">${contrat.devis.demande.user.email}</div>
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
                <div class="info-value">${(contrat as any).nom}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Prénom</div>
                <div class="info-value">${(contrat as any).prenom}</div>
              </div>
              <div class="info-item" style="grid-column: 1 / span 2">
                <div class="info-label">Adresse</div>
                <div class="info-value">${(contrat as any).adresse}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Profession</div>
                <div class="info-value">${(contrat as any).profession || 'Non renseigné'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Téléphone</div>
                <div class="info-value">${(contrat as any).telephone || '—'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Email</div>
                <div class="info-value">${contrat.devis.demande.user.email}</div>
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
                ${contrat.signature ? `<img src="${contrat.signature}" alt="Signature stagiaire" style="max-width: 220px; max-height: 70px;" />` : 'Signature électronique'}
              </div>
              <div class="muted" style="margin-top:8px;">${(contrat as any).prenom} ${(contrat as any).nom}</div>
            </div>
            <div style="flex:1;">
              <div class="info-label">Signature de l'administrateur</div>
              <div class="signature-box">
                ${contrat.adminSignature ? `<img src="${contrat.adminSignature}" alt="Signature admin" style="max-width: 220px; max-height: 70px;" />` : 'Non signée'}
              </div>
              <div class="muted" style="margin-top:8px;">CI.DES</div>
            </div>
          </div>
        </div>

        <div class="footer">
          <p><strong>CI.DES sasu</strong> - Capital 2 500 Euros</p>
          <p>SIRET: 87840789900011 - VAT: FR71878407899</p>
          <p>250501 CI.DES 2504SS03 11 Florent MIRBEAU Contrat Formation Professionnelle</p>
          <p style="margin-top: 10px; font-size: 10px; color: #999;">
            Document généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}
          </p>
        </div>
        </div>
      </body>
      </html>
    `;

    // Configuration Puppeteer
    const isProduction = process.env.NODE_ENV === 'production';
    
    const browserConfig: any = {
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
      timeout: 30000
    };

    // Configuration spécifique selon l'environnement
    if (isProduction) {
      // En production, utiliser Chromium
      browserConfig.executablePath = await chromium.executablePath();
    } else {
      // En développement, utiliser le Chrome local ou Chromium
      try {
        // Essayer de trouver Chrome
        const chromePath = execSync('where chrome', { encoding: 'utf8' }).trim();
        browserConfig.executablePath = chromePath;
      } catch {
        try {
          // Essayer de trouver Chromium
          const chromiumPath = execSync('where chromium', { encoding: 'utf8' }).trim();
          browserConfig.executablePath = chromiumPath;
        } catch {
          // Utiliser le chemin par défaut
          browserConfig.executablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
        }
      }
    }

    // Générer le PDF avec Puppeteer
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
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      }
    });

    await browser.close();

    // Retourner le PDF
    const arrayBuffer = pdf.buffer.slice(pdf.byteOffset, pdf.byteOffset + pdf.byteLength) as ArrayBuffer;
    return new NextResponse(arrayBuffer, {
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