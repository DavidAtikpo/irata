import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from 'lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Récupérer l'utilisateur avec ses sessions de formation
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id
      },
      include: {
        trainingSessions: {
          where: {
            status: 'ACTIVE'
          },
          orderBy: {
            startDate: 'desc'
          },
          take: 1 // Prendre la session la plus récente
        }
      }
    });

    // Récupérer la session de l'utilisateur
    const userSessionName = user?.trainingSessions[0]?.name;

    // Construire la condition where pour récupérer les Toolbox Talks
    let whereCondition: any = {
      isPublished: true
    };

    // Si l'utilisateur a une session active, filtrer par cette session
    if (userSessionName) {
      whereCondition.session = userSessionName;
    }

    // Récupérer les Toolbox Talks publiés pour la session de l'utilisateur
    const records = await prisma.toolboxTalkRecord.findMany({
      where: whereCondition,
      orderBy: { publishedAt: 'desc' },
      include: {
        signatures: {
          where: {
            userId: session.user.id
          },
          select: {
            id: true,
            signedAt: true
          }
        }
      }
    });

    // Ajouter une propriété pour indiquer si l'utilisateur a signé
    const recordsWithSignatureStatus = records.map((record: any) => ({
      ...record,
      userHasSigned: record.signatures.length > 0,
      userSignature: record.signatures[0] || null,
      // Ajouter les informations de session de l'utilisateur
      userSession: {
        userId: session.user?.id || '',
        userName: `${session.user?.prenom || ''} ${session.user?.nom || ''}`.trim(),
        userEmail: session.user?.email || '',
        sessionName: userSessionName || ''
      },
      // Ajouter le nom de la session du Toolbox Talk pour affichage
      toolboxSessionName: userSessionName || record.session || 'N/A'
    }));

    return NextResponse.json({
      data: recordsWithSignatureStatus,
      hasSession: !!userSessionName,
      sessionName: userSessionName || null,
      message: !userSessionName ? 'Aucune session de formation active trouvée - Affichage de tous les Toolbox Talks publiés' : null
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des Toolbox Talks:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération' },
      { status: 500 }
    );
  }
}
