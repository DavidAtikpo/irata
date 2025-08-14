import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/admin/formulaires-quotidiens/[id]/reponses
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 })
    }

    const { id } = await params

    const formulaire = await prisma.formulairesQuotidiens.findUnique({ where: { id } })
    if (!formulaire) {
      return NextResponse.json({ message: 'Formulaire non trouvé' }, { status: 404 })
    }

    const reponses = await prisma.reponseFormulaire.findMany({
      where: { formulaireId: id },
      include: {
        stagiaire: {
          select: { id: true, nom: true, prenom: true, email: true }
        }
      },
      orderBy: { dateReponse: 'desc' }
    })

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
    }))

    return NextResponse.json(reponsesFormatted)
  } catch (error) {
    console.error('Erreur lors de la récupération des réponses:', error)
    return NextResponse.json({ message: 'Erreur lors de la récupération des réponses' }, { status: 500 })
  }
}

// POST /api/admin/formulaires-quotidiens/[id]/reponses
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const { reponseId, decision, commentaire, score } = body as {
      reponseId: string
      decision?: 'ACCEPTE' | 'REFUSE' | 'A_REVOIR'
      commentaire?: string
      score?: number
    }

    if (!reponseId) {
      return NextResponse.json({ message: 'reponseId requis' }, { status: 400 })
    }

    const reponse = await prisma.reponseFormulaire.findUnique({ where: { id: reponseId } })
    if (!reponse || reponse.formulaireId !== id) {
      return NextResponse.json({ message: 'Réponse introuvable' }, { status: 404 })
    }

    const updated = await prisma.reponseFormulaire.update({
      where: { id: reponseId },
      data: {
        decisionAdmin: decision || null,
        commentaireAdmin: commentaire || null,
        scoreAdmin: typeof score === 'number' ? score : null
      }
    })

    return NextResponse.json({ success: true, updated })
  } catch (error) {
    console.error("Erreur lors de l'envoi de la décision:", error)
    return NextResponse.json({ message: "Erreur lors de l'envoi de la décision" }, { status: 500 })
  }
}

export {}




