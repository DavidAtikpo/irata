import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { contratId, paymentMethod, amount, notes, invoiceNumber } = await request.json();

    // Vérifier que l'utilisateur a un contrat valide
    const contrat = await prisma.contrat.findFirst({
      where: {
        id: contratId,
        userId: session.user.id,
        statut: 'VALIDE'
      },
      include: {
        devis: {
          select: {
            numero: true,
            montant: true,
          }
        }
      }
    });

    if (!contrat) {
      return NextResponse.json({ error: 'Contrat non trouvé ou non valide' }, { status: 404 });
    }

    // Créer ou mettre à jour la facture
    let invoice = await prisma.invoice.findFirst({
      where: {
        contratId: contratId,
        userId: session.user.id
      }
    });

    if (!invoice) {
      // Utiliser le numéro de facture fourni par l'utilisateur ou en générer un nouveau
      const finalInvoiceNumber = invoiceNumber || (() => {
        const currentYear = new Date().getFullYear();
        const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
        const currentDay = String(new Date().getDate()).padStart(2, '0');
        const timestamp = Date.now();
        return `CI.FF ${currentYear}${currentMonth}${currentDay} ${String(timestamp).slice(-3).padStart(3, '0')}`;
      })();
      
      // Créer une nouvelle facture
      invoice = await prisma.invoice.create({
        data: {
          invoiceNumber: finalInvoiceNumber,
          amount: contrat.devis.montant,
          paymentStatus: 'PENDING',
          paymentMethod: paymentMethod || 'VIREMENT',
          notes: notes || '',
          userId: session.user.id,
          contratId: contratId,
        }
      });
    } else {
      // Mettre à jour la facture existante
      invoice = await prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          paymentMethod: paymentMethod || 'VIREMENT',
          notes: notes || '',
          updatedAt: new Date(),
        }
      });
    }

    // Envoyer une notification à l'administrateur
    try {
      // Ici vous pouvez ajouter l'envoi d'email à l'admin
      console.log(`Signalement de paiement reçu de ${session.user.email} pour la facture ${invoice.invoiceNumber}`);
    } catch (emailError) {
      console.error('Erreur lors de l\'envoi de la notification admin:', emailError);
    }

    return NextResponse.json({
      success: true,
      message: 'Signalement de paiement envoyé à l\'administration',
      invoice: {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        amount: invoice.amount,
        paymentStatus: invoice.paymentStatus,
        paymentMethod: invoice.paymentMethod,
        notes: invoice.notes,
      }
    });

  } catch (error) {
    console.error('Erreur lors du signalement de paiement:', error);
    return NextResponse.json(
      { error: 'Erreur lors du signalement de paiement' },
      { status: 500 }
    );
  }
}
