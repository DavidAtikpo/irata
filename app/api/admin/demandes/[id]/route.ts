import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendStatusUpdateEmail } from '@/lib/email';

// GET /api/admin/demandes/[id]
export async function GET(
  request: Request,
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

    const demande = await prisma.demande.findUnique({
      where: { id: params.id },
      include: {
        user: true,
        formation: true,
      },
    });

    if (!demande) {
      return NextResponse.json(
        { message: 'Demande non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json(demande);
  } catch (error) {
    console.error('Erreur lors de la récupération de la demande:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération de la demande' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/demandes/[id]
export async function PUT(
  request: Request,
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

    const { status, commentaire } = await request.json();

    if (!status || !['EN_ATTENTE', 'VALIDE', 'REFUSE', 'ANNULE'].includes(status)) {
      return NextResponse.json(
        { message: 'Statut invalide' },
        { status: 400 }
      );
    }

    const demande = await prisma.demande.update({
      where: { id: params.id },
      data: {
        statut: status,
        commentaire: commentaire || null,
      },
      include: {
        user: true,
        formation: true,
      },
    });

    // Si la demande est validée, créer un devis
    if (status === 'VALIDE') {
      await prisma.devis.create({
        data: {
          demandeId: demande.id,
          userId: demande.userId,
          montant: demande.formation.prix,
          statut: 'EN_ATTENTE',
          numero: `DEV-${Date.now()}`,
          client: demande.user.nom,
          mail: demande.user.email,
          designation: demande.formation.titre,
          quantite: 1,
          unite: 'FORMATION',
          prixUnitaire: demande.formation.prix,
          tva: 20
        },
      });
    }

    // Envoyer un email de notification
    try {
      await sendStatusUpdateEmail(
        demande.user.email,
        demande.formation.titre,
        status,
        commentaire
      );
    } catch (emailError) {
      console.error('Erreur lors de l\'envoi de l\'email:', emailError);
      // On continue même si l'envoi de l'email échoue
    }

    return NextResponse.json(demande);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la demande:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la mise à jour de la demande' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/demandes/[id]
export async function DELETE(
  request: Request,
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

    await prisma.demande.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Demande supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la demande:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la suppression de la demande' },
      { status: 500 }
    );
  }
} 