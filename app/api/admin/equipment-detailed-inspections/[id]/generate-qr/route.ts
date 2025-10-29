import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Fonction pour générer un code QR unique pour une inspection
function generateInspectionQRCode(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `INS-${timestamp}-${random}`.toUpperCase();
}

// Route pour générer ou mettre à jour le QR code d'une inspection
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const resolvedParams = await params;
    const inspectionId = resolvedParams.id;

    // Vérifier que l'inspection existe
    const existingInspection = await prisma.equipmentDetailedInspection.findUnique({
      where: { id: inspectionId },
    });

    if (!existingInspection) {
      return NextResponse.json(
        { error: 'Inspection non trouvée' },
        { status: 404 }
      );
    }

    // Vérifier si le QR code existant est valide (code unique) ou une URL Cloudinary
    // Si c'est une URL Cloudinary, on le régénère
    let qrCode = existingInspection.qrCode;
    const isCloudinaryUrl = qrCode && (qrCode.includes('cloudinary.com') || qrCode.startsWith('http'));
    
    if (!qrCode || isCloudinaryUrl) {
      qrCode = generateInspectionQRCode();
      
      // Vérifier l'unicité du QR code
      let isUnique = false;
      let attempts = 0;
      while (!isUnique && attempts < 10) {
        const existing = await prisma.equipmentDetailedInspection.findFirst({
          where: { qrCode: qrCode },
        });
        
        if (!existing) {
          isUnique = true;
        } else {
          qrCode = generateInspectionQRCode();
          attempts++;
        }
      }

      if (!isUnique) {
        return NextResponse.json(
          { error: 'Impossible de générer un QR code unique' },
          { status: 500 }
        );
      }
    }

    // Construire l'URL publique
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXTAUTH_URL || 'https://www.a-finpart.com';
    const publicUrl = `${baseUrl}/inspection/${qrCode}`;

    // Mettre à jour l'inspection avec le QR code
    const updatedInspection = await prisma.equipmentDetailedInspection.update({
      where: { id: inspectionId },
      data: { qrCode: qrCode },
      include: {
        createdBy: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      qrCode: qrCode,
      publicUrl: publicUrl,
      qrCodeImageUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(publicUrl)}`,
      inspection: updatedInspection,
    });

  } catch (error) {
    console.error('Erreur lors de la génération du QR code:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la génération du QR code' },
      { status: 500 }
    );
  }
}

