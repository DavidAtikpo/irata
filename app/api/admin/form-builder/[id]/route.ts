import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id } = await params;
    const form = await prisma.formBuilder.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
          },
        },
        formSubmissions: {
          include: {
            submittedBy: {
              select: {
                id: true,
                nom: true,
                prenom: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!form) {
      return NextResponse.json({ error: 'Formulaire non trouvé' }, { status: 404 });
    }

    return NextResponse.json(form);
  } catch (error) {
    console.error('Erreur lors de la récupération du formulaire:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du formulaire' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    
    const { id } = await params;
    const form = await prisma.formBuilder.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        title: body.title,
        formData: body.formData,
        settings: body.settings,
        isActive: body.isActive,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(form);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du formulaire:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du formulaire' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id } = await params;
    
    // Vérifier s'il y a des soumissions
    const submissionCount = await prisma.formSubmission.count({
      where: { formBuilderId: id },
    });

    if (submissionCount > 0) {
      return NextResponse.json(
        { error: 'Impossible de supprimer un formulaire qui a des soumissions' },
        { status: 400 }
      );
    }

    await prisma.formBuilder.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Formulaire supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du formulaire:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du formulaire' },
      { status: 500 }
    );
  }
}
