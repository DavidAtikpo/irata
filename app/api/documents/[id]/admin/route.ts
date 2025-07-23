import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import cloudinary from '@/lib/cloudinary';

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

    try {
      console.log('=== TENTATIVE ADMIN API ===');
      console.log('Cloudinary ID:', document.cloudinaryId);

      // Méthode 1: Utiliser l'URL direct du document
      try {
        // Utiliser l'URL direct du document stocké
        const archiveUrl = document.url;

        console.log('Document URL:', archiveUrl);

        // Télécharger l'archive (qui sera un ZIP contenant le PDF)
        const archiveResponse = await fetch(archiveUrl);
        
        if (archiveResponse.ok) {
          console.log('Archive téléchargée avec succès');
          
          // Pour un seul fichier, l'archive peut être directement le fichier ou un ZIP
          const contentType = archiveResponse.headers.get('content-type');
          console.log('Content-Type de l\'archive:', contentType);
          
          if (contentType && contentType.includes('application/pdf')) {
            // C'est directement le PDF
            const buffer = await archiveResponse.arrayBuffer();
            
            return new NextResponse(buffer, {
              headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `inline; filename="${document.nom}.pdf"`,
                'Cache-Control': 'private, max-age=0',
                'Content-Length': buffer.byteLength.toString(),
              },
            });
          } else {
            // C'est probablement un ZIP, nous devons l'extraire
            const buffer = await archiveResponse.arrayBuffer();
            console.log('Taille de l\'archive:', buffer.byteLength);
            
            // Pour l'instant, on retourne l'archive telle quelle
            // Dans un cas réel, il faudrait extraire le PDF du ZIP
            return new NextResponse(buffer, {
              headers: {
                'Content-Type': 'application/zip',
                'Content-Disposition': `attachment; filename="${document.nom}.zip"`,
                'Cache-Control': 'private, max-age=0',
                'Content-Length': buffer.byteLength.toString(),
              },
            });
          }
        } else {
          throw new Error(`Archive failed: ${archiveResponse.status}`);
        }

      } catch (archiveError) {
        console.log('Archive method failed:', archiveError);

        // Méthode 2: Utiliser l'API Admin pour récupérer les métadonnées et construire une URL privée
        try {
          const resourceInfo = await cloudinary.api.resource(document.cloudinaryId, {
            resource_type: 'image',
            type: 'upload'
          });

          console.log('Resource info:', resourceInfo);

          // Utiliser les métadonnées pour construire une URL d'accès direct
          const directUrl = `https://${process.env.CLOUDINARY_API_KEY}:${process.env.CLOUDINARY_API_SECRET}@res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${document.cloudinaryId}.pdf`;
          
          console.log('URL d\'accès direct construite');

          const directResponse = await fetch(directUrl);
          
          if (directResponse.ok) {
            console.log('Accès direct réussi');
            const buffer = await directResponse.arrayBuffer();
            
            return new NextResponse(buffer, {
              headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `inline; filename="${document.nom}.pdf"`,
                'Cache-Control': 'private, max-age=0',
                'Content-Length': buffer.byteLength.toString(),
              },
            });
          } else {
            throw new Error(`Direct access failed: ${directResponse.status}`);
          }

        } catch (directError) {
          console.log('Direct access failed:', directError);
          throw new Error(`Toutes les méthodes admin ont échoué: ${directError}`);
        }
      }

    } catch (error) {
      console.error('=== ERREUR ADMIN API ===');
      console.error('Erreur:', error);

      return NextResponse.json(
        {
          message: 'Échec de l\'accès via Admin API',
          error: error instanceof Error ? error.message : 'Erreur inconnue',
          debug: {
            method: 'admin-api',
            cloudinaryId: document.cloudinaryId,
            timestamp: new Date().toISOString(),
          }
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Erreur générale admin:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération du document' },
      { status: 500 }
    );
  }
} 