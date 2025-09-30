import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { randomUUID } from "crypto"

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const status = searchParams.get("status")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    const where: any = {}

    if (userId) {
      where.userId = userId
    }

    if (status && status !== "all") {
      where.status = status
    }

    const [orders, total] = await Promise.all([
      prisma.orders.findMany({
        where,
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
              products: {
                select: {
                  name: true,
                  images: true,
                },
              },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.orders.count({ where }),
    ])

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ error: "Erreur lors de la récupération des commandes" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, items, shippingAddress, paymentMethod } = body

    // Calculer le total
    let total = 0
    const orderItems: { id: string; productId: string; quantity: number; unitPrice: number; totalPrice: number }[] = []

    for (const item of items) {
      const product = await prisma.products.findUnique({
        where: { id: item.productId },
      })

      if (!product) {
        return NextResponse.json({ error: `Produit ${item.productId} non trouvé` }, { status: 404 })
      }

      if (product.stock < item.quantity) {
        return NextResponse.json({ error: `Stock insuffisant pour ${product.name}` }, { status: 400 })
      }

      const itemTotal = product.price * item.quantity
      total += itemTotal

      orderItems.push({
        id: randomUUID(),
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: product.price,
        totalPrice: itemTotal,
      })
    }

    // Créer la commande
    const order = await prisma.orders.create({
      data: {
        id: randomUUID(),
        orderNumber: `ORD-${Date.now()}`,
        User: {
          connect: { id: userId }
        },
        totalAmount: total,
        status: "PENDING",
        updatedAt: new Date(),
        shippingAddress,
        paymentMethod,
        order_items: {
          createMany: {
            data: orderItems,
          },
        },
      },
      include: {
        order_items: {
          include: {
            products: true,
          },
        },
      },
    })

    // Mettre à jour le stock des produits
    for (const item of items) {
      await prisma.products.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      })
    }

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json({ error: "Erreur lors de la création de la commande" }, { status: 500 })
  }
}
