import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const { sessionId, courseDate, courseLocation, diffusion, copie, adminSignature } = body;

    if (!sessionId || !courseDate || !courseLocation || !diffusion || !copie || !adminSignature) {
      return NextResponse.json({ 
        error: 'Tous les champs sont requis',
        received: { sessionId, courseDate, courseLocation, diffusion, copie, hasSignature: !!adminSignature }
      }, { status: 400 });
    }

    // sessionId est maintenant le nom de la session (ex: "2025 avril 21 au 11/08/2025")
    const sessionName = sessionId;

    // Vérifier si une induction existe déjà pour cette session
    const existingInduction = await prisma.$queryRaw`
      SELECT * FROM "webirata"."TraineeInduction" WHERE "sessionId" = ${sessionName}
    `;

    let result;
    if (Array.isArray(existingInduction) && existingInduction.length > 0) {
      // Mettre à jour l'induction existante
      const existingId = existingInduction[0].id;
      result = await prisma.$queryRaw`
        UPDATE "webirata"."TraineeInduction" 
        SET "courseDate" = ${courseDate},
            "courseLocation" = ${courseLocation},
            "diffusion" = ${diffusion},
            "copie" = ${copie},
            "adminSignature" = ${adminSignature},
            "updatedAt" = NOW()
        WHERE id = ${existingId}
        RETURNING *
      `;
    } else {
      // Créer une nouvelle induction
      result = await prisma.$queryRaw`
        INSERT INTO "webirata"."TraineeInduction" (
          id, "sessionId", "courseDate", "courseLocation", "diffusion", "copie", "adminSignature", "createdAt", "updatedAt"
        ) VALUES (
          gen_random_uuid()::text, ${sessionName}, ${courseDate}, ${courseLocation}, ${diffusion}, ${copie}, ${adminSignature}, NOW(), NOW()
        )
        RETURNING *
      `;
    }

    const induction = Array.isArray(result) ? result[0] : null;

    if (!induction) {
      return NextResponse.json({ error: 'Erreur lors de la sauvegarde' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Induction sauvegardée avec succès',
      induction
    });

  } catch (error) {
    console.error('Erreur lors de la sauvegarde de l\'induction:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la sauvegarde de l\'induction' },
      { status: 500 }
    );
  }
}
