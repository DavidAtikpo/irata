import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        investments: {
          include: {
            user: {
              select: {
                nom: true,
                prenom: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    })

    if (!project) {
      return NextResponse.json({ error: "Projet non trouvé" }, { status: 404 })
    }

    const totalRaised = project.investments.reduce((sum, inv) => sum + inv.amount, 0)
    const progressPercentage = (totalRaised / project.targetAmount) * 100

    return NextResponse.json({
      ...project,
      totalRaised,
      progressPercentage: Math.min(progressPercentage, 100),
      investorCount: project.investments.length,
    })
  } catch (error) {
    console.error("Error fetching project:", error)
    return NextResponse.json({ error: "Erreur lors de la récupération du projet" }, { status: 500 })
  }
}
