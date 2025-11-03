import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '../../../../lib/prisma';
import { sendEmail } from '../../../../lib/email';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { step, email, nom, prenom, password, session, message, registrationType, entreprise, niveau } = body;

    const existingUser = await prisma.user.findUnique({ 
      where: { email },
      include: {
        demandes: {
          select: {
            niveau: true,
          }
        }
      }
    });

    if (step === 1) {
      if (existingUser) {
        // Vérifier si une demande avec le même niveau existe déjà
        const hasExistingNiveau = existingUser.demandes.some(
          (demande) => demande.niveau === niveau
        );

        if (hasExistingNiveau) {
          // Email + niveau déjà existant : demander de se connecter
          return NextResponse.json({ 
            message: `Vous avez déjà un compte avec ce niveau de formation. Veuillez vous connecter pour accéder à votre espace.`,
            shouldLogin: true
          }, { status: 409 });
        } else {
          // Email existe mais niveau différent : permettre de créer une nouvelle demande
          return NextResponse.json({ 
            message: 'Vous avez déjà un compte. Nous allons créer une nouvelle demande pour ce niveau.',
            userExists: true,
            skipPassword: true
          }, { status: 200 });
        }
      }
      // Envoyer un email à l'admin dès la préinscription (étape 1)
      try {
        const result = await sendEmail({
          to: 'pmcides@gmail.com , atikpododzi4@gmail.com,pm@cides.tf',
          subject: 'Nouvelle préinscription (Étape 1) - CI.DES',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
              <h2 style="color: #dc2626; margin-bottom: 20px;">Préinscription reçue (Étape 1)</h2>
              <p><strong>Un utilisateur a soumis le formulaire de préinscription.</strong></p>
              <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin: 15px 0;">
                <h3 style="color: #374151; margin-bottom: 10px;">Informations soumises :</h3>
                <p><strong>Nom :</strong> ${prenom || ''} ${nom || ''}</p>
                <p><strong>Email :</strong> ${email || ''}</p>
                <p><strong>Type d'inscription :</strong> ${(registrationType === 'entreprise') ? 'Entreprise' : 'Personnel'}</p>
                ${registrationType === 'entreprise' && entreprise ? `<p><strong>Entreprise :</strong> ${entreprise}</p>` : ''}
                <p><strong>Niveau :</strong> Niveau ${niveau || '1'}</p>
                <p><strong>Session choisie :</strong> ${session || 'Non spécifiée'}</p>
                <p><strong>Message :</strong> ${message || 'Aucun message'}</p>
                <p><strong>Date de soumission :</strong> ${new Date().toLocaleString('fr-FR')}</p>
              </div>
              <p style="margin-top: 20px; color: #6b7280; font-size: 14px;">
                Cet email est envoyé à l'étape 1 pour permettre un suivi même si l'utilisateur n'achève pas la création du mot de passe.
              </p>
            </div>
          `,
          replyTo: email,
        })
        if (!(result as any)?.success) {
          console.error('Echec envoi email admin étape 1:', (result as any)?.error)
        }
      } catch (adminEmailStep1Error) {
        console.error("Erreur lors de l'envoi de l'email admin (étape 1):", adminEmailStep1Error)
        // On ne bloque pas le flux, on informe simplement côté API
      }
      // L'email est disponible, on peut passer à l'étape du mot de passe
      return NextResponse.json({ message: 'Email disponible.' }, { status: 200 });
    }

    if (step === 2) {
      if (!nom || !prenom || !email) {
        return NextResponse.json({ message: 'Les champs nom, prénom et email sont requis.' }, { status: 400 });
      }

      let user;
      
      if (existingUser) {
        // L'utilisateur existe déjà, vérifier qu'il n'a pas déjà ce niveau
        const hasExistingNiveau = existingUser.demandes.some(
          (demande) => demande.niveau === niveau
        );

        if (hasExistingNiveau) {
          return NextResponse.json({ 
            message: 'Vous avez déjà une demande pour ce niveau. Veuillez vous connecter.' 
          }, { status: 409 });
        }

        // Créer seulement une nouvelle demande pour ce nouveau niveau
        const demande = await prisma.demande.create({
          data: {
            userId: existingUser.id,
            session: session || 'Session non spécifiée',
            message: message || '',
            statut: 'EN_ATTENTE',
            typeInscription: registrationType || 'personnel',
            entreprise: entreprise || null,
            niveau: niveau || '1',
          },
        });

        user = existingUser;

        // Envoyer un email à l'utilisateur pour l'informer de la nouvelle demande
        try {
          await sendEmail({
            to: email,
            subject: 'Nouvelle demande de formation - CI.DES',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
                <h2 style="color: #2563eb; margin-bottom: 20px;">Nouvelle demande enregistrée</h2>
                <p>Bonjour ${prenom} ${nom},</p>
                <p>Votre demande de formation pour le <strong>Niveau ${niveau}</strong> a été enregistrée avec succès.</p>
                <p>Vous pouvez suivre l'évolution de votre demande en vous connectant avec vos identifiants habituels :</p>
                <div style="text-align: center; margin: 20px 0;">
                  <a href="https://www.a-finpart.com/login" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                    Se connecter
                  </a>
                </div>
                <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
                  Cordialement,<br>
                  L'équipe CI.DES
                </p>
              </div>
            `,
          });
        } catch (emailError) {
          console.error('Erreur lors de l\'envoi de l\'email:', emailError);
        }

      } else {
        // Nouvel utilisateur, créer le compte et la demande
        if (!password) {
          return NextResponse.json({ message: 'Le mot de passe est requis.' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Créer l'utilisateur et la demande en transaction
        const result = await prisma.$transaction(async (tx: any) => {
          const newUser = await tx.user.create({
            data: {
              nom,
              prenom,
              email,
              password: hashedPassword,
              niveau: niveau || '1',
            },
          });

          // Créer la demande avec la session choisie
          const demande = await tx.demande.create({
            data: {
              userId: newUser.id,
              session: session || 'Session non spécifiée',
              message: message || '',
              statut: 'EN_ATTENTE',
              typeInscription: registrationType || 'personnel',
              entreprise: entreprise || null,
              niveau: niveau || '1',
            },
          });

          return { user: newUser, demande };
        });

        user = result.user;
      }

      const userForResponse = user;

      // Envoyer l'email de bienvenue seulement si c'est un nouvel utilisateur
      if (!existingUser) {
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
                  <a href="https://www.a-finpart.com/login" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
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
      }

      // Envoyer l'email de notification à l'admin
      try {
        await sendEmail({
          to: 'pmcides@gmail.com,atikpododzi4@gmail.com,pm@cides.tf',
          subject: existingUser ? 'Nouvelle demande de niveau - CI.DES' : 'Nouvelle préinscription IRATA - CI.DES',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
              <h2 style="color: #dc2626; margin-bottom: 20px;">${existingUser ? 'Nouvelle demande de niveau' : 'Nouvelle Préinscription IRATA'}</h2>
              <p><strong>${existingUser ? 'Un utilisateur existant a fait une nouvelle demande pour un niveau différent.' : 'Un nouvel utilisateur s\'est inscrit sur la plateforme C.IDES.'}</strong></p>
              
              <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin: 15px 0;">
                <h3 style="color: #374151; margin-bottom: 10px;">Informations de l'utilisateur :</h3>
                <p><strong>Nom :</strong> ${prenom} ${nom}</p>
                <p><strong>Email :</strong> ${email}</p>
                <p><strong>Type d'inscription :</strong> ${registrationType === 'entreprise' ? 'Entreprise' : 'Personnel'}</p>
                ${registrationType === 'entreprise' && entreprise ? `<p><strong>Entreprise :</strong> ${entreprise}</p>` : ''}
                <p><strong>Niveau :</strong> Niveau ${niveau || '1'}</p>
                <p><strong>Session choisie :</strong> ${session || 'Non spécifiée'}</p>
                <p><strong>Message :</strong> ${message || 'Aucun message'}</p>
                <p><strong>Date d'inscription :</strong> ${new Date().toLocaleString('fr-FR')}</p>
                ${existingUser ? '<p style="color: #d97706; font-weight: bold;">⚠️ Cet utilisateur a déjà un compte actif</p>' : ''}
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

      const { password: _, ...userWithoutPassword } = userForResponse;
      return NextResponse.json({ user: userWithoutPassword }, { status: 201 });
    }

    return NextResponse.json({ message: 'Étape non valide' }, { status: 400 });

  } catch (error) {
    console.error("Erreur lors de l'inscription:", error);
    return NextResponse.json({ message: 'Erreur serveur interne' }, { status: 500 });
  }
} 