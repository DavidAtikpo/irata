import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from 'lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Récupérer les factures de l'utilisateur
    const invoices = await prisma.invoice.findMany({
      where: {
        userId: session?.user?.id
      },
      include: {
        contrat: {
          include: {
            devis: {
              select: {
                numero: true,
                montant: true,
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Formater les données pour l'affichage
    const formattedInvoices = invoices.map(invoice => ({
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      amount: invoice.amount,
      paymentStatus: invoice.paymentStatus,
      paidAmount: invoice.paidAmount,
      paymentMethod: invoice.paymentMethod,
      notes: invoice.notes,
      createdAt: invoice.createdAt,
      updatedAt: invoice.updatedAt,
      contratId: invoice.contratId,
      devisNumber: invoice.contrat?.devis?.numero
    }));

    return NextResponse.json(formattedInvoices);
  } catch (error) {
    console.error('Erreur lors de la récupération du statut des factures:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du statut des factures' },
      { status: 500 }
    );
  }
}
