import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { sendWelcomeEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, password, contributionData } = await request.json();

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      // Si l'utilisateur existe déjà, on peut lier la contribution à son compte existant
      return NextResponse.json({
        success: true,
        message: 'Utilisateur existant',
        user: existingUser,
        temporaryPassword: null
      });
    }

    // Hasher le mot de passe
    const hashedPassword = await hash(password, 12);

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        nom: name,
        email,
        password: hashedPassword,
        role: 'CONTRIBUTOR'
      }
    });

    // Envoyer un email de bienvenue
    try {
      await sendWelcomeEmail({
        email: user.email,
        name: user.nom || name,
        temporaryPassword: password
      });
    } catch (emailError) {
      console.error('Erreur envoi email bienvenue:', emailError);
      // Ne pas faire échouer la création du compte si l'email échoue
    }

    return NextResponse.json({
      success: true,
      message: 'Compte créé avec succès',
      user: {
        id: user.id,
        name: user.nom || name,
        email: user.email
      },
      temporaryPassword: password
    });

  } catch (error) {
    console.error('Erreur création compte:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création du compte' },
      { status: 500 }
    );
  }
}
