import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Récupérer toutes les signatures avec les informations utilisateur et induction
    const signatures = await prisma.$queryRaw`
      SELECT 
        tis.id,
        tis."inductionId",
        ti."sessionId" as sessionName,
        tis."userId",
        u.prenom,
        u.nom,
        u.email,
        tis."userSignature",
        tis."createdAt"
      FROM "webirata"."TraineeInductionSignature" tis
      JOIN "webirata"."TraineeInduction" ti ON tis."inductionId" = ti.id
      JOIN "webirata"."User" u ON tis."userId" = u.id
      ORDER BY tis."createdAt" DESC
    `;

    // Formater les résultats
    const formattedSignatures = Array.isArray(signatures) ? signatures.map((sig: any) => ({
      id: sig.id,
      inductionId: sig.inductionId,
      sessionName: sig.sessionName,
      userId: sig.userId,
      userName: `${sig.prenom || ''} ${sig.nom || ''}`.trim() || 'Nom non défini',
      userEmail: sig.email,
      userSignature: sig.userSignature,
      createdAt: sig.createdAt
    })) : [];

    return NextResponse.json(formattedSignatures);

  } catch (error) {
    console.error('Erreur lors de la récupération des signatures:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des signatures' },
      { status: 500 }
    );
  }
}
