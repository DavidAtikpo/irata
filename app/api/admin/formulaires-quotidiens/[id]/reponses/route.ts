import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/admin/formulaires-quotidiens/[id]/reponses
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Vérifier si le formulaire existe
    const formulaire = await prisma.formulairesQuotidiens.findUnique({
      where: { id }
    });

    if (!formulaire) {
      return NextResponse.json(
        { message: 'Formulaire non trouvé' },
        { status: 404 }
      );
    }

    // Récupérer toutes les réponses pour ce formulaire
    const reponses = await prisma.reponseFormulaire.findMany({
      where: {
        formulaireId: id
      },
      include: {
        stagiaire: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true
          }
        }
      },
      orderBy: {
        dateReponse: 'desc'
      }
    });

    // Transformer les données pour correspondre à l'interface attendue
    const reponsesFormatted = reponses.map(reponse => ({
      id: reponse.id,
      formulaireId: reponse.formulaireId,
      utilisateurId: reponse.stagiaireId,
      utilisateurNom: `${reponse.stagiaire.prenom || ''} ${reponse.stagiaire.nom || ''}`.trim(),
      utilisateurEmail: reponse.stagiaire.email,
      dateReponse: reponse.dateReponse,
      reponses: reponse.reponses,
      commentaires: reponse.commentaires,
      soumis: reponse.soumis
    }));

    return NextResponse.json(reponsesFormatted);
  } catch (error) {
    console.error('Erreur lors de la récupération des réponses:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des réponses' },
      { status: 500 }
    );
  }
} 