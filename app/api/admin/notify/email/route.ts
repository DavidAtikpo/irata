import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from 'lib/prisma';
import { sendEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { userId, subject, message } = await req.json();
    if (!userId) {
      return NextResponse.json({ error: 'userId requis' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true, nom: true, prenom: true } });
    if (!user?.email) {
      return NextResponse.json({ error: "Email utilisateur introuvable" }, { status: 400 });
    }

    const emailSubject = subject || 'Action requise sur votre dossier';
    const emailBody = message || `Bonjour ${user.prenom || ''} ${user.nom || ''},\n\nMerci de compléter les étapes en attente (validation du devis, signature du contrat, ou paiement).\n\nCordialement.`;

    await sendEmail({
      to: user.email,
      subject: emailSubject,
      text: emailBody,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Erreur envoi email:', error);
    return NextResponse.json({ error: "Erreur lors de l'envoi de l'email" }, { status: 500 });
  }
}


