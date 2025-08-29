import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Récupérer l'utilisateur avec ses contributions
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        contributions: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Formater les données pour le frontend
    const formattedUser = {
      id: user.id,
      name: user.nom || user.email,
      email: user.email,
      role: user.role
    };

    const formattedContributions = user.contributions.map(contribution => ({
      id: contribution.id,
      amount: contribution.amount,
      type: contribution.type,
      returnAmount: contribution.returnAmount,
      returnDescription: contribution.returnDescription,
      paymentMethod: contribution.paymentMethod,
      status: contribution.status,
      donorName: contribution.donorName,
      donorEmail: contribution.donorEmail,
      createdAt: contribution.createdAt
    }));

    return NextResponse.json({
      success: true,
      user: formattedUser,
      contributions: formattedContributions
    });

  } catch (error) {
    console.error('Erreur récupération profil:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}






