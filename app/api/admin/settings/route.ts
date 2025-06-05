import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/admin/settings
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const settings = await prisma.settings.findFirst();

    if (!settings) {
      // Créer des paramètres par défaut s'ils n'existent pas
      const defaultSettings = await prisma.settings.create({
        data: {
          company: {
            name: 'CIDES',
            address: '123 Rue de la Paix',
            city: 'Paris',
            postalCode: '75000',
            country: 'France',
            email: 'contact@cides.fr',
            phone: '+33 1 23 45 67 89',
            website: 'https://www.cides.fr',
            siret: '12345678901234',
            tva: 'FR12345678901'
          },
          formation: {
            defaultDuration: 1,
            maxParticipants: 12,
            minParticipants: 4,
            pricePerDay: 0
          },
          email: {
            smtpHost: 'smtp.gmail.com',
            smtpPort: 587,
            smtpUser: 'davidatikpo4@gmail.com',
            smtpPassword: 'osqu uyka rphz zegn',
            fromEmail: 'davidatikpo4@gmail.com',
            fromName: 'CIDES'
          }
        }
      });
      return NextResponse.json(defaultSettings);
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Erreur lors de la récupération des paramètres:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des paramètres' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/settings
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const body = await req.json();

    const settings = await prisma.settings.upsert({
      where: { id: '1' },
      update: {
        company: body.company,
        formation: body.formation,
        email: body.email
      },
      create: {
        id: '1',
        company: body.company,
        formation: body.formation,
        email: body.email
      }
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Erreur lors de la mise à jour des paramètres:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la mise à jour des paramètres' },
      { status: 500 }
    );
  }
} 