import { NextRequest, NextResponse } from "next/server"
import { prisma } from "../../../../../lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const product = await prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        images: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        stock: true,
        brand: true,
        sku: true,
        weight: true,
        dimensions: true,
        tags: true,
        views: true,
        standards: true,
        ceMarking: true,
        serialNumber: true,
        technicalNotice: true,
        conformityCertificate: true,
        controlCertificate: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!product) {
      return NextResponse.json({ error: "Produit non trouvé" }, { status: 404 })
    }

    // Incrémenter les vues
    await prisma.product.update({
      where: { id },
      data: { views: { increment: 1 } }
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error("Erreur GET /api/client/products/[id]:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}