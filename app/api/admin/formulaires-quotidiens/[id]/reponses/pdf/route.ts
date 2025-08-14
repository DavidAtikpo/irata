import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getSessionLabel } from '@/lib/sessions';
import puppeteer from 'puppeteer';

// GET /api/admin/formulaires-quotidiens/[id]/reponses/pdf
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Récupérer le formulaire avec ses réponses
    const formulaire = await prisma.formulairesQuotidiens.findUnique({
      where: { id },
      include: {
        reponses: {
          include: {
            stagiaire: {
              select: {
                nom: true,
                prenom: true,
                email: true
              }
            }
          },
          orderBy: {
            dateReponse: 'desc'
          }
        }
      }
    });

    if (!formulaire) {
      return NextResponse.json(
        { message: 'Formulaire non trouvé' },
        { status: 404 }
      );
    }

    // Générer le HTML pour le PDF
    const html = generatePDFHTML(formulaire);

    // Générer le PDF avec Puppeteer
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setContent(html);
    
    const pdf = await page.pdf({
      format: 'A4',
      landscape: true,
      margin: {
        top: '15mm',
        right: '15mm',
        bottom: '15mm',
        left: '15mm'
      },
      printBackground: true
    });

    await browser.close();

    // Retourner le PDF
    const sessionLabel = getSessionLabel(formulaire.session).replace(/[^a-zA-Z0-9]/g, '-');
    const arrayBuffer = pdf.buffer.slice(pdf.byteOffset, pdf.byteOffset + pdf.byteLength) as ArrayBuffer;
    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="session-${sessionLabel}-reponses-${new Date().toISOString().split('T')[0]}.pdf"`
      }
    });
  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la génération du PDF' },
      { status: 500 }
    );
  }
}

function generatePDFHTML(formulaire: any) {
  const questions = Array.isArray(formulaire.questions) ? formulaire.questions : [];
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Réponses - ${formulaire.titre}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.4;
          color: #333;
          margin: 0;
          padding: 15px;
          font-size: 11px;
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #2563eb;
          padding-bottom: 15px;
          margin-bottom: 20px;
        }
        .header h1 {
          color: #2563eb;
          margin: 0;
          font-size: 20px;
        }
        .header p {
          margin: 3px 0;
          color: #666;
          font-size: 12px;
        }
        .reponses-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-bottom: 20px;
        }
        .reponse {
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          padding: 12px;
          background-color: #fafafa;
          page-break-inside: avoid;
        }
        .reponse-header {
          background-color: #f3f4f6;
          padding: 8px;
          border-radius: 4px;
          margin-bottom: 10px;
          border-left: 4px solid #2563eb;
        }
        .reponse-header h3 {
          margin: 0;
          color: #1f2937;
          font-size: 13px;
          font-weight: bold;
        }
        .reponse-header p {
          margin: 2px 0;
          color: #6b7280;
          font-size: 10px;
        }
        .question {
          margin-bottom: 8px;
        }
        .question h4 {
          margin: 0 0 4px 0;
          color: #374151;
          font-size: 11px;
          font-weight: bold;
        }
        .reponse-text {
          background-color: #ffffff;
          padding: 6px;
          border-radius: 3px;
          border-left: 3px solid #2563eb;
          font-size: 10px;
          min-height: 20px;
        }
        .commentaires {
          margin-top: 8px;
          padding: 6px;
          background-color: #eff6ff;
          border-radius: 4px;
          border-left: 3px solid #3b82f6;
        }
        .commentaires h4 {
          margin: 0 0 4px 0;
          color: #1e40af;
          font-size: 11px;
          font-weight: bold;
        }
        .commentaires p {
          margin: 0;
          font-size: 10px;
        }
        .no-reponses {
          text-align: center;
          padding: 40px;
          color: #6b7280;
          font-style: italic;
        }
        .page-break {
          page-break-before: always;
        }
        .session-info {
          background-color: #f0f9ff;
          border: 1px solid #0ea5e9;
          border-radius: 6px;
          padding: 10px;
          margin-bottom: 15px;
        }
        .session-info h2 {
          margin: 0 0 5px 0;
          color: #0c4a6e;
          font-size: 16px;
        }
        .session-info p {
          margin: 2px 0;
          color: #0369a1;
          font-size: 11px;
        }
        .stats {
          display: flex;
          justify-content: space-between;
          background-color: #f8fafc;
          padding: 8px;
          border-radius: 4px;
          margin-bottom: 15px;
          font-size: 11px;
        }
        .stat-item {
          text-align: center;
        }
        .stat-number {
          font-weight: bold;
          color: #2563eb;
          font-size: 14px;
        }
        .stat-label {
          color: #64748b;
          font-size: 10px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${formulaire.titre}</h1>
        <p><strong>Session:</strong> ${getSessionLabel(formulaire.session)}</p>
        <p><strong>Période:</strong> ${new Date(formulaire.dateDebut).toLocaleDateString('fr-FR')} - ${new Date(formulaire.dateFin).toLocaleDateString('fr-FR')}</p>
        <p><strong>Généré le:</strong> ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
      </div>

      <div class="session-info">
        <h2>📊 Résumé de la session</h2>
        <p><strong>Formation:</strong> ${formulaire.titre}</p>
        <p><strong>Session:</strong> ${getSessionLabel(formulaire.session)}</p>
        <p><strong>Période de formation:</strong> ${new Date(formulaire.dateDebut).toLocaleDateString('fr-FR')} au ${new Date(formulaire.dateFin).toLocaleDateString('fr-FR')}</p>
      </div>

      <div class="stats">
        <div class="stat-item">
          <div class="stat-number">${formulaire.reponses.length}</div>
          <div class="stat-label">Stagiaires</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">${questions.length}</div>
          <div class="stat-label">Questions</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">${formulaire.reponses.filter((r: any) => r.soumis).length}</div>
          <div class="stat-label">Soumis</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">${formulaire.reponses.filter((r: any) => !r.soumis).length}</div>
          <div class="stat-label">Brouillons</div>
        </div>
      </div>

      ${formulaire.reponses.length === 0 ? `
        <div class="no-reponses">
          <h3>Aucune réponse</h3>
          <p>Aucun stagiaire n'a encore répondu à ce formulaire.</p>
        </div>
      ` : `
        <div class="reponses-grid">
          ${formulaire.reponses.map((reponse: any, index: number) => `
            <div class="reponse">
              <div class="reponse-header">
                <h3>👤 ${reponse.stagiaire.prenom || ''} ${reponse.stagiaire.nom || ''}</h3>
                <p>📧 ${reponse.stagiaire.email}</p>
                <p>📅 ${new Date(reponse.dateReponse).toLocaleDateString('fr-FR')} à ${new Date(reponse.dateReponse).toLocaleTimeString('fr-FR')}</p>
                <p>${reponse.soumis ? '✅ Soumis' : '⏳ Brouillon'}</p>
              </div>

              ${Array.isArray(reponse.reponses) ? reponse.reponses.map((reponseQuestion: any, qIndex: number) => {
                const question = questions.find((q: any) => q.id === reponseQuestion.questionId);
                return `
                  <div class="question">
                    <h4>Q${qIndex + 1}: ${question ? question.question : 'Question non trouvée'}</h4>
                    <div class="reponse-text">
                      ${Array.isArray(reponseQuestion.reponse) 
                        ? reponseQuestion.reponse.join(', ')
                        : reponseQuestion.reponse || 'Pas de réponse'
                      }
                    </div>
                  </div>
                `;
              }).join('') : '<p>Aucune réponse aux questions</p>'}

              ${reponse.commentaires ? `
                <div class="commentaires">
                  <h4>💬 Commentaires</h4>
                  <p>${reponse.commentaires}</p>
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      `}
    </body>
    </html>
  `;
} 