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

    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'ID de session requis' },
        { status: 400 }
      );
    }

    // Lire les documents existants
    let documentsData: any[] = [];
    try {
      const fileContent = await fs.readFile(TRAINEE_INDUCTION_FORMS_FILE, 'utf-8');
      documentsData = JSON.parse(fileContent);
    } catch (error) {
      return NextResponse.json(
        { error: 'Document non trouvé' },
        { status: 404 }
      );
    }

    // Trouver le document pour cette session
    const docIndex = documentsData.findIndex((doc: any) => doc.sessionId === sessionId);
    
    if (docIndex === -1) {
      return NextResponse.json(
        { error: 'Document non trouvé pour cette session' },
        { status: 404 }
      );
    }

    // Vérifier que le document est signé par l'admin
    if (documentsData[docIndex].status !== 'admin_signed') {
      return NextResponse.json(
        { error: 'Le document doit être signé par l\'admin avant publication' },
        { status: 400 }
      );
    }

    // Mettre à jour le statut
    documentsData[docIndex] = {
      ...documentsData[docIndex],
      status: 'published_to_trainees',
      publishedAt: new Date().toISOString()
    };

    // Sauvegarder
    await fs.writeFile(TRAINEE_INDUCTION_FORMS_FILE, JSON.stringify(documentsData, null, 2));

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Erreur lors de la publication:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
