import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/admin/formulaires-quotidiens/[id]
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

    const formulaire = await prisma.formulairesQuotidiens.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            reponses: true
          }
        }
      }
    });

    if (!formulaire) {
      return NextResponse.json(
        { message: 'Formulaire non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: formulaire.id,
      titre: formulaire.titre,
      description: formulaire.description,
      session: formulaire.session,
      niveau: formulaire.niveau || '1', // Défaut niveau 1 si non défini
      dateCreation: formulaire.dateCreation,
      dateDebut: formulaire.dateDebut,
      dateFin: formulaire.dateFin,
      actif: formulaire.actif,
      valide: formulaire.valide,
      questions: formulaire.questions,
      nombreReponses: formulaire._count.reponses
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du formulaire:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération du formulaire' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/formulaires-quotidiens/[id]
export async function PUT(
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
    const body = await req.json();
    const { titre, description, session: sessionName, niveau, dateDebut, dateFin, questions } = body;

    // Validation des données
    if (!titre || !sessionName || !dateDebut || !dateFin) {
      return NextResponse.json(
        { message: 'Les champs titre, session, date de début et date de fin sont obligatoires' },
        { status: 400 }
      );
    }

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { message: 'Au moins une question est requise' },
        { status: 400 }
      );
    }

    // Validation des questions
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      if (!question.question || !question.type) {
        return NextResponse.json(
          { message: `Question ${i + 1}: Le texte et le type sont obligatoires` },
          { status: 400 }
        );
      }

      // Vérifier que les questions avec options ont bien des options
      if (['select', 'radio', 'checkbox'].includes(question.type)) {
        if (!question.options || !Array.isArray(question.options) || question.options.length === 0) {
          return NextResponse.json(
            { message: `Question ${i + 1}: Les options sont requises pour ce type de question` },
            { status: 400 }
          );
        }
      }
    }

    // Validation des dates
    const debut = new Date(dateDebut);
    const fin = new Date(dateFin);
    
    if (debut >= fin) {
      return NextResponse.json(
        { message: 'La date de fin doit être postérieure à la date de début' },
        { status: 400 }
      );
    }

    const formulaire = await prisma.formulairesQuotidiens.update({
      where: { id },
      data: {
        titre: titre.trim(),
        description: description?.trim() || null,
        session: sessionName.trim(),
        niveau: niveau || '1', // Défaut niveau 1 si non spécifié
        dateDebut: debut,
        dateFin: fin,
        questions
      }
    });

    return NextResponse.json({
      message: 'Formulaire mis à jour avec succès',
      formulaire: {
        id: formulaire.id,
        titre: formulaire.titre,
        description: formulaire.description,
        session: formulaire.session,
        niveau: formulaire.niveau,
        dateCreation: formulaire.dateCreation,
        dateDebut: formulaire.dateDebut,
        dateFin: formulaire.dateFin,
        actif: formulaire.actif,
        valide: formulaire.valide,
        questions: formulaire.questions
      }
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du formulaire:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la mise à jour du formulaire' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/formulaires-quotidiens/[id]
export async function DELETE(
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

    // Supprimer le formulaire (les réponses seront supprimées automatiquement grâce à CASCADE)
    await prisma.formulairesQuotidiens.delete({
      where: { id }
    });

    return NextResponse.json({
      message: 'Formulaire supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du formulaire:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la suppression du formulaire' },
      { status: 500 }
    );
  }
} 