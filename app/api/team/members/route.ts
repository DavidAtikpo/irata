import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const teamMembers = await prisma.teamMember.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        order: 'asc'
      }
    });

    // Formater les membres pour le frontend
    const formattedMembers = teamMembers.map(member => ({
      id: member.id,
      name: member.name,
      role: member.role,
      experience: member.experience,
      certifications: member.certifications ? JSON.parse(member.certifications) : [],
      photo: member.photo,
      email: member.email,
      linkedin: member.linkedin
    }));

    return NextResponse.json({
      success: true,
      members: formattedMembers
    });

  } catch (error) {
    console.error('Erreur récupération équipe:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération de l\'équipe' },
      { status: 500 }
    );
  }
}
