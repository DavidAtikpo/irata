import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: 'Non authentifié' }, { status: 401 });

    const sessionName = req.nextUrl.searchParams.get('session');
    console.log('User unlock GET pour session:', sessionName); // Debug
    if (!sessionName) return NextResponse.json({ message: 'session requis' }, { status: 400 });

    const unlocks = await prisma.attendanceUnlock.findMany({ where: { sessionName } });
    console.log('Unlocks trouvés pour user:', unlocks); // Debug
    const map = unlocks.reduce((acc: Record<string, boolean>, u) => {
      acc[`${u.day}-${u.period}`] = true;
      return acc;
    }, {} as Record<string, boolean>);
    console.log('Map unlocks pour user:', map); // Debug
    return NextResponse.json({ unlocks: map });
  } catch (e) {
    console.error('Erreur GET unlock user:', e); // Debug
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 });
  }
}


