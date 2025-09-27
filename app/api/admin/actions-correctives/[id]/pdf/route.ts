import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from 'lib/prisma';
import puppeteer from 'puppeteer-core';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session?.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Récupérer l'action corrective avec toutes les données nécessaires
    const actionCorrective = await prisma.actionCorrective.findUnique({
      where: { id },
      include: {
        nonConformite: {
          include: {
            detecteur: {
              select: {
                id: true,
                nom: true,
                prenom: true,
                email: true
              }
            }
          }
        },
        responsable: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true
          }
        }
      }
    });

    if (!actionCorrective) {
      return NextResponse.json(
        { message: 'Action corrective non trouvée' },
        { status: 404 }
      );
    }

    // Générer le HTML pour le PDF
    const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Action Corrective - ${actionCorrective.number || actionCorrective.id}</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 20px;
                font-size: 12px;
                line-height: 1.4;
                color: #333;
            }
            .header {
                display: flex;
                align-items: center;
                gap: 20px;
                margin-bottom: 30px;
                border-bottom: 2px solid #333;
                padding-bottom: 20px;
            }
            .logo {
                width: 80px;
                height: 100px;
                object-fit: contain;
            }
            .header-info {
                flex: 1;
            }
            .header-table {
                width: 100%;
                border-collapse: collapse;
                font-size: 10px;
            }
            .header-table td {
                border: 1px solid #333;
                padding: 4px;
                text-align: center;
            }
            .header-table .label {
                font-weight: bold;
                background-color: #f5f5f5;
            }
            .section {
                margin-bottom: 25px;
                border: 1px solid #333;
                border-radius: 4px;
                padding: 15px;
            }
            .section-title {
                font-weight: bold;
                font-size: 14px;
                margin-bottom: 15px;
                text-transform: uppercase;
                border-bottom: 1px solid #ccc;
                padding-bottom: 5px;
            }
            .form-row {
                display: flex;
                gap: 15px;
                margin-bottom: 10px;
            }
            .form-field {
                flex: 1;
            }
            .form-field label {
                display: block;
                font-size: 10px;
                font-weight: bold;
                margin-bottom: 2px;
            }
            .form-field input, .form-field textarea {
                width: 100%;
                border: 1px solid #ccc;
                border-radius: 3px;
                padding: 4px;
                font-size: 11px;
            }
            .form-field textarea {
                height: 60px;
                resize: vertical;
            }
            .checkbox-group {
                display: flex;
                flex-direction: column;
                gap: 5px;
            }
            .checkbox-item {
                display: flex;
                align-items: center;
                gap: 5px;
                font-size: 11px;
            }
            .signature-box {
                border: 1px solid #333;
                border-radius: 4px;
                padding: 10px;
                text-align: center;
                min-height: 80px;
                display: flex;
                align-items: center;
                justify-content: center;
                background-color: #f9f9f9;
            }
            .signature-image {
                max-width: 100%;
                max-height: 60px;
                object-fit: contain;
            }
            .no-signature {
                color: #666;
                font-style: italic;
            }
            .grid-2 {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
            }
            .grid-3 {
                display: grid;
                grid-template-columns: 1fr 1fr 1fr;
                gap: 15px;
            }
            .text-center {
                text-align: center;
            }
            .font-bold {
                font-weight: bold;
            }
            .bg-gray-50 {
                background-color: #f9f9f9;
            }
            .border {
                border: 1px solid #ccc;
            }
            .rounded {
                border-radius: 4px;
            }
            .p-2 {
                padding: 8px;
            }
            .mb-2 {
                margin-bottom: 8px;
            }
            .mt-2 {
                margin-top: 8px;
            }
            @media print {
                body { margin: 0; padding: 15px; }
                .section { break-inside: avoid; }
            }
        </style>
    </head>
    <body>
        <!-- Header -->
        <div class="header">
            <img src="/logo.png" alt="CI.DES Logo" class="logo" />
            <div class="header-info">
                <table class="header-table">
                    <tr>
                        <td class="label">Titre</td>
                        <td class="label">Numéro de code</td>
                        <td class="label">Révision</td>
                        <td class="label">Création date</td>
                    </tr>
                    <tr>
                        <td>CI.DES ACTION CORRECTIVE - (DIGITAL)</td>
                        <td>ENR-CIFRA-QHSE 002</td>
                        <td>00</td>
                        <td>${new Date(actionCorrective.createdAt).toLocaleDateString('fr-FR')}</td>
                    </tr>
                </table>
            </div>
        </div>

        <!-- Informations générales -->
        <div class="section">
            <div class="section-title">Informations Générales</div>
            <div class="form-row">
                <div class="form-field">
                    <label>Émetteur</label>
                    <div class="bg-gray-50 border rounded p-2">${actionCorrective.issuerName || '—'}</div>
                </div>
                <div class="form-field">
                    <label>Destinataire</label>
                    <div class="bg-gray-50 border rounded p-2">${actionCorrective.recipientName || '—'}</div>
                </div>
                <div class="form-field">
                    <label>Date</label>
                    <div class="bg-gray-50 border rounded p-2">${actionCorrective.date || '—'}</div>
                </div>
                <div class="form-field">
                    <label>N°</label>
                    <div class="bg-gray-50 border rounded p-2">${actionCorrective.number || '—'}</div>
                </div>
                <div class="form-field">
                    <label>Département</label>
                    <div class="bg-gray-50 border rounded p-2">${actionCorrective.department || '—'}</div>
                </div>
            </div>
        </div>

        <!-- Partie réservée à l'émetteur -->
        <div class="section">
            <div class="section-title">PARTIE RÉSERVÉE À L'ÉMETTEUR</div>
            
            <div class="form-row">
                <div class="form-field">
                    <label>Origine</label>
                    <div class="checkbox-group">
                        <div class="checkbox-item">
                            <input type="checkbox" ${actionCorrective.originCustomer ? 'checked' : ''} disabled />
                            <span>Client</span>
                        </div>
                        <div class="checkbox-item">
                            <input type="checkbox" ${actionCorrective.originProduction ? 'checked' : ''} disabled />
                            <span>Production</span>
                        </div>
                        <div class="checkbox-item">
                            <input type="checkbox" ${actionCorrective.originAdministration ? 'checked' : ''} disabled />
                            <span>Administration</span>
                        </div>
                        <div class="checkbox-item">
                            <input type="checkbox" ${actionCorrective.originOther ? 'checked' : ''} disabled />
                            <span>Autre</span>
                        </div>
                    </div>
                </div>
                <div class="form-field">
                    <label>Catégorie d'anomalie</label>
                    <div class="bg-gray-50 border rounded p-2">${actionCorrective.categoryOfAnomaly || '—'}</div>
                </div>
            </div>

            <div class="form-field">
                <label>Description</label>
                <div class="bg-gray-50 border rounded p-2" style="min-height: 60px;">${actionCorrective.issuerDescription || '—'}</div>
            </div>

            <div class="form-row">
                <div class="form-field">
                    <div class="checkbox-item">
                        <input type="checkbox" ${actionCorrective.immediateCurativeAction ? 'checked' : ''} disabled />
                        <span>Action curative immédiate</span>
                    </div>
                </div>
                <div class="form-field">
                    <label>Action planifiée ?</label>
                    <div class="bg-gray-50 border rounded p-2">${actionCorrective.actionPlanned || '—'}</div>
                </div>
            </div>

            <div class="form-row">
                <div class="form-field">
                    <div class="checkbox-item">
                        <input type="checkbox" ${actionCorrective.correctiveDescribed ? 'checked' : ''} disabled />
                        <span>Corrective (décrite)</span>
                    </div>
                </div>
                <div class="form-field">
                    <div class="checkbox-item">
                        <input type="checkbox" ${actionCorrective.preventiveDescribed ? 'checked' : ''} disabled />
                        <span>Préventive (décrite)</span>
                    </div>
                </div>
            </div>

            <div class="form-field">
                <label>Collaborateur responsable de l'action</label>
                <div class="bg-gray-50 border rounded p-2">${actionCorrective.collaboratorInCharge || '—'}</div>
            </div>

            <div class="form-field">
                <label>Signature de l'émetteur</label>
                <div class="signature-box">
                    ${actionCorrective.issuerSignature ? 
                        `<img src="${actionCorrective.issuerSignature}" alt="Signature Émetteur" class="signature-image" />` : 
                        '<span class="no-signature">Aucune signature</span>'
                    }
                </div>
            </div>
        </div>

        <!-- Partie réservée au responsable qualité -->
        <div class="section">
            <div class="section-title">PARTIE RÉSERVÉE AU RESPONSABLE QUALITÉ / AUTORITÉ TECHNIQUE / PDG</div>
            
            <div class="form-field">
                <label>Analyse de la cause / Proposition d'action à valider par le PDG</label>
                <div class="bg-gray-50 border rounded p-2" style="min-height: 60px;">${actionCorrective.analysis || '—'}</div>
            </div>

            <div class="form-row">
                <div class="form-field">
                    <label>Délai limite</label>
                    <div class="bg-gray-50 border rounded p-2">${actionCorrective.limitTime || '—'}</div>
                </div>
                <div class="form-field">
                    <label>Collaborateur responsable de l'action (désigné par le PDG)</label>
                    <div class="bg-gray-50 border rounded p-2">${actionCorrective.collaboratorAppointed || '—'}</div>
                </div>
            </div>

            <div class="form-row">
                <div class="form-field">
                    <label>Clôture des actions</label>
                    <div class="bg-gray-50 border rounded p-2">${actionCorrective.closingDate || '—'}</div>
                </div>
                <div class="form-field">
                    <label>Efficacité des actions prises ?</label>
                    <div class="bg-gray-50 border rounded p-2">${actionCorrective.effectiveness || '—'}</div>
                </div>
                <div class="form-field">
                    <label>Type d'efficacité</label>
                    <div class="bg-gray-50 border rounded p-2">${actionCorrective.effectivenessType || '—'}</div>
                </div>
            </div>

            <div class="form-field">
                <label>Signature / Réception</label>
                <div class="signature-box">
                    ${actionCorrective.signatureReception ? 
                        `<img src="${actionCorrective.signatureReception}" alt="Signature Réception" class="signature-image" />` : 
                        '<span class="no-signature">Aucune signature</span>'
                    }
                </div>
            </div>

            <div class="form-field">
                <label>Observation du Responsable Qualité / Autorité Technique</label>
                <div class="bg-gray-50 border rounded p-2" style="min-height: 60px;">${actionCorrective.observation || '—'}</div>
            </div>

            <div class="form-row">
                <div class="form-field">
                    <label>Conclusion du Responsable Qualité / Autorité Technique</label>
                    <div class="bg-gray-50 border rounded p-2">${actionCorrective.conclusion || '—'}</div>
                </div>
                <div class="form-field">
                    <label>Signature</label>
                    <div class="signature-box">
                        ${actionCorrective.conclusionSignature ? 
                            `<img src="${actionCorrective.conclusionSignature}" alt="Signature Conclusion" class="signature-image" />` : 
                            '<span class="no-signature">Aucune signature</span>'
                        }
                    </div>
                </div>
            </div>
        </div>

        <!-- Informations sur la non-conformité associée -->
        <div class="section">
            <div class="section-title">Non-conformité Associée</div>
            ${actionCorrective.nonConformite ? `
            <div class="form-row">
                <div class="form-field">
                    <label>Numéro</label>
                    <div class="bg-gray-50 border rounded p-2">${actionCorrective.nonConformite.numero}</div>
                </div>
                <div class="form-field">
                    <label>Titre</label>
                    <div class="bg-gray-50 border rounded p-2">${actionCorrective.nonConformite.titre}</div>
                </div>
                <div class="form-field">
                    <label>Statut</label>
                    <div class="bg-gray-50 border rounded p-2">${actionCorrective.nonConformite.statut}</div>
                </div>
            </div>
            <div class="form-field">
                <label>Description</label>
                <div class="bg-gray-50 border rounded p-2" style="min-height: 60px;">${actionCorrective.nonConformite.description || '—'}</div>
            </div>
            ` : `
            <div class="form-field">
                <div class="bg-gray-50 border rounded p-2 text-center">Aucune non-conformité associée</div>
            </div>
            `}
        </div>
    </body>
    </html>
    `;

    // Try Puppeteer; fallback to HTML download
    try {
      const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox','--disable-setuid-sandbox'] });
      const page = await browser.newPage();
      await page.setViewport({ width: 1240, height: 1754 });
      await page.setContent(html, { waitUntil: ['networkidle0','domcontentloaded'], timeout: 30000 });
      const pdf = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '12mm', right: '12mm', bottom: '12mm', left: '12mm' } });
      await browser.close();
      return new NextResponse(pdf as BodyInit, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="action-corrective-${actionCorrective.number || actionCorrective.id}.pdf"`
        }
      });
    } catch (e) {
      return new NextResponse(html, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Content-Disposition': `attachment; filename="action-corrective-${actionCorrective.number || actionCorrective.id}.html"`
        }
      });
    }
  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la génération du PDF' },
      { status: 500 }
    );
  }
}
