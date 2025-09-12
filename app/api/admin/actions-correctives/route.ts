import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Vérifier que l'utilisateur est admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // Récupérer toutes les actions correctives avec les informations de la non-conformité
    const actionsCorrectives = await prisma.actionCorrective.findMany({
      include: {
        nonConformite: {
          select: {
            id: true,
            numero: true,
            titre: true,
            statut: true
          }
        },
        responsable: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ actionsCorrectives });
  } catch (error) {
    console.error('Erreur lors de la récupération des actions correctives:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Vérifier que l'utilisateur est admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const body = await request.json();
    const { 
      nonConformiteId, titre, description, type, priorite, responsableId, dateEcheance,
      // Champs CI.DES Action Corrective
      issuerName, recipientName, date, number, department,
      originCustomer, originProduction, originAdministration, originOther,
      categoryOfAnomaly, issuerDescription, immediateCurativeAction, actionPlanned,
      correctiveDescribed, preventiveDescribed, recipientSignature, issuerSignature, collaboratorInCharge,
      analysis, limitTime, collaboratorAppointed, closingDate, effectiveness, effectivenessType,
      signatureReception, observation, conclusion, conclusionSignature
    } = body;

    // Debug pour voir les signatures reçues
    console.log('Signatures reçues dans l\'API:');
    console.log('recipientSignature:', recipientSignature);
    console.log('issuerSignature:', issuerSignature);
    console.log('signatureReception:', signatureReception);
    console.log('conclusionSignature:', conclusionSignature);

    // Validation des champs requis
    if (!nonConformiteId || !titre || !description) {
      return NextResponse.json(
        { error: 'Champs requis manquants' },
        { status: 400 }
      );
    }

    // Vérifier que la non-conformité existe
    const nonConformite = await prisma.nonConformite.findUnique({
      where: { id: nonConformiteId }
    });

    if (!nonConformite) {
      return NextResponse.json(
        { error: 'Non-conformité non trouvée' },
        { status: 404 }
      );
    }

    // Créer l'action corrective
    const actionCorrective = await prisma.actionCorrective.create({
      data: {
        titre,
        description,
        type: type || 'ACTION_CORRECTIVE',
        priorite: priorite || 'MOYENNE',
        statut: 'EN_COURS',
        nonConformiteId,
        responsableId: responsableId || null,
        dateEcheance: dateEcheance ? new Date(dateEcheance) : null,
        createdAt: new Date(),
        updatedAt: new Date(),
        // Champs CI.DES Action Corrective
        issuerName,
        recipientName,
        date,
        number,
        department,
        originCustomer,
        originProduction,
        originAdministration,
        originOther,
        categoryOfAnomaly,
        issuerDescription,
        immediateCurativeAction,
        actionPlanned,
        correctiveDescribed,
        preventiveDescribed,
        recipientSignature,
        issuerSignature,
        collaboratorInCharge,
        analysis,
        limitTime,
        collaboratorAppointed,
        closingDate,
        effectiveness,
        effectivenessType,
        signatureReception,
        observation,
        conclusion,
        conclusionSignature
      },
      include: {
        nonConformite: {
          select: {
            numero: true,
            titre: true
          }
        }
      }
    });

    return NextResponse.json({ 
      message: 'Action corrective créée avec succès',
      actionCorrective 
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'action corrective:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}