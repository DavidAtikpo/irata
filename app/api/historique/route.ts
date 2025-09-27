import { NextResponse } from 'next/server';
import { prisma } from 'lib/prisma';

export async function GET() {
  try {
    const items = await prisma.historiqueItem.findMany({
      orderBy: { createdAt: 'desc' },
      include: { document: true },
    });

    const safe = items.filter((it) => it.document?.public && it.document?.type === 'historique');
    return NextResponse.json({ items: safe });
  } catch (error) {
    console.error('Erreur GET public historique:', error);
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 });
  }
}


