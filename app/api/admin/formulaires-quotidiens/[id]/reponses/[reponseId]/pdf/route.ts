import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getSessionLabel } from '@/lib/sessions';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import fs from 'fs';
import path from 'path';
import { isTextAnswerCorrect, isNumberAnswerCorrect } from '@/lib/fuzzy-matching';

// GET /api/admin/formulaires-quotidiens/[id]/reponses/[reponseId]/pdf
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; reponseId: string }> }
) {
  try {
    console.log('=== Début génération PDF ===');
    console.log('Environnement:', process.env.NODE_ENV);
    console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
    console.log('NEXT_PUBLIC_BASE_URL:', process.env.NEXT_PUBLIC_BASE_URL);
    
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
        // Pour les questions numériques, utiliser la comparaison floue
        correcte = isNumberAnswerCorrect(reponseQuestion.reponse, (question as any).correctAnswers?.[0] || '');
        pointsObtenus = correcte ? pointsMaxQuestion : 0;
      } else if ((question as any).type === 'text' || (question as any).type === 'textarea') {
        // Pour les questions texte, utiliser la comparaison floue intelligente
        correcte = isTextAnswerCorrect(reponseQuestion.reponse, (question as any).correctAnswers?.[0] || '');
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
    
    // Test rapide de disponibilité de Puppeteer
    console.log('Test de disponibilité de Puppeteer...');
    try {
      // Vérifier que le module Puppeteer est bien chargé
      if (!puppeteer || typeof puppeteer.launch !== 'function') {
        throw new Error('Module Puppeteer non disponible');
      }
    } catch (moduleError) {
      console.error('❌ Module Puppeteer non disponible:', moduleError);
      // Passer directement au mode HTML
      const stagiaireNom = `${reponse.stagiaire.prenom || ''} ${reponse.stagiaire.nom || ''}`.trim();
      const sessionLabel = getSessionLabel(formulaire.session).replace(/[^a-zA-Z0-9]/g, '-');
      
      return new NextResponse(html, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Content-Disposition': `attachment; filename="session-${sessionLabel}-reponse-${stagiaireNom}-${new Date().toISOString().split('T')[0]}.html"`,
          'X-PDF-Fallback': 'true',
          'X-Fallback-Reason': 'Puppeteer module unavailable'
        }
      });
    }
    
    try {
      console.log('Début génération PDF avec Puppeteer');
      console.log('Plateforme:', process.platform);
      console.log('Architecture:', process.arch);
      
      // Vérifier si nous sommes en mode de développement ou production
      const isDevelopment = process.env.NODE_ENV === 'development';
      
      // Configuration Puppeteer adaptée à l'environnement
      const puppeteerConfig = {
        headless: true,
        args: isDevelopment ? [
          '--no-sandbox'
        ] : [
          ...chromium.args,
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--disable-features=VizDisplayCompositor',
          '--no-zygote',
          '--single-process',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding'
        ],
        timeout: 30000,
        // Utiliser Chromium optimisé pour les services serverless
        executablePath: isDevelopment 
          ? process.env.PUPPETEER_EXECUTABLE_PATH 
          : await chromium.executablePath()
      };

      console.log('Configuration Puppeteer:', puppeteerConfig);

      // Tenter le lancement avec gestion d'erreur détaillée
      let browser;
      try {
        browser = await puppeteer.launch(puppeteerConfig);
        
      } catch (launchError) {
    
        throw launchError;
      }
      const page = await browser.newPage();
      
      // Définir une User-Agent valide
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      
      // Définir le contenu avec un timeout plus long
      await page.setContent(html, { 
        waitUntil: ['networkidle0', 'domcontentloaded'],
        timeout: 30000 
      });
      
      // Attendre que le contenu soit chargé avec un timeout plus court
      await page.waitForSelector('body', { timeout: 5000 }).catch(() => {
        
      });
      
      // URL du logo adaptée à l'environnement
      const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://www.a-finpart.com';
      const logoUrl = `${baseUrl}/logo.png`;
      
      // Configuration PDF avec pied de page
      console.log('Génération du PDF...');
      pdf = await page.pdf({
        format: 'A4',
        landscape: false,
        margin: {
          top: '10mm',
          right: '10mm',
          bottom: '25mm', // Plus d'espace pour le footer
          left: '10mm'
        },
        printBackground: true,
        displayHeaderFooter: true,
        headerTemplate: '<div></div>', // Header vide
        footerTemplate: `
          <div style="font-size: 9px; color: #6b7280; text-align: center; width: 100%; padding: 5px 15mm; background-color: white; border-top: 1px solid #e5e7eb;">
            <div style="display: flex; justify-content: space-between; align-items: center; width: 180mm; margin: 0 auto;">
              <div style="flex: 1; font-weight: 500;">
                CI.DES - Réponse stagiaire
              </div>
              <div style="flex: 2; text-align: center;">
                <div style="margin: 1px 0;">CI.DES sasu · Capital 2 500 Euros</div>
                <div style="margin: 1px 0;">SIRET : 87840789900011 · VAT : FR71878407899</div>
                <div style="margin: 1px 0;">Page <span class="pageNumber"></span> sur <span class="totalPages"></span></div>
              </div>
              <div style="flex: 1; text-align: right; display: flex; align-items: center; justify-content: flex-end;">
                <span>© 2025 CI.DES</span>
                <img src="${baseUrl}/logo.png" style="width: 18px; height: 18px; object-fit: contain; margin-left: 6px;" onerror="this.style.display='none';">
              </div>
            </div>
          </div>
        `,
        preferCSSPageSize: true
      });
      

      await browser.close();
     
    } catch (puppeteerError) {
      // Vérifier si c'est une erreur de lancement de Puppeteer en production
      const isLaunchError = puppeteerError instanceof Error && (
        puppeteerError.message.includes('Failed to launch') ||
        puppeteerError.message.includes('spawn') ||
        puppeteerError.message.includes('ENOENT') ||
        puppeteerError.message.includes('chrome') ||
        puppeteerError.message.includes('chromium')
      );

      if (isLaunchError) {
        console.log('Détection d\'une erreur de lancement Chrome/Chromium en production');
        

        const stagiaireNom = `${reponse.stagiaire.prenom || ''} ${reponse.stagiaire.nom || ''}`.trim();
        const sessionLabel = getSessionLabel(formulaire.session).replace(/[^a-zA-Z0-9]/g, '-');
        
        // Ajouter un message d'information au début du HTML
        const htmlWithInstructions = html.replace(
          '<div class="document-container">',
          `<div class="document-container">
          <div style="background-color: #fef3c7; border: 2px solid #f59e0b; border-radius: 8px; padding: 16px; margin-bottom: 20px; text-align: center; page-break-inside: avoid;">
            <h2 style="color: #92400e; margin: 0 0 8px 0;">📄 Mode Impression Manuelle</h2>
            <p style="color: #92400e; margin: 0; font-size: 14px;">
              <strong>Pour obtenir un PDF :</strong><br>
              1. Utilisez <kbd>Ctrl+P</kbd> (Windows/Linux) ou <kbd>Cmd+P</kbd> (Mac)<br>
              2. Sélectionnez "Enregistrer au format PDF"<br>
              3. Ajustez les marges si nécessaire
            </p>
            <details style="margin-top: 10px; font-size: 12px;">
              <summary style="cursor: pointer; color: #92400e;">Détails techniques</summary>
              <p style="color: #6b7280; margin: 5px 0;">Chrome/Chromium non disponible sur ce serveur</p>
            </details>
          </div>`
        );
        
        return new NextResponse(htmlWithInstructions, {
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Content-Disposition': `attachment; filename="session-${sessionLabel}-reponse-${stagiaireNom}-${new Date().toISOString().split('T')[0]}.html"`,
            'X-PDF-Fallback': 'true',
            'X-Fallback-Reason': 'Chrome not available'
          }
        });
      }
      

      const stagiaireNom = `${reponse.stagiaire.prenom || ''} ${reponse.stagiaire.nom || ''}`.trim();
      const sessionLabel = getSessionLabel(formulaire.session).replace(/[^a-zA-Z0-9]/g, '-');
      
      // Ajouter un message d'information au début du HTML
      const htmlWithInfo = html.replace(
        '<!-- Instructions d\'impression -->',
        `<!-- Instructions d\'impression -->
        <div style="background-color: #fee2e2; border: 2px solid #dc2626; border-radius: 8px; padding: 16px; margin-bottom: 20px; text-align: center;">
          <h2 style="color: #dc2626; margin: 0 0 8px 0;">⚠️ Mode Impression Manuel</h2>
          <p style="color: #991b1b; margin: 0; font-size: 14px;">
            Le PDF automatique n'est pas disponible sur ce serveur. 
            <strong>Utilisez Ctrl+P pour imprimer ce document en PDF.</strong><br>
            <small>Erreur technique: ${puppeteerError instanceof Error ? puppeteerError.message : 'Erreur inconnue'}</small>
          </p>
        </div>`
      );
      
      return new NextResponse(htmlWithInfo, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Content-Disposition': `attachment; filename="session-${sessionLabel}-reponse-${stagiaireNom}-${new Date().toISOString().split('T')[0]}.html"`,
          'X-PDF-Fallback': 'true'
        }
      });
    }

    // Retourner le PDF
    const stagiaireNom = `${reponse.stagiaire.prenom || ''} ${reponse.stagiaire.nom || ''}`.trim();
    const sessionLabel = getSessionLabel(formulaire.session).replace(/[^a-zA-Z0-9]/g, '-');
    
    // Gestion appropriée du Buffer pour NextResponse
    let responseData: ArrayBuffer;
    if (pdf instanceof Buffer) {
      responseData = pdf.buffer.slice(pdf.byteOffset, pdf.byteOffset + pdf.byteLength);
    } else {
      // Si c'est déjà un Uint8Array, le convertir en ArrayBuffer
      responseData = pdf.buffer.slice(pdf.byteOffset, pdf.byteOffset + pdf.byteLength) as ArrayBuffer;
    }
    
    return new NextResponse(responseData, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="session-${sessionLabel}-reponse-${stagiaireNom}-${new Date().toISOString().split('T')[0]}.pdf"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
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
  const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://www.a-finpart.com';
  
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
          padding: 8px;
          font-size: 12px;
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
          fallback: none;
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
        

        
        /* Règles de pagination avec pied de page */
        @page {
          margin: 10mm 10mm 25mm 10mm;
          size: A4 portrait;
          
          @bottom-center {
            content: "Page " counter(page) " sur " counter(pages);
            font-size: 10px;
            color: #6b7280;
          }
          
          @bottom-left {
            content: "CI.DES - Réponse stagiaire";
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
        
        /* Forcer le format A4 pour l'affichage */
        body {
          width: 210mm;
          min-height: 297mm;
          margin: 0 auto;
          padding: 15mm;
          box-sizing: border-box;
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
            width: 210mm !important;
            min-height: 297mm !important;
            margin: 0 !important;
            padding: 15mm !important;
          }
        }
        
        /* Styles pour l'affichage à l'écran */
        @media screen {
          body {
            background-color: #f5f5f5;
            font-family: Arial, sans-serif;
          }
          .document-container {
            background-color: white;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            margin: 20px auto;
            width: 210mm;
            min-height: 297mm;
            padding: 15mm;
            box-sizing: border-box;
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
         
          background-color:rgb(255, 255, 255);
        }
        .question.incorrect {
         
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
        
        /* Pied de page fixe pour HTML */
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
          width: 20px;
          height: 20px;
          object-fit: contain;
          margin-left: 8px;
        }
        
        /* Espace pour le footer fixe */
        body {
          padding-bottom: 70px;
        }
      </style>
    </head>
    <body>
      <div class="document-container">
        <!-- En-tête professionnel -->
              <div class="header">
          <div class="logo">
            <img src="${baseUrl}/logo.png" alt="CI.DES Logo" style="max-width: 100%; max-height: 100%;" onerror="this.style.display='none';">
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

      </div>
      
      <!-- Pied de page fixe qui apparaît sur chaque page -->
    </body>
    </html>
  `;
} 