import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    if (session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès réservé aux administrateurs' }, { status: 403 });
    }

    // Récupérer tous les diplômes
    // TODO: Exécuter la migration Prisma avant d'utiliser: npx prisma migrate dev --name add_diplome_and_equipment_qr_models
    const diplomes = await (prisma as any).diplome.findMany({
      include: {
        stagiaire: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true
          }
        },
        generePar: {
          select: {
            id: true,
            nom: true,
            prenom: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Générer les URLs pour chaque diplôme
    const baseUrl = process.env.NEXTAUTH_URL || 'https://www.a-finpart.com';
    const diplomesAvecUrl = diplomes.map((diplome: any) => ({
      ...diplome,
      url: `${baseUrl}/diplome/${diplome.qrCode}`
    }));

    return NextResponse.json(diplomesAvecUrl);

  } catch (error) {
    console.error('Erreur lors de la récupération des diplômes:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' }, 
      { status: 500 }
    );
  }
}

