import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type ItemInput = {
  label: string;
  rating: string;
  comment?: string;
};

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { type, traineeName, items, suggestions, session: trainingSession, signature } = body as {
      type?: 'ENVIRONMENT_RECEPTION' | 'EQUIPMENT' | 'TRAINING_PEDAGOGY';
      traineeName?: string;
      items?: ItemInput[];
      suggestions?: string;
      session?: string;
      signature?: string; // data URL
    };

    if (!type || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { message: 'Données invalides' },
        { status: 400 }
      );
    }

    // Basic sanitize: only keep required fields
    const normalizedItems = items.map((i) => ({
      label: String(i.label || ''),
      rating: String(i.rating || ''),
      ...(i.comment ? { comment: String(i.comment) } : {}),
    }));

    const created = await prisma.customerSatisfactionResponse.create({
      data: {
        user: { connect: { id: session.user.id } },
        traineeName: traineeName || null,
        type,
        items: normalizedItems as unknown as object,
        suggestions: suggestions || null,
        session: trainingSession || null,
        signature: signature || null,
      },
    });

    return NextResponse.json(
      {
        message: 'Réponse enregistrée',
        id: created.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erreur lors de la soumission du questionnaire:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la soumission du questionnaire' },
      { status: 500 }
    );
  }
}


