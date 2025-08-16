import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { promises as fs } from 'fs';
import { join } from 'path';

const DATA_PATH = join(process.cwd(), 'data');
const MEDICAL_DECLARATIONS_FILE = 'medical-declarations.json';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { formData } = await request.json();

    if (!formData || !formData.signature || !formData.date || !formData.luEtApprouve) {
      return NextResponse.json(
        { error: 'Données du formulaire incomplètes' },
        { status: 400 }
      );
    }

    // Créer l'entrée de déclaration médicale
    const declaration = {
      id: `medical_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: session.user.id || session.user.email,
      userEmail: session.user.email,
      name: formData.name,
      sessionName: formData.sessionName,
      irataNo: formData.irataNo || '',
      date: formData.date,
      signature: formData.signature,
      luEtApprouve: formData.luEtApprouve,
      hasOtherSubjects: formData.hasOtherSubjects || false,
      otherSubjectsText: formData.otherSubjectsText || '',
      status: 'submitted',
      submittedAt: new Date().toISOString()
    };

    // Lire les déclarations existantes
    let declarationsData: any[] = [];
    try {
      const fileContent = await fs.readFile(join(DATA_PATH, MEDICAL_DECLARATIONS_FILE), 'utf-8');
      declarationsData = JSON.parse(fileContent);
    } catch (error) {
      // Fichier n'existe pas encore, on commence avec un tableau vide
      declarationsData = [];
    }

    // Vérifier si l'utilisateur a déjà soumis une déclaration
    const existingIndex = declarationsData.findIndex((dec: any) => 
      dec.userEmail === session.user?.email
    );

    if (existingIndex !== -1) {
      // Mettre à jour la déclaration existante
      declarationsData[existingIndex] = declaration;
    } else {
      // Ajouter une nouvelle déclaration
      declarationsData.push(declaration);
    }

    // Sauvegarder
    await fs.writeFile(join(DATA_PATH, MEDICAL_DECLARATIONS_FILE), JSON.stringify(declarationsData, null, 2));

    return NextResponse.json({ success: true, id: declaration.id });

  } catch (error) {
    console.error('Erreur lors de la soumission de la déclaration médicale:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
