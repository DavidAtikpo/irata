import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from 'lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Récupérer toutes les factures avec les informations utilisateur
    const invoices = await prisma.$queryRaw`
      SELECT i.*, u.prenom, u.nom, u.email, d.numero as devis_numero, dm.session
      FROM "webirata"."Invoice" i
      JOIN "webirata"."User" u ON i."userId" = u.id
      JOIN "webirata"."Contrat" c ON i."contratId" = c.id
      JOIN "webirata"."Devis" d ON c."devisId" = d.id
      JOIN "webirata"."Demande" dm ON d."demandeId" = dm.id
      ORDER BY i."createdAt" DESC
    `;

    // Récupérer le nombre total d'utilisateurs inscrits par session depuis la table Demande
    const sessionStats = await prisma.$queryRaw`
      SELECT dm.session, COUNT(DISTINCT dm."userId") as user_count
      FROM "webirata"."Demande" dm
      WHERE dm.session IS NOT NULL
      GROUP BY dm.session
      ORDER BY dm.session
    `;

    const invoicesArray = Array.isArray(invoices) ? invoices : [];
    const sessionStatsArray = Array.isArray(sessionStats) ? sessionStats : [];
    
    console.log('Factures trouvées dans la DB:', invoicesArray.length);
    console.log('Statistiques par session:', sessionStatsArray);
    
    if (invoicesArray.length > 0) {
      console.log('Première facture:', {
        id: invoicesArray[0].id,
        invoiceNumber: invoicesArray[0].invoiceNumber,
        userId: invoicesArray[0].userId,
        userName: `${invoicesArray[0].prenom} ${invoicesArray[0].nom}`,
        userEmail: invoicesArray[0].email
      });
    }

    // Formater les données pour l'affichage
    const formattedInvoices = invoicesArray.map((invoice: any) => ({
      id: invoice.id,
      userId: invoice.userId,
      invoiceNumber: invoice.invoiceNumber,
      amount: invoice.amount,
      paymentStatus: invoice.paymentStatus,
      paidAmount: invoice.paidAmount,
      createdAt: invoice.createdAt,
      userName: `${invoice.prenom} ${invoice.nom}`,
      userEmail: invoice.email,
      userAddress: 'Adresse non disponible',
      contratId: invoice.contratId,
      devisNumber: invoice.devis_numero,
      session: invoice.session,
      paymentMethod: invoice.paymentMethod,
      notes: invoice.notes
    }));

    // Formater les statistiques par session
    const formattedSessionStats = sessionStatsArray.reduce((acc: any, stat: any) => {
      acc[stat.session] = parseInt(stat.user_count);
      return acc;
    }, {});

    return NextResponse.json({
      invoices: formattedInvoices,
      sessionStats: formattedSessionStats
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des factures:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des factures' },
      { status: 500 }
    );
  }
}
