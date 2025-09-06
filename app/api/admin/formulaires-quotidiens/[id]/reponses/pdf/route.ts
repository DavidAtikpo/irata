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
    
    // Attendre que le contenu soit chargé
    await page.waitForSelector('.reponse', { timeout: 5000 }).catch(() => {});
    
    // Calculer le nombre de pages approximatif
    const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
    const pageHeight = 1123; // Hauteur A4 en pixels (297mm)
    const totalPages = Math.ceil(bodyHeight / pageHeight);
    
    // Mettre à jour la numérotation des pages
    await page.evaluate((totalPages) => {
      const pageElements = document.querySelectorAll('.page');
      const topageElements = document.querySelectorAll('.topage');
      
      pageElements.forEach((el, index) => {
        el.textContent = (index + 1).toString();
      });
      
      topageElements.forEach(el => {
        el.textContent = totalPages.toString();
      });
    }, totalPages);
    
    const pdf = await page.pdf({
      format: 'A4',
      landscape: false, // Changement en portrait
      margin: {
        top: '15mm',
        right: '15mm',
        bottom: '30mm', // Augmenté pour le footer
        left: '15mm'
      },
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: '<div></div>', // Header vide
      footerTemplate: `
        <div style="font-size: 9px; color: #6b7280; text-align: center; width: 100%; padding: 5px 15mm; background-color: white; border-top: 1px solid #e5e7eb;">
          <div style="display: flex; justify-content: space-between; align-items: center; width: 180mm; margin: 0 auto;">
            <div style="flex: 1; font-weight: 500;">
              CI.DES - Réponses Formulaires
            </div>
            <div style="flex: 2; text-align: center;">
              <div style="margin: 1px 0;">CI.DES sasu · Capital 2 500 Euros</div>
              <div style="margin: 1px 0;">SIRET : 87840789900011 · VAT : FR71878407899</div>
              <div style="margin: 1px 0;">Page <span class="pageNumber"></span> sur <span class="totalPages"></span></div>
            </div>
            <div style="flex: 1; text-align: right; display: flex; align-items: center; justify-content: flex-end;">
              <span>© 2025 CI.DES</span>
              <img src="${process.env.NEXTAUTH_URL || 'https://www.a-finpart.com'}/logo.png" style="width: 20px; height: 20px; object-fit: contain; margin-left: 8px;" onerror="this.style.display='none';">
            </div>
          </div>
        </div>
      `
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
          font-size: 10px;
        }
        
        /* En-tête professionnel */
        .header {
          display: flex;
          margin-bottom: 20px;
          border: 2px solid #000;
          padding: 10px;
        }
        .logo {
          width: 60px;
          height: 60px;
          margin-right: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .logo img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }
        .header-table {
          border-collapse: collapse;
          width: 100%;
          font-size: 9px;
        }
        .header-table td {
          border: 1px solid #000;
          padding: 4px;
        }
        .header-table .bold {
          font-weight: bold;
        }
        
        /* Titre principal */
        .title {
          text-align: center;
          font-weight: bold;
          border: 2px solid #000;
          padding: 10px;
          margin: 15px 0;
          font-size: 16px;
        }
        
        /* Informations de session */
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
          font-size: 14px;
        }
        .session-info p {
          margin: 2px 0;
          color: #0369a1;
          font-size: 11px;
        }
        
        /* Statistiques */
        .stats {
          display: flex;
          justify-content: space-between;
          background-color: #f8fafc;
          padding: 8px;
          border-radius: 4px;
          margin-bottom: 15px;
          font-size: 10px;
        }
        .stat-item {
          text-align: center;
        }
        .stat-number {
          font-weight: bold;
          color: #2563eb;
          font-size: 12px;
        }
        .stat-label {
          color: #64748b;
          font-size: 9px;
        }
        
        /* Réponses en colonne unique pour portrait */
        .reponses-container {
          margin-bottom: 20px;
        }
        .reponse {
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          padding: 10px;
          background-color: #fafafa;
          margin-bottom: 15px;
          page-break-inside: avoid;
          break-inside: avoid;
          page-break-before: auto;
        }
        .reponse-header {
          background-color: #f3f4f6;
          padding: 8px;
          border-radius: 4px;
          margin-bottom: 8px;
          border-left: 4px solid #2563eb;
        }
        .reponse-header h3 {
          margin: 0;
          color: #1f2937;
          font-size: 12px;
          font-weight: bold;
        }
        .reponse-header p {
          margin: 2px 0;
          color: #6b7280;
          font-size: 9px;
        }
        .question {
          margin-bottom: 6px;
          page-break-inside: avoid;
          break-inside: avoid;
        }
        .question h4 {
          margin: 0 0 3px 0;
          color: #374151;
          font-size: 10px;
          font-weight: bold;
        }
        .reponse-text {
          background-color: #ffffff;
          padding: 4px;
          border-radius: 3px;
          border-left: 3px solid #2563eb;
          font-size: 9px;
          min-height: 15px;
        }
        .commentaires {
          margin-top: 6px;
          padding: 4px;
          background-color: #eff6ff;
          border-radius: 4px;
          border-left: 3px solid #3b82f6;
          page-break-inside: avoid;
          break-inside: avoid;
        }
        .commentaires h4 {
          margin: 0 0 3px 0;
          color: #1e40af;
          font-size: 10px;
          font-weight: bold;
        }
        .commentaires p {
          margin: 0;
          font-size: 9px;
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
        
        /* Numérotation des pages */
        .page-number {
          position: fixed;
          bottom: 60px;
          right: 15px;
          font-size: 10px;
          color: #6b7280;
          background-color: white;
          padding: 2px 6px;
          border-radius: 3px;
          border: 1px solid #e5e7eb;
        }
        
        /* Éviter les coupures dans les éléments importants */
        h1, h2, h3, h4 {
          page-break-after: avoid;
          break-after: avoid;
        }
        
        table {
          page-break-inside: avoid;
          break-inside: avoid;
        }
        
        /* Règles strictes pour éviter les coupures de réponses */
        .reponse {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
          page-break-before: auto;
          orphans: 3;
          widows: 3;
        }
        
        .reponse-header {
          page-break-after: avoid;
          break-after: avoid;
        }
        
        .question {
          page-break-inside: avoid;
          break-inside: avoid;
        }
        
        .commentaires {
          page-break-inside: avoid;
          break-inside: avoid;
        }
        
        /* Espacement pour éviter les coupures */
        .reponse:last-child {
          margin-bottom: 20px;
        }
        
        /* Forcer les sauts de page si nécessaire */
        .force-page-break {
          page-break-before: always;
          break-before: page;
        }
        
        /* Informations de diffusion */
        .info-section {
          margin: 10px 0;
        }
        .info-section p {
          margin: 3px 0;
          font-size: 10px;
        }
        
        /* Pied de page avec @page pour répétition sur chaque page */
        @page {
          margin: 15mm 15mm 25mm 15mm;
          size: A4 portrait;
          
          @bottom-center {
            content: "Page " counter(page) " sur " counter(pages);
            font-size: 10px;
            color: #6b7280;
          }
          
          @bottom-left {
            content: "CI.DES - Réponses Formulaires";
            font-size: 9px;
            font-weight: 500;
            color: #6b7280;
          }
          
          @bottom-right {
            content: "© 2025 CI.DES";
            font-size: 9px;
            color: #6b7280;
          }
        }
        
        /* Pied de page fixe pour les navigateurs qui supportent position: fixed */
        .footer {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background-color: white;
          padding: 8px 15mm;
          border-top: 1px solid #e5e7eb;
          font-size: 9px;
          color: #6b7280;
          z-index: 1000;
        }
        
        .footer-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 180mm;
          margin: 0 auto;
        }
        
        .footer-left {
          font-weight: 500;
          flex: 1;
        }
        
        .footer-center {
          text-align: center;
          flex: 2;
        }
        
        .footer-center div {
          margin: 1px 0;
          line-height: 1.2;
        }
        
        .footer-right {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          flex: 1;
        }
        
        .footer-logo {
          width: 24px;
          height: 24px;
          object-fit: contain;
          margin-left: 8px;
        }
        
        /* Espace pour le footer fixe */
        body {
          padding-bottom: 60px;
          counter-reset: page;
        }
        
        /* Styles pour l'impression */
        @media print {
          .footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background-color: white !important;
            padding: 8px 15mm;
            border-top: 1px solid #e5e7eb;
            font-size: 9px;
            color: #6b7280 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          body {
            padding-bottom: 60px !important;
          }
          
          /* Forcer l'affichage des couleurs */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      </style>
    </head>
    <body>
      <!-- En-tête professionnel -->
              <div class="header">
          <div class="logo">
            <img src="${process.env.NEXTAUTH_URL || 'https://www.a-finpart.com'}/logo.png" alt="CI.DES Logo" style="max-width: 100%; max-height: 100%;">
          </div>
        <table class="header-table">
          <tr>
            <td class="bold">Titre</td>
            <td class="bold">Numéro de code</td>
            <td class="bold">Révision</td>
            <td class="bold">Création date</td>
          </tr>
          <tr>
            <td>CIDES FORMULAIRE QUOTIDIEN - RÉPONSES</td>
            <td>ENR-CIFRA-HSE 030</td>
            <td>00</td>
            <td>09/10/2023</td>
          </tr>
        </table>
      </div>

      <!-- Titre principal -->
      <h1 class="title">RÉPONSES AU FORMULAIRE QUOTIDIEN</h1>

      <!-- Informations de diffusion -->
      <div class="info-section">
        <p><strong>Diffusion:</strong> ${formulaire.titre}</p>
        <p><strong>Copie:</strong> Tous les stagiaires</p>
      </div>

      <!-- Informations de session -->
      <div class="session-info">
        <h2>📊 Réponses - Session ${getSessionLabel(formulaire.session)}</h2>
        <p><strong>Formation:</strong> ${formulaire.titre}</p>
        <p><strong>Période:</strong> ${new Date(formulaire.dateDebut).toLocaleDateString('fr-FR')} au ${new Date(formulaire.dateFin).toLocaleDateString('fr-FR')}</p>
      </div>

      <!-- Statistiques -->
      <div class="stats">
        <div class="stat-item">
          <div class="stat-number">${formulaire.reponses.length}</div>
          <div class="stat-label">Total Réponses</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">${formulaire.reponses.filter((r: any) => r.soumis).length}</div>
          <div class="stat-label">Soumises</div>
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
        <div class="reponses-container">
          ${formulaire.reponses.map((reponse: any, index: number) => `
            <div class="reponse" ${index > 0 && index % 3 === 0 ? 'style="page-break-before: always;"' : ''}>
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
      
      <!-- Numérotation des pages -->
      <div class="page-number">
        Page <span class="page"></span>
      </div>
      
      <!-- Pied de page fixe sur chaque page -->
      <div class="footer">
        <div class="footer-content">
          <div class="footer-left">
            CI.DES - Satisfaction Client
          </div>
          <div class="footer-center">
            <div>CI.DES sasu · Capital 2 500 Euros</div>
            <div>SIRET : 87840789900011 · VAT : FR71878407899</div>
            <div>Page <span class="page"></span> sur <span class="topage"></span></div>
          </div>
          <div class="footer-right">
            <img src="${process.env.NEXTAUTH_URL || 'https://www.a-finpart.com'}/logo.png" alt="CI.DES" class="footer-logo">
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
} 