import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "12")
    const skip = (page - 1) * limit

    const where: any = {}

    if (status && status !== "all") {
      where.status = status
    }

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: {
          investments: {
            select: {
              amount: true,
            },
          },
          _count: {
            select: {
              investments: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.project.count({ where }),
    ])

    const projectsWithStats = projects.map((project) => {
      const totalRaised = project.investments.reduce((sum, inv) => sum + inv.amount, 0)
      const progressPercentage = (totalRaised / project.targetAmount) * 100

      return {
        ...project,
        totalRaised,
        progressPercentage: Math.min(progressPercentage, 100),
        investorCount: project._count.investments,
      }
    })

    return NextResponse.json({
      projects: projectsWithStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching projects:", error)
    return NextResponse.json({ error: "Erreur lors de la récupération des projets" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, targetAmount, endDate, images, category } = body

    const project = await prisma.project.create({
      data: {
        title,
        description,
        targetAmount: Number.parseFloat(targetAmount),
        startDate: new Date(),
        endDate: new Date(endDate),
        images,
        category,
        status: "ACTIVE",
      },
    })

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error("Error creating project:", error)
    return NextResponse.json({ error: "Erreur lors de la création du projet" }, { status: 500 })
  }
}
