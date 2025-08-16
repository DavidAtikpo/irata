import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    const { id, note1, note2 } = await req.json();
    if (!id) {
      return NextResponse.json({ message: 'ID requis' }, { status: 400 });
    }

    // Persist admin comments as a JSON field in suggestions if needed, or in a dedicated place
    // If your model does not yet have admin comment fields, store in suggestions appended safely
    const existing = await prisma.customerSatisfactionResponse.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ message: 'Réponse introuvable' }, { status: 404 });
    }

    const adminComments = `\n\n[Admin 1]: ${note1 || ''}\n[Admin 2]: ${note2 || ''}`.trim();
    const suggestions = (existing.suggestions || '') + (adminComments ? adminComments : '');

    await prisma.customerSatisfactionResponse.update({
      where: { id },
      data: { suggestions },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Erreur commentaire admin:', err);
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 });
  }
}






