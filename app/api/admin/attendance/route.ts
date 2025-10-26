import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from 'lib/prisma';

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
  role?: string;
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
        prenom: true,
        role: true
      }
    });

    return users.map(user => ({
      id: user.id,
      prenom: user.prenom || undefined,
      nom: user.nom || undefined,
      email: user.email,
      role: (user as any).role
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

async function getAttendanceSignatures(): Promise<AttendanceSignature[]> {
  try {
    const signatures = await (prisma as any).attendanceSignature.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    return signatures.map((sig: any) => ({
      userId: sig.userId,
      signatureKey: sig.signatureKey,
      signatureData: sig.signatureData,
      timestamp: sig.createdAt.toISOString(),
      generatedFromFollowUp: false // Les signatures de la base sont manuelles
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération des signatures:', error);
    return [];
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Vérifier l'authentification admin
    if (!session || (session as any).user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Récupérer toutes les signatures d'attendance depuis la base de données
    const signatures = await getAttendanceSignatures();

    // Récupérer les profils utilisateurs et sessions
    const userProfiles = await getUserProfiles();
    const userSessions = await getUserSessions();
    
    // Récupérer les demandes pour associer les admins aux sessions
    const demandes = await prisma.demande.findMany({
      where: {
        statut: { in: ['EN_ATTENTE', 'VALIDE'] }
      },
      select: {
        userId: true,
        session: true,
        statut: true
      }
    });
    // Récupérer les signatures d'admin avec leur session associée
    const adminSignatures = await prisma.attendanceSignature.findMany({
      where: {
        user: {
          role: 'ADMIN'
        }
      },
      include: {
        user: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    

    // Récupérer les associations admin-session depuis la nouvelle table
    const adminSessionAssociations = await (prisma as any).adminAttendanceSession.findMany({
      include: {
        user: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    // Créer une map des sessions d'admin basée sur les associations
    const adminSessionMap = new Map<string, string>();
    adminSessionAssociations.forEach((association: any) => {
      if (association.user.role === 'ADMIN') {
        adminSessionMap.set(association.userId, association.sessionName);
      }
    });

    // Organiser les données par utilisateur
    const userAttendanceMap = new Map<string, UserAttendanceData>();

    // Initialiser avec tous les utilisateurs (même ceux sans signatures)
    userProfiles.forEach(profile => {
      const session = userSessions.find(s => s.userId === profile.id);
      const userName = [profile.prenom, profile.nom].filter(Boolean).join(' ').trim() || profile.email;
      
      // Ajouter un indicateur pour l'admin
      const displayName = profile.role === 'ADMIN' ? `[ADMIN] ${userName}` : userName;
      
      // Pour les admins, utiliser la session de leur demande
      let sessionName = session?.name;
      if (profile.role === 'ADMIN') {
        const adminSession = adminSessionMap.get(profile.id);
        if (adminSession) {
          sessionName = adminSession;
        }
      }
      
      userAttendanceMap.set(profile.id, {
        userId: profile.id,
        userName: displayName,
        userEmail: profile.email,
        sessionName: sessionName,
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

    // Supprimer la signature depuis la base de données
    const deletedSignature = await (prisma as any).attendanceSignature.deleteMany({
      where: {
        userId: userId,
        signatureKey: signatureKey
      }
    });

    return NextResponse.json({ 
      message: 'Signature supprimée avec succès',
      deletedCount: deletedSignature.count
    });

  } catch (error) {
    console.error('Erreur lors de la suppression de la signature:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
