import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from 'lib/prisma';
import cloudinary from 'lib/cloudinary';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    const items = await prisma.historiqueItem.findMany({
      orderBy: { createdAt: 'desc' },
      include: { document: true },
    });

    return NextResponse.json({ items });
  } catch (error) {
    console.error('Erreur GET historique:', error);
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    const formData = await req.formData();
    const files = formData.getAll('files') as File[];
    const annee = (formData.get('annee') as string) || '';
    const sessionLabel = (formData.get('session') as string) || '';
    const commentaire = (formData.get('commentaire') as string) || '';

    if (!files || files.length === 0) {
      return NextResponse.json({ message: 'Aucun fichier fourni' }, { status: 400 });
    }

    const created: any[] = [];

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            resource_type: 'image',
            folder: 'irata-historique',
            public_id: `${annee}_${sessionLabel}_${Date.now()}`,
            type: 'upload',
            access_mode: 'public',
            overwrite: true,
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(buffer);
      });

      const result = uploadResult as any;

      const doc = await prisma.document.create({
        data: {
          nom: `${annee} ${sessionLabel}`.trim() || 'Historique',
          description: commentaire,
          cloudinaryId: result.public_id,
          url: result.secure_url,
          type: 'historique',
          public: true,
        },
      });

      const item = await prisma.historiqueItem.create({
        data: {
          annee,
          session: sessionLabel,
          commentaire,
          documentId: doc.id,
        },
        include: { document: true },
      });

      created.push(item);
    }

    return NextResponse.json({ message: 'Images téléversées', items: created });
  } catch (error) {
    console.error('Erreur POST historique:', error);
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    const body = await req.json();
    const { id, annee, session: sessionLabel, commentaire } = body as {
      id: string; annee?: string; session?: string; commentaire?: string;
    };
    if (!id) return NextResponse.json({ message: 'ID requis' }, { status: 400 });

    const item = await prisma.historiqueItem.update({
      where: { id },
      data: {
        annee: typeof annee === 'string' ? annee : undefined,
        session: typeof sessionLabel === 'string' ? sessionLabel : undefined,
        commentaire: typeof commentaire === 'string' ? commentaire : undefined,
      },
      include: { document: true },
    });

    // Optionally keep document.nom in sync
    if ((annee || sessionLabel) && item.document) {
      await prisma.document.update({
        where: { id: item.documentId },
        data: { nom: `${item.annee} ${item.session}`.trim() },
      });
    }

    return NextResponse.json({ item });
  } catch (error) {
    console.error('Erreur PATCH historique:', error);
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    const body = await req.json();
    const { id } = body as { id: string };
    if (!id) return NextResponse.json({ message: 'ID requis' }, { status: 400 });

    const item = await prisma.historiqueItem.findUnique({ where: { id }, include: { document: true } });
    if (!item) return NextResponse.json({ message: 'Introuvable' }, { status: 404 });

    // Delete Cloudinary asset if exists
    if (item.document?.cloudinaryId) {
      try {
        await cloudinary.uploader.destroy(item.document.cloudinaryId, { resource_type: 'image' });
      } catch (e) {
        console.warn('Cloudinary destroy failed:', e);
      }
    }

    await prisma.historiqueItem.delete({ where: { id } });
    if (item.documentId) {
      await prisma.document.delete({ where: { id: item.documentId } });
    }

    return NextResponse.json({ message: 'Supprimé' });
  } catch (error) {
    console.error('Erreur DELETE historique:', error);
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 });
  }
}


