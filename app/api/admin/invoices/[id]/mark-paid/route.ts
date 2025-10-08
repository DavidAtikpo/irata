import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from 'lib/prisma';
import { sendPaymentStatusUpdateEmail } from '@/lib/email';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { paymentType, amount } = await request.json();
    const resolvedParams = await params;
    const invoiceId = resolvedParams.id;

    if (!invoiceId) {
      return NextResponse.json({ error: 'ID de facture requis' }, { status: 400 });
    }

    // Récupérer la facture avec les informations utilisateur
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        user: {
          select: {
            email: true,
            prenom: true,
            nom: true
          }
        }
      }
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Facture non trouvée' }, { status: 404 });
    }

    let updateData: any = {};

    if (paymentType === 'full') {
      updateData = {
        paymentStatus: 'PAID',
        paidAmount: invoice.amount,
        updatedAt: new Date()
      };
    } else if (paymentType === 'partial' && amount) {
      updateData = {
        paymentStatus: 'PARTIAL',
        paidAmount: amount,
        updatedAt: new Date()
      };
    } else {
      return NextResponse.json({ error: 'Type de paiement invalide' }, { status: 400 });
    }

    // Mettre à jour la facture en utilisant Prisma ORM au lieu de requête raw
    const updatedInvoice = await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        paymentStatus: updateData.paymentStatus as 'PAID' | 'PARTIAL' | 'PENDING',
        paidAmount: updateData.paidAmount,
        updatedAt: updateData.updatedAt
      }
    });

    // Envoyer un email de notification à l'utilisateur
    try {
      const userName = `${invoice.user.prenom} ${invoice.user.nom}`;
      await sendPaymentStatusUpdateEmail(
        invoice.user.email,
        userName,
        invoice.invoiceNumber,
        invoice.amount,
        updateData.paymentStatus,
        updateData.paidAmount
      );
      console.log('Email de notification envoyé avec succès');
    } catch (emailError) {
      console.error('Erreur lors de l\'envoi de l\'email:', emailError);
      // Ne pas faire échouer la requête si l'email échoue
    }

    return NextResponse.json({
      success: true,
      message: `Facture marquée comme ${paymentType === 'full' ? 'totalement' : 'partiellement'} payée`,
      invoice: updatedInvoice
    });

  } catch (error) {
    console.error('Erreur lors du marquage de la facture:', error);
    return NextResponse.json(
      { error: 'Erreur lors du marquage de la facture' },
      { status: 500 }
    );
  }
}
