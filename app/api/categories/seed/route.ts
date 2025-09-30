import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    // Vérifier si des catégories existent déjà
    const existingCategories = await prisma.categories.findMany();

    if (existingCategories.length > 0) {
      return NextResponse.json({
        success: false,
        message: 'Des catégories existent déjà'
      });
    }

    // Créer les catégories de base
    const categories = [
      {
        name: 'Harnais',
        description: 'Harnais de sécurité pour travaux en hauteur',
        slug: 'harnais'
      },
      {
        name: 'Cordes',
        description: 'Cordes et accessoires de cordage',
        slug: 'cordes'
      },
      {
        name: 'Casques',
        description: 'Casques de sécurité et protection',
        slug: 'casques'
      },
      {
        name: 'Accessoires',
        description: 'Accessoires et équipements divers',
        slug: 'accessoires'
      }
    ];

    // Insérer les catégories
    const createdCategories = await prisma.categories.createMany({
      data: categories.map(category => ({
        ...category,
        id: randomUUID(),
        updatedAt: new Date()
      }))
    });

    return NextResponse.json({
      success: true,
      message: `${createdCategories.count} catégories créées avec succès`,
      categories: createdCategories
    });

  } catch (error) {
    console.error('Erreur lors de la création des catégories:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création des catégories' },
      { status: 500 }
    );
  }
}
