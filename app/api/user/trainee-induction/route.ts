import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { promises as fs } from 'fs';
import { join } from 'path';

const DATA_PATH = join(process.cwd(), 'data');
const TRAINEE_INDUCTION_FORMS_FILE = 'trainee-induction-forms.json';
const TRAINEE_SIGNATURES_FILE = 'trainee-induction-signatures.json';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Récupérer l'utilisateur et sa session de formation
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        demandes: {
          select: {
            id: true,
            session: true,
            statut: true,
            createdAt: true
          }
        }
      }
    });

    if (!user || !user.demandes || user.demandes.length === 0) {
      return NextResponse.json([]);
    }

    const userSessionIds = user.demandes.map(d => d.id);

    // Lire les documents d'induction publiés
    let documentsData: any[] = [];
    try {
      const fileContent = await fs.readFile(join(DATA_PATH, TRAINEE_INDUCTION_FORMS_FILE), 'utf-8');
      documentsData = JSON.parse(fileContent);
    } catch (error) {
      return NextResponse.json([]);
    }

    // Filtrer les documents pour les sessions de l'utilisateur et qui sont publiés
    const availableDocuments = documentsData.filter((doc: any) => 
      userSessionIds.includes(doc.sessionId) && 
      doc.status === 'published_to_trainees'
    );

    // Lire les signatures existantes
    let signaturesData: any[] = [];
    try {
      const signaturesContent = await fs.readFile(join(DATA_PATH, TRAINEE_SIGNATURES_FILE), 'utf-8');
      signaturesData = JSON.parse(signaturesContent);
    } catch (error) {
      signaturesData = [];
    }

    // Ajouter les informations de signature pour chaque document
    const documentsWithSignatureStatus = availableDocuments.map((doc: any) => {
      const userSignature = signaturesData.find((sig: any) => 
        sig.documentId === doc.id && sig.userId === user.id
      );

      const sessionInfo = user.demandes!.find(d => d.id === doc.sessionId);

      return {
        id: doc.id,
        sessionId: doc.sessionId,
        sessionName: sessionInfo?.session || 'Session inconnue',
        courseDate: doc.courseDate,
        courseLocation: doc.courseLocation,
        diffusion: doc.diffusion,
        copie: doc.copie,
        adminSignature: doc.adminSignature,
        status: doc.status,
        userHasSigned: !!userSignature,
        userSignature: userSignature?.signature || null
      };
    });

    return NextResponse.json(documentsWithSignatureStatus);

  } catch (error) {
    console.error('Erreur lors de la récupération des documents:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
