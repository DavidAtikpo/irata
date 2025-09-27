import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';

interface FormField {
  id: string;
  type: 'text' | 'textarea' | 'checkbox' | 'date' | 'signature';
  label: string;
  value: string;
  x: number;
  y: number;
  width: number;
  height: number;
  required?: boolean;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session?.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Simuler la récupération du formulaire
    // Dans une vraie implémentation, vous récupéreriez depuis la base de données
    const mockFormulaire = {
      id,
      nom: 'Formulaire évaluation niveau 1',
      description: 'Formulaire d\'évaluation pour les stagiaires niveau 1 IRATA',
      type: 'TEMPLATE',
      fichierUrl: `/formulaires/evaluation-niveau1.pdf`,
      fields: [
        {
          id: '1',
          type: 'text',
          label: 'Nom du stagiaire',
          value: '',
          x: 100,
          y: 150,
          width: 200,
          height: 30,
          required: true
        },
        // ... autres champs
      ]
    };

    return NextResponse.json(mockFormulaire);

  } catch (error) {
    console.error('Erreur lors de la récupération:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération du formulaire' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session?.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const { fields, stagiaireId } = await req.json();

    // Valider les données
    if (!fields || !Array.isArray(fields)) {
      return NextResponse.json(
        { message: 'Champs invalides' },
        { status: 400 }
      );
    }

    // Sauvegarder les modifications en base de données
    console.log('Sauvegarde des champs pour le formulaire:', id);
    console.log('Champs:', fields);
    console.log('Stagiaire ID:', stagiaireId);

    // Ici vous mettriez à jour la base de données
    // await prisma.formulairePDF.update({
    //   where: { id },
    //   data: {
    //     fields: JSON.stringify(fields),
    //     stagiaireId: stagiaireId || null,
    //     updatedAt: new Date()
    //   }
    // });

    return NextResponse.json({
      message: 'Formulaire sauvegardé avec succès',
      updatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la sauvegarde' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session?.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Supprimer le formulaire
    console.log('Suppression du formulaire:', id);

    // Ici vous supprimeriez de la base de données et le fichier
    // await prisma.formulairePDF.delete({ where: { id } });
    // await unlink(filePath); // Supprimer le fichier

    return NextResponse.json({
      message: 'Formulaire supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la suppression' },
      { status: 500 }
    );
  }
} 