import { NextRequest, NextResponse } from 'next/server';
import { prisma } from 'lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const qrCode = resolvedParams.id;

    const equipment = await prisma.equipment.findUnique({
      where: {
        qrCode: qrCode
      }
    });

    if (!equipment || !equipment.pdfUrl) {
      return NextResponse.json(
        { error: 'PDF non trouvé' },
        { status: 404 }
      );
    }

    // Essayer de récupérer le PDF depuis Cloudinary
    try {
      const response = await fetch(equipment.pdfUrl);
      if (response.ok) {
        const pdfBuffer = await response.arrayBuffer();
        return new NextResponse(pdfBuffer, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `inline; filename="${equipment.qrCode}.pdf"`,
            'Cache-Control': 'public, max-age=3600',
          },
        });
      } else {
        // Si l'accès direct échoue, rediriger quand même
        return NextResponse.redirect(equipment.pdfUrl);
      }
    } catch (fetchError) {
      console.error('Erreur lors de la récupération du PDF:', fetchError);
      // En cas d'erreur, rediriger vers l'URL originale
      return NextResponse.redirect(equipment.pdfUrl);
    }

  } catch (error) {
    console.error('Erreur lors de la récupération du PDF:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
