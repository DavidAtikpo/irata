import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { PrismaClient } from '@prisma/client';
import { sendDiplomeEmail } from '@/lib/email';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    if (session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès réservé aux administrateurs' }, { status: 403 });
    }

    const { diplomeId } = await request.json();

    if (!diplomeId) {
      return NextResponse.json({ 
        error: 'Données manquantes: diplomeId est requis' 
      }, { status: 400 });
    }

    // TODO: Exécuter la migration Prisma avant d'utiliser
    // Récupérer le diplôme
    const diplome = await (prisma as any).diplome.findUnique({
      where: { id: diplomeId },
      include: {
        stagiaire: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true
          }
        }
      }
    });

    if (!diplome) {
      return NextResponse.json({ error: 'Diplôme non trouvé' }, { status: 404 });
    }

    // Générer l'URL du diplôme
    const baseUrl = process.env.NEXTAUTH_URL || 'https://www.a-finpart.com';
    const diplomeUrl = `${baseUrl}/diplome/${diplome.qrCode}`;

    // Envoyer l'email
    await sendDiplomeEmail(
      diplome.stagiaire.email,
      `${diplome.prenom} ${diplome.nom}`,
      diplome.formation,
      diplome.session,
      diplomeUrl,
      diplome.qrCode
    );

    return NextResponse.json({ 
      success: true,
      message: 'Email envoyé avec succès au stagiaire'
    });

  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi de l\'email' }, 
      { status: 500 }
    );
  }
}

