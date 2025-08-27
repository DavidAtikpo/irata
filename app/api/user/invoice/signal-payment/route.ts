import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { invoiceId } = await request.json();

    if (!invoiceId) {
      return NextResponse.json({ error: 'ID de facture requis' }, { status: 400 });
    }

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Vérifier que la facture appartient à l'utilisateur
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        userId: user.id,
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Facture non trouvée' }, { status: 404 });
    }

    // Mettre à jour le statut de la facture
    const updatedInvoice = await prisma.invoice.update({
      where: {
        id: invoiceId,
      },
      data: {
        paymentStatus: 'PAID',
        paidAmount: invoice.amount, // Marquer comme entièrement payée
        notes: invoice.notes ? `${invoice.notes}\nPaiement signalé le ${new Date().toLocaleDateString('fr-FR')}` : `Paiement signalé le ${new Date().toLocaleDateString('fr-FR')}`,
      },
    });

    return NextResponse.json({
      message: 'Paiement signalé avec succès',
      invoice: updatedInvoice,
    });
  } catch (error) {
    console.error('Erreur lors du signalement du paiement:', error);
    return NextResponse.json(
      { error: 'Erreur lors du signalement du paiement' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
