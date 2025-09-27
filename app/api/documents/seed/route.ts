import { NextRequest, NextResponse } from 'next/server';
import { prisma } from 'lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Vérifier si des documents existent déjà
    const existingDocs = await prisma.document.findMany({
      where: {
        type: 'FINANCEMENT_PARTICIPATIF'
      }
    });

    if (existingDocs.length > 0) {
      return NextResponse.json({
        success: false,
        message: 'Des documents existent déjà'
      });
    }

    // Créer les documents de test
    const documents = [
      {
        nom: '📋 Plan d\'Affaires Complet',
        description: 'Étude détaillée du marché, projections financières et stratégie de développement',
        type: 'FINANCEMENT_PARTICIPATIF',
        url: '/documents/financement-participatif/business-plan.pdf',
        cloudinaryId: 'financement-participatif/business-plan',
        public: true
      },
      {
        nom: '⚖️ Statuts Juridiques & Licences',
        description: 'Documents officiels d\'enregistrement et autorisations légales',
        type: 'FINANCEMENT_PARTICIPATIF',
        url: '/documents/financement-participatif/statuts-juridiques.pdf',
        cloudinaryId: 'financement-participatif/statuts-juridiques',
        public: true
      },
      {
        nom: '💰 Audit Financier Indépendant',
        description: 'Rapport d\'audit réalisé par un cabinet comptable certifié',
        type: 'FINANCEMENT_PARTICIPATIF',
        url: '/documents/financement-participatif/audit-financier.pdf',
        cloudinaryId: 'financement-participatif/audit-financier',
        public: true
      },
      {
        nom: '🏆 Certifications & Agréments IRATA',
        description: 'Certifications officielles et partenariats avec les organismes de formation',
        type: 'FINANCEMENT_PARTICIPATIF',
        url: '/documents/financement-participatif/certifications.pdf',
        cloudinaryId: 'financement-participatif/certifications',
        public: true
      },
      {
        nom: '🏗️ Rapport d\'Avancement Construction',
        description: 'Photos et rapports détaillés de l\'état d\'avancement du bâtiment (95% terminé)',
        type: 'FINANCEMENT_PARTICIPATIF',
        url: '/documents/financement-participatif/avancement-construction.pdf',
        cloudinaryId: 'financement-participatif/avancement-construction',
        public: true
      },
      {
        nom: '⚠️ Analyse des Risques & Mitigation',
        description: 'Identification des risques projet et stratégies de mitigation',
        type: 'FINANCEMENT_PARTICIPATIF',
        url: '/documents/financement-participatif/analyse-risques.pdf',
        cloudinaryId: 'financement-participatif/analyse-risques',
        public: true
      }
    ];

    // Insérer les documents
    const createdDocs = await prisma.document.createMany({
      data: documents
    });

    return NextResponse.json({
      success: true,
      message: `${createdDocs.count} documents créés avec succès`
    });

  } catch (error) {
    console.error('Erreur création documents:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création des documents' },
      { status: 500 }
    );
  }
}
