import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET /api/admin/formations/[id]
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const formation = await prisma.formation.findUnique({
      where: { id: params.id },
    });

    if (!formation) {
      return NextResponse.json(
        { message: 'Formation non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json(formation);
  } catch (error) {
    console.error('Erreur lors de la récupération de la formation:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération de la formation' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/formations/[id]
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { titre, description, duree, prix, niveau } = await req.json();

    if (!titre || !description || !duree || !prix || !niveau) {
      return NextResponse.json(
        { message: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }

    const formation = await prisma.formation.update({
      where: { id: params.id },
      data: {
        titre,
        description,
        duree,
        prix,
        niveau,
      },
    });

    return NextResponse.json(formation);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la formation:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la mise à jour de la formation' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/formations/[id]
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    await prisma.formation.delete({
      where: { id: params.id },
    });

    return NextResponse.json(
      { message: 'Formation supprimée avec succès' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur lors de la suppression de la formation:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la suppression de la formation' },
      { status: 500 }
    );
  }
} 