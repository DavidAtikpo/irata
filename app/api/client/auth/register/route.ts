import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, password, phone, address, city, zipCode } = body
    const normEmail = (email as string).trim().toLowerCase()

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: normEmail },
    })

    if (existingUser) {
      return NextResponse.json({ error: "Un utilisateur avec cet email existe déjà" }, { status: 409 })
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12)

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        prenom: firstName ?? null,
        nom: lastName ?? null,
        email: normEmail,
        password: hashedPassword,
        role: "CLIENT",
        isActive: true,
        phone: phone ?? null,
        address: address ?? null,
        city: city ?? null,
        zipCode: zipCode ?? null,
      },
    })

    // Créer le token JWT
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" },
    )

    // Créer la réponse avec le cookie
    const response = NextResponse.json(
      {
        user: {
          id: user.id,
          name: `${user.prenom ?? ''} ${user.nom ?? ''}`.trim(),
          email: user.email,
          role: user.role,
        },
        token,
      },
      { status: 201 },
    )

    // Définir le cookie
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 jours
    })

    return response
  } catch (error) {
    console.error("Error during registration:", error)
    return NextResponse.json({ error: "Erreur lors de l'inscription" }, { status: 500 })
  }
}
