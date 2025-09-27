import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "ID utilisateur requis" }, { status: 400 })
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            images: true,
            stock: true,
            status: true,
          },
        },
      },
    })

    const total = cartItems.reduce((sum, item) => {
      return sum + item.product?.price * item.quantity
    }, 0)

    return NextResponse.json({
      items: cartItems,
      total,
      itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0),
    })
  } catch (error) {
    console.error("Error fetching cart:", error)
    return NextResponse.json({ error: "Erreur lors de la récupération du panier" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, productId, quantity } = body

    // Vérifier si le produit existe et est disponible
    const product = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!product || !product.status) {
      return NextResponse.json({ error: "Produit non disponible" }, { status: 404 })
    }

    if (product.stock < quantity) {
      return NextResponse.json({ error: "Stock insuffisant" }, { status: 400 })
    }

    // Vérifier si l'article existe déjà dans le panier
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    })

    let cartItem

    if (existingItem) {
      // Mettre à jour la quantité
      cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
        include: {
          product: {
            select: {
              name: true,
              price: true,
              images: true,
            },
          },
        },
      })
    } else {
      // Créer un nouvel article
      cartItem = await prisma.cartItem.create({
        data: {
          userId,
          productId,
          quantity,
        },
        include: {
          product: {
            select: {
              name: true,
              price: true,
              images: true,
            },
          },
        },
      })
    }

    return NextResponse.json(cartItem, { status: 201 })
  } catch (error) {
    console.error("Error adding to cart:", error)
    return NextResponse.json({ error: "Erreur lors de l'ajout au panier" }, { status: 500 })
  }
}
