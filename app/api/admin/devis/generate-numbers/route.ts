import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from 'lib/prisma';

// Fonction pour générer le numéro de devis: CI.DEV YYMM 000
async function generateDevisNumber(): Promise<string> {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2); // 25 pour 2025
  const month = (now.getMonth() + 1).toString().padStart(2, '0'); // 09 pour septembre
  const yearMonth = year + month; // 2509
  
  // Compter tous les devis créés cette ANNÉE (comptage global annuel)
  const startOfYear = new Date(now.getFullYear(), 0, 1); // 1er janvier
  const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999); // 31 décembre
  
  const count = await prisma.devis.count({
    where: {
      createdAt: {
        gte: startOfYear,
        lte: endOfYear
      }
    }
  });
  
  const nextNumber = (count + 1).toString().padStart(3, '0');
  return `CI.DEV ${yearMonth} ${nextNumber}`;
}

// Fonction pour générer la référence par session: CI.DES YYMM 000
async function generateSessionReference(sessionString: string): Promise<string> {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const yearMonth = year + month;
  
  // Compter les devis pour cette session spécifique cette ANNÉE (comptage par session annuel)
  const startOfYear = new Date(now.getFullYear(), 0, 1); // 1er janvier
  const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999); // 31 décembre
  
  const sessionCount = await prisma.devis.count({
    where: {
      createdAt: {
        gte: startOfYear,
        lte: endOfYear
      },
      demande: {
        session: sessionString
      }
    }
  });
  
  const nextSessionNumber = (sessionCount + 1).toString().padStart(3, '0');
  return `CI.DES ${yearMonth} ${nextSessionNumber}`;
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session?.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const sessionString = searchParams.get('session');

    if (!sessionString) {
      return NextResponse.json(
        { message: 'Le paramètre session est requis' },
        { status: 400 }
      );
    }

    const numeroDevis = await generateDevisNumber();
    const referenceSession = await generateSessionReference(sessionString);

    return NextResponse.json({
      numeroDevis,
      referenceSession
    });
  } catch (error) {
    console.error('Erreur lors de la génération des numéros:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la génération des numéros' },
      { status: 500 }
    );
  }
}
