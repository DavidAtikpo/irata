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

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Vérifier s'il y a déjà des devis pour cet utilisateur
    let existingDevis = await prisma.devis.findFirst({
      where: {
        userId: user.id,
      },
      include: {
        contrat: true,
      },
    });

    // Si pas de devis existant, créer un devis de test
    if (!existingDevis) {
      // Créer une demande temporaire
      const tempDemande = await prisma.demande.create({
        data: {
          statut: 'EN_ATTENTE',
          session: 'Session de test',
          user: {
            connect: {
              id: user.id
            }
          }
        }
      });

      // Créer un devis de test
      existingDevis = await prisma.devis.create({
        data: {
          demandeId: tempDemande.id,
          userId: user.id,
          numero: `DEV-TEST-${Date.now()}`,
          client: user.nom || 'Utilisateur Test',
          mail: user.email,
          designation: 'Formation Cordiste IRATA - Test',
          quantite: 1,
          prixUnitaire: 1350,
          montant: 1350,
          unite: 'jour',
          tva: 0,
          statut: 'VALIDE', // Marquer comme validé pour permettre la création de facture
        },
        include: {
          contrat: true,
        },
      });

      // Créer un contrat de test
      const testContrat = await prisma.contrat.create({
        data: {
          nom: user.nom || 'Utilisateur',
          prenom: user.prenom || 'Test',
          adresse: 'Adresse de test',
          statut: 'EN_ATTENTE',
          dateSignature: new Date(),
          signature: 'Signature de test',
          devisId: existingDevis.id,
          userId: user.id,
        },
      });
    }

    // Créer une facture basée sur le devis
    const currentYear = new Date().getFullYear();
    const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
    const currentDay = String(new Date().getDate()).padStart(2, '0');
    const timestamp = Date.now();
    const invoiceNumber = `CI.FF ${currentYear}${currentMonth}${currentDay} ${String(timestamp).slice(-3).padStart(3, '0')}`;

    // Trouver ou créer un contrat pour ce devis
    let contratId = existingDevis.contrat?.id;
    if (!contratId) {
      const existingContrat = await prisma.contrat.findFirst({
        where: { devisId: existingDevis.id }
      });
      if (existingContrat) {
        contratId = existingContrat.id;
      } else {
        // Créer un contrat de test si aucun n'existe
        const testContrat = await prisma.contrat.create({
          data: {
            nom: user.nom || 'Utilisateur',
            prenom: user.prenom || 'Test',
            adresse: 'Adresse de test',
            statut: 'EN_ATTENTE',
            dateSignature: new Date(),
            signature: 'Signature de test',
            devisId: existingDevis.id,
            userId: user.id,
          },
        });
        contratId = testContrat.id;
      }
    }

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        amount: existingDevis.montant,
        paymentStatus: 'PENDING',
        notes: `Facture de test basée sur le devis ${existingDevis.numero}`,
        userId: user.id,
        contratId: contratId, // Maintenant contratId est garanti d'être défini
      },
    });

    return NextResponse.json({
      message: 'Facture de test créée avec succès',
      invoice: {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        amount: invoice.amount,
        status: 'PENDING',
      },
    });
  } catch (error) {
    console.error('Erreur lors de la création de la facture de test:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la facture de test' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
