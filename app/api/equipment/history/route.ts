import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    console.log('🔍 Récupération de l\'historique des équipements pour:', session.user.email);

    // TODO: Exécuter la migration Prisma avant d'utiliser: npx prisma migrate dev --name add_diplome_and_equipment_qr_models
    const equipments = await (prisma as any).equipmentQR.findMany({
      where: {
        createdById: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        qrCode: true,
        produit: true,
        referenceInterne: true,
        numeroSerie: true,
        pdfUrl: true,
        cloudinaryPublicId: true,
        createdAt: true,
        fabricant: true,
        normes: true,
      }
    });

    console.log(`✅ ${equipments.length} équipements trouvés`);

    return NextResponse.json(equipments);

  } catch (error) {
    console.error('❌ Erreur lors de la récupération de l\'historique:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' }, 
      { status: 500 }
    );
  }
}





