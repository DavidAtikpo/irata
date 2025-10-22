import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { PrismaClient } from '@prisma/client';
import { nanoid } from 'nanoid';

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

    const body = await request.json();
    const {
      stagiaireId,
      nom,
      prenom,
      formation,
      session: sessionFormation,
      dateObtention,
      photoUrl,
      pdfUrl
    } = body;

    // Validation
    if (!stagiaireId || !nom || !prenom || !formation || !sessionFormation || !dateObtention) {
      return NextResponse.json({ 
        error: 'Données manquantes: stagiaireId, nom, prenom, formation, session et dateObtention sont requis' 
      }, { status: 400 });
    }

    // Vérifier que le stagiaire existe
    const stagiaire = await prisma.user.findUnique({
      where: { id: stagiaireId }
    });

    if (!stagiaire) {
      return NextResponse.json({ error: 'Stagiaire non trouvé' }, { status: 404 });
    }

    // Générer un code QR unique
    const qrCode = nanoid(12); // Code de 12 caractères

    // TODO: Exécuter la migration Prisma avant d'utiliser
    // Créer le diplôme
    const diplome = await (prisma as any).diplome.create({
      data: {
        qrCode,
        stagiaireId,
        nom,
        prenom,
        formation,
        session: sessionFormation,
        dateObtention: new Date(dateObtention),
        photoUrl: photoUrl || null,
        pdfUrl: pdfUrl || null,
        genereParId: session.user.id
      },
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

    // Générer l'URL du QR code
    const baseUrl = process.env.NEXTAUTH_URL || 'https://www.a-finpart.com';
    const diplomeUrl = `${baseUrl}/diplome/${qrCode}`;

    return NextResponse.json({ 
      success: true,
      message: 'Diplôme généré avec succès',
      diplome: {
        ...diplome,
        url: diplomeUrl
      }
    });

  } catch (error) {
    console.error('Erreur lors de la génération du diplôme:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' }, 
      { status: 500 }
    );
  }
}

