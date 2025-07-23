import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { sendEmail } from '../../../../lib/email';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: 'Email is required.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // To prevent email enumeration, we still return a success-like message.
      return NextResponse.json({ message: 'If an account with that email exists, a password reset code has been sent.' }, { status: 200 });
    }

    // Generate a 6-digit code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Upsert to handle existing tokens for the same user
    await prisma.passwordResetToken.upsert({
      where: { email },
      update: {
        token: resetCode,
        expires: new Date(Date.now() + 600000), // 10 minutes from now
      },
      create: {
        email,
        token: resetCode,
        expires: new Date(Date.now() + 600000), // 10 minutes from now
      },
    });

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #333;">Votre code de réinitialisation de mot de passe</h2>
        <p>Bonjour ${user.prenom},</p>
        <p>Nous avons reçu une demande de réinitialisation de mot de passe. Utilisez le code ci-dessous pour choisir un nouveau mot de passe.</p>
        <div style="text-align: center; margin: 20px 0;">
          <p style="display: inline-block; background-color: #f0f0f0; color: #333; font-size: 24px; font-weight: bold; padding: 10px 20px; border-radius: 5px; letter-spacing: 5px;">
            ${resetCode}
          </p>
        </div>
        <p>Ce code expirera dans 10 minutes. Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet e-mail.</p>
        <hr style="border: none; border-top: 1px solid #eee;" />
        <p style="margin-top: 20px; color: #666;">Cordialement,<br>L'équipe CI.DES</p>
      </div>
    `;

    await sendEmail({
      to: email,
      subject: 'Votre code de réinitialisation de mot de passe',
      html: emailHtml,
    });

    return NextResponse.json({ message: 'If an account with that email exists, a password reset code has been sent.' }, { status: 200 });

  } catch (error) {
    console.error('Forgot Password Error:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
} 