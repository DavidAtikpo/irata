import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import cloudinary from '@/lib/cloudinary';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const nom = formData.get('nom') as string;
    const description = formData.get('description') as string;
    const type = formData.get('type') as string;
    const isPublic = formData.get('public') === 'true';
    const userId = formData.get('userId') as string;
    const devisId = formData.get('devisId') as string;
    const certificationId = formData.get('certificationId') as string;

    if (!file || !nom || !type) {
      return NextResponse.json(
        { message: 'Fichier, nom et type sont requis' },
        { status: 400 }
      );
    }

    // Vérifier que c'est un PDF
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { message: 'Seuls les fichiers PDF sont autorisés' },
        { status: 400 }
      );
    }

    // Convertir le fichier en buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Téléverser vers Cloudinary avec une configuration publique forcée
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'raw',
          folder: 'irata-documents',
          public_id: `${type}_${Date.now()}`,
          type: 'upload',
          access_mode: 'public',
          invalidate: true,
          overwrite: true,
          // Configuration publique explicite
          delivery_type: 'upload',
          // Headers pour forcer l'accessibilité
          context: 'public=true'
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    const result = uploadResult as any;

    // Sauvegarder dans la base de données
    const document = await prisma.document.create({
      data: {
        nom,
        description,
        cloudinaryId: result.public_id,
        url: result.secure_url,
        type,
        public: isPublic,
        userId: userId || null,
        devisId: devisId || null,
        certificationId: certificationId || null,
      },
      include: {
        user: userId ? { select: { nom: true, prenom: true, email: true } } : false,
        devis: devisId ? { select: { numero: true } } : false,
      },
    });

    return NextResponse.json({
      message: 'Document téléversé avec succès',
      document,
    });
  } catch (error) {
    console.error('Erreur lors du téléversement:', error);
    return NextResponse.json(
      { message: 'Erreur lors du téléversement du document' },
      { status: 500 }
    );
  }
} 