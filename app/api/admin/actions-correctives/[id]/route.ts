import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/admin/actions-correctives/[id] - Récupérer une action corrective spécifique (admin)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'GESTIONNAIRE')) {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const actionCorrective = await prisma.actionCorrective.findUnique({
      where: { id },
      include: {
        nonConformite: {
          include: {
            detecteur: {
              select: {
                id: true,
                nom: true,
                prenom: true,
                email: true
              }
            },
            responsable: {
              select: {
                id: true,
                nom: true,
                prenom: true,
                email: true
              }
            }
          }
        },
        responsable: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true
          }
        },
        commentaires: {
          include: {
            user: {
              select: {
                id: true,
                nom: true,
                prenom: true,
                email: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        documents: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!actionCorrective) {
      return NextResponse.json(
        { message: 'Action corrective non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json(actionCorrective);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'action corrective:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération de l\'action corrective' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/actions-correctives/[id] - Mettre à jour une action corrective (admin)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'GESTIONNAIRE')) {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const {
      titre,
      description,
      type,
      statut,
      priorite,
      responsableId,
      dateEcheance,
      dateRealisation,
      resultats,
      efficacite
    } = body;

    // Vérifier que l'action corrective existe
    const existingAction = await prisma.actionCorrective.findUnique({
      where: { id },
      include: {
        nonConformite: {
          select: {
            id: true,
            titre: true,
            detecteurId: true,
            responsableId: true
          }
        }
      }
    });

    if (!existingAction) {
      return NextResponse.json(
        { message: 'Action corrective non trouvée' },
        { status: 404 }
      );
    }

    // Préparer les données de mise à jour
    const updateData: any = {};
    if (titre !== undefined) updateData.titre = titre;
    if (description !== undefined) updateData.description = description;
    if (type !== undefined) updateData.type = type;
    if (statut !== undefined) updateData.statut = statut;
    if (priorite !== undefined) updateData.priorite = priorite;
    if (responsableId !== undefined) updateData.responsableId = responsableId;
    if (dateEcheance !== undefined) updateData.dateEcheance = dateEcheance ? new Date(dateEcheance) : null;
    if (dateRealisation !== undefined) updateData.dateRealisation = dateRealisation ? new Date(dateRealisation) : null;
    if (resultats !== undefined) updateData.resultats = resultats;
    if (efficacite !== undefined) updateData.efficacite = efficacite || null;

    const updatedAction = await prisma.actionCorrective.update({
      where: { id },
      data: updateData,
      include: {
        nonConformite: {
          select: {
            id: true,
            numero: true,
            titre: true,
            type: true,
            gravite: true,
            statut: true
          }
        },
        responsable: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true
          }
        }
      }
    });

    // Créer une notification si le responsable a changé
    if (responsableId && responsableId !== existingAction.responsableId) {
      await prisma.notification.create({
        data: {
          userId: responsableId,
          title: 'Action corrective assignée',
          message: `L'action corrective "${updatedAction.titre}" vous a été assignée.`,
          type: 'action_corrective',
          category: 'assignment',
          relatedId: id
        }
      });
    }

    // Créer une notification si l'action est terminée
    if (statut === 'TERMINEE' && existingAction.statut !== 'TERMINEE' && existingAction.nonConformite) {
      await prisma.notification.create({
        data: {
          userId: existingAction.nonConformite.detecteurId,
          title: 'Action corrective terminée',
          message: `L'action corrective "${updatedAction.titre}" a été terminée.`,
          type: 'action_corrective',
          category: 'completed',
          relatedId: id
        }
      });
    }

    return NextResponse.json({
      message: 'Action corrective mise à jour avec succès',
      actionCorrective: updatedAction
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'action corrective:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la mise à jour de l\'action corrective' },
      { status: 500 }
    );
  }
}
