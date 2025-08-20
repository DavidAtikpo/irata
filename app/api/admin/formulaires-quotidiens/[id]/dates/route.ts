import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { dateDebut, dateFin } = body;

    // Validation des dates
    if (!dateDebut || !dateFin) {
      return NextResponse.json(
        { error: 'Les dates de début et de fin sont requises' },
        { status: 400 }
      );
    }

    const debut = new Date(dateDebut);
    const fin = new Date(dateFin);
    
    if (debut >= fin) {
      return NextResponse.json(
        { error: 'La date de fin doit être postérieure à la date de début' },
        { status: 400 }
      );
    }

    // Mettre à jour le formulaire
    const formulaire = await prisma.formulairesQuotidiens.update({
      where: { id },
      data: {
        dateDebut: debut,
        dateFin: fin
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Dates mises à jour avec succès',
      formulaire: {
        id: formulaire.id,
        titre: formulaire.titre,
        dateDebut: formulaire.dateDebut,
        dateFin: formulaire.dateFin
      }
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour des dates:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
