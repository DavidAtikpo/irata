import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from 'lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const sessionName = req.nextUrl.searchParams.get('session');
    console.log('Admin unlock GET pour session:', sessionName); // Debug
    if (!sessionName) return NextResponse.json({ message: 'session requis' }, { status: 400 });

    const unlocks = await prisma.attendanceUnlock.findMany({ where: { sessionName } });
    console.log('Unlocks trouvés:', unlocks); // Debug
    return NextResponse.json({ unlocks });
  } catch (e) {
    console.error('Erreur GET unlock:', e); // Debug
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    const { sessionName, day, period } = await req.json();
    console.log('Admin unlock POST:', { sessionName, day, period }); // Debug
    if (!sessionName || !day || !period) {
      return NextResponse.json({ message: 'Champs requis' }, { status: 400 });
    }

    const unlock = await prisma.attendanceUnlock.upsert({
      where: { sessionName_day_period: { sessionName, day, period } },
      update: {},
      create: { sessionName, day, period, createdBy: session.user.id },
    });
    console.log('Unlock créé:', unlock); // Debug
    return NextResponse.json({ unlock });
  } catch (e) {
    console.error('Erreur POST unlock:', e); // Debug
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    const { sessionName, day, period } = await req.json();
    if (!sessionName || !day || !period) {
      return NextResponse.json({ message: 'Champs requis' }, { status: 400 });
    }

    await prisma.attendanceUnlock.delete({
      where: { sessionName_day_period: { sessionName, day, period } },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 });
  }
}


