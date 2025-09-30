import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const order = await prisma.orders.findUnique({
      where: { id },
      include: {
        User: {
          select: {
            nom: true,
            prenom: true,
            email: true,
          },
        },
        order_items: {
          include: {
            products: true,
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json({ error: "Commande non trouvée" }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error("Error fetching order:", error)
    return NextResponse.json({ error: "Erreur lors de la récupération de la commande" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status, trackingNumber } = body

    const order = await prisma.orders.update({
      where: { id },
      data: {
        status,
        trackingNumber,
        updatedAt: new Date(),
      },
      include: {
        User: {
          select: {
            nom: true,
            prenom: true,
            email: true,
          },
        },
        order_items: {
          include: {
            products  : true,
          },
        },
      },
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error("Error updating order:", error)
    return NextResponse.json({ error: "Erreur lors de la mise à jour de la commande" }, { status: 500 })
  }
}
