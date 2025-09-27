import { NextRequest, NextResponse } from 'next/server';
import { prisma } from 'lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const documents = await prisma.document.findMany({
      where: {
        type: 'FINANCEMENT_PARTICIPATIF',
        public: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Formater les documents pour le frontend
    const formattedDocuments = documents.map(doc => ({
      id: doc.id,
      title: doc.nom,
      description: doc.description || '',
      size: '2.8 MB', // Valeur par défaut
      pages: '45 pages', // Valeur par défaut
      category: doc.type,
      downloadUrl: doc.url,
      preview: {
        sections: ['Document disponible', 'Informations détaillées', 'Données du projet']
      },
      isPublic: doc.public,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString()
    }));

    return NextResponse.json({
      success: true,
      documents: formattedDocuments
    });

  } catch (error) {
    console.error('Erreur récupération documents:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des documents' },
      { status: 500 }
    );
  }
}
