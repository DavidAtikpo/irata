import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
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

export async function sendEmail({ to, subject, html }: EmailOptions) {
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
    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM || 'IRATA'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
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