import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from 'lib/prisma';
import { sendEmail } from 'lib/email';

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
        userId: session?.user?.id,
        ...formData,
        signature,
        statut: 'SIGNE',
      },
    });

    // Envoyer les emails de notification
    try {
      // Email à l'utilisateur
      await sendEmail({
        to: formData.email || devis.demande.user.email,
        subject: 'Contrat de formation signé',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h2 style="color: #2563eb; margin-bottom: 20px;">Contrat de formation signé</h2>
            <p>Bonjour ${formData.prenom} ${formData.nom},</p>
            <p>Votre contrat de formation a été signé avec succès pour la session <strong>${devis.demande.session}</strong>.</p>
            <p>Détails du contrat :</p>
            <ul style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 15px 0;">
              <li>Formation : Formation Cordiste IRATA - ${devis.demande.session}</li>
              <li>Montant : ${devis.montant} €</li>
              <li>Date de formation : ${devis.dateFormation ? new Date(devis.dateFormation).toLocaleDateString('fr-FR') : 'Non définie'}</li>
            </ul>
            <p>Nous vous contacterons prochainement pour finaliser les détails pratiques de la formation.</p>
            <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
              Cordialement,<br>
              L'équipe CI.DES
            </p>
          </div>
        `
      });

      // Email à l'admin
      await sendEmail({
        to: 'atikpododzi4@gmail.com,pmcides@gmail.com,pm@cides.tf',
        subject: 'Nouveau contrat signé',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h2 style="color: #2563eb; margin-bottom: 20px;">Nouveau contrat signé</h2>
            <p>Un nouveau contrat a été signé par ${formData.prenom} ${formData.nom}.</p>
            <p>Détails :</p>
            <ul style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 15px 0;">
              <li>Formation : Formation Cordiste IRATA - ${devis.demande.session}</li>
              <li>Email : ${formData.email || devis.demande.user.email}</li>
              <li>Téléphone : ${formData.telephone}</li>
              <li>Adresse : ${formData.adresse}</li>
              <li>Date de naissance : ${formData.dateNaissance}</li>
              <li>Lieu de naissance : ${formData.lieuNaissance}</li>
            </ul>
            <p>Vous pouvez consulter les détails complets du contrat dans votre espace administrateur.</p>
            <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
              Cordialement,<br>
              L'équipe CI.DES
            </p>
          </div>
        `
      });
    } catch (emailError) {
      console.error('Erreur lors de l\'envoi des emails:', emailError);
      // On continue même si l'email échoue
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