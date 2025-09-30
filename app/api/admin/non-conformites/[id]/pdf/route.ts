import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import puppeteer from 'puppeteer-core';

function buildHtml(nc: any) {
  const format = (d?: string | Date) => d ? new Date(d).toLocaleDateString('fr-FR') : '';
  const esc = (s?: any) => (s ?? '').toString().replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const actions = (nc.actionsCorrectives || []) as any[];
  return `<!doctype html>
  <html lang="fr">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>CI.DES CORRECTIVE ACTION FORM - ${esc(nc.numero)}</title>
      <style>
        body { font-family: Arial, Helvetica, sans-serif; color: #111827; }
        .container { padding: 16px; }
        h1 { font-size: 18px; margin: 0 0 8px; }
        h2 { font-size: 14px; margin: 16px 0 8px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 8px; }
        .row { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 8px; }
        .cell { border: 1px solid #E5E7EB; padding: 8px; font-size: 12px; min-height: 24px; }
        .section { border: 1px solid #E5E7EB; margin-top: 10px; }
        .section .title { background: #F3F4F6; padding: 6px 8px; font-weight: 600; font-size: 12px; }
        .section .content { padding: 8px; font-size: 12px; }
        .muted { color: #6B7280; }
        .actions { margin-top: 10px; }
        ul { margin: 6px 0; padding-left: 16px; }
        .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>CI.DES CORRECTIVE ACTION FORM, PREVENTIVE PROGRESS</h1>
        <div class="row">
          <div class="cell"><strong>Code</strong><div>ENR-CIFRA-QISE 003</div></div>
          <div class="cell"><strong>Révision</strong><div>00</div></div>
          <div class="cell"><strong>Date</strong><div>21/03/2023</div></div>
          <div class="cell"><strong>N°</strong><div>${esc(nc.numero)}</div></div>
        </div>

        <div class="section">
          <div class="title">Issuer / Recipient</div>
          <div class="content two-col">
            <div>
              <strong>Issuer</strong><br/>
              Name: ${esc(nc.issuerName) || '—'}<br/>
              Signature: ${esc(nc.issuerSignature) || '—'}
            </div>
            <div>
              <strong>Recipient</strong><br/>
              Name: ${esc(nc.recipientName) || '—'}<br/>
              Department: ${esc(nc.recipientDepartment) || '—'}<br/>
              Date: ${format(nc.recipientDate)}<br/>
              N°: ${esc(nc.recipientNumber) || '—'}
            </div>
          </div>
        </div>

        <div class="section">
          <div class="title">PART RESERVE FOR THE ISSUER</div>
          <div class="content">
            <div class="two-col">
              <div>
                <strong>Anomaly/Malfunction</strong><br/>
                Origin: ${esc(nc.anomalyOrigin) || '—'}<br/>
                ${nc.anomalyOriginOther ? `Other: ${esc(nc.anomalyOriginOther)}<br/>` : ''}
                <br/>
                <strong>Description:</strong><br/>
                ${esc(nc.anomalyDescription) || '—'}<br/>
                <br/>
                <strong>Immediate curative action:</strong><br/>
                ${esc(nc.immediateCurativeAction) || '—'}<br/>
                <br/>
                <strong>Action planned:</strong> ${esc(nc.actionPlanned) || '—'}<br/>
                ${nc.correctiveActionDescription ? `Corrective (describe): ${esc(nc.correctiveActionDescription)}<br/>` : ''}
                ${nc.preventiveActionDescription ? `Preventive (describe): ${esc(nc.preventiveActionDescription)}<br/>` : ''}
                <br/>
                Recipient signature: ${esc(nc.recipientSignature) || '—'}<br/>
                Collaborator in charge: ${esc(nc.collaboratorInCharge) || '—'}
              </div>
              <div>
                <strong>Category of anomaly:</strong><br/>
                ${esc(nc.categoryOfAnomaly) || '—'}
              </div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="title">PART RESERVE TO QUALITY MANAGER / Technical Authority / CEO</div>
          <div class="content">
            <strong>Analysis of the causes / Action proposal:</strong><br/>
            ${esc(nc.analysisCauses) || '—'}<br/>
            <br/>
            Collaborator in charge: ${esc(nc.collaboratorAppointed) || '—'}<br/>
            Limit Time: ${esc(nc.limitTime) || '—'}
          </div>
        </div>

        <div class="section">
          <div class="title">Closing of Actions</div>
          <div class="content">
            Effectiveness actions taken: ${esc(nc.effectivenessAction) || '—'}<br/>
            Closing Date: ${format(nc.closingDate)}<br/>
            Signature Recipient: ${esc(nc.signatureRecipient) || '—'}<br/>
            Department: ${esc(nc.closingDepartment) || '—'}
          </div>
        </div>

        <div class="section">
          <div class="title">Conclusion of the Quality Manager / Technical Authority</div>
          <div class="content">
            Type: ${esc(nc.conclusionType) || '—'}<br/>
            <br/>
            <strong>Observation:</strong><br/>
            ${esc(nc.qualityManagerObservation) || '—'}<br/>
            <br/>
            Date: ${format(nc.qualityManagerDate)}<br/>
            Signature: ${esc(nc.qualityManagerSignature) || '—'}
          </div>
        </div>

        <h2 class="actions">Actions Correctives Associées</h2>
        ${actions.map((a, idx) => `
          <div class="section">
            <div class="title">Action ${idx + 1}: ${esc(a.titre)}</div>
            <div class="content">
              <div><strong>Type</strong>: ${esc(a.type)} — <strong>Priorité</strong>: ${esc(a.priorite)}</div>
              <div><strong>Responsable</strong>: ${esc(a.responsable?.nom) || '-'}</div>
              <div><strong>Début</strong>: ${format(a.dateDebut)} • <strong>Échéance</strong>: ${format(a.dateEcheance)}</div>
              <div class="muted" style="margin-top:6px;">${esc(a.description || '')}</div>
            </div>
          </div>
        `).join('')}
      </div>
    </body>
  </html>`;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    const { id } = await params;
    const nc = await prisma.nonConformite.findUnique({
      where: { id },
      include: {
        responsable: { select: { nom: true, prenom: true, email: true } },
        actionsCorrectives: {
          include: { responsable: { select: { nom: true, prenom: true, email: true } } },
          orderBy: { createdAt: 'asc' }
        }
      }
    });
    if (!nc) {
      return NextResponse.json({ message: 'Non-conformité non trouvée' }, { status: 404 });
    }

    const html = buildHtml(nc);

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
          'Content-Disposition': `attachment; filename="non-conformite-${nc.numero}.pdf"`
        }
      });
    } catch (e) {
      return new NextResponse(html, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Content-Disposition': `attachment; filename="non-conformite-${nc.numero}.html"`,
          'X-PDF-Fallback': 'true'
        }
      });
    }
  } catch (error) {
    console.error('Erreur génération PDF NC:', error);
    return NextResponse.json({ message: 'Erreur interne du serveur' }, { status: 500 });
  }
}


