import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from 'lib/prisma';
import { Prisma } from '@prisma/client';
import { sendEmail } from 'lib/email';

// Fonction pour générer le numéro de devis: CI.DEV YYMM 000
async function generateDevisNumber(): Promise<string> {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2); // 25 pour 2025
  const month = (now.getMonth() + 1).toString().padStart(2, '0'); // 09 pour septembre
  const yearMonth = year + month; // 2509
  
  // Compter tous les devis créés cette ANNÉE (comptage global annuel)
  const startOfYear = new Date(now.getFullYear(), 0, 1); // 1er janvier
  const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999); // 31 décembre
  
  const count = await prisma.devis.count({
    where: {
      createdAt: {
        gte: startOfYear,
        lte: endOfYear
      }
    }
  });
  
  const nextNumber = (count + 1).toString().padStart(3, '0');
  return `CI.DEV ${yearMonth} ${nextNumber}`;
}

// Fonction pour générer la référence par session: CI.DEV YYMM 000
async function generateSessionReference(sessionString: string): Promise<string> {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const yearMonth = year + month;
  
  // Compter les devis pour cette session spécifique cette ANNÉE (comptage par session annuel)
  const startOfYear = new Date(now.getFullYear(), 0, 1); // 1er janvier
  const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999); // 31 décembre
  
  const sessionCount = await prisma.devis.count({
    where: {
      createdAt: {
        gte: startOfYear,
        lte: endOfYear
      },
      demande: {
        session: sessionString
      }
    }
  });
  
  const nextSessionNumber = (sessionCount + 1).toString().padStart(3, '0');
  return `CI.DEV ${yearMonth} ${nextSessionNumber}`;
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session?.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const body = await req.json();
    console.log('Body reçu pour création devis:', body);

    const { demandeId, numero, client, mail, designation, quantite, unite, prixUnitaire, tva, montant, signature } = body;

    if (!demandeId || !numero || !client || !mail || !designation || !quantite || !unite || !prixUnitaire || !tva || !montant) {
      return NextResponse.json(
        { message: 'Tous les champs obligatoires sont requis' },
        { status: 400 }
      );
    }

    // Validation de la signature
    if (!signature) {
      return NextResponse.json(
        { message: 'La signature est requise' },
        { status: 400 }
      );
    }

    if (!signature.startsWith('data:image/')) {
      return NextResponse.json(
        { message: 'La signature doit être au format image valide' },
        { status: 400 }
      );
    }

    // Vérifier si un devis existe déjà pour cette demande
    const existingDevis = await prisma.devis.findFirst({
      where: { demandeId }
    });

    if (existingDevis) {
      return NextResponse.json(
        { message: 'Un devis existe déjà pour cette demande' },
        { status: 400 }
      );
    }

    // Vérifier si la demande existe et est validée
    const demande = await prisma.demande.findUnique({
      where: { id: demandeId },
      include: { 
        user: true
      },
    });

    if (!demande) {
      return NextResponse.json(
        { message: 'Demande non trouvée' },
        { status: 404 }
      );
    }

    if (demande.statut !== 'VALIDE') {
      return NextResponse.json(
        { message: 'La demande doit être validée pour créer un devis' },
        { status: 400 }
      );
    }

    // Générer les numéros automatiquement
    const numeroDevis = await generateDevisNumber();
    const referenceSession = await generateSessionReference(demande.session);

    // Créer le devis avec l'ID de l'utilisateur qui a fait la demande
    const devis = await prisma.devis.create({
      data: {
        demandeId,
        userId: demande.userId,
        numero: numeroDevis,
        referenceAffaire: referenceSession,
        client: body.client,
        mail: body.mail,
        entreprise: body.entreprise ?? null,
        adresseLivraison: body.adresseLivraison,
        dateLivraison: body.dateLivraison ? new Date(body.dateLivraison) : null,
        dateExamen: body.dateExamen ? new Date(body.dateExamen) : null,
        adresse: body.adresse,
        siret: body.siret,
        numNDA: body.numNDA,
        dateFormation: body.dateFormation ? new Date(body.dateFormation) : null,
        suiviPar: body.suiviPar,
        designation: body.designation,
        quantite: parseInt(body.quantite),
        unite: body.unite,
        prixUnitaire: parseFloat(body.prixUnitaire),
        tva: parseFloat(body.tva),
        exoneration: body.exoneration,
        datePriseEffet: body.datePriseEffet ? new Date(body.datePriseEffet) : null,
        montant: parseFloat(body.montant),
        iban: body.iban,
        bic: body.bic,
        banque: body.banque,
        intituleCompte: body.intituleCompte,
        signature: body.signature,
        statut: 'EN_ATTENTE'
      },
      include: {
        demande: {
          include: {
            user: true,
          },
        },
      },
    });



    // Envoyer l'email de notification
    try {
      await sendEmail({
        to: demande.user.email,
        subject: 'Nouveau devis - Formation Cordiste IRATA',
        html: `
          <h1>Nouveau devis</h1>
          <p>Bonjour ${demande.user.prenom} ${demande.user.nom},</p>
          <p>Un nouveau devis a été créé pour votre demande de formation pour la session "${demande.session}".</p>
          <p>Numéro du devis : ${devis.numero}</p>
          <p>Montant : ${devis.montant} €</p>
          <p>Vous pouvez consulter les détails de votre devis dans votre espace personnel.</p>
          <p>Cordialement,<br>L'équipe CI.DES</p>
        `
      });
      console.log('Email de notification envoyé avec succès');
    } catch (emailError) {
      console.error('Erreur lors de l\'envoi de l\'email:', emailError);
      // On continue même si l'email échoue
    }

    return NextResponse.json(devis, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création du devis:', error);
    if (error instanceof Error) {
      console.error('Message:', error.message);
      if ('stack' in error) console.error('Stack:', error.stack);
    }
    return NextResponse.json(
      { message: 'Erreur lors de la création du devis', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session?.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const devis = await prisma.devis.findMany({
      select: {
        id: true,
        numero: true,
        client: true,
        mail: true,
        montant: true,
        statut: true,
        createdAt: true,
        demande: {
          select: {
            user: {
              select: { prenom: true, nom: true }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(devis);
  } catch (error) {
    console.error('Erreur lors de la récupération des devis:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des devis' },
      { status: 500 }
    );
  }
} 