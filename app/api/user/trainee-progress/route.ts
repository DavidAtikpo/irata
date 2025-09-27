import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';
import { promises as fs } from 'fs';
import { join } from 'path';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Récupérer les vraies données de progression depuis la base de données
    const progress = await prisma.traineeProgress.findMany({
      where: {
        traineeId: session?.user?.id
      },
      select: {
        syllabusItem: true,
        traineeId: true,
        day: true,
        completed: true,
      },
      orderBy: [
        { syllabusItem: 'asc' },
        { day: 'asc' }
      ]
    });

    return NextResponse.json(progress);
  } catch (error) {
    console.error('Erreur lors de la récupération de la progression:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

async function generateAttendanceSignatures(traineeId: string, day: string, completed: boolean) {
  if (!completed) return; // Ne générer des signatures que si le jour est coché
  
  try {
    const DATA_PATH = join(process.cwd(), 'data');
    const ATTENDANCE_SIGNATURES_FILE = join(DATA_PATH, 'attendance-signatures.json');
    
    // Mapping des jours trainee-follow-up vers attendance
    const dayMapping: Record<string, string> = {
      'J1': 'Lundi',
      'J2': 'Mardi', 
      'J3': 'Mercredi',
      'J4': 'Jeudi',
      'J5': 'Vendredi'
    };
    
    const attendanceDay = dayMapping[day];
    if (!attendanceDay) return; // Seulement pour J1-J5
    
    // Créer le dossier data s'il n'existe pas
    await fs.mkdir(DATA_PATH, { recursive: true });
    
    // Lire les signatures existantes
    let signatures = [];
    try {
      const raw = await fs.readFile(ATTENDANCE_SIGNATURES_FILE, 'utf8');
      signatures = JSON.parse(raw || '[]');
    } catch {
      // Fichier n'existe pas encore
    }
    
    // Signature fictive pour indiquer la présence
    const fakeSignature = `data:image/svg+xml;base64,${Buffer.from(
      `<svg width="150" height="50" xmlns="http://www.w3.org/2000/svg">
        <text x="10" y="30" font-family="cursive" font-size="16" fill="blue">Présent ${day}</text>
       </svg>`
    ).toString('base64')}`;
    
    const timestamp = new Date().toISOString();
    
    // Créer signatures pour matin et soir
    const morningKey = `${attendanceDay}-matin`;
    const eveningKey = `${attendanceDay}-soir`;
    
    // Vérifier si les signatures existent déjà
    const existingMorning = signatures.findIndex(
      (sig: any) => sig.userId === traineeId && sig.signatureKey === morningKey
    );
    const existingEvening = signatures.findIndex(
      (sig: any) => sig.userId === traineeId && sig.signatureKey === eveningKey
    );
    
    const morningSignature = {
      userId: traineeId,
      signatureKey: morningKey,
      signatureData: fakeSignature,
      timestamp,
      generatedFromFollowUp: true
    };
    
    const eveningSignature = {
      userId: traineeId,
      signatureKey: eveningKey,
      signatureData: fakeSignature,
      timestamp,
      generatedFromFollowUp: true
    };
    
    if (existingMorning >= 0) {
      signatures[existingMorning] = morningSignature;
    } else {
      signatures.push(morningSignature);
    }
    
    if (existingEvening >= 0) {
      signatures[existingEvening] = eveningSignature;
    } else {
      signatures.push(eveningSignature);
    }
    
    // Sauvegarder
    await fs.writeFile(ATTENDANCE_SIGNATURES_FILE, JSON.stringify(signatures, null, 2), 'utf8');
    console.log(`Signatures d'attendance générées automatiquement pour ${attendanceDay}`);
    
    // Déclencher la signature automatique du Pre-Job Training pour le matin
    try {
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();
      
      // Récupérer le nom de l'utilisateur
      const user = await prisma.user.findUnique({
        where: { id: traineeId },
        select: { prenom: true, nom: true, email: true }
      });
      
      let userName = 'Utilisateur';
      if (user) {
        const fullName = [user.prenom, user.nom].filter(Boolean).join(' ').trim();
        userName = fullName || user.email || 'Utilisateur';
      }
      
      // Créer la signature Pre-Job Training automatique
      const existingSignature = await prisma.preJobTrainingSignature.findFirst({
        where: {
          day: attendanceDay,
          userId: traineeId
        }
      });

      if (existingSignature) {
        await prisma.preJobTrainingSignature.update({
          where: { id: existingSignature.id },
          data: {
            signatureData: fakeSignature,
            userName: userName,
            signedAt: new Date(),
            autoSigned: true
          }
        });
      } else {
        await prisma.preJobTrainingSignature.create({
          data: {
            day: attendanceDay,
            signatureData: fakeSignature,
            userId: traineeId,
            userName: userName,
            autoSigned: true
          }
        });
      }
      
      console.log(`Pre-Job Training signé automatiquement pour ${attendanceDay}`);
      await prisma.$disconnect();
      
    } catch (preJobError) {
      console.error('Erreur lors de la signature automatique du Pre-Job Training:', preJobError);
    }
    
  } catch (error) {
    console.error('Erreur lors de la génération des signatures d\'attendance:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { syllabusItem, traineeId, day, completed } = await request.json();
    
    // Validation des champs requis
    if (!syllabusItem || !traineeId || !day) {
      console.error('Champs manquants:', { syllabusItem, traineeId, day });
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
    }
    
    console.log('Mise à jour de la progression stagiaire:', { 
      syllabusItem, 
      traineeId, 
      day, 
      completed,
      updatedBy: session?.user?.email 
    });

    // Sauvegarder dans la base de données avec Prisma
    const updatedProgress = await prisma.traineeProgress.upsert({
      where: {
        syllabusItem_traineeId_day: {
          syllabusItem,
          traineeId,
          day
        }
      },
      update: { completed },
      create: { syllabusItem, traineeId, day, completed }
    });

    // Générer automatiquement les signatures d'attendance pour ce jour
    await generateAttendanceSignatures(traineeId, day, completed);

    return NextResponse.json(updatedProgress);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la progression:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
} 