import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { amount, notes } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Montant requis et doit être positif' }, { status: 400 });
    }

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Créer une demande temporaire pour le devis
    const tempDemande = await prisma.demande.create({
      data: {
        statut: 'EN_ATTENTE',
        session: 'Session temporaire',
        user: {
          connect: {
            id: user.id
          }
        }
      }
    });

    // Créer une demande de facture (peut être stockée dans une table de notifications ou de demandes)
    // Pour l'instant, on va créer une facture avec statut PENDING
    const currentYear = new Date().getFullYear();
    const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
    const currentDay = String(new Date().getDate()).padStart(2, '0');
    const timestamp = Date.now();
    const invoiceNumber = `CI.FF ${currentYear}${currentMonth}${currentDay} ${String(timestamp).slice(-3).padStart(3, '0')}`;

    // Créer un contrat temporaire pour la facture
    const tempContrat = await prisma.contrat.create({
      data: {
        nom: user.nom || 'Utilisateur',
        prenom: user.prenom || 'Test',
        adresse: 'Adresse temporaire',
        statut: 'EN_ATTENTE',
        dateSignature: new Date(), // Ajout du champ manquant
        signature: '', // Signature vide pour contrat temporaire
        user: {
          connect: {
            id: user.id
          }
        },
        devis: {
          create: {
            demandeId: tempDemande.id,
            userId: user.id,
            numero: `DEV-${Date.now()}`,
            client: user.nom || 'Utilisateur',
            mail: user.email,
            designation: 'Formation Cordiste IRATA',
            quantite: 1,
            prixUnitaire: amount,
            montant: amount,
            unite: 'jour',
            tva: 0,
            statut: 'EN_ATTENTE'
          }
        }
      },
    });

    // Créer une facture temporaire ou une notification pour l'admin
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        amount: amount,
        paymentStatus: 'PENDING',
        notes: notes ? `Demande de facture: ${notes}` : 'Demande de facture créée par l\'utilisateur',
        userId: user.id,
        contratId: tempContrat.id,
      },
    });

    // Créer une notification pour l'administrateur
    await prisma.notification.create({
      data: {
        userId: user.id, // L'admin recevra cette notification
        title: 'Nouvelle demande de facture',
        message: `L'utilisateur ${user.nom} ${user.prenom} (${user.email}) a demandé une facture de ${amount}€. Notes: ${notes || 'Aucune'}`,
        type: 'INVOICE_REQUEST',
        relatedId: invoice.id,
      },
    });

    return NextResponse.json({
      message: 'Demande de facture envoyée avec succès',
      invoice: {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        amount: invoice.amount,
        status: 'PENDING',
      },
    });
  } catch (error) {
    console.error('Erreur lors de la création de la demande de facture:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la demande' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
