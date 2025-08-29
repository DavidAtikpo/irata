import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Vérifier si des membres existent déjà
    const existingMembers = await prisma.teamMember.findMany();

    if (existingMembers.length > 0) {
      return NextResponse.json({
        success: false,
        message: 'Des membres d\'équipe existent déjà'
      });
    }

    // Créer les membres de test
    const teamMembers = [
      {
        name: 'Jean-Claude AGBODJAN',
        role: 'Directeur Général',
        experience: '15 ans dans la formation sécurité',
        certifications: JSON.stringify(['IRATA Level 3', 'Formateur CND']),
        photo: '/team/jean-claude.jpg',
        email: 'jean-claude.agbodjan@cides.tf',
        linkedin: 'https://linkedin.com/in/jean-claude-agbodjan',
        isActive: true,
        order: 1
      },
      {
        name: 'Marie KOFFI',
        role: 'Directrice Technique',
        experience: '12 ans en sécurité industrielle',
        certifications: JSON.stringify(['Ingénieur Sécurité', 'NEBOSH']),
        photo: '/team/marie-koffi.jpg',
        email: 'marie.koffi@cides.tf',
        linkedin: 'https://linkedin.com/in/marie-koffi',
        isActive: true,
        order: 2
      },
      {
        name: 'Kofi MENSAH',
        role: 'Responsable Formation',
        experience: '10 ans formation professionnelle',
        certifications: JSON.stringify(['IRATA Level 2', 'SST Formateur']),
        photo: '/team/kofi-mensah.jpg',
        email: 'kofi.mensah@cides.tf',
        linkedin: 'https://linkedin.com/in/kofi-mensah',
        isActive: true,
        order: 3
      }
    ];

    // Insérer les membres
    const createdMembers = await prisma.teamMember.createMany({
      data: teamMembers
    });

    return NextResponse.json({
      success: true,
      message: `${createdMembers.count} membres d'équipe créés avec succès`
    });

  } catch (error) {
    console.error('Erreur création membres équipe:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création des membres d\'équipe' },
      { status: 500 }
    );
  }
}
