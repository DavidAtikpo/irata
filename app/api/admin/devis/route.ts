import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { sendEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const body = await req.json();
    console.log('Body reçu pour création devis:', body);

    const { demandeId, numero, client, mail, designation, quantite, unite, prixUnitaire, tva, montant } = body;

    if (!demandeId || !numero || !client || !mail || !designation || !quantite || !unite || !prixUnitaire || !tva || !montant) {
      return NextResponse.json(
        { message: 'Tous les champs obligatoires sont requis' },
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

    // Créer le devis avec l'ID de l'utilisateur qui a fait la demande
    const devis = await prisma.devis.create({
      data: {
        demandeId,
        userId: demande.userId,
        numero: body.numero,
        client: body.client,
        mail: body.mail,
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

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const devis = await prisma.devis.findMany({
      include: {
        demande: {
          include: {
            user: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
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