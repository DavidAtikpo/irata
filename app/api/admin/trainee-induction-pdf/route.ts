import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const { inductionId, signatureId } = body;

    if (!inductionId) {
      return NextResponse.json({ error: 'ID d\'induction requis' }, { status: 400 });
    }

    // Récupérer les données d'induction
    const inductionData = await prisma.$queryRaw`
      SELECT * FROM "webirata"."TraineeInduction" WHERE id = ${inductionId}
    `;

    if (!Array.isArray(inductionData) || inductionData.length === 0) {
      return NextResponse.json({ error: 'Induction non trouvée' }, { status: 404 });
    }

    const induction = inductionData[0];

    // Récupérer les signatures des utilisateurs
    let signatures;
    
    if (signatureId) {
      // Récupérer une signature spécifique
      signatures = await prisma.$queryRaw`
        SELECT 
          tis."userSignature",
          u.prenom,
          u.nom,
          u.email,
          tis."createdAt",
          tis.id as "signatureId"
        FROM "webirata"."TraineeInductionSignature" tis
        JOIN "webirata"."User" u ON tis."userId" = u.id
        WHERE tis."inductionId" = ${inductionId} AND tis.id = ${signatureId}
        ORDER BY tis."createdAt" ASC
      `;
    } else {
      // Récupérer toutes les signatures de la session
      signatures = await prisma.$queryRaw`
        SELECT 
          tis."userSignature",
          u.prenom,
          u.nom,
          u.email,
          tis."createdAt",
          tis.id as "signatureId"
        FROM "webirata"."TraineeInductionSignature" tis
        JOIN "webirata"."User" u ON tis."userId" = u.id
        WHERE tis."inductionId" = ${inductionId}
        ORDER BY tis."createdAt" ASC
      `;
    }

    const userSignatures = Array.isArray(signatures) ? signatures : [];

    // Générer le HTML du document
    const html = buildInductionHTML(induction, userSignatures);

    // Configuration Puppeteer
    const isProduction = process.env.NODE_ENV === 'production';
    
    let browserConfig: any = {
      headless: true,
      timeout: 30000
    };

    // Configuration des arguments selon l'environnement
    if (isProduction) {
      // Arguments optimisés pour la production (serverless)
      browserConfig.args = [
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
      ];
    } else {
      // Arguments pour le développement local
      browserConfig.args = [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-extensions'
      ];
    }

    // Configuration spécifique selon l'environnement
    if (isProduction) {
      // Production - utiliser Chromium avec @sparticuz/chromium
      try {
        browserConfig.executablePath = await chromium.executablePath();
        // Utiliser les arguments de chromium pour la production
        browserConfig.args = [...browserConfig.args, ...chromium.args];
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de Chromium:', error);
        throw new Error('Impossible d\'initialiser Chromium pour la génération PDF');
      }
    } else {
      // Développement - utiliser Chrome/Chromium local
      const possiblePaths = [
        process.env.PUPPETEER_EXECUTABLE_PATH,
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Users\\' + process.env.USERNAME + '\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe',
        '/usr/bin/google-chrome',
        '/usr/bin/chromium-browser',
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
      ];
      
      const fs = await import('fs');
      let executablePath = null;
      
      for (const path of possiblePaths) {
        if (path && fs.default.existsSync(path)) {
          executablePath = path;
          break;
        }
      }
      
      if (executablePath) {
        browserConfig.executablePath = executablePath;
        console.log('Chrome trouvé à:', executablePath);
      } else {
        console.error('Chrome/Chromium non trouvé. Veuillez installer Chrome ou définir PUPPETEER_EXECUTABLE_PATH');
        throw new Error('Chrome/Chromium non trouvé pour la génération PDF');
      }
    }
    
    // Générer le PDF
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
       margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' } 
     });
    await browser.close();

    // Retourner le PDF
    const arrayBuffer = pdf.buffer.slice(pdf.byteOffset, pdf.byteOffset + pdf.byteLength) as ArrayBuffer;
    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="induction_${induction.sessionId}.pdf"`,
      },
    });

  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la génération du PDF' },
      { status: 500 }
    );
  }
}

function buildInductionHTML(induction: any, userSignatures: any[]) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Document d'Induction des Stagiaires</title>
             <style>
         body { font-family: Arial, sans-serif; margin: 0; padding: 10px; font-size: 10px; }
         .header { display: flex; margin-bottom: 15px; }
         .logo { width: 60px; height: 60px; margin-right: 15px; }
         .header-table { border-collapse: collapse; width: 100%; font-size: 8px; }
         .header-table td { border: 1px solid #000; padding: 3px; }
         .header-table .bold { font-weight: bold; }
         .title { text-align: center; font-weight: bold; border: 1px solid #000; padding: 1px; margin: 10px 0; font-size: 12px; }
         .info { margin: 15px 0; }
         .section { margin: 12px 0; }
         .section h2 { color: #1e40af; font-size: 11px; margin-bottom: 8px; }
         .section ul { margin: 8px 0; padding-left: 15px; }
         .section li { margin: 3px 0; font-size: 9px; line-height: 1.2; }
         .validation { margin: 5px 0; }
         .validation table { width: 100%; border-collapse: collapse; margin: 5px 0; font-size: 8px; }
         .validation th, .validation td { border: 1px solid #000; padding: 6px; text-align: left; }
         .signatures { margin: 5px 0; text-align: right; }
         .signature-item { margin: 5px 0; padding: 1px; text-align: right; }
         .signature-image { max-height: 40px; max-width: 100px; }
         .session-info { text-align: right; margin-bottom: 10px; }

         .warning-box { background-color: #fef3c7; font-weight: bold; text-align: center; padding: 2px; margin: 2px 0; font-size: 9px; }
         .declaration { margin: 2px 0; }
         .declaration p { margin: 2px 0; font-size: 9px; }
       </style>
    </head>
    <body>
      <!-- En-tête -->
      <div class="header">
        <img src="https://www.a-finpart.com/logo.png" alt="CI.DES Logo" class="logo">
        <table class="header-table">
          <tr>
            <td class="bold">Titre</td>
            <td class="bold">Numéro de code</td>
            <td class="bold">Révision</td>
            <td class="bold">Création date</td>
          </tr>
          <tr>
            <td>CIDES INDUCTION DES STAGIAIRES</td>
            <td>ENR-CIFRA-HSE 029</td>
            <td>00</td>
            <td>09/10/2023</td>
          </tr>
        </table>
      </div>

      <h1 class="title">INDUCTION DES STAGIAIRES</h1>

      <div class="info">
        <p><strong>Diffusion:</strong> ${induction.diffusion}</p>
        <p><strong>Copie:</strong> ${induction.copie}</p>
      </div>

      <!-- Validation -->
      <div class="validation">
        <h2>VALIDATION</h2>
        <table>
          <thead>
            <tr>
              <th>Préparé par</th>
              <th>Révisé par</th>
              <th>Approuvé par</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                Laurent ARDOUIN<br/>TA / RAMR<br/>Date: 09/10/2023<br/>
                <strong>Signature:</strong> 
                ${induction.adminSignature ? `<img src="${induction.adminSignature}" alt="Signature Admin" style="height: 32px;">` : '<span style="color: red;">Non signé</span>'}
              </td>
              <td>Dimitar Aleksandrov MATEEB<br/>Formateur<br/>Date: 09/10/2023</td>
              <td>Laurent ARDOUIN<br/>Manager<br/>Date: 09/10/2023</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Sections du document -->
      <div class="section">
        <h2>1. LORSQUE LE COURS SE RASSEMBLE</h2>
        <ul>
          <li>ACCUEIL – offrir des rafraîchissements</li>
          <li>DEMANDER ET VÉRIFIER LES CARNETS DE BORD – (N2 et N3 uniquement)</li>
          <li>DISTRIBUER LE FORMULAIRE D'INSCRIPTION ET LE FORMULAIRE MÉDICAL</li>
          <li>DISTRIBUER LE MANUEL DU STAGIAIRE, ICOP, TACS ET LES QUESTIONNAIRES PERTINENTS</li>
        </ul>
      </div>

      <div class="section">
        <h2>2. LORSQUE LE COURS EST RASSEMBLÉ</h2>
        <ul>
          <li>PRÉSENTER LE(S) FORMATEUR(S) – nom, parcours, niveau, etc.</li>
          <li>FAIRE PRÉSENTER LES STAGIAIRES – nom, niveau, où ils ont travaillé / travaillent</li>
          <li>PRÉSENTER L'ENTREPRISE – historique, membre IRATA, etc.</li>
          <li>ASSURANCE – entièrement assurée</li>
          <li>EXPOSER LE SCHÉMA IRATA – niveaux, progression, historique, etc.</li>
          <li>STRUCTURE DU COURS ET HORAIRES – début / fin / déjeuner / pauses café</li>
          <li>SUPERVISION – pas autorisé sur cordes sans supervision directe du formateur</li>
          <li>ÉCHEC – politique de facturation de l'entreprise pour les candidats échoués</li>
          <li>RETRAIT / EXCLUSION DU COURS – politique de facturation de l'entreprise</li>
          <li>ARRANGEMENTS DE PAIEMENT – politique de l'entreprise</li>
          <li>CERTIFICATION – ne sera pas délivrée tant que le paiement complet n'est pas reçu</li>
          <li>INSTALLATIONS DE RAFRAÎCHISSEMENT – garder propre et rangé, signaler si les fournitures sont faibles</li>
          <li>TOILETTES ET DOUCHES – garder propre et rangé, signaler si les fournitures sont faibles</li>
          <li>MÉNAGE – aider à garder la zone de formation, le local et les toilettes propres et rangés</li>
          <li>FUMER</li>
          <li>STATIONNEMENT</li>
          <li>ARRANGEMENTS D'INCENDIE ET D'URGENCE – sorties, extincteurs (seulement si sûr)</li>
        </ul>
      </div>

      <div class="section">
        <h2>3. PASSER EN REVUE L'ÉVALUATION DES RISQUES</h2>
        <ul>
          <li>GLISSADES, TRÉBUCHER ET CHUTES – garder la zone propre, utiliser les rampes, toujours attaché, etc.</li>
          <li>VÉRIFICATION PAR PAIR – faire vérifier par quelqu'un avant d'aller sur cordes</li>
          <li>INSPECTION PRÉ-UTILISATION DE L'ÉQUIPEMENT – chaque fois avant utilisation, signaler les défauts</li>
          <li>VIGILANCE CONSTANTE DE L'ÉQUIPEMENT – signaler tout défaut suspecté</li>
          <li>OBJETS TOMBÉS – vider et fermer les poches</li>
          <li>BLESSURE AU COUDE – techniques d'échauffement</li>
          <li>MANUTENTION MANUELLE – traîner, ne pas soulever</li>
          <li>ÉPUISEMENT PAR LA CHALEUR – eau, repos, etc.</li>
          <li>PRÉCAUTIONS POUR LA FORMATION AVEC DES VICTIMES VIVANTES</li>
        </ul>
      </div>

             <div class="warning-box">
         MONTRER OÙ L'ÉVALUATION COMPLÈTE DES RISQUES EST AFFICHÉE ET ENCOURAGER LES GENS À LA LIRE<br/>
         TOUS LES STAGIAIRES ET FORMATEURS DOIVENT ENSUITE SIGNER<br/>
         LA DÉCLARATION D'INDUCTION
       </div>

       <div class="declaration" style="padding: 0px;">
         <h2>DÉCLARATION D'INDUCTION</h2>
         <p>
           <strong>DATE DU COURS:</strong> ${new Date(induction.courseDate).toLocaleDateString('fr-FR')} 
           &nbsp;&nbsp;&nbsp;&nbsp;
           <strong>LIEU DU COURS:</strong> ${induction.courseLocation}
         </p>
         <p>
           J'ai reçu l'induction du cours, compris tous ses aspects et accepte de respecter son contenu.
           De plus, j'ai lu et compris l'évaluation complète des risques de la zone de formation :
         </p>
       </div>
             <!-- Signatures des stagiaires -->
       <div class="signatures" style="font-size: 11px; padding: 0px;">
         <div class="session-info">
           <p><strong>Session:</strong> ${induction.sessionId}</p>
         </div>

         ${userSignatures.map((sig, index) => `
           <div class="signature-item" style="font-size: 9px; padding: 0px;">
             <p><strong>Stagiaire:</strong> ${sig.prenom || ''} ${sig.nom || ''} (${sig.email})</p>
             <p><strong>Date de signature:</strong> ${new Date(sig.createdAt).toLocaleDateString('fr-FR')}</p>
             ${sig.userSignature ? `<img src="${sig.userSignature}" alt="Signature" class="signature-image">` : '<p style="color: red;">Pas de signature</p>'}
           </div>
         `).join('')}
       </div>
    </body>
    </html>
  `;
}
