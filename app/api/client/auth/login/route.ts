import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient, Role } from "@prisma/client"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body
    const normEmail = (email as string).trim().toLowerCase()

    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { email: normEmail },
    })

    if (!user) {
      return NextResponse.json({ error: "Email ou mot de passe incorrect" }, { status: 401 })
    }

    // Vérifier si l'utilisateur est actif (champ optionnel selon le schéma)
    if ((user as any)?.isActive === false) {
      return NextResponse.json({ error: "Compte désactivé" }, { status: 401 })
    }

    // Vérifier que seuls certains rôles peuvent se connecter via cette route
    if (user.role !== Role.CLIENT) {
      return NextResponse.json({ error: "Accès réservé aux clients" }, { status: 403 })
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Email ou mot de passe incorrect" }, { status: 401 })
    }

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
    const response = NextResponse.json({
      user: {
        id: user.id,
        name: `${user.prenom ?? ''} ${user.nom ?? ''}`.trim(),
        email: user.email,
        role: user.role,
      },
      token,
    })

    // Définir le cookie
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 jours
    })

    return response
  } catch (error) {
    console.error("Error during login:", error)
    return NextResponse.json({ error: "Erreur lors de la connexion" }, { status: 500 })
  }
}
