import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from 'lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    if (session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès réservé aux administrateurs' }, { status: 403 });
    }

    // Récupérer tous les utilisateurs avec leurs informations de base
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        nom: true,
        prenom: true,
        phone: true,
        role: true,
        createdAt: true,
        isActive: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(users);

  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' }, 
      { status: 500 }
    );
  }
}

