import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from 'lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Récupérer le statut de validation du document Edge and Rope Management
    const validation = await prisma.$queryRaw`
      SELECT * FROM "webirata"."EdgeAndRopeManagementValidation" 
      ORDER BY "createdAt" DESC
      LIMIT 1
    `;

    const latestValidation = Array.isArray(validation) && validation.length > 0 ? validation[0] : null;

    return NextResponse.json({
      success: true,
      isValidated: !!latestValidation,
      adminSignature: latestValidation?.adminSignature || null,
      adminName: latestValidation?.adminName || null,
      validatedAt: latestValidation?.createdAt || null
    });

  } catch (error) {
    console.error('Erreur lors de la récupération du statut:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors de la récupération du statut',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}













