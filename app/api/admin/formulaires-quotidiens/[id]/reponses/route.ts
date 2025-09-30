import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { PrismaClient } from '@prisma/client';
import { sendFormulaireCorrectionEmail } from 'lib/email';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    if (session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès réservé aux administrateurs' }, { status: 403 });
    }

    const { reponseId, decision, commentaire, score } = await request.json();

    if (!reponseId || !decision) {
      return NextResponse.json({ 
        error: 'Données manquantes: reponseId et decision sont requis' 
      }, { status: 400 });
    }

    // Vérifier que la réponse existe
    const reponse = await prisma.reponseFormulaire.findUnique({
      where: { id: reponseId },
      include: {
        stagiaire: {
          select: {
            nom: true,
            prenom: true,
            email: true
          }
        },
        formulaire: {
          select: {
            id: true,
            titre: true,
            questions: true
          }
        }
      }
    });

    if (!reponse) {
      return NextResponse.json({ error: 'Réponse non trouvée' }, { status: 404 });
    }

    // Vérifier que la réponse appartient au formulaire spécifié
    const { id } = await params;
    if (reponse.formulaireId !== id) {
      return NextResponse.json({ 
        error: 'La réponse n\'appartient pas à ce formulaire' 
      }, { status: 400 });
    }

    // Créer ou mettre à jour la correction
    const correction = await prisma.correctionFormulaire.upsert({
      where: {
        reponseId: reponseId
      },
      update: {
        decision,
        commentaire: commentaire || '',
        score: score || null,
        dateCorrection: new Date(),
        adminId: session.user!.id
      },
      create: {
        reponseId: reponseId,
        decision,
        commentaire: commentaire || '',
        score: score || null,
        dateCorrection: new Date(),
        adminId: session.user!.id
      }
    });

    // Envoyer l'email de notification à l'étudiant
    try {
      await sendFormulaireCorrectionEmail(
        reponse.stagiaire.email,
        `${reponse.stagiaire.prenom} ${reponse.stagiaire.nom}`,
        reponse.formulaire.titre,
        decision,
        commentaire || '',
        score || undefined
      );
    } catch (emailError) {
      console.error('Erreur lors de l\'envoi de l\'email:', emailError);
      // Ne pas faire échouer la requête si l'email ne peut pas être envoyé
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Correction envoyée avec succès',
      correction 
    });

  } catch (error) {
    console.error('Erreur lors de l\'envoi de la correction:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' }, 
      { status: 500 }
    );
  }
}

function getDecisionText(decision: string): string {
  switch (decision) {
    case 'ACCEPTE':
      return '✅ Accepté';
    case 'A_REVOIR':
      return '⚠️ À revoir';
    case 'REFUSE':
      return '❌ Refusé';
    default:
      return decision;
  }
}