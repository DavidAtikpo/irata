import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { promises as fs } from 'fs';
import { join } from 'path';

const DATA_PATH = join(process.cwd(), 'data');
const TRAINEE_INDUCTION_FORMS_FILE = 'trainee-induction-forms.json';
const TRAINEE_SIGNATURES_FILE = 'trainee-induction-signatures.json';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { documentId, signature } = await request.json();

    if (!documentId || !signature) {
      return NextResponse.json(
        { error: 'ID du document et signature requis' },
        { status: 400 }
      );
    }

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier que le document existe et est disponible pour signature
    let documentsData: any[] = [];
    try {
      const fileContent = await fs.readFile(join(DATA_PATH, TRAINEE_INDUCTION_FORMS_FILE), 'utf-8');
      documentsData = JSON.parse(fileContent);
    } catch (error) {
      return NextResponse.json(
        { error: 'Document non trouvé' },
        { status: 404 }
      );
    }

    const document = documentsData.find((doc: any) => doc.id === documentId);
    if (!document) {
      return NextResponse.json(
        { error: 'Document non trouvé' },
        { status: 404 }
      );
    }

    if (document.status !== 'published_to_trainees') {
      return NextResponse.json(
        { error: 'Document non disponible pour signature' },
        { status: 400 }
      );
    }

    // Lire les signatures existantes
    let signaturesData: any[] = [];
    try {
      const signaturesContent = await fs.readFile(join(DATA_PATH, TRAINEE_SIGNATURES_FILE), 'utf-8');
      signaturesData = JSON.parse(signaturesContent);
    } catch (error) {
      signaturesData = [];
    }

    // Vérifier si l'utilisateur a déjà signé ce document
    const existingSignatureIndex = signaturesData.findIndex((sig: any) => 
      sig.documentId === documentId && sig.userId === user.id
    );

    const newSignature = {
      id: `signature_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      documentId,
      sessionId: document.sessionId,
      userId: user.id,
      signature,
      signedAt: new Date().toISOString()
    };

    if (existingSignatureIndex !== -1) {
      // Mettre à jour la signature existante
      signaturesData[existingSignatureIndex] = newSignature;
    } else {
      // Ajouter une nouvelle signature
      signaturesData.push(newSignature);
    }

    // Sauvegarder les signatures
    await fs.writeFile(join(DATA_PATH, TRAINEE_SIGNATURES_FILE), JSON.stringify(signaturesData, null, 2));

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Erreur lors de la signature:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
