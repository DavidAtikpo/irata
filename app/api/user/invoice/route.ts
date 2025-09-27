import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Vérifier s'il y a des devis validés sans factures correspondantes
    const validDevis = await prisma.devis.findMany({
      where: {
        userId: user.id,
        statut: 'VALIDE', // Devis validés par l'admin
      },
      include: {
        contrat: {
          include: {
            invoices: true, // Vérifier s'il y a déjà des factures
          },
        },
      },
    });

    // Créer des factures pour les devis validés qui n'en ont pas encore
    for (const devis of validDevis) {
      if (devis.contrat && devis.contrat.invoices.length === 0) {
        // Créer une facture basée sur le devis
        const currentYear = new Date().getFullYear();
        const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
        const currentDay = String(new Date().getDate()).padStart(2, '0');
        const timestamp = Date.now();
        const invoiceNumber = `CI.FF ${currentYear}${currentMonth}${currentDay} ${String(timestamp).slice(-3).padStart(3, '0')}`;

        await prisma.invoice.create({
          data: {
            invoiceNumber,
            amount: devis.montant, // Montant du devis
            paymentStatus: 'PENDING',
            notes: `Facture générée automatiquement à partir du devis ${devis.numero}`,
            userId: user.id,
            contratId: devis.contrat.id,
          },
        });
      }
    }

    // Récupérer les factures de l'utilisateur avec gestion des relations optionnelles
    const invoices = await prisma.invoice.findMany({
      where: {
        userId: user.id,
      },
      include: {
        contrat: {
          include: {
            devis: {
              select: {
                numero: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Formater les données pour le frontend avec gestion des valeurs null
    const formattedInvoices = invoices.map((invoice) => ({
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      amount: invoice.amount,
      paymentStatus: invoice.paymentStatus,
      paidAmount: invoice.paidAmount,
      paymentMethod: invoice.paymentMethod,
      notes: invoice.notes,
      createdAt: invoice.createdAt.toISOString(),
      devisNumber: invoice.contrat?.devis?.numero || null,
    }));

    return NextResponse.json({
      invoices: formattedInvoices,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des factures:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
