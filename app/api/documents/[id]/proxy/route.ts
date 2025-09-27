import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from 'lib/prisma';
import cloudinary from 'lib/cloudinary';

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
    const isAdmin = session?.user?.role === 'ADMIN';
    const isOwner = document.userId === session?.user?.id;
    const isDevisOwner = document.devis?.demande?.user?.id === session?.user?.id;
    const isPublic = document.public;

    if (!isAdmin && !isOwner && !isDevisOwner && !isPublic) {
      return NextResponse.json(
        { message: 'Accès refusé' },
        { status: 403 }
      );
    }

    try {
      console.log('=== DÉBOGAGE CLOUDINARY ===');
      console.log('Document ID:', document.id);
      console.log('Cloudinary ID:', document.cloudinaryId);
      console.log('URL stockée:', document.url);

      // Méthode 1: Générer une URL signée avec authentification
      const timestamp = Math.round(Date.now() / 1000);
      const apiKey = process.env.CLOUDINARY_API_KEY;
      const apiSecret = process.env.CLOUDINARY_API_SECRET;

      if (!apiKey || !apiSecret) {
        throw new Error('Clés Cloudinary manquantes');
      }

      // Essayer différentes méthodes selon le type de ressource
      const methods = [
        {
          name: 'URL signée (raw)',
          url: cloudinary.url(document.cloudinaryId, {
            resource_type: 'raw',
            type: 'upload',
            sign_url: true,
            api_key: apiKey,
            secure: true,
            expires_at: timestamp + 3600
          })
        },
        {
          name: 'URL signée (image)',
          url: cloudinary.url(document.cloudinaryId.replace('.pdf', ''), {
            resource_type: 'image',
            type: 'upload',
            format: 'pdf',
            sign_url: true,
            api_key: apiKey,
            secure: true,
            expires_at: timestamp + 3600
          })
        },
        {
          name: 'URL directe sans signature',
          url: document.url.split('?')[0] // Supprimer tous les paramètres
        }
      ];

      let lastError;
      for (const method of methods) {
        try {
          console.log(`Tentative: ${method.name}`);
          console.log(`URL: ${method.url}`);

          const response = await fetch(method.url, {
            method: 'GET',
            headers: {
              'User-Agent': 'irata-app/1.0',
              'Accept': 'application/pdf,*/*',
            },
            redirect: 'follow'
          });

          console.log(`Statut: ${response.status} ${response.statusText}`);
          console.log(`Headers:`, Object.fromEntries(response.headers.entries()));

          if (response.ok) {
            const contentType = response.headers.get('content-type') || 'application/pdf';
            console.log(`Succès avec ${method.name}!`);

            // Créer une réponse en streaming
            const buffer = await response.arrayBuffer();
            
            return new NextResponse(buffer, {
              headers: {
                'Content-Type': contentType,
                'Content-Disposition': `inline; filename="${document.nom}.pdf"`,
                'Cache-Control': 'private, max-age=0',
                'Content-Length': buffer.byteLength.toString(),
                'X-Method-Used': method.name,
              },
            });
          } else {
            lastError = `${method.name}: ${response.status} ${response.statusText}`;
            console.log(`Échec: ${lastError}`);
          }
        } catch (methodError) {
          lastError = `${method.name}: ${methodError}`;
          console.log(`Erreur: ${lastError}`);
        }
      }

      // Si toutes les méthodes ont échoué
      throw new Error(`Toutes les méthodes ont échoué. Dernière erreur: ${lastError}`);

    } catch (error) {
      console.error('=== ERREUR FINALE ===');
      console.error('Erreur:', error);

      // Retourner les informations de débogage
      return NextResponse.json(
        {
          message: 'Impossible d\'accéder au document',
          error: error instanceof Error ? error.message : 'Erreur inconnue',
          debug: {
            documentId: document.id,
            cloudinaryId: document.cloudinaryId,
            url: document.url,
            timestamp: new Date().toISOString(),
            hasApiKey: !!process.env.CLOUDINARY_API_KEY,
            hasApiSecret: !!process.env.CLOUDINARY_API_SECRET,
          }
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Erreur générale proxy:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération du document' },
      { status: 500 }
    );
  }
} 