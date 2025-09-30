import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../../lib/auth"
import { prisma } from "../../../../lib/prisma"
import { randomUUID } from "crypto"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""

    const skip = (page - 1) * limit

    const whereConditions: any = {}
    if (search) {
      whereConditions.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ]
    }

    const [products, totalCount] = await Promise.all([
      prisma.products.findMany({
        where: whereConditions,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          images: true,
          categories: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          },
          stock: true,
          reviews: true,
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
      }),
      prisma.products.count({ where: whereConditions }),
    ])

    return NextResponse.json({
      products,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNext: skip + limit < totalCount,
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.error("Erreur GET /api/vendor/products:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
    }

    const body = await request.json()
    const { 
      name, 
      description, 
      price, 
      image,
      images = [],
      categoryId,
      inStock,
      brand,
      sku,
      weight,
      dimensions,
      quantity = 0,
      standards,
      ceMarking,
      serialNumber,
      technicalNotice,
      conformityCertificate,
      controlCertificate
    } = body

    if (!categoryId || typeof categoryId !== 'string' || !categoryId.trim()) {
      return NextResponse.json({ error: "categoryId est requis" }, { status: 400 })
    }

    // Combine single image with images array
    const allImages = []
    if (image && image.trim()) {
      allImages.push(image.trim())
    }
    if (Array.isArray(images)) {
      allImages.push(...images.filter(img => img && img.trim()))
    }

    const product = await prisma.products.create({
      data: {
        id: randomUUID(),
        updatedAt: new Date(),
        name,
        description,
        price,
        images: allImages, // All images
        categories: {
          connect: { id: categoryId }
        },
        stock: typeof inStock === 'boolean' ? (inStock ? 1 : 0) : (quantity ? Number.parseInt(quantity.toString()) : 0),
        brand: brand || null,
        sku: sku || null,
        weight: weight ? Number.parseFloat(weight.toString()) : null,
        dimensions: dimensions || null,
        standards: standards || null,
        ceMarking: ceMarking || false,
        serialNumber: serialNumber || null,
        technicalNotice: technicalNotice || null,
        conformityCertificate: conformityCertificate || null,
        controlCertificate: controlCertificate || null,
      },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error("Erreur POST /api/vendor/products:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
