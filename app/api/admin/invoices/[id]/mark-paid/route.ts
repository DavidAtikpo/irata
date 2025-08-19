import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { paymentType, amount } = await request.json();
    const resolvedParams = await params;
    const invoiceId = resolvedParams.id;

    if (!invoiceId) {
      return NextResponse.json({ error: 'ID de facture requis' }, { status: 400 });
    }

    // Récupérer la facture
    const invoices = await prisma.$queryRaw`
      SELECT * FROM "webirata"."Invoice" WHERE id = ${invoiceId}
    `;
    
    const invoice = Array.isArray(invoices) ? invoices[0] : null;

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

    // Mettre à jour la facture
    const updateResult = await prisma.$queryRaw`
      UPDATE "webirata"."Invoice" 
      SET "paymentStatus" = ${updateData.paymentStatus}, 
          "paidAmount" = ${updateData.paidAmount}, 
          "updatedAt" = ${updateData.updatedAt}
      WHERE id = ${invoiceId}
      RETURNING *
    `;
    
    const updatedInvoice = Array.isArray(updateResult) ? updateResult[0] : null;

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
