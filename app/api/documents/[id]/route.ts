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
      // Méthode 1: Utiliser l'API Admin de Cloudinary pour récupérer les métadonnées
      let resourceInfo;
      let downloadUrl;
      
      try {
        // Essayer d'abord avec resource_type: 'raw'
        resourceInfo = await cloudinary.api.resource(document.cloudinaryId, {
          resource_type: 'raw',
          type: 'upload'
        });
        
        downloadUrl = cloudinary.url(document.cloudinaryId, {
          resource_type: 'raw',
          type: 'upload',
          sign_url: true,
          secure: true
        });
        
        console.log('Resource trouvée (raw):', resourceInfo.public_id);
        console.log('URL signée générée:', downloadUrl);
        
      } catch (rawError) {
        console.log('Pas trouvé en raw, essai en image...');
        
        // Si pas trouvé en raw, essayer en image
        const cloudinaryIdWithoutExtension = document.cloudinaryId.replace('.pdf', '');
        
        resourceInfo = await cloudinary.api.resource(cloudinaryIdWithoutExtension, {
          resource_type: 'image',
          type: 'upload'
        });
        
        downloadUrl = cloudinary.url(cloudinaryIdWithoutExtension, {
          resource_type: 'image',
          type: 'upload',
          format: 'pdf',
          sign_url: true,
          secure: true
        });
        
        console.log('Resource trouvée (image):', resourceInfo.public_id);
        console.log('URL signée générée:', downloadUrl);
      }
      
      // Récupérer le fichier avec l'URL signée
      const response = await fetch(downloadUrl);
      
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
        throw new Error(`Cloudinary signed URL response: ${response.status} ${response.statusText}`);
      }
      
    } catch (error) {
      console.error('Erreur complète lors de la récupération:', error);
      
      // Fallback: Retourner une erreur informative
      return NextResponse.json(
        { 
          message: 'Document temporairement inaccessible',
          error: error instanceof Error ? error.message : 'Erreur inconnue',
          cloudinaryId: document.cloudinaryId,
          suggestions: [
            'Veuillez réessayer dans quelques minutes',
            'Contactez l\'administrateur si le problème persiste'
          ]
        },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('Erreur lors de la récupération du document:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération du document' },
      { status: 500 }
    );
  }
} 