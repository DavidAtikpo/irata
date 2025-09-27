import { NextRequest, NextResponse } from "next/server"
import { prisma } from "../../../../lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { name: "asc" },
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error("Erreur GET /api/client/categories:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}