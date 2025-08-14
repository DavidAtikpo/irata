import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const devis = await prisma.devis.findUnique({
      where: { id },
      include: {
        demande: {
          include: {
            user: true
          }
        }
      }
    });

    if (!devis) {
      return NextResponse.json(
        { message: 'Devis non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json(devis);
  } catch (error) {
    console.error('Erreur lors de la récupération du devis:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération du devis' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { signature } = body || {};

    if (typeof signature !== 'string' || signature.length === 0) {
      return NextResponse.json(
        { message: "Champ 'signature' invalide ou manquant" },
        { status: 400 }
      );
    }

    const updated = await prisma.devis.update({
      where: { id },
      data: { signature },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la signature du devis:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la mise à jour du devis' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Vérifie l'existence d'abord pour retourner 404 proprement
    const existing = await prisma.devis.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { message: 'Devis non trouvé' },
        { status: 404 }
      );
    }

    await prisma.devis.delete({ where: { id } });

    return NextResponse.json({ message: 'Devis supprimé' }, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la suppression du devis:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la suppression du devis' },
      { status: 500 }
    );
  }
}