import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/demandes
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Si l'utilisateur est un admin, il peut voir toutes les demandes
    if (session.user.role === 'ADMIN') {
      const demandes = await prisma.demande.findMany({
        include: {
          user: {
            select: {
              id: true,
              nom: true,
              prenom: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return NextResponse.json(demandes);
    }

    // Sinon, l'utilisateur ne peut voir que ses propres demandes
    const demandes = await prisma.demande.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
        statut: true,
        session: true,
        message: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(demandes);
  } catch (error) {
    console.error('Erreur lors de la récupération des demandes:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des demandes' },
      { status: 500 }
    );
  }
}

// POST /api/demandes
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { formationId, message } = await req.json();

    if (!formationId) {
      return NextResponse.json(
        { message: 'La formation est requise' },
        { status: 400 }
      );
    }

    // Vérifier si la formation existe
    const formation = await prisma.formation.findUnique({
      where: { id: formationId },
    });

    if (!formation) {
      return NextResponse.json(
        { message: 'Formation non trouvée' },
        { status: 404 }
      );
    }

    // Créer la demande
    const demande = await prisma.demande.create({
      data: {
        userId: session.user.id,
        session: formationId, // Utiliser formationId comme session pour l'instant
        message,
        statut: 'EN_ATTENTE',
      },
    });

    return NextResponse.json(demande, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de la demande:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la création de la demande' },
      { status: 500 }
    );
  }
} 