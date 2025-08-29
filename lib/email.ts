import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export interface EmailData {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(emailData: EmailData) {
  try {
    const mailOptions = {
      from: `"${process.env.SMTP_FROM}" <${process.env.SMTP_FROM_EMAIL}>`,
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email envoyé:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Erreur envoi email:', error);
    return { success: false, error };
  }
}

export async function sendStatusUpdateEmail(
  to: string,
  formationTitle: string,
  status: string,
  comment?: string
) {
  const statusText = {
    EN_ATTENTE: 'en attente',
    VALIDE: 'acceptée',
    REFUSE: 'refusée',
  }[status];

  const subject = `Mise à jour de votre demande de formation - ${formationTitle}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
      <h2 style="color: #2563eb; margin-bottom: 20px;">Mise à jour de votre demande de formation</h2>
      <p>Bonjour,</p>
      <p>Votre demande pour la formation <strong>${formationTitle}</strong> est maintenant <strong>${statusText}</strong>.</p>
      ${comment ? `<p style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 15px 0;">
        <strong>Commentaire de l'administrateur :</strong><br>
        ${comment}
      </p>` : ''}
      <p>Vous pouvez consulter les détails de votre demande en vous connectant à votre espace personnel.</p>
      <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
        Cordialement,<br>
        L'équipe CI.DES
      </p>
    </div>
  `;

  return sendEmail({ to, subject, html });
}

export async function sendFormulaireValidationNotification(
  to: string,
  stagiaireNom: string,
  formulaireTitre: string,
  session: string,
  dateDebut: string,
  dateFin: string
) {
  const subject = `📋 Nouveau formulaire quotidien disponible - ${formulaireTitre}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; background-color: #f9fafb;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2563eb; margin: 0; font-size: 24px;">📋 Formulaire Quotidien</h1>
        <p style="color: #6b7280; margin: 5px 0;">CI.DES Formations</p>
      </div>
      
      <div style="background-color: white; padding: 25px; border-radius: 8px; border-left: 4px solid #10b981;">
        <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 20px;">Bonjour ${stagiaireNom},</h2>
        
        <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
          Un nouveau <strong>formulaire quotidien</strong> a été validé et est maintenant disponible pour votre session de formation.
        </p>
        
        <div style="background-color: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 6px; padding: 20px; margin: 20px 0;">
          <h3 style="color: #0c4a6e; margin: 0 0 15px 0; font-size: 18px;">📝 Détails du formulaire</h3>
          <div style="color: #0369a1;">
            <p style="margin: 8px 0;"><strong>Titre :</strong> ${formulaireTitre}</p>
            <p style="margin: 8px 0;"><strong>Session :</strong> ${session}</p>
            <p style="margin: 8px 0;"><strong>Période :</strong> Du ${new Date(dateDebut).toLocaleDateString('fr-FR')} au ${new Date(dateFin).toLocaleDateString('fr-FR')}</p>
          </div>
        </div>
        
        <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 15px; margin: 20px 0;">
          <p style="color: #92400e; margin: 0; font-weight: 500;">
            ⚠️ <strong>Action requise :</strong> Veuillez remplir ce formulaire quotidien dans les plus brefs délais.
          </p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/formulaires-quotidiens" 
             style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">
            📋 Accéder au formulaire
          </a>
        </div>
        
        <p style="color: #6b7280; font-size: 14px; margin-top: 25px;">
          Si vous avez des questions, n'hésitez pas à contacter votre formateur ou l'équipe administrative.
        </p>
      </div>
      
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 12px; margin: 0;">
          Cet email a été envoyé automatiquement par le système CI.DES<br>
          Merci de ne pas répondre à cet email
        </p>
      </div>
    </div>
  `;

  return sendEmail({ to, subject, html });
}

export async function sendContributionConfirmationEmail(
  contributorEmail: string,
  contributorName: string,
  amount: number,
  contributionType: string,
  returnAmount: number,
  returnDescription: string
) {
  const subject = 'Confirmation de votre contribution - CI.DES';
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">CI.DES</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px;">Centre de Formation Cordiste IRATA</p>
      </div>
      
      <div style="padding: 30px; background: #f9f9f9;">
        <h2 style="color: #333; margin-bottom: 20px;">Merci pour votre contribution !</h2>
        
        <p>Bonjour ${contributorName},</p>
        
        <p>Nous avons bien reçu votre contribution de <strong>${amount.toLocaleString()} FCFA</strong> pour notre projet de financement participatif.</p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
          <h3 style="color: #667eea; margin-top: 0;">Détails de votre contribution :</h3>
          <ul style="list-style: none; padding: 0;">
            <li style="margin: 10px 0;"><strong>Type :</strong> ${contributionType}</li>
            <li style="margin: 10px 0;"><strong>Montant :</strong> ${amount.toLocaleString()} FCFA</li>
            <li style="margin: 10px 0;"><strong>Votre retour :</strong> ${returnDescription}</li>
            <li style="margin: 10px 0;"><strong>Valeur du retour :</strong> ${returnAmount.toLocaleString()} FCFA</li>
          </ul>
        </div>
        
        <p>Votre contribution nous aide à équiper notre centre de formation avec les meilleurs équipements cordistes IRATA et de contrôle non destructif.</p>
        
        <div style="background: #e8f4fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #2c5aa0; margin-top: 0;">Prochaines étapes :</h3>
          <ul>
            <li>Vous recevrez bientôt un reçu officiel</li>
            <li>Nous vous tiendrons informés de l'avancement du projet</li>
            <li>Votre retour sera disponible selon les conditions définies</li>
          </ul>
        </div>
        
        <p>Pour toute question, n'hésitez pas à nous contacter à <a href="mailto:${process.env.SMTP_FROM_EMAIL}">${process.env.SMTP_FROM_EMAIL}</a></p>
        
        <p>Cordialement,<br>
        <strong>L'équipe CI.DES</strong></p>
      </div>
      
      <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
        <p>CI.DES - Centre de Formation Cordiste IRATA<br>
        17270 BORESSE-ET-MARTRON<br>
        Tél: +33 6 24 67 13 65 | Email: ${process.env.SMTP_FROM_EMAIL}</p>
      </div>
    </div>
  `;

  return sendEmail({ to: contributorEmail, subject, html });
}

export async function sendPaymentFailureEmail(
  contributorEmail: string,
  contributorName: string,
  amount: number,
  errorMessage: string
) {
  const subject = 'Problème avec votre paiement - CI.DES';
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">CI.DES</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px;">Centre de Formation Cordiste IRATA</p>
      </div>
      
      <div style="padding: 30px; background: #f9f9f9;">
        <h2 style="color: #333; margin-bottom: 20px;">Problème avec votre paiement</h2>
        
        <p>Bonjour ${contributorName},</p>
        
        <p>Nous avons rencontré un problème lors du traitement de votre paiement de <strong>${amount.toLocaleString()} FCFA</strong>.</p>
        
        <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
          <h3 style="color: #856404; margin-top: 0;">Détails du problème :</h3>
          <p style="color: #856404; margin: 0;">${errorMessage}</p>
        </div>
        
        <div style="background: #e8f4fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #2c5aa0; margin-top: 0;">Solutions possibles :</h3>
          <ul>
            <li>Vérifiez que votre carte bancaire est valide</li>
            <li>Assurez-vous d'avoir suffisamment de fonds</li>
            <li>Essayez avec une autre méthode de paiement</li>
            <li>Contactez-nous pour un paiement alternatif</li>
          </ul>
        </div>
        
        <p>Pour nous contacter : <a href="mailto:${process.env.SMTP_FROM_EMAIL}">${process.env.SMTP_FROM_EMAIL}</a></p>
        
        <p>Cordialement,<br>
        <strong>L'équipe CI.DES</strong></p>
      </div>
      
      <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
        <p>CI.DES - Centre de Formation Cordiste IRATA<br>
        17270 BORESSE-ET-MARTRON<br>
        Tél: +33 6 24 67 13 65 | Email: ${process.env.SMTP_FROM_EMAIL}</p>
      </div>
    </div>
  `;

  return sendEmail({ to: contributorEmail, subject, html });
}

export async function sendWelcomeEmail({
  email,
  name,
  temporaryPassword
}: {
  email: string;
  name: string;
  temporaryPassword: string;
}) {
  const subject = `🎉 Bienvenue sur CI.DES - Votre compte a été créé`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; background-color: #f9fafb;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2563eb; margin: 0; font-size: 24px;">🎉 Bienvenue sur CI.DES</h1>
        <p style="color: #6b7280; margin: 5px 0;">Centre de Multi Formations en Sécurité</p>
      </div>
      
      <div style="background-color: white; padding: 25px; border-radius: 8px; border-left: 4px solid #10b981;">
        <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 20px;">Bonjour ${name},</h2>
        
        <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
          Félicitations ! Votre compte a été créé automatiquement suite à votre contribution au projet de financement participatif.
        </p>
        
        <div style="background-color: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 6px; padding: 20px; margin: 20px 0;">
          <h3 style="color: #0c4a6e; margin: 0 0 15px 0; font-size: 18px;">🔐 Vos identifiants de connexion</h3>
          <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 4px; padding: 15px; margin: 15px 0;">
            <p style="margin: 8px 0; color: #92400e;"><strong>Email :</strong> ${email}</p>
            <p style="margin: 8px 0; color: #92400e;"><strong>Mot de passe temporaire :</strong> ${temporaryPassword}</p>
          </div>
          <p style="color: #dc2626; font-size: 14px; margin: 10px 0;">
            ⚠️ <strong>Important :</strong> Notez bien ce mot de passe. Vous pourrez le changer dans votre profil après connexion.
          </p>
        </div>
        
        <div style="background-color: #ecfdf5; border: 1px solid #10b981; border-radius: 6px; padding: 20px; margin: 20px 0;">
          <h3 style="color: #065f46; margin: 0 0 15px 0; font-size: 18px;">🚀 Que pouvez-vous faire maintenant ?</h3>
          <ul style="color: #047857; line-height: 1.8; margin: 0; padding-left: 20px;">
            <li>Accéder à votre dashboard personnel</li>
            <li>Suivre l'avancement du projet</li>
            <li>Consulter vos contributions</li>
            <li>Recevoir des mises à jour exclusives</li>
            <li>Modifier votre profil et mot de passe</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/user/dashboard" 
             style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Accéder à mon Dashboard
          </a>
        </div>
        
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px; text-align: center;">
          Merci de votre confiance et de votre contribution à notre projet !<br>
          L'équipe CI.DES
        </p>
      </div>
    </div>
  `;

  return sendEmail({ to: email, subject, html });
}

export async function sendInvoicePaymentConfirmationEmail(
  userEmail: string,
  userName: string,
  invoiceNumber: string,
  paymentAmount: number,
  totalAmount: number,
  paymentStatus: string,
  paymentDate: string
) {
  const subject = 'Confirmation de paiement - Facture CI.DES';
  
  const isFullyPaid = paymentStatus === 'PAID';
  const statusText = isFullyPaid ? 'entièrement payée' : 'partiellement payée';
  const statusColor = isFullyPaid ? '#10b981' : '#f59e0b';
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">✅ Paiement Confirmé</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px;">CI.DES - Centre de Formation Cordiste IRATA</p>
      </div>
      
      <div style="padding: 30px; background: #f9f9f9;">
        <h2 style="color: #333; margin-bottom: 20px;">Merci pour votre paiement !</h2>
        
        <p>Bonjour ${userName},</p>
        
        <p>Nous confirmons la réception de votre paiement pour votre facture de formation.</p>
        
        <div style="background: white; padding: 25px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${statusColor};">
          <h3 style="color: #333; margin-top: 0; margin-bottom: 20px;">📋 Détails du paiement :</h3>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
            <div>
              <strong style="color: #6b7280;">Numéro de facture :</strong><br>
              <span style="color: #333; font-size: 16px;">${invoiceNumber}</span>
            </div>
            <div>
              <strong style="color: #6b7280;">Date de paiement :</strong><br>
              <span style="color: #333;">${new Date(paymentDate).toLocaleDateString('fr-FR')}</span>
            </div>
            <div>
              <strong style="color: #6b7280;">Montant payé :</strong><br>
              <span style="color: #10b981; font-size: 18px; font-weight: bold;">${paymentAmount.toLocaleString()}€</span>
            </div>
            <div>
              <strong style="color: #6b7280;">Montant total :</strong><br>
              <span style="color: #333; font-size: 16px;">${totalAmount.toLocaleString()}€</span>
            </div>
          </div>
          
          <div style="background: ${isFullyPaid ? '#d1fae5' : '#fef3c7'}; padding: 15px; border-radius: 6px; border-left: 4px solid ${statusColor};">
            <p style="margin: 0; color: ${isFullyPaid ? '#065f46' : '#92400e'}; font-weight: 500;">
              ${isFullyPaid ? '✅' : '⚠️'} Votre facture est maintenant <strong>${statusText}</strong>
              ${!isFullyPaid ? `<br>Reste à payer : <strong>${(totalAmount - paymentAmount).toLocaleString()}€</strong>` : ''}
            </p>
          </div>
        </div>
        
        <div style="background: #e8f4fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #2c5aa0; margin-top: 0;">📋 Prochaines étapes :</h3>
          <ul style="color: #374151;">
            <li>Votre facture a été mise à jour dans votre espace personnel</li>
            <li>Vous pouvez télécharger votre facture depuis votre tableau de bord</li>
            ${isFullyPaid ? '<li>Votre formation peut maintenant commencer selon le planning prévu</li>' : '<li>Vous pouvez effectuer le solde restant quand vous le souhaitez</li>'}
            <li>Pour toute question, contactez-nous à <a href="mailto:${process.env.SMTP_FROM_EMAIL}">${process.env.SMTP_FROM_EMAIL}</a></li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/invoice" 
             style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">
            📊 Voir mes factures
          </a>
        </div>
        
        <p style="color: #6b7280; font-size: 14px; margin-top: 25px;">
          Cet email fait office de reçu de paiement. Conservez-le précieusement.
        </p>
        
        <p>Cordialement,<br>
        <strong>L'équipe CI.DES</strong></p>
      </div>
      
      <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
        <p>CI.DES - Centre de Formation Cordiste IRATA<br>
        17270 BORESSE-ET-MARTRON<br>
        Tél: +33 6 24 67 13 65 | Email: ${process.env.SMTP_FROM_EMAIL}</p>
      </div>
    </div>
  `;

  return sendEmail({ to: userEmail, subject, html });
} 