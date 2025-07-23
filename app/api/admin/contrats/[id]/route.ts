import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const contrat = await prisma.contrat.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            nom: true,
            prenom: true,
          },
        },
        devis: {
          include: {
            demande: {
              select: {
                session: true,
                message: true,
              },
            },
          },
        },
      },
    });

    if (!contrat) {
      return NextResponse.json(
        { message: 'Contrat non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json(contrat);
  } catch (error) {
    console.error('Erreur lors de la récupération du contrat:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération du contrat' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { status } = await request.json();

    if (!status || !['EN_ATTENTE', 'SIGNE', 'VALIDE', 'REFUSE', 'ANNULE'].includes(status)) {
      return NextResponse.json(
        { message: 'Statut invalide' },
        { status: 400 }
      );
    }

    const { id } = await params;

    const contrat = await prisma.contrat.update({
      where: { id },
      data: { statut: status },
      include: {
        user: true,
        devis: {
          include: {
            demande: {
              select: {
                session: true,
              },
            },
          },
        },
      },
    });

    // Envoyer un email de notification
    try {
      const statusMap = {
        EN_ATTENTE: 'en attente',
        SIGNE: 'signé',
        VALIDE: 'validé',
        REFUSE: 'refusé',
        ANNULE: 'annulé',
      } as const;
      const statusText = statusMap[status as keyof typeof statusMap];

      await sendEmail({
        to: contrat.user.email,
        subject: `Mise à jour de votre contrat de formation - ${statusText}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h2 style="color: #2563eb; margin-bottom: 20px;">Mise à jour de votre contrat de formation</h2>
            <p>Bonjour ${contrat.user.prenom} ${contrat.user.nom},</p>
            <p>Votre contrat de formation pour la session <strong>${contrat.devis.demande.session}</strong> est maintenant <strong>${statusText}</strong>.</p>
            <p>Vous pouvez consulter les détails en vous connectant à votre espace personnel.</p>
            <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
              Cordialement,<br>
              L'équipe CI.DES
            </p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error('Erreur lors de l\'envoi de l\'email:', emailError);
      // On continue même si l'envoi de l'email échoue
    }

    return NextResponse.json(contrat);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du contrat:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la mise à jour du contrat' },
      { status: 500 }
    );
  }
} 