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
      console.log('Tentative de récupération pour:', document.cloudinaryId);
      
      // Méthode 1: URL signée directe avec expiration
      const signedUrl = cloudinary.url(document.cloudinaryId, {
        resource_type: 'raw',
        type: 'upload',
        sign_url: true,
        secure: true,
        expires_at: Math.floor(Date.now() / 1000) + 3600 // 1 heure
      });

      console.log('URL signée générée:', signedUrl);

      // Essayer de récupérer le fichier avec l'URL signée
      const response = await fetch(signedUrl);
      
      if (response.ok) {
        const buffer = await response.arrayBuffer();
        
        return new NextResponse(buffer, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `inline; filename="${document.nom}.pdf"`,
            'Cache-Control': 'private, max-age=0',
            'Content-Length': buffer.byteLength.toString(),
          },
        });
      } else {
        throw new Error(`Signed URL response: ${response.status} ${response.statusText}`);
      }

    } catch (signedError) {
      console.error('Erreur avec URL signée:', signedError);
      
      try {
        // Fallback: Utiliser l'API transformation pour forcer le téléchargement
        const transformUrl = cloudinary.url(document.cloudinaryId, {
          resource_type: 'raw',
          type: 'upload',
          sign_url: true,
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          transformation: [
            { flags: 'attachment' }
          ]
        });

        console.log('Transform URL générée:', transformUrl);
        
        const response = await fetch(transformUrl);
        
        if (response.ok) {
          // Streamer la réponse
          const buffer = await response.arrayBuffer();
          
          return new NextResponse(buffer, {
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': `attachment; filename="${document.nom}.pdf"`,
              'Cache-Control': 'private, no-cache',
              'Content-Length': buffer.byteLength.toString(),
            },
          });
        } else {
          throw new Error(`Transform response: ${response.status}`);
        }

      } catch (transformError) {
        console.error('Erreur avec transform:', transformError);
        
        // Dernière tentative: URL basique signée
        try {
          const basicUrl = cloudinary.url(document.cloudinaryId, {
            resource_type: 'raw',
            type: 'upload',
            sign_url: true,
            secure: true
          });

          return NextResponse.redirect(basicUrl);

        } catch (basicError) {
          console.error('Erreur avec URL basique:', basicError);
          
          return NextResponse.json(
            { 
              message: 'Impossible d\'accéder au document',
              error: 'Toutes les méthodes d\'accès ont échoué',
              cloudinaryId: document.cloudinaryId,
                             debug: {
                 signedError: signedError instanceof Error ? signedError.message : 'Erreur URL signée',
                 transformError: transformError instanceof Error ? transformError.message : 'Erreur transform',
                 basicError: basicError instanceof Error ? basicError.message : 'Erreur basique'
               }
            },
            { status: 500 }
          );
        }
      }
    }

  } catch (error) {
    console.error('Erreur générale stream:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération du document' },
      { status: 500 }
    );
  }
} 