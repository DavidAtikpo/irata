import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Récupérer les vraies signatures depuis la base de données
    const signatures = await prisma.traineeSignature.findMany({
      select: {
        traineeId: true,
        signature: true,
        adminSignature: true,
      },
      orderBy: {
        traineeId: 'asc',
      },
    });

    return NextResponse.json(signatures);
  } catch (error) {
    console.error('Erreur lors de la récupération des signatures:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des signatures' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { traineeId, signature } = await request.json();

    // Mettre à jour ou créer la signature dans la base de données
    const updatedSignature = await prisma.traineeSignature.upsert({
      where: { traineeId },
      update: { signature },
      create: { traineeId, signature },
    });

    return NextResponse.json(updatedSignature);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la signature:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la mise à jour de la signature' },
      { status: 500 }
    );
  }
} 