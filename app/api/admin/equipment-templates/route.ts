import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Liste tous les templates
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const templates = await prisma.equipmentTemplate.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        createdBy: {
          select: {
            nom: true,
            prenom: true,
          },
        },
      },
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error('Erreur lors de la récupération des templates:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// POST - Créer un nouveau template
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, structure } = body;

    if (!name || !structure) {
      return NextResponse.json(
        { error: 'Nom et structure requis' },
        { status: 400 }
      );
    }

    // Vérifier si un template avec ce nom existe déjà
    const existingTemplate = await prisma.equipmentTemplate.findUnique({
      where: { name },
    });

    if (existingTemplate) {
      return NextResponse.json(
        { error: 'Un template avec ce nom existe déjà. Veuillez choisir un autre nom.' },
        { status: 400 }
      );
    }

    const template = await prisma.equipmentTemplate.create({
      data: {
        name,
        description: description || '',
        structure,
        createdById: session.user.id,
      },
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error: any) {
    console.error('Erreur lors de la création du template:', error);
    
    // Erreur de nom unique (fallback si la vérification précédente n'a pas fonctionné)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Un template avec ce nom existe déjà. Veuillez choisir un autre nom.' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la création du template. Veuillez réessayer.' },
      { status: 500 }
    );
  }
}

