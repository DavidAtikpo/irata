import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

// Configuration unique du transporteur SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
});

export async function sendEmail({ to, subject, html, attachments }: EmailOptions) {
  console.log('Configuration SMTP:', {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    user: process.env.SMTP_USER,
    fromName: process.env.SMTP_FROM,
    fromEmail: process.env.SMTP_FROM_EMAIL
  });

  if (!process.env.SMTP_PASS) {
    console.error('SMTP_PASS non défini dans les variables d\'environnement');
    throw new Error('Configuration SMTP incomplète');
  }

  console.log('Tentative d\'envoi d\'email à:', to);
  console.log('Sujet:', subject);

  try {
    const mailOptions: any = {
      from: `"${process.env.SMTP_FROM || 'IRATA'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    };

    if (attachments && attachments.length > 0) {
      mailOptions.attachments = attachments;
    }

    const info = await transporter.sendMail(mailOptions);
    console.log('Email envoyé avec succès:', info.messageId);
    return info;
  } catch (error: any) {
    console.error('Erreur détaillée lors de l\'envoi d\'email:', {
      error: error.message,
      code: error.code,
      command: error.command,
      stack: error.stack
    });
    throw error;
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

  try {
    await transporter.sendMail({
      from: `"${process.env.SMTP_FROM || 'IRATA'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    console.log('Email envoyé avec succès à:', to);
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    throw error;
  }
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

  try {
    await sendEmail({
      to,
      subject,
      html,
    });
    console.log(`Notification de formulaire envoyée avec succès à: ${to}`);
  } catch (error) {
    console.error(`Erreur lors de l'envoi de la notification à ${to}:`, error);
    throw error;
  }
} 