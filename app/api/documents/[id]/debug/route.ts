import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from 'lib/prisma';
import { existsSync } from 'fs';
import { join } from 'path';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
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
        devis: true
      }
    });

    if (!document) {
      return NextResponse.json(
        { message: 'Document non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier si le fichier local existe
    const filePath = join(process.cwd(), 'public', 'uploads', 'documents', document.cloudinaryId);
    const fileExists = existsSync(filePath);

    // Informations de débogage
    const debugInfo = {
      document: {
        id: document.id,
        nom: document.nom,
        cloudinaryId: document.cloudinaryId,
        url: document.url,
        type: document.type,
        public: document.public,
        createdAt: document.createdAt,
        userId: document.userId,
        devisId: document.devisId
      },
      file: {
        expectedPath: filePath,
        exists: fileExists,
        isLocalUrl: document.url.startsWith('/uploads/'),
        isCloudinaryUrl: document.url.includes('cloudinary.com')
      },
      server: {
        cwd: process.cwd(),
        timestamp: new Date().toISOString()
      }
    };

    return NextResponse.json(debugInfo);

  } catch (error) {
    console.error('Erreur de débogage:', error);
    return NextResponse.json(
      { 
        message: 'Erreur lors du débogage',
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
} 