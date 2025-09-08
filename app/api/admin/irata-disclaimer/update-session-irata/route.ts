import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session as any).user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { session: sessionName, irataNo } = await request.json();

    if (!sessionName || !irataNo) {
      return NextResponse.json({ 
        error: 'Session et numéro IRATA requis' 
      }, { status: 400 });
    }

    console.log('Updating IRATA number for session:', sessionName);
    console.log('New IRATA number:', irataNo);

    // Mettre à jour tous les documents de la session spécifiée
    const updateResult = await prisma.irataDisclaimerSubmission.updateMany({
      where: { 
        session: sessionName 
      },
      data: { 
        irataNo: irataNo,
        updatedAt: new Date()
      }
    });

    console.log('Update result:', updateResult);

    if (updateResult.count === 0) {
      return NextResponse.json({ 
        message: 'Aucun document trouvé pour cette session',
        count: 0
      });
    }

    return NextResponse.json({
      message: `${updateResult.count} document(s) mis à jour avec succès`,
      session: sessionName,
      irataNo: irataNo,
      count: updateResult.count
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour du numéro IRATA:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    );
  }
}









