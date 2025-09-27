import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from '../../../../../lib/prisma';

// GET /api/admin/non-conformites/[id] - Récupérer une non-conformité spécifique (admin)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'GESTIONNAIRE')) {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const nonConformite = await prisma.nonConformite.findUnique({
      where: { id },
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
        },
        actionsCorrectives: {
          include: {
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
            }
          },
          orderBy: {
            createdAt: 'desc'
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

    if (!nonConformite) {
      return NextResponse.json(
        { message: 'Non-conformité non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json(nonConformite);
  } catch (error) {
    console.error('Erreur lors de la récupération de la non-conformité:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération de la non-conformité' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/non-conformites/[id] - Mettre à jour une non-conformité (admin)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'GESTIONNAIRE')) {
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
      gravite,
      statut,
      lieu,
      responsableId,
      dateEcheance
    } = body;

    // Vérifier que la non-conformité existe
    const existingNonConformite = await prisma.nonConformite.findUnique({
      where: { id }
    });

    if (!existingNonConformite) {
      return NextResponse.json(
        { message: 'Non-conformité non trouvée' },
        { status: 404 }
      );
    }

    // Préparer les données de mise à jour
    const updateData: any = {};
    if (titre !== undefined) updateData.titre = titre;
    if (description !== undefined) updateData.description = description;
    if (type !== undefined) updateData.type = type;
    if (gravite !== undefined) updateData.gravite = gravite;
    if (statut !== undefined) updateData.statut = statut;
    if (lieu !== undefined) updateData.lieu = lieu;
    if (responsableId !== undefined) updateData.responsableId = responsableId;
    if (dateEcheance !== undefined) updateData.dateEcheance = dateEcheance ? new Date(dateEcheance) : null;

    const updatedNonConformite = await prisma.nonConformite.update({
      where: { id },
      data: updateData,
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
    });

    // Créer une notification si le responsable a changé
    if (responsableId && responsableId !== existingNonConformite.responsableId) {
      await prisma.notification.create({
        data: {
          userId: responsableId,
          title: 'Non-conformité assignée',
          message: `La non-conformité "${updatedNonConformite.titre}" vous a été assignée.`,
          type: 'non_conformite',
          category: 'assignment',
          relatedId: id
        }
      });
    }

    // Créer une notification si le statut a changé
    if (statut && statut !== existingNonConformite.statut) {
      const participants = [
        existingNonConformite.detecteurId,
        existingNonConformite.responsableId
      ].filter((participantId) => participantId && participantId !== session?.user?.id);

      for (const participantId of participants) {
        if (participantId) {
          await prisma.notification.create({
            data: {
              userId: participantId,
            title: 'Statut de non-conformité modifié',
            message: `Le statut de la non-conformité "${updatedNonConformite.titre}" a été modifié.`,
            type: 'non_conformite',
            category: 'status_change',
            relatedId: id
          }
        });
        }
      }
    }

    return NextResponse.json({
      message: 'Non-conformité mise à jour avec succès',
      nonConformite: updatedNonConformite
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la non-conformité:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la mise à jour de la non-conformité' },
      { status: 500 }
    );
  }
}
