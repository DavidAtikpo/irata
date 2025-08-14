import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    // Settings row has id "1" by default
    const settings = await prisma.settings.findUnique({ where: { id: '1' } });

    const company = (settings?.company as any) ?? {};
    const invoiceTemplate = company.invoiceTemplate ?? null;

    return NextResponse.json({ invoiceTemplate });
  } catch (error) {
    console.error('GET /api/admin/settings/invoice error:', error);
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    const body = await req.json();
    // Persist invoice template under settings.company.invoiceTemplate
    const current = await prisma.settings.findUnique({ where: { id: '1' } });
    const company = (current?.company as any) ?? {};
    company.invoiceTemplate = body;

    const updated = await prisma.settings.upsert({
      where: { id: '1' },
      create: {
        id: '1',
        company,
        formation: {},
        email: {},
      },
      update: {
        company,
      },
    });

    return NextResponse.json({ success: true, invoiceTemplate: (updated.company as any).invoiceTemplate });
  } catch (error) {
    console.error('PUT /api/admin/settings/invoice error:', error);
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 });
  }
}






