import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

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
      // Construire le chemin du fichier local
      const filePath = join(process.cwd(), 'public', 'uploads', 'documents', document.cloudinaryId);
      
      console.log('Tentative de lecture du fichier local:', filePath);

      // Vérifier que le fichier existe
      if (!existsSync(filePath)) {
        console.log('Fichier local non trouvé, tentative de redirection vers l\'URL publique');
        
        // Si le fichier n'existe pas localement, essayer de rediriger vers l'URL
        if (document.url.startsWith('/uploads/')) {
          return NextResponse.json(
            { message: 'Fichier local non trouvé' },
            { status: 404 }
          );
        }
        
        // Sinon, rediriger vers l'URL externe (Cloudinary)
        return NextResponse.redirect(document.url);
      }

      // Lire le fichier
      const fileBuffer = await readFile(filePath);
      
      console.log('Fichier local lu avec succès, taille:', fileBuffer.length);

      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `inline; filename="${document.nom}.pdf"`,
          'Cache-Control': 'private, max-age=0',
          'Content-Length': fileBuffer.length.toString(),
          'X-Storage-Type': 'local',
        },
      });

    } catch (fileError) {
      console.error('Erreur lors de la lecture du fichier local:', fileError);
      
      return NextResponse.json(
        {
          message: 'Erreur lors de l\'accès au fichier local',
          error: fileError instanceof Error ? fileError.message : 'Erreur inconnue',
          debug: {
            documentId: document.id,
            cloudinaryId: document.cloudinaryId,
            url: document.url,
            filePath: join('public', 'uploads', 'documents', document.cloudinaryId),
            timestamp: new Date().toISOString(),
          }
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