import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
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

    const { sessionId, courseDate, courseLocation, diffusion, copie, adminSignature } = await request.json();

    if (!sessionId || !courseDate || !courseLocation || !diffusion || !copie || !adminSignature) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }

    // Créer le document d'induction signé
    const inductionDocument = {
      id: `induction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sessionId,
      courseDate,
      courseLocation,
      diffusion,
      copie,
      adminSignature,
      adminSignedAt: new Date().toISOString(),
      status: 'admin_signed',
      createdAt: new Date().toISOString()
    };

    // Lire les documents existants
    let documentsData: any[] = [];
    try {
      const fileContent = await fs.readFile(TRAINEE_INDUCTION_FORMS_FILE, 'utf-8');
      documentsData = JSON.parse(fileContent);
    } catch (error) {
      documentsData = [];
    }

    // Vérifier s'il existe déjà un document pour cette session
    const existingIndex = documentsData.findIndex((doc: any) => doc.sessionId === sessionId);
    
    if (existingIndex !== -1) {
      // Mettre à jour le document existant
      documentsData[existingIndex] = inductionDocument;
    } else {
      // Ajouter un nouveau document
      documentsData.push(inductionDocument);
    }

    // Sauvegarder
    await fs.writeFile(TRAINEE_INDUCTION_FORMS_FILE, JSON.stringify(documentsData, null, 2));

    return NextResponse.json({ success: true, document: inductionDocument });

  } catch (error) {
    console.error('Erreur lors de la signature:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
