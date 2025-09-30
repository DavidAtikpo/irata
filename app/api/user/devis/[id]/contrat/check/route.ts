import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from 'lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Vérifier si un contrat existe pour ce devis
    const contrat = await prisma.contrat.findUnique({
      where: {
        devisId: id,
      },
    });

    return NextResponse.json({
      hasContract: !!contrat,
      contrat: contrat ? {
        id: contrat.id,
        statut: contrat.statut,
        dateSignature: contrat.dateSignature,
        numero: (contrat as any).numero || null,
        reference: (contrat as any).reference || null,
      } : null,
    });

  } catch (error) {
    console.error('Erreur lors de la vérification du contrat:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la vérification du contrat' },
      { status: 500 }
    );
  }
}
