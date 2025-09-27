import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "lib/prisma"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session || session?.user?.role !== "VENDOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get vendor info
    const vendor = await prisma.user.findUnique({
      where: { id: session?.user?.id },
    })

    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 })
    }

    const body = await request.json()
    const { trackingNumber } = body

    // Update order tracking number (only if it belongs to this vendor)
    const order = await prisma.order.updateMany({
      where: {
        id,
        userId: vendor.id,
      },
      data: {
        trackingNumber,
        status: "SHIPPED", // Automatically set to shipped when tracking number is added
      },
    })

    if (order.count === 0) {
      return NextResponse.json({ error: "Order not found or unauthorized" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating tracking number:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
