import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { promises as fs } from 'fs';
import { join } from 'path';

const DATA_PATH = join(process.cwd(), 'data');
const TRAINEE_INDUCTION_FORMS_FILE = join(DATA_PATH, 'trainee-induction-forms.json');

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { formId } = await request.json();

    if (!formId) {
      return NextResponse.json(
        { error: 'ID du formulaire requis' },
        { status: 400 }
      );
    }

    let formsData: any[] = [];
    try {
      const fileContent = await fs.readFile(TRAINEE_INDUCTION_FORMS_FILE, 'utf-8');
      formsData = JSON.parse(fileContent);
    } catch (error) {
      return NextResponse.json(
        { error: 'Fichier de données non trouvé' },
        { status: 404 }
      );
    }

    const formIndex = formsData.findIndex(form => form.id === formId);
    if (formIndex === -1) {
      return NextResponse.json(
        { error: 'Formulaire non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier que le document a été signé par l'admin
    if (!formsData[formIndex].adminSignature) {
      return NextResponse.json(
        { error: 'Le document doit être signé par l\'administrateur avant d\'être envoyé' },
        { status: 400 }
      );
    }

    // Mettre à jour le statut pour indiquer que le document a été envoyé aux stagiaires
    formsData[formIndex] = {
      ...formsData[formIndex],
      status: 'sent_to_trainees'
    };

    await fs.writeFile(TRAINEE_INDUCTION_FORMS_FILE, JSON.stringify(formsData, null, 2));

    // Ici, vous pourriez ajouter la logique pour envoyer un email ou une notification
    // aux stagiaires pour leur informer que le document est disponible

    return NextResponse.json(
      { message: 'Document envoyé aux stagiaires avec succès' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Erreur lors de l\'envoi:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi' },
      { status: 500 }
    );
  }
}
