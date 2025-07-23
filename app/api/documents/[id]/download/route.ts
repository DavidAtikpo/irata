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
       // Méthode directe : Utiliser l'API Admin pour télécharger le contenu
       let resourceContent;
       let resourceInfo;

       try {
         // Essayer d'abord avec resource_type: 'image' (nouveaux documents)
         resourceInfo = await cloudinary.api.resource(document.cloudinaryId.replace('.pdf', ''), {
           resource_type: 'image',
           type: 'upload'
         });

         // Utiliser l'uploader.explicit pour obtenir le contenu brut
         const explicitResult = await cloudinary.uploader.explicit(resourceInfo.public_id, {
           resource_type: 'image',
           type: 'upload',
           eager: [
             { format: 'pdf', flags: 'attachment' }
           ]
         });

         console.log('Explicit result:', explicitResult);

         // Utiliser l'URL de la transformation eager
         if (explicitResult.eager && explicitResult.eager.length > 0) {
           const eagerUrl = explicitResult.eager[0].secure_url;
           console.log('Eager URL:', eagerUrl);
           
           const response = await fetch(eagerUrl);
           if (response.ok) {
             resourceContent = await response.arrayBuffer();
           } else {
             throw new Error(`Eager URL failed: ${response.status}`);
           }
         } else {
           throw new Error('No eager transformation available');
         }

       } catch (imageError) {
         console.log('Erreur avec image, essai avec raw...', imageError);
         
         // Fallback : Essayer avec resource_type: 'raw' (anciens documents)
         try {
           resourceInfo = await cloudinary.api.resource(document.cloudinaryId, {
             resource_type: 'raw',
             type: 'upload'
           });

           console.log('Resource trouvée (raw):', resourceInfo);

           // Pour les fichiers raw, utiliser l'URL directe mais avec fetch en passant les headers d'auth
           const authHeaders = {
             'Authorization': `Basic ${Buffer.from(`${process.env.CLOUDINARY_API_KEY}:${process.env.CLOUDINARY_API_SECRET}`).toString('base64')}`
           };

           const response = await fetch(resourceInfo.secure_url, {
             headers: authHeaders
           });

           if (response.ok) {
             resourceContent = await response.arrayBuffer();
           } else {
             console.log('Erreur avec auth headers, essai URL simple...');
             
             // Dernière tentative : URL directe sans auth
             const simpleResponse = await fetch(resourceInfo.secure_url);
             if (simpleResponse.ok) {
               resourceContent = await simpleResponse.arrayBuffer();
             } else {
               throw new Error(`Raw URL failed: ${simpleResponse.status}`);
             }
           }

         } catch (rawError) {
           console.error('Erreur avec raw aussi:', rawError);
           throw new Error(`Impossible d'accéder au fichier: ${rawError}`);
         }
       }

       if (!resourceContent) {
         throw new Error('Aucun contenu récupéré');
       }

       return new NextResponse(resourceContent, {
         headers: {
           'Content-Type': 'application/pdf',
           'Content-Disposition': `attachment; filename="${document.nom}.pdf"`,
           'Content-Length': resourceContent.byteLength.toString(),
           'Cache-Control': 'private, max-age=0',
         },
       });

     } catch (cloudinaryError: any) {
       console.error('Erreur complète Cloudinary:', cloudinaryError);
       
       return NextResponse.json(
         { 
           message: 'Impossible de récupérer le document',
           error: cloudinaryError.message || 'Erreur inconnue',
           cloudinaryId: document.cloudinaryId,
           url: document.url,
           debug: 'Toutes les méthodes d\'accès Cloudinary ont échoué'
         },
         { status: 500 }
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