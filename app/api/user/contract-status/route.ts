import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    console.log('Vérification du contrat pour l\'utilisateur:', session?.user?.id);

    // Vérifier si l'utilisateur a un contrat validé
    const contract = await prisma.contrat.findFirst({
      where: {
        userId: session?.user?.id,
        statut: 'VALIDE'
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log('Contrat trouvé:', contract);

    // Si aucun contrat VALIDE, vérifier tous les contrats de l'utilisateur
    if (!contract) {
      const allContracts = await prisma.contrat.findMany({
        where: {
          userId: session?.user?.id
        },
        select: {
          id: true,
          statut: true,
          dateSignature: true
        }
      });
      console.log('Tous les contrats de l\'utilisateur:', allContracts);
    }

    return NextResponse.json({
      hasValidContract: !!contract,
      contract: contract ? {
        id: contract.id,
        status: contract.statut,
        dateSignature: contract.dateSignature
      } : null
    });
  } catch (error) {
    console.error('Erreur lors de la vérification du contrat:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
} 