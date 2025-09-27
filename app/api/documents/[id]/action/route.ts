import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('🔍 API Action - Début de la requête');
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      console.log('❌ API Action - Pas de session utilisateur');
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { action } = await request.json();
    const { id: documentId } = await params;
    const userId = session.user.id;
    
    console.log('🔍 API Action - Données reçues:', { action, documentId, userId });

    // Vérifier que le document existe
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        user: true,
        devis: true
      }
    });

    if (!document) {
      return NextResponse.json({ error: 'Document non trouvé' }, { status: 404 });
    }

    // Vérifier que l'utilisateur a accès au document
    if (!document.public && document.userId !== userId) {
      // Vérifier si l'utilisateur a un contrat validé lié à ce devis
      if (document.devisId) {
        const contrat = await prisma.contrat.findFirst({
          where: {
            devisId: document.devisId,
            userId: userId,
            statut: 'VALIDE'
          }
        });
        
        if (!contrat) {
          return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
        }
      } else {
        return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
      }
    }

    // Récupérer l'adresse IP et l'user agent
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Enregistrer ou mettre à jour l'action
    const documentAction = await prisma.documentAction.upsert({
      where: {
        documentId_userId_action: {
          documentId,
          userId,
          action
        }
      },
      update: {
        timestamp: new Date(),
        ipAddress,
        userAgent
      },
      create: {
        documentId,
        userId,
        action,
        ipAddress,
        userAgent
      }
    });

    return NextResponse.json({ 
      success: true, 
      action: documentAction,
      message: `Action ${action} enregistrée avec succès` 
    });

  } catch (error) {
    console.error('Erreur lors de l\'enregistrement de l\'action:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' }, 
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id: documentId } = await params;
    const userId = session.user.id;

    // Récupérer les actions de l'utilisateur sur ce document
    const actions = await prisma.documentAction.findMany({
      where: {
        documentId,
        userId
      },
      orderBy: {
        timestamp: 'desc'
      }
    });

    return NextResponse.json({ actions });

  } catch (error) {
    console.error('Erreur lors de la récupération des actions:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' }, 
      { status: 500 }
    );
  }
}
