import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from '../../../../lib/prisma';
import { promises as fs } from 'fs';
import { join } from 'path';

const DATA_PATH = join(process.cwd(), 'data');
const TRAINEE_SIGNATURES_FILE = 'trainee-induction-signatures.json';

interface TraineeSignature {
  id: string;
  documentId: string;
  sessionId: string;
  userId: string;
  signature: string;
  signedAt: string;
}

interface UserProfile {
  id: string;
  prenom?: string;
  nom?: string;
  email: string;
}

interface SessionProfile {
  id: string;
  session: string;
}

async function getUserProfiles(): Promise<UserProfile[]> {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        nom: true,
        prenom: true
      }
    });

    return users.map(user => ({
      id: user.id,
      prenom: user.prenom || undefined,
      nom: user.nom || undefined,
      email: user.email
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération des profils utilisateurs:', error);
    return [];
  }
}

async function getSessionProfiles(): Promise<SessionProfile[]> {
  try {
    const sessions = await prisma.demande.findMany({
      select: {
        id: true,
        session: true
      }
    });

    return sessions.map(session => ({
      id: session.id,
      session: session.session
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération des sessions:', error);
    return [];
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Lire les signatures des stagiaires
    let signaturesData: TraineeSignature[] = [];
    try {
      const fileContent = await fs.readFile(join(DATA_PATH, TRAINEE_SIGNATURES_FILE), 'utf-8');
      signaturesData = JSON.parse(fileContent);
    } catch (error) {
      // Fichier n'existe pas encore
      signaturesData = [];
    }

    // Récupérer les profils utilisateurs et sessions
    const userProfiles = await getUserProfiles();
    const sessionProfiles = await getSessionProfiles();

    const userProfileMap = new Map(userProfiles.map(user => [user.id, user]));
    const sessionProfileMap = new Map(sessionProfiles.map(session => [session.id, session]));

    // Enrichir les données
    const enrichedSignatures = signaturesData.map(signature => {
      const userProfile = userProfileMap.get(signature.userId);
      const sessionProfile = sessionProfileMap.get(signature.sessionId);
      
      const fullName = userProfile ? [userProfile.prenom, userProfile.nom].filter(Boolean).join(' ').trim() : '';
      
      return {
        ...signature,
        userName: fullName || userProfile?.email || 'Utilisateur inconnu',
        userEmail: userProfile?.email || 'email@inconnu.com',
        sessionName: sessionProfile?.session || 'Session inconnue'
      };
    });

    // Trier par date de signature (plus récentes en premier)
    enrichedSignatures.sort((a, b) => new Date(b.signedAt).getTime() - new Date(a.signedAt).getTime());

    return NextResponse.json(enrichedSignatures);

  } catch (error) {
    console.error('Erreur lors de la récupération des signatures:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}