import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Récupérer le document
    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        user: true,
        devis: {
          include: {
            demande: {
              include: {
                user: true
              }
            }
          }
        }
      }
    });

    if (!document) {
      return NextResponse.json(
        { message: 'Document non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier les permissions
    const isAdmin = session.user.role === 'ADMIN';
    const isOwner = document.userId === session.user.id;
    const isDevisOwner = document.devis?.demande?.user?.id === session.user.id;
    const isPublic = document.public;

    if (!isAdmin && !isOwner && !isDevisOwner && !isPublic) {
      return NextResponse.json(
        { message: 'Accès refusé' },
        { status: 403 }
      );
    }

    // Approche simple : rediriger vers l'URL Cloudinary en supprimant la signature problématique
    let cleanUrl = document.url;
    
    // Supprimer la signature automatique qui cause l'erreur 401
    if (cleanUrl.includes('?_a=')) {
      cleanUrl = cleanUrl.split('?_a=')[0];
    }
    
    // Pour les URLs image, s'assurer qu'elles sont publiques
    if (cleanUrl.includes('/image/upload/')) {
      // Remplacer par une URL publique sans signature
      cleanUrl = cleanUrl.replace('/image/upload/', '/image/upload/fl_attachment/');
    }
    
    console.log('URL originale:', document.url);
    console.log('URL nettoyée:', cleanUrl);
    
    try {
      // Essayer de récupérer le fichier avec l'URL nettoyée
      const response = await fetch(cleanUrl);
      
      if (response.ok) {
        const buffer = await response.arrayBuffer();
        
        return new NextResponse(buffer, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `inline; filename="${document.nom}.pdf"`,
            'Cache-Control': 'public, max-age=3600',
            'Content-Length': buffer.byteLength.toString(),
          },
        });
      } else {
        console.log(`URL nettoyée échouée: ${response.status}`);
        
        // Essayer l'URL originale
        const originalResponse = await fetch(document.url);
        
        if (originalResponse.ok) {
          const buffer = await originalResponse.arrayBuffer();
          
          return new NextResponse(buffer, {
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': `inline; filename="${document.nom}.pdf"`,
              'Cache-Control': 'public, max-age=3600',
              'Content-Length': buffer.byteLength.toString(),
            },
          });
        } else {
          throw new Error(`Toutes les URLs ont échoué: clean=${response.status}, original=${originalResponse.status}`);
        }
      }
    } catch (fetchError) {
      console.error('Erreur lors de la récupération:', fetchError);
      
      return NextResponse.json(
        {
          message: 'Document temporairement inaccessible',
          error: fetchError instanceof Error ? fetchError.message : 'Erreur de réseau',
          urls: {
            original: document.url,
            cleaned: cleanUrl
          },
          suggestion: 'Veuillez réessayer plus tard ou contacter l\'administrateur'
        },
        { status: 503 }
      );
    }

  } catch (error) {
    console.error('Erreur générale:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération du document' },
      { status: 500 }
    );
  }
} 