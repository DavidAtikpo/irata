import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Interface pour le formulaire
interface PreJobTrainingForm {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  session: string;
  permitNumber: string;
  permitType: {
    cold: boolean;
    hot: boolean;
    notFlame: boolean;
    flame: boolean;
  };
  taskDescription: string;
  incidentIdentification: string;
  consequences: string;
  securityMeasures: string;
  attendees: Array<{
    position: string;
    name: string;
    signatures: Record<string, string>;
  }>;
  createdAt: string;
  updatedAt: string;
}

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification de l'admin
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Récupérer les signatures Pre-Job Training depuis la base de données
    const signatures = await prisma.preJobTrainingSignature.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            nom: true,
            prenom: true
          }
        }
      },
      orderBy: {
        signedAt: 'desc'
      }
    });

    // Grouper les signatures par utilisateur et créer des formulaires
    const userSignaturesMap = new Map<string, any[]>();
    
    signatures.forEach(signature => {
      if (!userSignaturesMap.has(signature.userId)) {
        userSignaturesMap.set(signature.userId, []);
      }
      userSignaturesMap.get(signature.userId)!.push(signature);
    });

    // Créer les formulaires à partir des signatures
    const forms: PreJobTrainingForm[] = Array.from(userSignaturesMap.entries()).map(([userId, userSignatures]) => {
      const user = userSignatures[0]?.user;
      const fullName = user ? [user.prenom, user.nom].filter(Boolean).join(' ').trim() : '';
      
      // Créer un objet signatures par jour
      const signaturesByDay: Record<string, string> = {};
      userSignatures.forEach(sig => {
        signaturesByDay[sig.day] = sig.signatureData;
      });

      return {
        id: `form_${userId}`,
        userId: userId,
        userName: fullName || user?.email || 'Utilisateur inconnu',
        userEmail: user?.email || 'email@inconnu.com',
        session: 'Session IRATA', // Valeur par défaut
        permitNumber: 'N/A',
        permitType: {
          cold: false,
          hot: false,
          notFlame: false,
          flame: false
        },
        taskDescription: 'Formation Pre-Job Training',
        incidentIdentification: 'N/A',
        consequences: 'N/A',
        securityMeasures: 'N/A',
        attendees: [
          {
            position: 'Stagiaire',
            name: fullName || user?.email || 'Utilisateur inconnu',
            signatures: signaturesByDay
          }
        ],
        createdAt: userSignatures[0]?.signedAt.toISOString() || new Date().toISOString(),
        updatedAt: userSignatures[userSignatures.length - 1]?.signedAt.toISOString() || new Date().toISOString()
      };
    });

    return NextResponse.json(forms);

  } catch (error) {
    console.error('Erreur lors de la récupération des formulaires:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const formData = await request.json();

    // Cette méthode POST n'est plus utilisée car les signatures sont créées automatiquement
    // via l'API /api/user/pre-job-training-signature
    return NextResponse.json(
      { message: 'Les signatures Pre-Job Training sont créées automatiquement' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Erreur lors de la sauvegarde du formulaire:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la sauvegarde' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const formId = searchParams.get('id');

    if (!formId) {
      return NextResponse.json(
        { error: 'ID du formulaire requis' },
        { status: 400 }
      );
    }

    // Extraire l'userId du formId (format: form_${userId})
    const userId = formId.replace('form_', '');

    // Supprimer toutes les signatures de cet utilisateur
    const deletedSignatures = await prisma.preJobTrainingSignature.deleteMany({
      where: {
        userId: userId
      }
    });

    if (deletedSignatures.count === 0) {
      return NextResponse.json(
        { error: 'Aucune signature trouvée pour cet utilisateur' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: `${deletedSignatures.count} signature(s) supprimée(s) avec succès` },
      { status: 200 }
    );

  } catch (error) {
    console.error('Erreur lors de la suppression des signatures:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression' },
      { status: 500 }
    );
  }
}
