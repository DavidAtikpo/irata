import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { promises as fs } from 'fs';
import { join } from 'path';

const DATA_PATH = join(process.cwd(), 'data');
const FILE_PATH = join(DATA_PATH, 'irata-disclaimer-submissions.json');

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Vérifier l'authentification admin
    if (!session || (session as any).user?.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    const { submissionId, irataNo } = await request.json();

    if (!submissionId || !irataNo) {
      return NextResponse.json({ message: 'Données manquantes' }, { status: 400 });
    }

    // Lire le fichier existant
    const raw = await fs.readFile(FILE_PATH, 'utf8');
    const submissions = JSON.parse(raw || '[]');

    // Trouver et mettre à jour la soumission
    const submissionIndex = submissions.findIndex((s: any) => s.id === submissionId);
    
    if (submissionIndex === -1) {
      return NextResponse.json({ message: 'Soumission non trouvée' }, { status: 404 });
    }

    // Mettre à jour seulement le numéro IRATA
    submissions[submissionIndex] = {
      ...submissions[submissionIndex],
      irataNo: irataNo
    };

    // Sauvegarder
    await fs.writeFile(FILE_PATH, JSON.stringify(submissions, null, 2), 'utf8');

    return NextResponse.json({ 
      message: 'Numéro IRATA mis à jour avec succès',
      submission: submissions[submissionIndex]
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour du numéro IRATA:', error);
    return NextResponse.json({ message: 'Erreur interne du serveur' }, { status: 500 });
  }
}
