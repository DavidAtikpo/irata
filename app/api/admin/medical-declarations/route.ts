import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { promises as fs } from 'fs';
import { join } from 'path';

const DATA_PATH = join(process.cwd(), 'data');
const MEDICAL_DECLARATIONS_FILE = 'medical-declarations.json';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Lire les déclarations médicales
    let declarationsData: any[] = [];
    try {
      const fileContent = await fs.readFile(join(DATA_PATH, MEDICAL_DECLARATIONS_FILE), 'utf-8');
      declarationsData = JSON.parse(fileContent);
    } catch (error) {
      // Fichier n'existe pas encore
      declarationsData = [];
    }

    // Trier par date de soumission (plus récentes en premier)
    declarationsData.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

    return NextResponse.json(declarationsData);

  } catch (error) {
    console.error('Erreur lors de la récupération des déclarations médicales:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const declarationId = searchParams.get('id');

    if (!declarationId) {
      return NextResponse.json(
        { error: 'ID de déclaration requis' },
        { status: 400 }
      );
    }

    // Lire les déclarations existantes
    let declarationsData: any[] = [];
    try {
      const fileContent = await fs.readFile(join(DATA_PATH, MEDICAL_DECLARATIONS_FILE), 'utf-8');
      declarationsData = JSON.parse(fileContent);
    } catch (error) {
      return NextResponse.json(
        { error: 'Fichier de données non trouvé' },
        { status: 404 }
      );
    }

    // Filtrer pour supprimer la déclaration
    const filteredDeclarations = declarationsData.filter(
      (declaration: any) => declaration.id !== declarationId
    );

    if (filteredDeclarations.length === declarationsData.length) {
      return NextResponse.json(
        { error: 'Déclaration non trouvée' },
        { status: 404 }
      );
    }

    // Sauvegarder
    await fs.writeFile(join(DATA_PATH, MEDICAL_DECLARATIONS_FILE), JSON.stringify(filteredDeclarations, null, 2));

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Erreur lors de la suppression de la déclaration:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

