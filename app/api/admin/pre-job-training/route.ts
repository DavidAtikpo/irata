import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { promises as fs } from 'fs';
import { join } from 'path';

const DATA_PATH = join(process.cwd(), 'data');
const PRE_JOB_TRAINING_FORMS_FILE = join(DATA_PATH, 'pre-job-training-forms.json');

// Interface pour le formulaire
interface PreJobTrainingForm {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  sessionName: string;
  session: string;
  permitNumber: string;
  permitType: {
    cold: boolean;
    hot: boolean;
    notFlame: boolean;
    flame: boolean;
  };
  taskDescription: string;
  incidentIdentification: string;
  consequences: string;
  securityMeasures: string;
  attendees: Array<{
    position: string;
    name: string;
    signatures: Record<string, string>;
  }>;
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
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

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification de l'admin
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Vérifier si l'utilisateur est admin
    // if (session.user.role !== 'admin') {
    //   return NextResponse.json(
    //     { error: 'Accès refusé - droits administrateur requis' },
    //     { status: 403 }
    //   );
    // }

    // Récupérer les formulaires depuis le fichier JSON
    let formsData: any[] = [];
    try {
      const fileContent = await fs.readFile(PRE_JOB_TRAINING_FORMS_FILE, 'utf-8');
      formsData = JSON.parse(fileContent);
    } catch (error) {
      // Si le fichier n'existe pas, on commence avec un tableau vide
      console.log('Fichier pre-job-training-forms.json non trouvé, création d\'un nouveau fichier');
      await fs.writeFile(PRE_JOB_TRAINING_FORMS_FILE, JSON.stringify([], null, 2));
    }

    // Récupérer les profils utilisateurs et sessions depuis Prisma
    const userProfiles = await getUserProfiles();
    const userSessions = await getUserSessions();

    // Créer des maps pour un accès rapide
    const userProfileMap = new Map(userProfiles.map(user => [user.id, user]));
    const userSessionMap = new Map(userSessions.map(session => [session.userId, session]));

    // Enrichir les données des formulaires avec les informations utilisateur
    const enrichedForms = formsData.map(form => {
      const userProfile = userProfileMap.get(form.userId);
      const userSession = userSessionMap.get(form.userId);
      
      const fullName = userProfile ? [userProfile.prenom, userProfile.nom].filter(Boolean).join(' ').trim() : '';
      
      return {
        ...form,
        userName: fullName || userProfile?.email || 'Utilisateur inconnu',
        userEmail: userProfile?.email || 'email@inconnu.com',
        sessionName: form.sessionName || userSession?.name || 'Session inconnue',
        createdAt: form.submittedAt || form.createdAt || new Date().toISOString(),
        updatedAt: form.submittedAt || form.updatedAt || new Date().toISOString()
      };
    });

    // Trier par date de création (plus récent en premier)
    enrichedForms.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json(enrichedForms);

  } catch (error) {
    console.error('Erreur lors de la récupération des formulaires:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const formData = await request.json();

    // Lire les formulaires existants
    let formsData: any[] = [];
    try {
      const fileContent = await fs.readFile(PRE_JOB_TRAINING_FORMS_FILE, 'utf-8');
      formsData = JSON.parse(fileContent);
    } catch (error) {
      // Si le fichier n'existe pas, on commence avec un tableau vide
      console.log('Fichier pre-job-training-forms.json non trouvé, création d\'un nouveau fichier');
    }

    // Créer un nouveau formulaire
    const newForm = {
      id: `form_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: session.user?.id || 'unknown',
      ...formData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Ajouter le nouveau formulaire
    formsData.push(newForm);

    // Sauvegarder dans le fichier JSON
    await fs.writeFile(PRE_JOB_TRAINING_FORMS_FILE, JSON.stringify(formsData, null, 2));

    return NextResponse.json(
      { message: 'Formulaire sauvegardé avec succès', id: newForm.id },
      { status: 201 }
    );

  } catch (error) {
    console.error('Erreur lors de la sauvegarde du formulaire:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la sauvegarde' },
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
    const formId = searchParams.get('id');

    if (!formId) {
      return NextResponse.json(
        { error: 'ID du formulaire requis' },
        { status: 400 }
      );
    }

    // Lire les formulaires existants
    let formsData: any[] = [];
    try {
      const fileContent = await fs.readFile(PRE_JOB_TRAINING_FORMS_FILE, 'utf-8');
      formsData = JSON.parse(fileContent);
    } catch (error) {
      return NextResponse.json(
        { error: 'Fichier de données non trouvé' },
        { status: 404 }
      );
    }

    // Filtrer le formulaire à supprimer
    const filteredForms = formsData.filter(form => form.id !== formId);

    if (filteredForms.length === formsData.length) {
      return NextResponse.json(
        { error: 'Formulaire non trouvé' },
        { status: 404 }
      );
    }

    // Sauvegarder les formulaires mis à jour
    await fs.writeFile(PRE_JOB_TRAINING_FORMS_FILE, JSON.stringify(filteredForms, null, 2));

    return NextResponse.json(
      { message: 'Formulaire supprimé avec succès' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Erreur lors de la suppression du formulaire:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression' },
      { status: 500 }
    );
  }
}
