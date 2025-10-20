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
    const submissions = await prisma.formSubmission.findMany({
      where: { formBuilderId: id },
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
    });

    return NextResponse.json(submissions);
  } catch (error) {
    console.error('Erreur lors de la récupération des soumissions:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des soumissions' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    
    const submission = await prisma.formSubmission.create({
      data: {
        formData: body.formData,
        status: body.status || 'DRAFT',
        submittedAt: body.status === 'SUBMITTED' ? new Date() : null,
        formBuilderId: (await params).id,
        submittedById: session.user.id,
      },
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
    });

    return NextResponse.json(submission, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de la soumission:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la soumission' },
      { status: 500 }
    );
  }
}
