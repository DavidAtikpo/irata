import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface Session {
  user: {
    id: string;
    email: string;
    role: string;
  }
}

// GET /api/admin/formations
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const formations = await prisma.formation.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(formations);
  } catch (error) {
    console.error('Erreur lors de la récupération des formations:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des formations' },
      { status: 500 }
    );
  }
}

// POST /api/admin/formations
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { titre, description, prix, duree, niveau } = data;

    if (!titre || !description || !prix || !duree || !niveau) {
      return NextResponse.json(
        { message: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }

    const formation = await prisma.formation.create({
      data: {
        titre,
        description,
        prix: parseFloat(prix),
        duree,
        niveau,
      },
    });

    return NextResponse.json(formation, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de la formation:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la création de la formation' },
      { status: 500 }
    );
  }
} 