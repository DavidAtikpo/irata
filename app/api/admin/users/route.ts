import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('Début de la requête GET pour la liste des utilisateurs');
    
    const session = await getServerSession(authOptions);
    console.log('Session récupérée:', { 
      isAuthenticated: !!session?.user,
      userRole: session?.user?.role 
    });

    if (!session?.user) {
      console.log('Erreur: Utilisateur non authentifié');
      return new NextResponse('Non authentifié', { status: 401 });
    }

    if (session.user.role !== 'ADMIN') {
      console.log('Erreur: Accès non autorisé - Rôle:', session.user.role);
      return new NextResponse('Accès non autorisé', { status: 403 });
    }

    console.log('Tentative de récupération des utilisateurs...');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        nom: true,
        prenom: true,
        role: true,
        createdAt: true,
        demandes: {
          select: {
            id: true,
            statut: true,
          },
        },
        devis: {
          select: {
            id: true,
            numero: true,
            statut: true,
            contrat: {
              select: {
                id: true,
                statut: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log('Résultat de la requête:', { 
      usersCount: users.length,
      firstUser: users[0] ? {
        id: users[0].id,
        demandesCount: users[0].demandes.length,
        devisCount: users[0].devis.length
      } : null
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Erreur détaillée:', {
      message: error instanceof Error ? error.message : 'Erreur inconnue',
      stack: error instanceof Error ? error.stack : undefined,
      error
    });
    return new NextResponse('Erreur serveur', { status: 500 });
  }
} 