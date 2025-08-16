import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { promises as fs } from 'fs';
import { join } from 'path';

const DATA_PATH = join(process.cwd(), 'data');
const TRAINEE_INDUCTION_FORMS_FILE = join(DATA_PATH, 'trainee-induction-forms.json');

interface TraineeInductionForm {
  id: string;
  sessionId: string;
  sessionName: string;
  courseDate: string;
  courseLocation: string;
  diffusion: string;
  copie: string;
  adminSignature: string;
  adminSignedAt: string;
  status: 'pending' | 'admin_signed' | 'sent_to_trainees';
  createdAt: string;
}

interface SessionProfile {
  id: string;
  session?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

async function getSessionProfiles(): Promise<SessionProfile[]> {
  try {
    const sessions = await prisma.demande.findMany({
      select: {
        id: true,
        session: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return sessions.map(session => ({
      id: session.id,
      session: session.session || undefined,
      createdAt: session.createdAt || undefined,
      updatedAt: session.updatedAt || undefined
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

    let formsData: any[] = [];
    try {
      const fileContent = await fs.readFile(TRAINEE_INDUCTION_FORMS_FILE, 'utf-8');
      formsData = JSON.parse(fileContent);
    } catch (error) {
      console.log('Fichier trainee-induction-forms.json non trouvé, création d\'un nouveau fichier');
      await fs.writeFile(TRAINEE_INDUCTION_FORMS_FILE, JSON.stringify([], null, 2));
    }

    const sessionProfiles = await getSessionProfiles();
    const sessionProfileMap = new Map(sessionProfiles.map(session => [session.id, session]));

    const enrichedForms = formsData.map(form => {
      const sessionProfile = sessionProfileMap.get(form.sessionId);
      
      return {
        ...form,
        sessionName: sessionProfile?.session || 'Session inconnue',
        createdAt: form.createdAt || new Date().toISOString()
      };
    });

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

    let formsData: any[] = [];
    try {
      const fileContent = await fs.readFile(TRAINEE_INDUCTION_FORMS_FILE, 'utf-8');
      formsData = JSON.parse(fileContent);
    } catch (error) {
      console.log('Fichier trainee-induction-forms.json non trouvé, création d\'un nouveau fichier');
    }

    const newForm = {
      id: `induction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sessionId: formData.sessionId,
      courseDate: formData.courseDate,
      courseLocation: formData.courseLocation,
      diffusion: formData.diffusion || '',
      copie: formData.copie || '',
      adminSignature: '',
      adminSignedAt: '',
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    formsData.push(newForm);
    await fs.writeFile(TRAINEE_INDUCTION_FORMS_FILE, JSON.stringify(formsData, null, 2));

    return NextResponse.json(
      { message: 'Formulaire d\'induction créé avec succès', id: newForm.id },
      { status: 201 }
    );

  } catch (error) {
    console.error('Erreur lors de la création du formulaire:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création' },
      { status: 500 }
    );
  }
}
