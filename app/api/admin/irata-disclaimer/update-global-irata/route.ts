import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { promises as fs } from 'fs';
import { join } from 'path';

const DATA_PATH = join(process.cwd(), 'data');
const FILE_PATH = join(DATA_PATH, 'irata-disclaimer-submissions.json');
const GLOBAL_IRATA_FILE = join(DATA_PATH, 'global-irata-no.json');

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Vérifier l'authentification admin
    if (!session || (session as any).user?.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    const { irataNo } = await request.json();

    if (!irataNo) {
      return NextResponse.json({ message: 'Numéro IRATA manquant' }, { status: 400 });
    }

    // Sauvegarder le numéro IRATA global
    await fs.mkdir(DATA_PATH, { recursive: true });
    await fs.writeFile(GLOBAL_IRATA_FILE, JSON.stringify({ irataNo, updatedAt: new Date().toISOString() }), 'utf8');

    // Mettre à jour tous les documents existants qui n'ont pas encore de numéro IRATA
    try {
      const raw = await fs.readFile(FILE_PATH, 'utf8');
      const submissions = JSON.parse(raw || '[]');
      
      let updated = false;
      const updatedSubmissions = submissions.map((submission: any) => {
        if (!submission.irataNo) {
          updated = true;
          return { ...submission, irataNo };
        }
        return submission;
      });

      if (updated) {
        await fs.writeFile(FILE_PATH, JSON.stringify(updatedSubmissions, null, 2), 'utf8');
      }
    } catch (error) {
      // Si le fichier des soumissions n'existe pas encore, ce n'est pas grave
      console.log('Aucune soumission existante à mettre à jour');
    }

    return NextResponse.json({ 
      message: 'Numéro IRATA global mis à jour avec succès',
      irataNo
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour du numéro IRATA global:', error);
    return NextResponse.json({ message: 'Erreur interne du serveur' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session as any).user?.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    try {
      const raw = await fs.readFile(GLOBAL_IRATA_FILE, 'utf8');
      const data = JSON.parse(raw);
      return NextResponse.json(data);
    } catch (error) {
      return NextResponse.json({ irataNo: null });
    }

  } catch (error) {
    console.error('Erreur lors de la récupération du numéro IRATA global:', error);
    return NextResponse.json({ message: 'Erreur interne du serveur' }, { status: 500 });
  }
}
