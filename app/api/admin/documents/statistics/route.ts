import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    // Récupérer les statistiques globales
    const totalDocuments = await prisma.document.count();
    const totalUsers = await prisma.user.count();
    
    // Récupérer les statistiques des actions
    const actionStats = await prisma.documentAction.groupBy({
      by: ['action'],
      _count: {
        action: true
      }
    });

    // Récupérer les statistiques par document
    const documentStats = await prisma.document.findMany({
      include: {
        _count: {
          select: {
            actions: true
          }
        },
        actions: {
          include: {
            user: {
              select: {
                nom: true,
                prenom: true,
                email: true
              }
            }
          },
          orderBy: {
            timestamp: 'desc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Récupérer les statistiques par utilisateur
    const userStats = await prisma.user.findMany({
      include: {
        _count: {
          select: {
            documentActions: true
          }
        },
        documentActions: {
          include: {
            document: {
              select: {
                nom: true,
                type: true
              }
            }
          },
          orderBy: {
            timestamp: 'desc'
          }
        }
      },
      orderBy: {
        nom: 'asc'
      }
    });

    // Calculer les statistiques détaillées
    const stats = {
      global: {
        totalDocuments,
        totalUsers,
        totalActions: actionStats.reduce((sum, stat) => sum + stat._count.action, 0)
      },
      byAction: actionStats.reduce((acc, stat) => {
        acc[stat.action] = stat._count.action;
        return acc;
      }, {} as Record<string, number>),
      byDocument: documentStats.map(doc => ({
        id: doc.id,
        nom: doc.nom,
        type: doc.type,
        public: doc.public,
        createdAt: doc.createdAt,
        totalActions: doc._count.actions,
        actions: doc.actions.map(action => ({
          id: action.id,
          action: action.action,
          timestamp: action.timestamp,
          user: action.user
        }))
      })),
      byUser: userStats.map(user => ({
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        totalActions: user._count.documentActions,
        actions: user.documentActions.map(action => ({
          id: action.id,
          action: action.action,
          timestamp: action.timestamp,
          document: action.document
        }))
      }))
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' }, 
      { status: 500 }
    );
  }
}
