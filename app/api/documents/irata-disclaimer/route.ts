import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    const data = await request.json();
    console.log('Received disclaimer form data:', data);

    // Récupérer l'utilisateur pour lier la soumission
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ message: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Créer l'entrée dans la base de données
    const submission = await prisma.irataDisclaimerSubmission.create({
      data: {
        id: `irata_${Date.now()}`,
        name: data.name || null,
        address: data.address,
        signature: data.signature,
        session: data.session || null,
        userId: user.id,
        status: 'PENDING',
        updatedAt: new Date()
      }
    });

    console.log('Disclaimer submission created:', submission);

    return NextResponse.json({ 
      message: 'Document submitted successfully!', 
      submission 
    }, { status: 200 });
  } catch (error) {
    console.error('Error processing disclaimer form submission:', error);
    return NextResponse.json({ message: 'Error submitting document.' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session as any).user?.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    // Récupérer toutes les soumissions depuis la base de données
    const submissions = await prisma.irataDisclaimerSubmission.findMany({
      include: {
        User: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ submissions }, { status: 200 });
  } catch (error) {
    console.error('Error reading submissions:', error);
    return NextResponse.json({ message: 'Erreur lors de la récupération' }, { status: 500 });
  }
}