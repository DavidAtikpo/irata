import { NextRequest, NextResponse } from "next/server"
import { prisma } from "../../../../lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const category = searchParams.get("category") || ""

    const skip = (page - 1) * limit

    const whereConditions: any = {}
    if (search) {
      whereConditions.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ]
    }
    if (category && category !== "all") {
      whereConditions.category = {
        slug: category
      }
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
          brand: true,
          sku: true,
          weight: true,
          dimensions: true,
          tags: true,
          views: true,
          standards: true,
          ceMarking: true,
          serialNumber: true,
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
    console.error("Erreur GET /api/client/products:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}