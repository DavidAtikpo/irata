import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from '../../../../../../lib/prisma';
import { promises as fs } from 'fs';
import { join } from 'path';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

const DATA_PATH = join(process.cwd(), 'data');
const TRAINEE_INDUCTION_FORMS_FILE = 'trainee-induction-forms.json';
const TRAINEE_SIGNATURES_FILE = 'trainee-induction-signatures.json';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  const { documentId } = await params;
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Lire le document d'induction
    const formsPath = join(DATA_PATH, TRAINEE_INDUCTION_FORMS_FILE);
    const formsData = await fs.readFile(formsPath, 'utf-8');
    const forms = JSON.parse(formsData);
    const document = forms.find((form: any) => form.id === documentId);

    if (!document) {
      return NextResponse.json(
        { error: 'Document non trouvé' },
        { status: 404 }
      );
    }

    // Lire les signatures des stagiaires
    const signaturesPath = join(DATA_PATH, TRAINEE_SIGNATURES_FILE);
    const signaturesData = await fs.readFile(signaturesPath, 'utf-8');
    const signatures = JSON.parse(signaturesData);
    const documentSignatures = signatures.filter((sig: any) => sig.documentId === documentId);

    // Récupérer les profils utilisateurs et sessions
    const userProfiles = await getUserProfiles();
    const sessionProfiles = await getSessionProfiles();

    // Enrichir les signatures avec les informations utilisateur
    const enrichedSignatures = documentSignatures.map((signature: any) => {
      const userProfile = userProfiles.find((user: any) => user.id === signature.userId);
      const sessionProfile = sessionProfiles.find((session: any) => session.id === document.sessionId);
      return {
        ...signature,
        userName: userProfile ? `${userProfile.prenom} ${userProfile.nom}`.trim() : 'Utilisateur inconnu',
        userEmail: userProfile?.email || 'Email inconnu',
        sessionName: sessionProfile?.session || 'Session inconnue'
      };
    });

    const sessionProfile = sessionProfiles.find((session: any) => session.id === document.sessionId);

    // Générer le HTML
    const htmlContent = generateInductionHTML(document, enrichedSignatures, sessionProfile?.session || 'Session inconnue');

    // Générer le PDF avec Puppeteer
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    const pdf = await page.pdf({
      format: 'A4',
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      }
    });
    await browser.close();

    return new NextResponse(Buffer.from(pdf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="induction_document_${documentId}.pdf"`
      }
    });

  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la génération du PDF' },
      { status: 500 }
    );
  }
}

async function getUserProfiles() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        nom: true,
        prenom: true
      }
    });
    return users;
  } catch (error) {
    console.error('Erreur lors de la récupération des profils utilisateurs:', error);
    return [];
  }
}

async function getSessionProfiles() {
  try {
    const sessions = await prisma.demande.findMany({
      select: {
        id: true,
        session: true
      }
    });
    return sessions;
  } catch (error) {
    console.error('Erreur lors de la récupération des sessions:', error);
    return [];
  }
}

function generateInductionHTML(document: any, signatures: any[], sessionName: string): string {
  const signaturesHTML = signatures.map((signature: any) => `
    <tr>
      <td style="border: 1px solid #000; padding: 8px; text-align: center;">${signature.userName}</td>
      <td style="border: 1px solid #000; padding: 8px; text-align: center;">${signature.userEmail}</td>
      <td style="border: 1px solid #000; padding: 8px; text-align: center;">${signature.sessionName}</td>
      <td style="border: 1px solid #000; padding: 8px; text-align: center;">
        <img src="${signature.signature}" alt="Signature" style="max-height: 40px; max-width: 150px;" />
      </td>
      <td style="border: 1px solid #000; padding: 8px; text-align: center;">${new Date(signature.signedAt).toLocaleDateString('fr-FR')}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Document d'Induction - ${sessionName}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { border: 2px solid #000; padding: 10px; margin-bottom: 20px; }
        .title { text-align: center; border: 2px solid #000; padding: 15px; margin: 20px 0; }
        .section { border: 2px solid #000; padding: 15px; margin: 20px 0; }
        .signature-section { margin-top: 30px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th { background-color: #f0f0f0; font-weight: bold; }
        .admin-signature { text-align: center; margin: 20px 0; }
        .admin-signature img { max-height: 60px; max-width: 200px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div style="display: flex; justify-content: space-between; align-items: start;">
          <div style="display: flex; align-items: center;">
            <div style="width: 60px; height: 60px; background-color: #f0f0f0; border: 1px solid #000; margin-right: 15px; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 10px;">LOGO</span>
            </div>
            <div style="font-size: 12px;">
              <div><strong>Titre:</strong> CLDES INDUCTION DES STAGIAIRES</div>
              <div><strong>Numéro de Code:</strong> ENR-CIFRA-HSE 029</div>
            </div>
          </div>
          <div style="font-size: 12px; text-align: right;">
            <div><strong>Révision:</strong> 00</div>
            <div><strong>Date de création:</strong> 09/10/2023</div>
          </div>
        </div>
      </div>

      <div class="title">
        <h1 style="margin: 0; font-size: 24px;">INDUCTION DES STAGIAIRES</h1>
      </div>

      <div style="margin: 20px 0;">
        <p><strong>Diffusion:</strong> ${document.diffusion}</p>
        <p><strong>Copie:</strong> ${document.copie}</p>
      </div>

      <div class="section">
        <h3 style="margin-top: 0;">VALIDATION</h3>
        <p>Ce document a été validé et approuvé par l'administrateur.</p>
        
        <div class="admin-signature">
          <p><strong>Signature de l'Administrateur:</strong></p>
          ${document.adminSignature ? `<img src="${document.adminSignature}" alt="Signature Admin" />` : '<p>Aucune signature</p>'}
        </div>
      </div>

      <div class="section">
        <h3 style="margin-top: 0;">1. OBJECTIF</h3>
        <p>Ce document décrit les procédures d'induction pour les stagiaires participant aux formations d'accès par corde.</p>
      </div>

      <div class="section">
        <h3 style="margin-top: 0;">2. PORTÉE</h3>
        <p>Cette procédure s'applique à tous les stagiaires participant aux formations d'accès par corde organisées par notre centre.</p>
      </div>

      <div class="section">
        <h3 style="margin-top: 0;">3. DÉFINITIONS</h3>
        <ul>
          <li><strong>Induction:</strong> Processus d'introduction et d'orientation des nouveaux stagiaires</li>
          <li><strong>Stagiaire:</strong> Personne participant à une formation d'accès par corde</li>
          <li><strong>Formateur:</strong> Personnel qualifié responsable de la formation</li>
        </ul>
      </div>

      <div class="section">
        <h3 style="margin-top: 0;">DÉCLARATION</h3>
        <p>Je confirme avoir reçu et compris les informations contenues dans ce document d'induction.</p>
      </div>

      <div class="signature-section">
        <h3>Signatures des Stagiaires</h3>
        <table>
          <thead>
            <tr>
              <th style="border: 1px solid #000; padding: 8px;">Nom du Stagiaire</th>
              <th style="border: 1px solid #000; padding: 8px;">Email</th>
              <th style="border: 1px solid #000; padding: 8px;">Session</th>
              <th style="border: 1px solid #000; padding: 8px;">Signature</th>
              <th style="border: 1px solid #000; padding: 8px;">Date de Signature</th>
            </tr>
          </thead>
          <tbody>
            ${signaturesHTML}
          </tbody>
        </table>
      </div>

      <div style="margin-top: 30px; text-align: center; font-size: 12px; border: 1px solid #000; padding: 10px;">
        <strong>Ce document sera conservé en toute sécurité dans le dossier de formation.</strong>
      </div>
    </body>
    </html>
  `;
}
