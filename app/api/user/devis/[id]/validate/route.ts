import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from 'lib/prisma';
import { sendEmail } from 'lib/email';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const devis = await prisma.devis.findUnique({
      where: { id },
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

    if (devis.userId !== session?.user?.id) {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    if (devis.statut !== 'EN_ATTENTE') {
      return NextResponse.json(
        { message: 'Ce devis ne peut plus être validé' },
        { status: 400 }
      );
    }

    const updatedDevis = await prisma.devis.update({
      where: { id },
      data: { statut: 'VALIDE' },
      include: {
        demande: {
          include: {
            user: true,
          },
        },
      },
    });

    // Créer une notification pour l'utilisateur: contrat disponible
    try {
      await prisma.notification.create({
        data: {
          userId: updatedDevis.userId,
          title: 'Contrat disponible',
          message: `Votre contrat/convention pour la session ${updatedDevis.demande.session} est maintenant disponible.`,
          type: 'contrat',
          category: 'available',
          relatedId: updatedDevis.id,
        },
      });
    } catch (e) {
      console.error('Erreur création notification utilisateur (contrat disponible):', e);
    }

    // Envoyer l'email à l'utilisateur
    try {
      await sendEmail({
        to: devis.demande.user.email,
        subject: 'Devis validé',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h2 style="color: #2563eb; margin-bottom: 20px;">Devis validé</h2>
            <p>Bonjour ${devis.demande.user.prenom} ${devis.demande.user.nom},</p>
            <p>Vous avez accepté le devis pour la formation <strong>Formation Cordiste IRATA - ${devis.demande.session}</strong>.</p>
            <p>Détails du devis :</p>
            <ul style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 15px 0;">
              <li>Numéro : ${devis.numero}</li>
              <li>Montant : ${devis.montant} €</li>
              <li>Date de formation : ${devis.dateFormation ? new Date(devis.dateFormation).toLocaleDateString('fr-FR') : 'Non définie'}</li>
            </ul>
            <p> Le contrat est envoyé. Vous pouvez consulter les détails complets du contrat dans votre espace personnel.</p>
            <div style="margin: 24px 0;">
              <a href="https://www.a-finpart.com/mon-contrat" style="background-color:#2563eb;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:6px;display:inline-block;font-weight:600" target="_blank" rel="noopener noreferrer">
                Accéder à mon contrat
              </a>
            </div>
            <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
              Cordialement,<br>
              L'équipe CI.DES
            </p>
          </div>
        `
      });
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email à l\'utilisateur:', error);
    }

    // Envoyer l'email à l'admin
    try {
      const adminEmail = 'pmcides@gmail.com,pm@cides.tf'; // Email admin par défaut
      
      await sendEmail({
        to: adminEmail,
        subject: 'Devis accepté par le client',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h2 style="color: #2563eb; margin-bottom: 20px;">Devis accepté par le client</h2>
            <p>Bonjour,</p>
            <p>Le devis que vous avez créé a été accepté par le client.</p>
            <p>Détails du devis :</p>
            <ul style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 15px 0;">
              <li>Numéro : ${devis.numero}</li>
              <li>Client : ${devis.client}</li>
              <li>Formation : Formation Cordiste IRATA - ${devis.demande.session}</li>
              <li>Montant : ${devis.montant} €</li>
              <li>Date de formation : ${devis.dateFormation ? new Date(devis.dateFormation).toLocaleDateString('fr-FR') : 'Non définie'}</li>
            </ul>
            <p>Vous pouvez consulter les détails complets du devis dans votre espace administrateur.</p>
            <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
              Cordialement,<br>
              L'équipe CI.DES
            </p>
          </div>
        `
      });
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email à l\'admin:', error);
    }

    // Créer une notification pour l'admin
    const notificationData = {
      type: 'DEVIS_VALIDATED',
      message: `Devis ${devis.numero} accepté par ${devis.client} - Montant: ${devis.montant}€`,
      link: `/admin/devis/${devis.id}`
    };

    return NextResponse.json({
      ...updatedDevis,
      adminNotification: notificationData
    });
  } catch (error) {
    console.error('Erreur lors de la validation du devis:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la validation du devis' },
      { status: 500 }
    );
  }
} 