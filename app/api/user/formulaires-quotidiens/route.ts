import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/user/formulaires-quotidiens
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Récupérer tous les formulaires validés et actifs
    const formulaires = await prisma.formulairesQuotidiens.findMany({
      where: {
        valide: true,
        actif: true
      },
      include: {
        reponses: {
          where: {
            stagiaireId: session.user.id
          },
          orderBy: {
            dateReponse: 'desc'
          },
          take: 1 // Prendre seulement la réponse la plus récente
        }
      },
      orderBy: {
        dateDebut: 'desc'
      }
    });

    // Transformer les données pour inclure les informations de réponse
    const formulairesWithReponses = formulaires.map(formulaire => {
      const derniereReponse = formulaire.reponses[0];
      return {
        id: formulaire.id,
        titre: formulaire.titre,
        description: formulaire.description,
        session: formulaire.session,
        dateCreation: formulaire.dateCreation,
        dateDebut: formulaire.dateDebut,
        dateFin: formulaire.dateFin,
        actif: formulaire.actif,
        valide: formulaire.valide,
        questions: formulaire.questions,
        dejaRepondu: formulaire.reponses.length > 0,
        dateDerniereReponse: derniereReponse ? derniereReponse.dateReponse : null
      };
    });

    return NextResponse.json(formulairesWithReponses);
  } catch (error) {
    console.error('Erreur lors de la récupération des formulaires:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des formulaires' },
      { status: 500 }
    );
  }
} 