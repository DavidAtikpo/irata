import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { promises as fs } from 'fs';
import { join } from 'path';

const DATA_PATH = join(process.cwd(), 'data');
const ATTENDANCE_SIGNATURES_FILE = join(DATA_PATH, 'attendance-signatures.json');

interface AttendanceSignature {
  userId: string;
  signatureKey: string;
  signatureData: string;
  timestamp: string;
  generatedFromFollowUp?: boolean;
}

interface UserProfile {
  id: string;
  prenom?: string;
  nom?: string;
  email: string;
}

interface TrainingSession {
  userId: string;
  name: string;
}

interface UserAttendanceData {
  userId: string;
  userName: string;
  userEmail: string;
  sessionName?: string;
  signatures: Record<string, {
    signatureData: string;
    timestamp: string;
    generatedFromFollowUp?: boolean;
  }>;
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

async function getUserSessions(): Promise<TrainingSession[]> {
  try {
    const demandes = await prisma.demande.findMany({
      select: {
        userId: true,
        session: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Grouper par utilisateur pour récupérer la session la plus récente
    const sessionMap = new Map<string, string>();
    demandes.forEach(demande => {
      if (demande.session && !sessionMap.has(demande.userId)) {
        sessionMap.set(demande.userId, demande.session);
      }
    });

    return Array.from(sessionMap.entries()).map(([userId, session]) => ({
      userId,
      name: session
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération des sessions:', error);
    return [];
  }
}

async function ensureDataFile() {
  try {
    await fs.mkdir(DATA_PATH, { recursive: true });
    try {
      await fs.access(ATTENDANCE_SIGNATURES_FILE);
    } catch {
      await fs.writeFile(ATTENDANCE_SIGNATURES_FILE, JSON.stringify([]), 'utf8');
    }
  } catch (err) {
    console.error('Error ensuring data file:', err);
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Vérifier l'authentification admin
    if (!session || (session as any).user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    await ensureDataFile();

    // Récupérer toutes les signatures d'attendance
    const raw = await fs.readFile(ATTENDANCE_SIGNATURES_FILE, 'utf8');
    const signatures: AttendanceSignature[] = JSON.parse(raw || '[]');

    // Récupérer les profils utilisateurs et sessions
    const userProfiles = await getUserProfiles();
    const userSessions = await getUserSessions();

    // Organiser les données par utilisateur
    const userAttendanceMap = new Map<string, UserAttendanceData>();

    // Initialiser avec tous les utilisateurs (même ceux sans signatures)
    userProfiles.forEach(profile => {
      const session = userSessions.find(s => s.userId === profile.id);
      const userName = [profile.prenom, profile.nom].filter(Boolean).join(' ').trim() || profile.email;
      
      userAttendanceMap.set(profile.id, {
        userId: profile.id,
        userName,
        userEmail: profile.email,
        sessionName: session?.name,
        signatures: {}
      });
    });

    // Ajouter les signatures
    signatures.forEach(signature => {
      const userData = userAttendanceMap.get(signature.userId);
      if (userData) {
        userData.signatures[signature.signatureKey] = {
          signatureData: signature.signatureData,
          timestamp: signature.timestamp,
          generatedFromFollowUp: signature.generatedFromFollowUp
        };
      } else {
        // Utilisateur non trouvé dans les profils, créer une entrée basique
        userAttendanceMap.set(signature.userId, {
          userId: signature.userId,
          userName: `Utilisateur ${signature.userId}`,
          userEmail: 'email@unknown.com',
          signatures: {
            [signature.signatureKey]: {
              signatureData: signature.signatureData,
              timestamp: signature.timestamp,
              generatedFromFollowUp: signature.generatedFromFollowUp
            }
          }
        });
      }
    });

    // Convertir en array et trier par nom
    const attendanceData = Array.from(userAttendanceMap.values())
      .sort((a, b) => a.userName.localeCompare(b.userName));

    // Calculer quelques statistiques
    const totalUsers = attendanceData.length;
    const totalSignatures = signatures.length;
    const usersWithSignatures = attendanceData.filter(user => 
      Object.keys(user.signatures).length > 0
    ).length;

    return NextResponse.json({
      attendanceData,
      statistics: {
        totalUsers,
        totalSignatures,
        usersWithSignatures,
        completionRate: totalUsers > 0 ? Math.round((usersWithSignatures / totalUsers) * 100) : 0
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des données d\'attendance:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Vérifier l'authentification admin
    if (!session || (session as any).user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { userId, signatureKey } = await request.json();

    if (!userId || !signatureKey) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 });
    }

    await ensureDataFile();
    const raw = await fs.readFile(ATTENDANCE_SIGNATURES_FILE, 'utf8');
    const signatures: AttendanceSignature[] = JSON.parse(raw || '[]');

    // Supprimer la signature spécifique
    const filteredSignatures = signatures.filter(sig => 
      !(sig.userId === userId && sig.signatureKey === signatureKey)
    );

    await fs.writeFile(ATTENDANCE_SIGNATURES_FILE, JSON.stringify(filteredSignatures, null, 2), 'utf8');

    return NextResponse.json({ 
      message: 'Signature supprimée avec succès',
      deletedCount: signatures.length - filteredSignatures.length
    });

  } catch (error) {
    console.error('Erreur lors de la suppression de la signature:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
