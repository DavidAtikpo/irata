import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from 'lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    // Vérifier si les tables existent en essayant une requête simple
    let toolboxTalks;
    try {
      toolboxTalks = await prisma.toolboxTalkRecord.findMany({
        where: {
          isPublished: true
        },
        include: {
          signatures: {
            include: {
            user: {
              select: {
                id: true,
                email: true,
                nom: true,
                prenom: true
              }
            }
            }
          }
        },
        orderBy: {
          publishedAt: 'desc'
        }
      });
    } catch (dbError) {
      console.error('Erreur de base de données:', dbError);
      // Si les tables n'existent pas, retourner un tableau vide
      return NextResponse.json([]);
    }

    // Formater les données pour l'admin
    const formattedData = toolboxTalks.map((record: any) => ({
      id: record.id,
      site: record.site,
      date: record.date,
      topic: record.topic,
      reason: record.reason,
      startTime: record.startTime,
      finishTime: record.finishTime,
      mattersRaised: record.mattersRaised,
      comments: record.comments,
      adminName: record.adminName,
      adminSignature: record.adminSignature,
      publishedAt: record.publishedAt,
      createdAt: record.createdAt,
      signatures: record.signatures.map((signature: any) => ({
        id: signature.id,
        userId: signature.userId,
        userName: signature.userName,
        userEmail: signature.user?.email,
        userFullName: `${signature.user?.prenom || ''} ${signature.user?.nom || ''}`.trim(),
        signature: signature.signature,
        signedAt: signature.signedAt
      }))
    }));

    return NextResponse.json(formattedData);

  } catch (error) {
    console.error('Erreur lors de la récupération des signatures:', error);
    console.error('Détails de l\'erreur:', {
      message: error instanceof Error ? error.message : 'Erreur inconnue',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { 
        message: 'Erreur lors de la récupération',
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}
