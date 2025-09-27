import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { quantity } = body

    if (quantity <= 0) {
      // Supprimer l'article si la quantité est 0 ou négative
      await prisma.cartItem.delete({
        where: { id },
      })

      return NextResponse.json({ message: "Article supprimé du panier" })
    }

    const cartItem = await prisma.cartItem.update({
      where: { id },
      data: { quantity },
      include: {
        product: {
          select: {
            name: true,
            price: true,
            images: true,
            stock: true,
          },
        },
      },
    })

    return NextResponse.json(cartItem)
  } catch (error) {
    console.error("Error updating cart item:", error)
    return NextResponse.json({ error: "Erreur lors de la mise à jour du panier" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.cartItem.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Article supprimé du panier" })
  } catch (error) {
    console.error("Error deleting cart item:", error)
    return NextResponse.json({ error: "Erreur lors de la suppression de l'article" }, { status: 500 })
  }
}
