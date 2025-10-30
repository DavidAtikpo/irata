import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from 'lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId requis' }, { status: 400 });
    }

    // Récupérer les devis de l'utilisateur
    const devis = await prisma.devis.findMany({
      where: { userId },
      select: {
        id: true,
        numero: true,
        statut: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Récupérer les contrats de l'utilisateur
    const contrats = await prisma.contrat.findMany({
      where: { userId },
      select: {
        id: true,
        statut: true,
        devis: {
          select: {
            id: true,
            numero: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Générer les liens vers les pages
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
    
    const links = {
      mesDevis: `${baseUrl}/mes-devis`,
      monContrat: `${baseUrl}/mon-contrat`,
      invoice: `${baseUrl}/invoice`,
      devisDetails: devis.map(d => ({
        id: d.id,
        numero: d.numero,
        statut: d.statut,
        link: `${baseUrl}/mes-devis/${d.id}`,
        contratLink: d.statut === 'VALIDE' ? `${baseUrl}/mes-devis/${d.id}/contrat` : null,
      })),
      contrats: contrats.map(c => ({
        id: c.id,
        statut: c.statut,
        devisNumero: c.devis?.numero,
        link: `${baseUrl}/mon-contrat`,
      })),
    };

    return NextResponse.json(links);
  } catch (error) {
    console.error('Erreur lors de la récupération des liens:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

