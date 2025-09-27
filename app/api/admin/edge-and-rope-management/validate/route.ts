import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from 'lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const { adminName, adminSignature } = body;

    if (!adminName || !adminSignature) {
      return NextResponse.json({ 
        error: 'Nom admin et signature requis' 
      }, { status: 400 });
    }

    // Créer la validation du document
    const result = await prisma.$queryRaw`
      INSERT INTO "webirata"."EdgeAndRopeManagementValidation" (
        id, "adminName", "adminSignature", "createdAt", "updatedAt"
      ) VALUES (
        gen_random_uuid()::text, ${adminName}, ${adminSignature}, NOW(), NOW()
      )
      RETURNING *
    `;

    const validation = Array.isArray(result) ? result[0] : null;

    if (!validation) {
      return NextResponse.json({ error: 'Erreur lors de la validation' }, { status: 500 });
    }

    console.log('Document Edge and Rope Management validé par:', adminName);

    return NextResponse.json({
      success: true,
      message: 'Document validé et mis à disposition des utilisateurs',
      validation
    });

  } catch (error) {
    console.error('Erreur lors de la validation du document:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors de la validation du document',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}













