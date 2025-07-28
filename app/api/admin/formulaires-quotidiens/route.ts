import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const formulaires = await prisma.formulairesQuotidiens.findMany({
      include: {
        _count: {
          select: {
            reponses: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transformer les données pour inclure le nombre de réponses
    const formulairesWithCount = formulaires.map(formulaire => ({
      id: formulaire.id,
      titre: formulaire.titre,
      description: formulaire.description,
      session: formulaire.session,
      dateCreation: formulaire.dateCreation,
      dateDebut: formulaire.dateDebut,
      dateFin: formulaire.dateFin,
      actif: formulaire.actif,
      valide: (formulaire as any).valide || false, // Nouveau champ pour la validation
      questions: formulaire.questions,
      nombreReponses: formulaire._count.reponses
    }));

    return NextResponse.json(formulairesWithCount);
  } catch (error) {
    console.error('Erreur lors de la récupération des formulaires:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des formulaires' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { titre, description, session: sessionName, dateDebut, dateFin, questions, valide = false } = body;

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

    const formulaire = await prisma.formulairesQuotidiens.create({
      data: {
        titre: titre.trim(),
        description: description?.trim() || null,
        session: sessionName.trim(),
        dateDebut: debut,
        dateFin: fin,
        questions,
        valide: Boolean(valide), // Par défaut false, l'admin doit valider
        actif: true, // Actif par défaut
        createdBy: session.user.id
      } as any
    });

    return NextResponse.json({
      message: 'Formulaire créé avec succès',
      formulaire: {
        id: formulaire.id,
        titre: formulaire.titre,
        description: formulaire.description,
        session: formulaire.session,
        dateCreation: formulaire.dateCreation,
        dateDebut: formulaire.dateDebut,
        dateFin: formulaire.dateFin,
        actif: formulaire.actif,
        valide: (formulaire as any).valide,
        questions: formulaire.questions
      }
    });
  } catch (error) {
    console.error('Erreur lors de la création du formulaire:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la création du formulaire' },
      { status: 500 }
    );
  }
}