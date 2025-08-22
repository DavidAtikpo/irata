import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getSessionLabel } from '@/lib/sessions';
import puppeteer from 'puppeteer';
import logo from '@/public/logo.png';
import fs from 'fs';
import path from 'path';

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
    
    // Attendre que le contenu soit chargé
    await page.waitForSelector('.question', { timeout: 5000 }).catch(() => {});
    
    // Convertir le logo importé en base64
    const logoPath = path.join(process.cwd(), 'public', 'cidelogo.png');
    const logoBuffer = fs.readFileSync(logoPath);
    const logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;
    
    // Calculer le nombre de pages approximatif
    const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
    const pageHeight = 1123; // Hauteur A4 en pixels (297mm)
    const totalPages = Math.ceil(bodyHeight / pageHeight);
    
    // Utiliser les options de numérotation de Puppeteer
    const pdf = await page.pdf({
      format: 'A4',
      landscape: false, // Changement en portrait
      margin: {
        top: '15mm',
        right: '15mm',
        bottom: '25mm', // Augmenté pour le footer
        left: '15mm'
      },
      printBackground: true,
      displayHeaderFooter: true, // Activer le header/footer de Puppeteer
      headerTemplate: '<div></div>', // Header vide
      footerTemplate: `
        <div style="font-size: 10px; color: #6b7280; text-align: center; width: 90%; padding: 10px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="font-weight: 500; margin-left: 70px;">CI.DES - Reponse stagiaire</div>
            <div style="text-align: center;">
              <div>CI.DES sasu · Capital 2 500 Euros</div>
              <div>SIRET : 87840789900011 · VAT : FR71878407899</div>
              <div>Page <span class="pageNumber"></span> sur <span class="totalPages"></span></div>
            </div>
            <img src="${logoBase64}" style="width: 44px; height: 44px; object-fit: contain;" alt="CI.DES">
          </div>
        </div>
      `
    });

    await browser.close();

    // Retourner le PDF
    const stagiaireNom = `${reponse.stagiaire.prenom || ''} ${reponse.stagiaire.nom || ''}`.trim();
    const sessionLabel = getSessionLabel(formulaire.session).replace(/[^a-zA-Z0-9]/g, '-');
    // Ensure BodyInit type: pass ArrayBuffer
    const arrayBuffer = pdf.buffer.slice(pdf.byteOffset, pdf.byteOffset + pdf.byteLength) as ArrayBuffer;
    return new NextResponse(arrayBuffer, {
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
          font-size: 11px;
        }
        
        /* En-tête professionnel */
        .header {
          display: flex;
          margin-bottom: 20px;
          /* border: 2px solid #000; */
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
        
        
        /* Informations de session */
        .session-info {
          background-color: #f0f9ff;
          border: 1px solid #0ea5e9;
          /* border-radius: 6px; */
          padding: 5px;

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
        
        /* En-tête de réponse */
        .reponse-header {
          background-color: #f3f4f6;
          padding: 12px;
          /* border-radius: 6px; */
          margin-bottom: 5px;
          border-left: 2px solid #2563eb;
        }
        .reponse-header h2 {
          margin: 0 0 8px 0;
          color: #1f2937;
          font-size: 14px;
        }
        .reponse-header p {
          margin: 3px 0;
          color: #6b7280;
          font-size: 10px;
        }
        
        /* Questions en colonne unique pour portrait */
        .questions-container {
          margin-bottom: 20px;
        }
        .question {
          /* border: 1px solid #e5e7eb; */
          /* border-radius: 6px; */
          padding: 5px;
          background-color: #fafafa;
          margin-bottom: 5px;
        }
        .question h3 {
          margin: 0 0 6px 0;
          color: #374151;
          font-size: 12px;
          font-weight: bold;
        }
        .reponse-text {
          background-color: #ffffff;
          padding: 6px;
        
          border-left: 2px solid #2563eb;
          font-size: 10px;
          min-height: 20px;
        }
        
        /* Commentaires */
        .commentaires {
          margin-top: 15px;
          padding: 12px;
          background-color: #eff6ff;
          border-radius: 6px;
          border-left: 4px solid #3b82f6;
        }
        .commentaires h3 {
          margin: 0 0 8px 0;
          color: #1e40af;
          font-size: 12px;
        }
        .commentaires p {
          margin: 0;
          line-height: 1.4;
          font-size: 10px;
        }
        

        
        /* Règles de pagination */
        @page {
          margin: 15mm 15mm 25mm 15mm;
          size: A4;
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
        
        /* Règles pour éviter les coupures de questions */
        .questions-container {
          page-break-inside: auto;
          break-inside: auto;
        }
        
        .question {
          page-break-inside: avoid;
          break-inside: avoid;
          margin-bottom: 8px;
        }
        
        .question h3 {
          page-break-after: avoid;
          break-after: avoid;
        }
        
        .reponse-text {
          page-break-inside: avoid;
          break-inside: avoid;
        }
        
        .commentaires {
          page-break-inside: avoid;
          break-inside: avoid;
        }
        
        /* Règles supplémentaires pour éviter les coupures */
        .question {
          min-height: 30px;
          display: block;
        }
        
        /* Règles d'impression simplifiées */
        @media print {
          .question {
            page-break-inside: avoid;
            break-inside: avoid;
          }
        }
        
        /* Informations de diffusion */
        .info-section {
          margin: 10px 0;
        }
        .info-section p {
          margin: 3px 0;
          font-size: 10px;
        }
      </style>
    </head>
    <body>
      <!-- En-tête professionnel -->
              <div class="header">
          <div class="logo">
            <img src="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/logo.png" alt="CI.DES Logo" style="max-width: 100%; max-height: 100%;">
          </div>
        <table class="header-table">
          <tr>
            <td class="bold">Titre</td>
            <td class="bold">Numéro de code</td>
            <td class="bold">Révision</td>
            <td class="bold">Création date</td>
          </tr>
          <tr>
            <td>CIDES FORMULAIRE QUOTIDIEN - RÉPONSE</td>
            <td>ENR-CIFRA-HSE 030</td>
            <td>00</td>
            <td>22/08/2025</td>
          </tr>
        </table>
      </div>

      <!-- Titre principal -->
     <!-- <h1 class="title">RÉPONSE AU FORMULAIRE</h1> -->

      <!-- Informations de diffusion -->
      <div class="info-section">
        <p><strong>Diffusion:</strong> ${formulaire.titre}</p>
        <p><strong>Copie:</strong> ${stagiaireNom}</p>
      </div>

      <!-- Informations de session -->
      <div class="session-info">
        <h2> Réponse individuelle - Session ${getSessionLabel(formulaire.session)}</h2>
        <p><strong>Formation:</strong> ${formulaire.titre}</p>
        <p><strong>Période:</strong> ${new Date(formulaire.dateDebut).toLocaleDateString('fr-FR')} au ${new Date(formulaire.dateFin).toLocaleDateString('fr-FR')}</p>
      </div>

      <!-- En-tête de réponse -->
  <!--    <div class="reponse-header">
        <h2>👤 Réponse de ${stagiaireNom}</h2>
        <p>📧 <strong>Email:</strong> ${reponse.stagiaire.email}</p>
        <p>📅 <strong>Date de réponse:</strong> ${new Date(reponse.dateReponse).toLocaleDateString('fr-FR')} à ${new Date(reponse.dateReponse).toLocaleTimeString('fr-FR')}</p>
        <p>${reponse.soumis ? '✅ Soumis' : '⏳ Brouillon'}</p>
      </div> -->

      <!-- Questions -->
      <div class="questions-container">
        ${Array.isArray(reponse.reponses) ? reponse.reponses.map((reponseQuestion: any, qIndex: number) => {
          const question = questions.find((q: any) => q.id === reponseQuestion.questionId);
          const reponseText = Array.isArray(reponseQuestion.reponse) 
            ? reponseQuestion.reponse.join(', ')
            : reponseQuestion.reponse || 'Pas de réponse';
          return `
            <div class="question">
              <h3>Q${qIndex + 1}: ${question ? question.question : 'Question non trouvée'}</h3>
              <div class="reponse-text">
                ${reponseText}
              </div>
            </div>
          `;
        }).join('') : '<p>Aucune réponse aux questions</p>'}
      </div>

      <!-- Commentaires -->
      ${reponse.commentaires ? `
        <div class="commentaires">
          <h3>💬 Commentaires</h3>
          <p>${reponse.commentaires}</p>
        </div>
      ` : ''}


    </body>
    </html>
  `;
} 