import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from 'lib/prisma';

// Placeholder endpoint - integrate with real WhatsApp provider later (e.g., Twilio)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { userId, message } = await req.json();
    if (!userId) {
      return NextResponse.json({ error: 'userId requis' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { phone: true, nom: true, prenom: true } });
    if (!user?.phone) {
      return NextResponse.json({ error: 'Numéro de téléphone manquant' }, { status: 400 });
    }

    // For now, return whatsapp deep-link so admin can click and send
    const text = encodeURIComponent(message || `Bonjour ${user.prenom || ''} ${user.nom || ''}, merci de compléter les étapes en attente.`);
    const phone = user.phone.replace(/\D/g, '');
    const link = `https://wa.me/${phone}?text=${text}`;

    return NextResponse.json({ ok: true, link });
  } catch (error) {
    console.error('Erreur WhatsApp:', error);
    return NextResponse.json({ error: 'Erreur lors de la préparation du message WhatsApp' }, { status: 500 });
  }
}


