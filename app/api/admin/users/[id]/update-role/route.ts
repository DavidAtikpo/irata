import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from 'lib/prisma';

type Role = 'USER' | 'ADMIN' | 'GESTIONNAIRE' | 'CONTRIBUTOR' | 'CLIENT';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    if (session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès réservé aux administrateurs' }, { status: 403 });
    }

    const userId = params.id;
    const body = await request.json();
    const { role } = body;

    // Valider le rôle
    const validRoles: Role[] = ['USER', 'ADMIN', 'GESTIONNAIRE', 'CONTRIBUTOR', 'CLIENT'];
    if (!role || !validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Rôle invalide. Rôles valides: USER, ADMIN, GESTIONNAIRE, CONTRIBUTOR, CLIENT' },
        { status: 400 }
      );
    }

    // Vérifier que l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Empêcher un utilisateur de modifier son propre rôle (sécurité)
    if (user.id === session.user.id) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas modifier votre propre rôle' },
        { status: 403 }
      );
    }

    // Mettre à jour le rôle
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: role as Role },
      select: {
        id: true,
        email: true,
        nom: true,
        prenom: true,
        role: true,
      }
    });

    console.log(`Rôle mis à jour pour l'utilisateur ${user.email}: ${user.role} -> ${role} par ${session.user.email}`);

    return NextResponse.json({
      message: 'Rôle mis à jour avec succès',
      user: updatedUser
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour du rôle:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' }, 
      { status: 500 }
    );
  }
}

