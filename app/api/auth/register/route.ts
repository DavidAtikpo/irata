import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '../../../../lib/prisma';
import { sendEmail } from '../../../../lib/email';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { step, email, nom, prenom, password, session, message } = body;

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (step === 1) {
      if (existingUser) {
        return NextResponse.json({ message: 'Un compte avec cet email existe déjà.' }, { status: 409 });
      }
      // L'email est disponible, on peut passer à l'étape du mot de passe
      return NextResponse.json({ message: 'Email disponible.' }, { status: 200 });
    }

    if (step === 2) {
      if (!nom || !prenom || !email || !password) {
        return NextResponse.json({ message: 'Tous les champs sont requis pour finaliser l\'inscription.' }, { status: 400 });
      }

      if (existingUser) {
        return NextResponse.json({ message: 'Un compte avec cet email existe déjà.' }, { status: 409 });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Créer l'utilisateur et la demande en transaction
      const result = await prisma.$transaction(async (tx: any) => {
        const user = await tx.user.create({
          data: {
            nom,
            prenom,
            email,
            password: hashedPassword,
          },
        });

        // Créer la demande avec la session choisie
        const demande = await tx.demande.create({
          data: {
            userId: user.id,
            session: session || 'Session non spécifiée',
            message: message || '',
            statut: 'EN_ATTENTE',
          },
        });

        return { user, demande };
      });

      const { user } = result;

      // Envoyer l'email de bienvenue à l'utilisateur
      try {
        await sendEmail({
          to: email,
          subject: 'Bienvenue sur CI.DES formation irata - Votre compte a été créé',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
              <h2 style="color: #2563eb; margin-bottom: 20px;">Bienvenue sur C.IDES !</h2>
              <p>Bonjour ${prenom} ${nom},</p>
              <p>Votre compte a été créé avec succès sur notre plateforme IRATA.</p>
              <p>Vous pouvez maintenant vous connecter avec votre email <strong>${email}</strong> en cliquant sur le lien ci-dessous :</p>
              <div style="text-align: center; margin: 20px 0;">
                <a href="https://irata.vercel.app/login" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                  Se connecter
                </a>
              </div>
              <p>Une fois connecté, vous pourrez :</p>
              <ul style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 15px 0;">
                <li>Faire une demande de formation</li>
                <li>Consulter vos devis</li>
                <li>Suivre vos contrats</li>
                <li>Accéder à vos documents</li>
              </ul>
              <p>Si vous avez des questions, n'hésitez pas à nous contacter.</p>
              <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
                Cordialement,<br>
                L'équipe CI.DES
              </p>
            </div>
          `,
        });
        console.log('Email de bienvenue envoyé avec succès à:', email);
      } catch (emailError) {
        console.error('Erreur lors de l\'envoi de l\'email de bienvenue:', emailError);
        // On continue même si l'email échoue, l'inscription est valide
      }

      // Envoyer l'email de notification à l'admin
      try {
        await sendEmail({
          to: 'pmcides@gmail.com',
          subject: 'Nouvelle préinscription IRATA - CI.DES',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
              <h2 style="color: #dc2626; margin-bottom: 20px;">Nouvelle Préinscription IRATA</h2>
              <p><strong>Un nouvel utilisateur s'est inscrit sur la plateforme C.IDES.</strong></p>
              
              <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin: 15px 0;">
                <h3 style="color: #374151; margin-bottom: 10px;">Informations de l'utilisateur :</h3>
                <p><strong>Nom :</strong> ${prenom} ${nom}</p>
                <p><strong>Email :</strong> ${email}</p>
                <p><strong>Session choisie :</strong> ${session || 'Non spécifiée'}</p>
                <p><strong>Message :</strong> ${message || 'Aucun message'}</p>
                <p><strong>Date d'inscription :</strong> ${new Date().toLocaleString('fr-FR')}</p>
              </div>
              
              <p style="margin-top: 20px; color: #6b7280; font-size: 14px;">
                Vous pouvez consulter cette demande dans votre interface d'administration.
              </p>
              
              <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
                Cordialement,<br>
                Système de notification CI.DES
              </p>
            </div>
          `,
        });
        console.log('Email de notification admin envoyé avec succès');
      } catch (adminEmailError) {
        console.error('Erreur lors de l\'envoi de l\'email de notification admin:', adminEmailError);
        // On continue même si l'email admin échoue
      }

      const { password: _, ...userWithoutPassword } = user;
      return NextResponse.json({ user: userWithoutPassword }, { status: 201 });
    }

    return NextResponse.json({ message: 'Étape non valide' }, { status: 400 });

  } catch (error) {
    console.error("Erreur lors de l'inscription:", error);
    return NextResponse.json({ message: 'Erreur serveur interne' }, { status: 500 });
  }
} 