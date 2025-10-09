import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from 'lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    // Récupérer tous les Toolbox Talks créés par l'admin
    const toolboxTalks = await prisma.toolboxTalkRecord.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(toolboxTalks);

  } catch (error) {
    console.error('Erreur lors de la récupération des Toolbox Talks:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      site,
      date,
      reason,
      startTime,
      finishTime,
      mattersRaised,
      comments,
      adminName,
      adminSignature
    } = body;

    // Validation des champs requis
    if (!site || !date || !reason || !startTime || !finishTime || !adminName || !adminSignature) {
      return NextResponse.json(
        { message: 'Tous les champs requis doivent être remplis' },
        { status: 400 }
      );
    }

    // Créer l'enregistrement Toolbox Talk
    const toolboxTalkRecord = await prisma.toolboxTalkRecord.create({
      data: {
        site,
        date: new Date(date),
        reason,
        startTime,
        finishTime,
        mattersRaised: mattersRaised || [],
        comments: comments || null,
        adminName,
        adminSignature,
        isPublished: false
      }
    });

    return NextResponse.json(
      {
        message: 'Toolbox Talk enregistré avec succès',
        id: toolboxTalkRecord.id
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Erreur lors de l\'enregistrement du Toolbox Talk:', error);
    return NextResponse.json(
      { message: 'Erreur lors de l\'enregistrement' },
      { status: 500 }
    );
  }
}

