import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { randomUUID } from "crypto"

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const projectId = searchParams.get("projectId")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    const where: any = {}

    if (userId) {
      where.userId = userId
    }

    if (projectId) {
      where.projectId = projectId
    }

    const [investments, total] = await Promise.all([
      prisma.investments.findMany({
        where,
        include: {
          User: {
            select: {
              nom: true,
              prenom: true,
              email: true,
            },
          },
          projects: {
            select: {
              title: true,
              status: true,
              images: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.investments.count({ where }),
    ])

    return NextResponse.json({
      investments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching investments:", error)
    return NextResponse.json({ error: "Erreur lors de la récupération des investissements" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, projectId, amount } = body

    // Vérifier que le projet existe et est actif
    const project = await prisma.projects.findUnique({
      where: { id: projectId },
    })

    if (!project) {
      return NextResponse.json({ error: "Projet non trouvé" }, { status: 404 })
    }

    if (project.status !== "ACTIVE") {
      return NextResponse.json({ error: "Le projet n'est plus actif" }, { status: 400 })
    }

    if (new Date() > project.endDate) {
      return NextResponse.json({ error: "La période d'investissement est terminée" }, { status: 400 })
    }

    // Créer l'investissement
    const investment = await prisma.investments.create({
      data: {
        id: randomUUID(),
        amount: Number.parseFloat(amount),
        status: "CONFIRMED",
        updatedAt: new Date(),
        projects: { connect: { id: projectId } },
        User: { connect: { id: userId } },
      },
      include: {
        projects: {
          select: {
            title: true,
          },
        },
      },
    })

    return NextResponse.json(investment, { status: 201 })
  } catch (error) {
    console.error("Error creating investment:", error)
    return NextResponse.json({ error: "Erreur lors de la création de l'investissement" }, { status: 500 })
  }
}
