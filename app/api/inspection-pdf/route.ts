import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const pdfUrl = searchParams.get('url');

    if (!pdfUrl) {
      return NextResponse.json(
        { error: 'URL du PDF requise' },
        { status: 400 }
      );
    }

    // Récupérer le PDF depuis Cloudinary
    try {
      const response = await fetch(pdfUrl);
      if (response.ok) {
        const pdfBuffer = await response.arrayBuffer();
        return new NextResponse(pdfBuffer, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `inline; filename="document.pdf"`,
            'Cache-Control': 'public, max-age=3600',
          },
        });
      } else {
        // Si l'accès direct échoue, rediriger quand même
        return NextResponse.redirect(pdfUrl);
      }
    } catch (fetchError) {
      console.error('Erreur lors de la récupération du PDF:', fetchError);
      // En cas d'erreur, rediriger vers l'URL originale
      return NextResponse.redirect(pdfUrl);
    }

  } catch (error) {
    console.error('Erreur lors de la récupération du PDF:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

