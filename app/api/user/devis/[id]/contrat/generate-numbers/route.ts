import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from 'lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Récupérer le devis pour déterminer le type d'inscription
    const devis = await prisma.devis.findUnique({
      where: { id },
      include: {
        demande: true
      }
    });

    if (!devis) {
      return NextResponse.json(
        { message: 'Devis non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier que le devis appartient à l'utilisateur
    if (devis.userId !== session?.user?.id) {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Déterminer le type d'inscription
    const isEntreprise = devis.demande?.typeInscription?.toLowerCase() === 'entreprise' || !!devis.demande?.entreprise;
    const prefix = isEntreprise ? 'CI.ICE' : 'CI.ICP';

    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');

    // Compter les contrats créés cette année
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const endOfYear = new Date(now.getFullYear() + 1, 0, 1);
    const yearCount = await prisma.contrat.count({
      where: { 
        createdAt: { gte: startOfYear, lt: endOfYear }
      }
    });

    // Compter les contrats créés pour cette session spécifique
    const sessionCount = await prisma.contrat.count({
      where: {
        devis: {
          demande: {
            session: devis.demande?.session
          }
        }
      }
    });

    const nthYear = String(yearCount + 1).padStart(3, '0');
    const nthSession = String(sessionCount + 1).padStart(3, '0');

    const numero = `${prefix} ${yy}${mm}${nthYear}`;
    const reference = `${prefix} ${yy}${mm} ${nthSession}`;

    return NextResponse.json({
      numero,
      reference,
      typeInscription: isEntreprise ? 'entreprise' : 'personnel'
    });

  } catch (error) {
    console.error('Erreur lors de la génération des numéros de contrat:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la génération des numéros de contrat' },
      { status: 500 }
    );
  }
}
