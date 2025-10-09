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

    // Récupérer les Toolbox Talks publiés
    const records = await prisma.toolboxTalkRecord.findMany({
      where: {
        isPublished: true
      },
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
        userEmail: session.user?.email || ''
      }
    }));

    return NextResponse.json(recordsWithSignatureStatus);

  } catch (error) {
    console.error('Erreur lors de la récupération des Toolbox Talks:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération' },
      { status: 500 }
    );
  }
}
