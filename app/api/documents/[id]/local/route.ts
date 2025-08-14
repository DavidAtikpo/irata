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
        
        // Si le fichier n'existe pas localement
        if (document.url.startsWith('/uploads/')) {
          return NextResponse.json(
            { message: 'Fichier local non trouvé' },
            { status: 404 }
          );
        }
        
        // Si c'est une URL Cloudinary, essayer de la servir directement
        if (document.url.includes('cloudinary.com')) {
          console.log('Tentative d\'accès à Cloudinary:', document.url);
          
          try {
            const cloudinaryResponse = await fetch(document.url);
            if (cloudinaryResponse.ok) {
              const pdfBuffer = await cloudinaryResponse.arrayBuffer();
              return new NextResponse(pdfBuffer, {
                headers: {
                  'Content-Type': 'application/pdf',
                  'Content-Disposition': `inline; filename="${document.nom}.pdf"`,
                  'Cache-Control': 'private, max-age=0',
                  'Content-Length': pdfBuffer.byteLength.toString(),
                  'X-Storage-Type': 'cloudinary',
                },
              });
            } else {
              throw new Error(`Cloudinary returned ${cloudinaryResponse.status}`);
            }
          } catch (cloudinaryError) {
            console.error('Erreur Cloudinary:', cloudinaryError);
            return NextResponse.json(
              { 
                message: 'Erreur d\'accès à Cloudinary - service temporairement indisponible',
                error: cloudinaryError instanceof Error ? cloudinaryError.message : 'Erreur inconnue'
              },
              { status: 503 }
            );
          }
        }
        
        // Fallback : redirection vers l'URL
        return NextResponse.redirect(document.url);
      }

      // Lire le fichier
      const fileBuffer = await readFile(filePath);
      
      console.log('Fichier local lu avec succès:', {
        path: filePath,
        size: fileBuffer.length,
        documentName: document.nom,
        cloudinaryId: document.cloudinaryId
      });

      // Vérifier que c'est bien un PDF (magic number)
      const isPdf = fileBuffer.length >= 4 && 
                   fileBuffer[0] === 0x25 && // %
                   fileBuffer[1] === 0x50 && // P
                   fileBuffer[2] === 0x44 && // D
                   fileBuffer[3] === 0x46;   // F

      console.log('Vérification PDF:', { isPdf, firstBytes: fileBuffer.slice(0, 4) });

      const arrayBuffer = fileBuffer.buffer.slice(fileBuffer.byteOffset, fileBuffer.byteOffset + fileBuffer.byteLength) as ArrayBuffer;
      return new NextResponse(arrayBuffer, {
        headers: {
          'Content-Type': isPdf ? 'application/pdf' : 'application/octet-stream',
          'Content-Disposition': `inline; filename="${document.nom}.pdf"`,
          'Cache-Control': 'private, max-age=0',
          'Content-Length': fileBuffer.length.toString(),
          'X-Storage-Type': 'local',
          'X-Is-PDF': isPdf.toString(),
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