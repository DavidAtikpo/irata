import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { promises as fs } from 'fs';
import { join } from 'path';

const DATA_PATH = join(process.cwd(), 'data');
const ATTENDANCE_SIGNATURES_FILE = join(DATA_PATH, 'attendance-signatures.json');

interface AttendanceSignature {
  userId: string;
  signatureKey: string; // format: "Lundi-matin", "Mardi-soir", etc.
  signatureData: string;
  timestamp: string;
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
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    await ensureDataFile();
    const raw = await fs.readFile(ATTENDANCE_SIGNATURES_FILE, 'utf8');
    const allSignatures: AttendanceSignature[] = JSON.parse(raw || '[]');
    
    // Filtrer les signatures de l'utilisateur connecté
    const userSignatures = allSignatures.filter(sig => sig.userId === session.user.id);
    
    // Convertir en format object pour l'interface
    const signaturesObject: Record<string, string> = {};
    userSignatures.forEach(sig => {
      signaturesObject[sig.signatureKey] = sig.signatureData;
    });

    return NextResponse.json({ 
      signatures: signaturesObject,
      count: userSignatures.length 
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des signatures d\'attendance:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { signatureKey, signatureData, userId } = await request.json();

    if (!signatureKey || !signatureData) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
    }

    // Vérifier que l'utilisateur ne peut modifier que ses propres signatures
    if (userId !== session.user.id) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    await ensureDataFile();
    const raw = await fs.readFile(ATTENDANCE_SIGNATURES_FILE, 'utf8');
    const signatures: AttendanceSignature[] = JSON.parse(raw || '[]');

    // Rechercher une signature existante pour cette clé et cet utilisateur
    const existingIndex = signatures.findIndex(
      sig => sig.userId === session.user.id && sig.signatureKey === signatureKey
    );

    const newSignature: AttendanceSignature = {
      userId: session.user.id,
      signatureKey,
      signatureData,
      timestamp: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      // Mettre à jour la signature existante
      signatures[existingIndex] = newSignature;
    } else {
      // Ajouter une nouvelle signature
      signatures.push(newSignature);
    }

    await fs.writeFile(ATTENDANCE_SIGNATURES_FILE, JSON.stringify(signatures, null, 2), 'utf8');

    return NextResponse.json({ 
      message: 'Signature d\'attendance sauvegardée avec succès',
      signature: newSignature
    });

  } catch (error) {
    console.error('Erreur lors de la sauvegarde de la signature d\'attendance:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
