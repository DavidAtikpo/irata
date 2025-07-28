import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getSessionLabel } from '@/lib/sessions';
import puppeteer from 'puppeteer';

// GET /api/admin/formulaires-quotidiens/[id]/reponses/[reponseId]/pdf
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; reponseId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { id, reponseId } = await params;

    // Récupérer le formulaire et la réponse spécifique
    const formulaire = await prisma.formulairesQuotidiens.findUnique({
      where: { id }
    });

    if (!formulaire) {
      return NextResponse.json(
        { message: 'Formulaire non trouvé' },
        { status: 404 }
      );
    }

    const reponse = await prisma.reponseFormulaire.findUnique({
      where: { id: reponseId },
      include: {
        stagiaire: {
          select: {
            nom: true,
            prenom: true,
            email: true
          }
        }
      }
    });

    if (!reponse) {
      return NextResponse.json(
        { message: 'Réponse non trouvée' },
        { status: 404 }
      );
    }

    // Vérifier que la réponse appartient bien au formulaire
    if (reponse.formulaireId !== id) {
      return NextResponse.json(
        { message: 'Réponse non trouvée pour ce formulaire' },
        { status: 404 }
      );
    }

    // Générer le HTML pour le PDF
    const html = generateSingleResponsePDFHTML(formulaire, reponse);

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
    const stagiaireNom = `${reponse.stagiaire.prenom || ''} ${reponse.stagiaire.nom || ''}`.trim();
    const sessionLabel = getSessionLabel(formulaire.session).replace(/[^a-zA-Z0-9]/g, '-');
    return new NextResponse(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="session-${sessionLabel}-reponse-${stagiaireNom}-${new Date().toISOString().split('T')[0]}.pdf"`
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

function generateSingleResponsePDFHTML(formulaire: any, reponse: any) {
  const questions = Array.isArray(formulaire.questions) ? formulaire.questions : [];
  const stagiaireNom = `${reponse.stagiaire.prenom || ''} ${reponse.stagiaire.nom || ''}`.trim();
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Réponse - ${formulaire.titre}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.4;
          color: #333;
          margin: 0;
          padding: 15px;
          font-size: 12px;
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
          font-size: 11px;
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
        .reponse-header {
          background-color: #f3f4f6;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
          border-left: 4px solid #2563eb;
        }
        .reponse-header h2 {
          margin: 0 0 10px 0;
          color: #1f2937;
          font-size: 18px;
        }
        .reponse-header p {
          margin: 5px 0;
          color: #6b7280;
          font-size: 12px;
        }
        .questions-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }
        .question {
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          padding: 12px;
          background-color: #fafafa;
        }
        .question h3 {
          margin: 0 0 8px 0;
          color: #374151;
          font-size: 13px;
          font-weight: bold;
        }
        .reponse-text {
          background-color: #ffffff;
          padding: 8px;
          border-radius: 4px;
          border-left: 3px solid #2563eb;
          font-size: 11px;
          min-height: 25px;
        }
        .commentaires {
          margin-top: 20px;
          padding: 15px;
          background-color: #eff6ff;
          border-radius: 8px;
          border-left: 4px solid #3b82f6;
          grid-column: 1 / -1;
        }
        .commentaires h3 {
          margin: 0 0 10px 0;
          color: #1e40af;
          font-size: 14px;
        }
        .commentaires p {
          margin: 0;
          line-height: 1.5;
          font-size: 12px;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          color: #6b7280;
          font-size: 10px;
          border-top: 1px solid #e5e7eb;
          padding-top: 15px;
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
        <h2>📊 Réponse individuelle - Session ${getSessionLabel(formulaire.session)}</h2>
        <p><strong>Formation:</strong> ${formulaire.titre}</p>
        <p><strong>Période:</strong> ${new Date(formulaire.dateDebut).toLocaleDateString('fr-FR')} au ${new Date(formulaire.dateFin).toLocaleDateString('fr-FR')}</p>
      </div>

      <div class="reponse-header">
        <h2>👤 Réponse de ${stagiaireNom}</h2>
        <p>📧 <strong>Email:</strong> ${reponse.stagiaire.email}</p>
        <p>📅 <strong>Date de réponse:</strong> ${new Date(reponse.dateReponse).toLocaleDateString('fr-FR')} à ${new Date(reponse.dateReponse).toLocaleTimeString('fr-FR')}</p>
        <p>${reponse.soumis ? '✅ Soumis' : '⏳ Brouillon'}</p>
      </div>

      <div class="questions-grid">
        ${Array.isArray(reponse.reponses) ? reponse.reponses.map((reponseQuestion: any, qIndex: number) => {
          const question = questions.find((q: any) => q.id === reponseQuestion.questionId);
          return `
            <div class="question">
              <h3>Q${qIndex + 1}: ${question ? question.question : 'Question non trouvée'}</h3>
              <div class="reponse-text">
                ${Array.isArray(reponseQuestion.reponse) 
                  ? reponseQuestion.reponse.join(', ')
                  : reponseQuestion.reponse || 'Pas de réponse'
                }
              </div>
            </div>
          `;
        }).join('') : '<p>Aucune réponse aux questions</p>'}
      </div>

      ${reponse.commentaires ? `
        <div class="commentaires">
          <h3>💬 Commentaires</h3>
          <p>${reponse.commentaires}</p>
        </div>
      ` : ''}

      <div class="footer">
        <p>Document généré automatiquement par le système CI.DES</p>
        <p>Session ${getSessionLabel(formulaire.session)} - ${formulaire.titre}</p>
      </div>
    </body>
    </html>
  `;
} 