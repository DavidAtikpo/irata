import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from 'lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session?.user?.role !== 'ADMIN') {
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
    const stagiaireId = formData.get('stagiaireId') as string;

    if (!file || !nom || !type) {
      return NextResponse.json(
        { message: 'Fichier, nom et type sont requis' },
        { status: 400 }
      );
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { message: 'Seuls les fichiers PDF sont autorisés' },
        { status: 400 }
      );
    }

    // Créer le répertoire s'il n'existe pas
    const uploadsDir = join(process.cwd(), 'public', 'formulaires');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Sauvegarder le fichier
    const timestamp = Date.now();
    const fileName = `${type}_${timestamp}.pdf`;
    const filePath = join(uploadsDir, fileName);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    const publicUrl = `/formulaires/${fileName}`;

    // Sauvegarder en base de données
    // Pour l'instant, nous utilisons un modèle simple
    // Dans une vraie implémentation, vous ajouteriez un modèle FormulairePDF à votre schema Prisma

    const formulaireData = {
      nom,
      description,
      type,
      fichierUrl: publicUrl,
      stagiaireId: stagiaireId || null,
      // Structure des champs (pour l'instant vide, à analyser plus tard)
      fields: JSON.stringify([])
    };

    console.log('Formulaire PDF sauvegardé:', formulaireData);

    return NextResponse.json({
      message: 'Formulaire téléversé avec succès',
      formulaire: {
        id: timestamp.toString(),
        ...formulaireData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Erreur lors du téléversement:', error);
    return NextResponse.json(
      { message: 'Erreur lors du téléversement du formulaire' },
      { status: 500 }
    );
  }
} 