import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from 'lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Récupérer les signatures depuis la base de données
    const userSignatures = await prisma.attendanceSignature.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
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

// Fonction pour récupérer les signatures par session
async function getSignaturesBySession(sessionName: string, userId: string) {
  console.log('Récupération des signatures pour la session:', sessionName);

  // Récupérer les signatures pour cette session spécifique
  console.log('🔍 Recherche des signatures pour userId:', userId, 'sessionName:', sessionName);
  const sessionSignatures = await (prisma as any).adminAttendanceSession.findMany({
    where: {
      userId: userId,
      sessionName: sessionName
    },
    include: {
      user: {
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

  console.log('Signatures trouvées pour la session:', sessionSignatures.length);
  console.log('Détail des signatures trouvées:', sessionSignatures.map((s: any) => s.signatureKey));

  // Récupérer les données de signature correspondantes
  const signaturesObject: Record<string, string> = {};
  
  for (const sessionSig of sessionSignatures) {
    const signatureData = await prisma.attendanceSignature.findUnique({
      where: {
        userId_signatureKey: {
          userId: userId,
          signatureKey: sessionSig.signatureKey
        }
      }
    });
    
    if (signatureData) {
      signaturesObject[sessionSig.signatureKey] = signatureData.signatureData;
      console.log(`✅ Signature ${sessionSig.signatureKey} trouvée pour la session ${sessionName}`);
    } else {
      console.log(`⚠️ Signature ${sessionSig.signatureKey} non trouvée dans AttendanceSignature`);
    }
  }

  console.log('Signatures récupérées:', Object.keys(signaturesObject));
  console.log('Total signatures retournées:', Object.keys(signaturesObject).length);
  return signaturesObject;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const { signatureKey, signatureData, userId, sessionName } = body;

    // Si sessionName est fourni sans signatureKey, c'est une demande de récupération
    if (sessionName && !signatureKey) {
      const signatures = await getSignaturesBySession(sessionName, session.user.id);
      return NextResponse.json({ 
        signatures: signatures,
        count: Object.keys(signatures).length,
        sessionName: sessionName
      });
    }

    if (!signatureKey || !signatureData) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
    }

    // Vérifier que l'utilisateur ne peut modifier que ses propres signatures
    if (userId !== session.user.id) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // Utiliser upsert pour créer ou mettre à jour la signature
    const signature = await prisma.attendanceSignature.upsert({
      where: {
        userId_signatureKey: {
          userId: session.user.id,
          signatureKey: signatureKey
        }
      },
      update: {
        signatureData: signatureData,
        updatedAt: new Date()
      },
      create: {
        userId: session.user.id,
        signatureKey: signatureKey,
        signatureData: signatureData
      }
    });

    // Si c'est un admin et qu'une session est fournie, créer une entrée dans une table d'association
    if (sessionName && session.user.role === 'ADMIN') {
      try {
        // Créer une entrée dans une table d'association admin-session
        await (prisma as any).adminAttendanceSession.upsert({
          where: {
            userId_signatureKey: {
              userId: session.user.id,
              signatureKey: signatureKey
            }
          },
          update: {
            sessionName: sessionName,
            updatedAt: new Date()
          },
          create: {
            userId: session.user.id,
            signatureKey: signatureKey,
            sessionName: sessionName
          }
        });
        console.log(`Session ${sessionName} associée à l'admin ${session.user.id} pour la signature ${signatureKey}`);
      } catch (error) {
        console.error('Erreur lors de l\'association admin-session:', error);
      }
    }

    return NextResponse.json({ 
      message: 'Signature d\'attendance sauvegardée avec succès',
      signature: {
        id: signature.id,
        userId: signature.userId,
        signatureKey: signature.signatureKey,
        signatureData: signature.signatureData,
        timestamp: signature.createdAt.toISOString()
      }
    });

  } catch (error) {
    console.error('Erreur lors de la sauvegarde de la signature d\'attendance:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
