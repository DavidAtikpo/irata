import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Début de la requête GET pour l\'utilisateur:', params.id);
    
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

    console.log('Tentative de récupération des données utilisateur...');
    const user = await prisma.user.findUnique({
      where: {
        id: params.id,
      },
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
            createdAt: true,
            formation: {
              select: {
                titre: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        devis: {
          select: {
            id: true,
            numero: true,
            statut: true,
            montant: true,
            createdAt: true,
            contrat: {
              select: {
                id: true,
                statut: true,
                dateDebut: true,
                dateFin: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    console.log('Résultat de la requête:', { 
      userFound: !!user,
      userId: user?.id,
      demandesCount: user?.demandes?.length,
      devisCount: user?.devis?.length
    });

    if (!user) {
      console.log('Erreur: Utilisateur non trouvé');
      return new NextResponse('Utilisateur non trouvé', { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Erreur détaillée:', {
      message: error instanceof Error ? error.message : 'Erreur inconnue',
      stack: error instanceof Error ? error.stack : undefined,
      error
    });
    return new NextResponse('Erreur serveur', { status: 500 });
  }
} 