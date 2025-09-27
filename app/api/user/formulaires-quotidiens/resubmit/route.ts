import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    if (session.user.role !== 'USER') {
      return NextResponse.json({ error: 'Accès réservé aux utilisateurs' }, { status: 403 });
    }

    const { reponseOriginaleId, reponses, commentaires } = await request.json();

    if (!reponseOriginaleId || !reponses) {
      return NextResponse.json({ 
        error: 'Données manquantes: reponseOriginaleId et reponses sont requis' 
      }, { status: 400 });
    }

    // Vérifier que la réponse originale existe et appartient à l'utilisateur
    const reponseOriginale = await prisma.reponseFormulaire.findUnique({
      where: { id: reponseOriginaleId },
      include: {
        formulaire: true,
        correction: true
      }
    });

    if (!reponseOriginale) {
      return NextResponse.json({ error: 'Réponse originale non trouvée' }, { status: 404 });
    }

    if (reponseOriginale.stagiaireId !== session.user.id) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    // Vérifier qu'il y a une correction "À revoir"
    if (!reponseOriginale.correction || reponseOriginale.correction.decision !== 'A_REVOIR') {
      return NextResponse.json({ 
        error: 'Aucune correction "À revoir" trouvée pour cette réponse' 
      }, { status: 400 });
    }

    // Calculer la prochaine version
    const derniereVersion = await prisma.reponseFormulaire.findFirst({
      where: {
        reponseOriginaleId: reponseOriginaleId
      },
      orderBy: {
        version: 'desc'
      }
    });

    const nouvelleVersion = (derniereVersion?.version || reponseOriginale.version) + 1;

    // Créer la nouvelle réponse corrigée
    const nouvelleReponse = await prisma.reponseFormulaire.create({
      data: {
        formulaireId: reponseOriginale.formulaireId,
        stagiaireId: session.user.id,
        reponses: reponses,
        commentaires: commentaires || null,
        soumis: true,
        version: nouvelleVersion,
        reponseOriginaleId: reponseOriginaleId,
        dateReponse: new Date()
      }
    });

    // Mettre à jour la correction pour indiquer qu'une nouvelle version a été soumise
    await prisma.correctionFormulaire.update({
      where: { reponseId: reponseOriginaleId },
      data: {
        dateCorrection: new Date(),
        commentaire: reponseOriginale.correction.commentaire + '\n\n--- Nouvelle version soumise ---'
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Correction soumise avec succès',
      reponse: {
        id: nouvelleReponse.id,
        version: nouvelleVersion,
        dateReponse: nouvelleReponse.dateReponse
      }
    });

  } catch (error) {
    console.error('Erreur lors de la soumission de la correction:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' }, 
      { status: 500 }
    );
  }
}

