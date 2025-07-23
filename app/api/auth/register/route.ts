import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '../../../../lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { step, email, nom, prenom, password } = body;

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
      const user = await prisma.user.create({
        data: {
          nom,
          prenom,
          email,
          password: hashedPassword,
        },
      });

      const { password: _, ...userWithoutPassword } = user;
      return NextResponse.json({ user: userWithoutPassword }, { status: 201 });
    }

    return NextResponse.json({ message: 'Étape non valide' }, { status: 400 });

  } catch (error) {
    console.error("Erreur lors de l'inscription:", error);
    return NextResponse.json({ message: 'Erreur serveur interne' }, { status: 500 });
  }
} 