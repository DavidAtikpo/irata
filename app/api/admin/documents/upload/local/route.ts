import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

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

    // Créer le dossier de stockage local s'il n'existe pas
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'documents');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Générer un nom de fichier unique
    const timestamp = Date.now();
    const fileName = `${type}_${timestamp}.pdf`;
    const filePath = join(uploadsDir, fileName);

    // Convertir le fichier en buffer et l'enregistrer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Créer l'URL d'accès public
    const publicUrl = `/uploads/documents/${fileName}`;

    console.log('Fichier sauvegardé localement:', filePath);
    console.log('URL publique:', publicUrl);

    // Sauvegarder dans la base de données
    const document = await prisma.document.create({
      data: {
        nom,
        description,
        cloudinaryId: fileName, // Utiliser le nom de fichier comme ID
        url: publicUrl,
        type,
        public: isPublic,
        userId: userId || null,
        devisId: devisId || null,
      },
      include: {
        user: userId ? { select: { nom: true, prenom: true, email: true } } : false,
        devis: devisId ? { select: { numero: true } } : false,
      },
    });

    return NextResponse.json({
      message: 'Document téléversé avec succès (stockage local)',
      document,
      note: 'Document stocké localement en attendant la résolution du problème Cloudinary'
    });

  } catch (error) {
    console.error('Erreur lors du téléversement local:', error);
    return NextResponse.json(
      { message: 'Erreur lors du téléversement du document' },
      { status: 500 }
    );
  }
} 