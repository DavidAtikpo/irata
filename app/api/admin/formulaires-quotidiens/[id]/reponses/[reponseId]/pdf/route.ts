import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getSessionLabel } from '@/lib/sessions';
import puppeteer from 'puppeteer';
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

    // Calculer les scores et corriger les réponses
    const questions = Array.isArray(formulaire.questions) ? formulaire.questions : [];
    const reponses = Array.isArray(reponse.reponses) ? reponse.reponses : [];
    
    const reponsesCorrigees = reponses.map((reponseQuestion: any) => {
      const question = questions.find((q: any) => q.id === reponseQuestion.questionId);
      if (!question) return reponseQuestion;

      const pointsMaxQuestion = (question as any).points || 1;
      let pointsObtenus = 0;
      let correcte = false;

      if ((question as any).type === 'number') {
        const reponseNum = parseFloat(reponseQuestion.reponse);
        const bonneReponseNum = parseFloat((question as any).correctAnswers?.[0] || '');
        if (!isNaN(reponseNum) && !isNaN(bonneReponseNum)) {
          correcte = Math.abs(reponseNum - bonneReponseNum) < 0.01;
          pointsObtenus = correcte ? pointsMaxQuestion : 0;
        }
      } else if ((question as any).type === 'text' || (question as any).type === 'textarea') {
        const reponseNormalisee = reponseQuestion.reponse.toLowerCase().trim();
        const bonneReponseNormalisee = ((question as any).correctAnswers?.[0] || '').toLowerCase().trim();
        correcte = reponseNormalisee === bonneReponseNormalisee;
        pointsObtenus = correcte ? pointsMaxQuestion : 0;
      } else if ((question as any).type === 'radio' || (question as any).type === 'select') {
        const reponseNormalisee = reponseQuestion.reponse.toLowerCase().trim();
        const bonneReponseNormalisee = ((question as any).correctAnswers?.[0] || '').toLowerCase().trim();
        correcte = reponseNormalisee === bonneReponseNormalisee;
        pointsObtenus = correcte ? pointsMaxQuestion : 0;
      } else if ((question as any).type === 'checkbox') {
        const reponsesUtilisateur = Array.isArray(reponseQuestion.reponse) 
          ? reponseQuestion.reponse 
          : [reponseQuestion.reponse];
        
        const reponsesUtilisateurNormalisees = reponsesUtilisateur.map((r: any) => r.toLowerCase().trim());
        const bonnesReponsesNormalisees = ((question as any).correctAnswers || []).map((r: any) => r.toLowerCase().trim());
        
        const toutesBonnesReponsesSelectionnees = bonnesReponsesNormalisees.every((r: any) => 
          reponsesUtilisateurNormalisees.includes(r)
        );
        const aucuneMauvaiseReponse = reponsesUtilisateurNormalisees.every((r: any) => 
          bonnesReponsesNormalisees.includes(r)
        );
        
        correcte = toutesBonnesReponsesSelectionnees && aucuneMauvaiseReponse;
        pointsObtenus = correcte ? pointsMaxQuestion : 0;
      }

      return {
        ...reponseQuestion,
        pointsObtenus,
        correcte,
        question
      };
    });

    // Calculer les totaux
    const totalPoints = reponsesCorrigees.reduce((sum, r) => sum + r.pointsObtenus, 0);
    const pointsMax = reponsesCorrigees.reduce((sum, r) => sum + (r.question?.points || 1), 0);
    const moyenne = pointsMax > 0 ? (totalPoints / pointsMax) * 20 : 0;

    // Générer le HTML pour le PDF avec les scores
    const html = generateSingleResponsePDFHTML(formulaire, reponse, reponsesCorrigees, totalPoints, pointsMax, moyenne);

    // Vérifier si Puppeteer est disponible (production vs développement)
    let pdf: Buffer | Uint8Array;
    
    try {
      // Générer le PDF avec Puppeteer
      const browser = await puppeteer.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'] // Arguments pour la production
      });
      const page = await browser.newPage();
      await page.setContent(html);
      
      // Attendre que le contenu soit chargé
      await page.waitForSelector('.question', { timeout: 5000 }).catch(() => {});
      
      // Utiliser l'URL du logo directement pour éviter les problèmes d'import en production
      const logoUrl = `${process.env.NEXTAUTH_URL || 'https://www.a-finpart.com'}/logo.png`;
      
      // Calculer le nombre de pages approximatif
      const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
      const pageHeight = 1123; // Hauteur A4 en pixels (297mm)
      const totalPages = Math.ceil(bodyHeight / pageHeight);
      
      // Utiliser les options de numérotation de Puppeteer
      pdf = await page.pdf({
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
              <img src="${logoUrl}" style="width: 44px; height: 44px; object-fit: contain;" alt="CI.DES">
            </div>
          </div>
        `
      }).catch(async (error) => {
        console.error('Erreur lors de la génération du PDF avec footer:', error);
        try {
          // Essayer sans le footer si il y a un problème
          return await page.pdf({
            format: 'A4',
            landscape: false,
            margin: {
              top: '15mm',
              right: '15mm',
              bottom: '15mm',
              left: '15mm'
            },
            printBackground: true,
            displayHeaderFooter: false
          });
        } catch (fallbackError) {
          console.error('Erreur lors de la génération du PDF sans footer:', fallbackError);
          throw new Error(`Erreur de génération PDF: ${fallbackError instanceof Error ? fallbackError.message : 'Erreur inconnue'}`);
        }
      });

      await browser.close();
    } catch (puppeteerError) {
      console.error('Puppeteer non disponible, génération HTML alternative:', puppeteerError);
      
      // Fallback: retourner le HTML pour impression côté client
      const stagiaireNom = `${reponse.stagiaire.prenom || ''} ${reponse.stagiaire.nom || ''}`.trim();
      const sessionLabel = getSessionLabel(formulaire.session).replace(/[^a-zA-Z0-9]/g, '-');
      
      // Ajouter un message d'information au début du HTML
      const htmlWithInfo = html.replace(
        '<!-- Instructions d\'impression -->',
        `<!-- Instructions d\'impression -->
        <div style="background-color: #fee2e2; border: 2px solid #dc2626; border-radius: 8px; padding: 16px; margin-bottom: 20px; text-align: center;">
          <h2 style="color: #dc2626; margin: 0 0 8px 0;">⚠️ Mode Impression</h2>
          <p style="color: #991b1b; margin: 0; font-size: 14px;">
            Le PDF automatique n'est pas disponible sur ce serveur. 
            <strong>Utilisez Ctrl+P pour imprimer ce document en PDF.</strong>
          </p>
        </div>`
      );
      
      return new NextResponse(htmlWithInfo, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Content-Disposition': `inline; filename="session-${sessionLabel}-reponse-${stagiaireNom}-${new Date().toISOString().split('T')[0]}.html"`
        }
      });
    }

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
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { 
        message: 'Erreur lors de la génération du PDF',
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : 'No stack trace') : undefined
      },
      { status: 500 }
    );
  }
}

function generateSingleResponsePDFHTML(formulaire: any, reponse: any, reponsesCorrigees: any[], totalPoints: number, pointsMax: number, moyenne: number) {
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
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
        
        /* Instructions d'impression */
        .print-instructions {
          background-color: #fef3c7;
          border: 1px solid #f59e0b;
          border-radius: 6px;
          padding: 12px;
          margin-bottom: 20px;
          font-size: 12px;
        }
        .print-instructions h3 {
          margin: 0 0 8px 0;
          color: #92400e;
          font-size: 14px;
        }
        .print-instructions p {
          margin: 4px 0;
          color: #92400e;
        }
        
        /* Résumé des scores */
        .score-summary {
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 12px;
          margin-bottom: 15px;
        }
        .score-summary h2 {
          margin: 0 0 8px 0;
          color: #1e293b;
          font-size: 14px;
          font-weight: bold;
        }
        .score-grid {
          display: flex;
          justify-content: space-between;
          gap: 15px;
        }
        .score-item {
          text-align: center;
          flex: 1;
        }
        .score-label {
          display: block;
          font-size: 9px;
          color: #64748b;
          margin-bottom: 2px;
        }
        .score-value {
          display: block;
          font-size: 12px;
          font-weight: bold;
          color: #2563eb;
        }
        
        /* Questions avec statuts */
        .question {
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          padding: 8px;
          background-color: #fafafa;
          margin-bottom: 8px;
        }
        .question.correct {
          border-left: 4px solid #10b981;
          background-color: #f0fdf4;
        }
        .question.incorrect {
          border-left: 4px solid #ef4444;
          background-color: #fef2f2;
        }
        .question-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 6px;
        }
        .question-header h3 {
          margin: 0;
          color: #374151;
          font-size: 11px;
          font-weight: bold;
          flex: 1;
        }
        .question-status {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 2px;
        }
        .status-badge {
          padding: 2px 6px;
          border-radius: 12px;
          font-size: 8px;
          font-weight: bold;
          text-transform: uppercase;
        }
        .status-badge.correct {
          background-color: #d1fae5;
          color: #065f46;
        }
        .status-badge.incorrect {
          background-color: #fee2e2;
          color: #991b1b;
        }
        .points-badge {
          background-color: #dbeafe;
          color: #1e40af;
          padding: 1px 4px;
          border-radius: 8px;
          font-size: 8px;
          font-weight: bold;
        }
        .reponse-text {
          background-color: #ffffff;
          padding: 4px 6px;
          border-radius: 4px;
          margin-bottom: 4px;
          font-size: 9px;
          min-height: 16px;
        }
        .bonne-reponse {
          background-color: #f0f9ff;
          padding: 4px 6px;
          border-radius: 4px;
          border-left: 2px solid #0ea5e9;
          font-size: 9px;
          color: #0369a1;
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

      <!-- Résumé des scores -->
      <div class="score-summary">
        <h2>📊 Résumé des scores</h2>
        <div class="score-grid">
          <div class="score-item">
            <span class="score-label">Score obtenu:</span>
            <span class="score-value">${totalPoints}/${pointsMax} points</span>
          </div>
          <div class="score-item">
            <span class="score-label">Moyenne:</span>
            <span class="score-value">${moyenne.toFixed(2)}/20</span>
          </div>
          <div class="score-item">
            <span class="score-label">Pourcentage:</span>
            <span class="score-value">${pointsMax > 0 ? Math.round((totalPoints / pointsMax) * 100) : 0}%</span>
          </div>
        </div>
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
        ${reponsesCorrigees.map((reponseQuestion: any, qIndex: number) => {
          const question = reponseQuestion.question;
          if (!question) return '';
          
          const reponseText = Array.isArray(reponseQuestion.reponse) 
            ? reponseQuestion.reponse.join(', ')
            : reponseQuestion.reponse || 'Pas de réponse';
          
          const bonneReponse = question.type === 'checkbox' 
            ? question.correctAnswers.join(', ')
            : question.correctAnswers[0] || '';
          
          return `
            <div class="question ${reponseQuestion.correcte ? 'correct' : 'incorrect'}">
              <div class="question-header">
                <h3>Q${qIndex + 1}: ${question.question}</h3>
                <div class="question-status">
                  <span class="status-badge ${reponseQuestion.correcte ? 'correct' : 'incorrect'}">
                    ${reponseQuestion.correcte ? '✅ Correct' : '❌ Incorrect'}
                  </span>
                  <span class="points-badge">
                    ${reponseQuestion.pointsObtenus}/${question.points} pts
                  </span>
                </div>
              </div>
              <div class="reponse-text">
                <strong>Réponse donnée:</strong> ${reponseText}
              </div>
              <div class="bonne-reponse">
                <strong>Bonne réponse:</strong> ${bonneReponse}
              </div>
            </div>
          `;
        }).join('')}
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