import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, ContributionStatus } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('status');

    const where = status && Object.values(ContributionStatus).includes(status as ContributionStatus) 
      ? { status: status as ContributionStatus } 
      : {};

    const [contributions, total, stats] = await Promise.all([
      prisma.contribution.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          user: {
            select: {
              id: true,
              nom: true,
              prenom: true,
              email: true
            }
          }
        }
      }),
      prisma.contribution.count({ where }),
      prisma.contribution.aggregate({
        _sum: { amount: true },
        _avg: { amount: true },
        _count: { id: true }
      })
    ]);

    const transformedContributions = contributions.map(contribution => ({
      id: contribution.id,
      donorName: contribution.user ? `${contribution.user.prenom} ${contribution.user.nom}` : contribution.donorName,
      donorEmail: contribution.user?.email || contribution.donorEmail,
      amount: contribution.amount,
      type: contribution.type,
      status: contribution.status,
      returnAmount: contribution.returnAmount,
      date: contribution.createdAt.toISOString(),
      notes: contribution.notes,
      paymentMethod: contribution.paymentMethod,
      userId: contribution.userId
    }));

    const goal = 50000000; // 50M FCFA objectif
    const totalRaised = stats._sum.amount || 0;
    const contributorCount = stats._count.id || 0;
    const averageContribution = Math.round(stats._avg.amount || 0);

    return NextResponse.json({
      success: true,
      data: {
        contributions: transformedContributions,
        stats: {
          totalRaised,
          goal,
          contributorCount,
          averageContribution,
          progressPercentage: Math.round((totalRaised / goal) * 100)
        },
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total
        }
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des contributions:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la récupération des contributions' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const {
      donorName,
      donorEmail,
      donorPhone,
      amount,
      type,
      paymentMethod = 'mobile_money',
      userId,
      notes
    } = data;

    // Validation
    if (!donorName || !donorEmail || !amount || !type) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Les champs nom, email, montant et type sont obligatoires' 
        },
        { status: 400 }
      );
    }

    if (amount < 25000) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Le montant minimum est de 25 000 FCFA' 
        },
        { status: 400 }
      );
    }

    // Calcul du montant de retour selon le type
    let returnAmount = amount;
    let returnDescription = '';

    switch (type) {
      case 'preformation':
        returnAmount = amount + (amount * 0.10); // 10% de bonus
        returnDescription = `Remise de ${returnAmount.toLocaleString()} FCFA sur la formation`;
        break;
      case 'financial':
        returnAmount = amount + (amount * 0.08); // 8% de rendement
        returnDescription = `Remboursement de ${returnAmount.toLocaleString()} FCFA`;
        break;
      case 'material':
        returnAmount = amount;
        returnDescription = 'Récompenses matérielles selon le montant';
        break;
    }

    // Créer la contribution
    const contribution = await prisma.contribution.create({
      data: {
        donorName,
        donorEmail,
        donorPhone,
        amount,
        type,
        returnAmount,
        returnDescription,
        paymentMethod,
        status: 'PENDING',
        userId: userId || null,
        notes: notes || null
      }
    });

    // Envoyer email de confirmation (à implémenter)
    // await sendContributionConfirmationEmail(contribution);

    return NextResponse.json({
      success: true,
      data: {
        contributionId: contribution.id,
        amount,
        returnAmount,
        returnDescription,
        status: contribution.status,
        message: 'Contribution enregistrée avec succès. Vous recevrez bientôt les instructions de paiement.'
      }
    });

  } catch (error) {
    console.error('Erreur lors de la création de la contribution:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la création de la contribution' 
      },
      { status: 500 }
    );
  }
}