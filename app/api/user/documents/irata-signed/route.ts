import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { promises as fs } from 'fs';
import { join } from 'path';

const DATA_PATH = join(process.cwd(), 'data');
const FILE_PATH = join(DATA_PATH, 'irata-disclaimer-submissions.json');

interface SignedDocument {
  id: string;
  name: string | null;
  address: string | null;
  signature: string | null;
  session?: string | null;
  adminSignature: string | null;
  adminSignedAt: string | null;
  status: string;
  createdAt: string;
  sentAt?: string;
}

async function getUserSignedDocuments(userEmail: string): Promise<SignedDocument[]> {
  try {
    const raw = await fs.readFile(FILE_PATH, 'utf8');
    const submissions = JSON.parse(raw || '[]');
    
    // Filtrer les documents de l'utilisateur qui ont été signés par l'admin
    return submissions.filter((submission: any) => 
      submission.user?.email === userEmail && 
      (submission.status === 'signed' || submission.status === 'sent')
    );
  } catch (error) {
    console.error('Erreur lors de la lecture des documents:', error);
    return [];
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Récupérer l'email depuis les paramètres de requête ou utiliser celui de la session
    const url = new URL(request.url);
    const requestedEmail = url.searchParams.get('email');
    
    // Vérifier que l'utilisateur demande ses propres documents
    if (requestedEmail && requestedEmail !== session.user.email) {
      // Seuls les admins peuvent voir les documents d'autres utilisateurs
      if ((session as any).user?.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Accès refusé' },
          { status: 403 }
        );
      }
    }

    const userEmail = requestedEmail || session.user.email;
    const documents = await getUserSignedDocuments(userEmail);

    return NextResponse.json({ 
      documents,
      count: documents.length 
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des documents signés:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
