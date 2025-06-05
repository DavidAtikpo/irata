import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import puppeteer from 'puppeteer';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const data = await req.json();
    const { devisId, signature, ...formData } = data;

    // Récupérer le devis
    const devis = await prisma.devis.findUnique({
      where: { id: devisId },
      include: {
        demande: {
          include: {
            formation: true,
            user: true,
          },
        },
      },
    });

    if (!devis) {
      return NextResponse.json(
        { message: 'Devis non trouvé' },
        { status: 404 }
      );
    }

    // Créer le contrat
    const contrat = await prisma.contrat.create({
      data: {
        devisId,
        userId: session.user.id,
        ...formData,
        signature,
        statut: 'SIGNE',
      },
    });

    // Générer le PDF du contrat
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Créer le HTML du contrat
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            .header { text-align: center; margin-bottom: 40px; }
            .section { margin-bottom: 30px; }
            .signature { margin-top: 50px; }
            .signature img { max-width: 300px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Contrat de Formation</h1>
          </div>
          
          <div class="section">
            <h2>Informations de la Formation</h2>
            <p><strong>Formation:</strong> ${devis.demande.formation.titre}</p>
            <p><strong>Montant:</strong> ${devis.montant} €</p>
            <p><strong>Date de formation:</strong> ${devis.dateFormation ? new Date(devis.dateFormation).toLocaleDateString('fr-FR') : 'Non définie'}</p>
          </div>

          <div class="section">
            <h2>Informations du Stagiaire</h2>
            <p><strong>Nom:</strong> ${formData.nom}</p>
            <p><strong>Prénom:</strong> ${formData.prenom}</p>
            <p><strong>Adresse:</strong> ${formData.adresse}</p>
            <p><strong>Téléphone:</strong> ${formData.telephone}</p>
            <p><strong>Email:</strong> ${formData.email}</p>
            <p><strong>Date de naissance:</strong> ${formData.dateNaissance}</p>
            <p><strong>Lieu de naissance:</strong> ${formData.lieuNaissance}</p>
          </div>

          <div class="signature">
            <h3>Signature du Stagiaire</h3>
            <img src="${signature}" alt="Signature" />
          </div>
        </body>
      </html>
    `;

    await page.setContent(html);
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px',
      },
    });

    await browser.close();

    // Envoyer le PDF par email
    try {
      await sendEmail({
        to: formData.email,
        subject: 'Votre contrat de formation',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h2 style="color: #2563eb; margin-bottom: 20px;">Contrat de formation signé</h2>
            <p>Bonjour ${formData.prenom} ${formData.nom},</p>
            <p>Votre contrat de formation a été signé avec succès.</p>
            <p>Vous trouverez ci-joint une copie de votre contrat au format PDF.</p>
            <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
              Cordialement,<br>
              L'équipe CI.DES
            </p>
          </div>
        `,
        attachments: [
          {
            filename: 'contrat.pdf',
            content: pdf,
          },
        ],
      });

      // Envoyer une copie à l'admin
      await sendEmail({
        to: 'atikpododzi4@gmail.com',
        subject: 'Nouveau contrat signé',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h2 style="color: #2563eb; margin-bottom: 20px;">Nouveau contrat signé</h2>
            <p>Un nouveau contrat a été signé par ${formData.prenom} ${formData.nom}.</p>
            <p>Formation: ${devis.demande.formation.titre}</p>
            <p>Vous trouverez ci-joint une copie du contrat au format PDF.</p>
            <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
              Cordialement,<br>
              L'équipe CI.DES
            </p>
          </div>
        `,
        attachments: [
          {
            filename: 'contrat.pdf',
            content: pdf,
          },
        ],
      });
    } catch (error) {
      console.error('Erreur lors de l\'envoi des emails:', error);
    }

    return NextResponse.json(contrat);
  } catch (error) {
    console.error('Erreur lors de la création du contrat:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la création du contrat' },
      { status: 500 }
    );
  }
} 