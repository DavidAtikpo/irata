import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        orders: {
          select: {
            id: true,
            totalAmount: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        investments: {
          select: {
            id: true,
            amount: true,
            status: true,
            createdAt: true,
            project: {
              select: {
                title: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 })
    }

    // Calculer les statistiques
    const totalOrders = await prisma.order.count({
      where: { userId: id },
    })

    const totalSpent = await prisma.order.aggregate({
      where: { userId: id, status: "DELIVERED" },
      _sum: { totalAmount: true },
    })

    const totalInvestments = await prisma.investment.count({
      where: { userId: id },
    })

    const totalInvested = await prisma.investment.aggregate({
      where: { userId: id },
      _sum: { amount: true },
    })

    return NextResponse.json({
      ...user,
      stats: {
        totalOrders,
        totalSpent: totalSpent._sum.totalAmount || 0,
        totalInvestments,
        totalInvested: totalInvested._sum.amount || 0,
      },
    })
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "Erreur lors de la récupération de l'utilisateur" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { nom, prenom, email, role, isActive } = body

    const user = await prisma.user.update({
      where: { id },
      data: {
        nom,
        prenom,
        email,
        role,
        isActive,
      },
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Erreur lors de la mise à jour de l'utilisateur" }, { status: 500 })
  }
}
