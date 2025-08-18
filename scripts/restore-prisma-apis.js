const fs = require('fs');
const path = require('path');

console.log('🔄 Restauration des APIs Prisma...');

try {
  // Restaurer l'API utilisateur avec Prisma
  const userApiPath = path.join(process.cwd(), 'app', 'api', 'documents', 'irata-disclaimer', 'route.ts');
  const userApiContent = `import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log('Received disclaimer form data:', data);

    // Récupérer le numéro IRATA global depuis la base de données
    let globalIrataNo = null;
    try {
      const globalSettings = await prisma.settings.findFirst({
        where: { key: 'globalIrataNo' }
      });
      globalIrataNo = globalSettings?.value || null;
    } catch (error) {
      console.log('Aucun numéro IRATA global défini');
    }

    const entry = await prisma.irataDisclaimerSubmission.create({
      data: {
        name: data.name || null,
        address: data.address || null,
        signature: data.signature || null,
        session: data.session || null,
        userId: data.user?.id || null,
        irataNo: globalIrataNo,
        status: 'PENDING'
      }
    });

    return NextResponse.json({ message: 'Document submitted successfully!', entry }, { status: 200 });
  } catch (error) {
    console.error('Error processing disclaimer form submission:', error);
    return NextResponse.json({ message: 'Error submitting document.' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session as any).user?.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    const submissions = await prisma.irataDisclaimerSubmission.findMany({
      include: {
        user: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ submissions }, { status: 200 });
  } catch (error) {
    console.error('Error reading submissions:', error);
    return NextResponse.json({ message: 'Erreur lors de la récupération' }, { status: 500 });
  }
}`;

  fs.writeFileSync(userApiPath, userApiContent, 'utf8');
  console.log('✅ API utilisateur restaurée avec Prisma');

  // Restaurer l'API admin avec Prisma
  const adminApiPath = path.join(process.cwd(), 'app', 'api', 'admin', 'irata-disclaimer', 'sign', 'route.ts');
  const adminApiContent = `import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Vérifier l'authentification admin
    if (!session || (session as any).user?.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    const { submissionId, adminSignature, adminName } = await request.json();

    if (!submissionId || !adminSignature) {
      return NextResponse.json({ message: 'Données manquantes' }, { status: 400 });
    }

    const updatedSubmission = await prisma.irataDisclaimerSubmission.update({
      where: { id: submissionId },
      data: {
        adminSignature,
        adminName,
        adminSignedAt: new Date(),
        status: 'SIGNED'
      }
    });

    return NextResponse.json({ 
      message: 'Document signé avec succès',
      submission: updatedSubmission
    });

  } catch (error) {
    console.error('Erreur lors de la signature admin:', error);
    return NextResponse.json({ message: 'Erreur interne du serveur' }, { status: 500 });
  }
}`;

  fs.writeFileSync(adminApiPath, adminApiContent, 'utf8');
  console.log('✅ API admin restaurée avec Prisma');

  console.log('🎉 Toutes les APIs ont été restaurées pour utiliser Prisma');
  console.log('💡 Votre application utilise maintenant la base de données');

} catch (error) {
  console.error('❌ Erreur lors de la restauration:', error);
  process.exit(1);
}
