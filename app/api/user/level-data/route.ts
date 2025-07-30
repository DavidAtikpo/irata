import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Données mockées pour la démonstration
    const mockLevelData = [
      { syllabusItem: 'Généralités', level: 'Level 1', required: true },
      { syllabusItem: 'Généralités', level: 'Level 2', required: false },
      { syllabusItem: 'Généralités', level: 'Level 3', required: false },
      { syllabusItem: 'Règles de sécurité', level: 'Level 1', required: true },
      { syllabusItem: 'Règles de sécurité', level: 'Level 2', required: true },
      { syllabusItem: 'Règles de sécurité', level: 'Level 3', required: false },
      { syllabusItem: 'Équipements de protection', level: 'Level 1', required: true },
      { syllabusItem: 'Équipements de protection', level: 'Level 2', required: true },
      { syllabusItem: 'Équipements de protection', level: 'Level 3', required: true },
      { syllabusItem: 'Inspection des équipements', level: 'Level 1', required: true },
      { syllabusItem: 'Inspection des équipements', level: 'Level 2', required: false },
      { syllabusItem: 'Inspection des équipements', level: 'Level 3', required: false },
      { syllabusItem: 'Techniques de gréage', level: 'Level 1', required: true },
      { syllabusItem: 'Techniques de gréage', level: 'Level 2', required: true },
      { syllabusItem: 'Techniques de gréage', level: 'Level 3', required: false },
      { syllabusItem: 'Manœuvres de cordes', level: 'Level 1', required: true },
      { syllabusItem: 'Manœuvres de cordes', level: 'Level 2', required: true },
      { syllabusItem: 'Manœuvres de cordes', level: 'Level 3', required: true },
      { syllabusItem: 'Sauvetage et évacuation', level: 'Level 1', required: true },
      { syllabusItem: 'Sauvetage et évacuation', level: 'Level 2', required: false },
      { syllabusItem: 'Sauvetage et évacuation', level: 'Level 3', required: false },
      { syllabusItem: 'Premiers soins', level: 'Level 1', required: true },
      { syllabusItem: 'Premiers soins', level: 'Level 2', required: true },
      { syllabusItem: 'Premiers soins', level: 'Level 3', required: false },
      { syllabusItem: 'Communication radio', level: 'Level 1', required: true },
      { syllabusItem: 'Communication radio', level: 'Level 2', required: false },
      { syllabusItem: 'Communication radio', level: 'Level 3', required: false },
      { syllabusItem: 'Planification des travaux', level: 'Level 1', required: true },
      { syllabusItem: 'Planification des travaux', level: 'Level 2', required: true },
      { syllabusItem: 'Planification des travaux', level: 'Level 3', required: true },
      { syllabusItem: 'Évaluation des risques', level: 'Level 1', required: true },
      { syllabusItem: 'Évaluation des risques', level: 'Level 2', required: true },
      { syllabusItem: 'Évaluation des risques', level: 'Level 3', required: false },
      { syllabusItem: 'Procédures d\'urgence', level: 'Level 1', required: true },
      { syllabusItem: 'Procédures d\'urgence', level: 'Level 2', required: true },
      { syllabusItem: 'Procédures d\'urgence', level: 'Level 3', required: true },
      { syllabusItem: 'Maintenance des équipements', level: 'Level 1', required: true },
      { syllabusItem: 'Maintenance des équipements', level: 'Level 2', required: false },
      { syllabusItem: 'Maintenance des équipements', level: 'Level 3', required: false },
      { syllabusItem: 'Réglementation', level: 'Level 1', required: true },
      { syllabusItem: 'Réglementation', level: 'Level 2', required: true },
      { syllabusItem: 'Réglementation', level: 'Level 3', required: false },
      { syllabusItem: 'Certification', level: 'Level 1', required: true },
      { syllabusItem: 'Certification', level: 'Level 2', required: true },
      { syllabusItem: 'Certification', level: 'Level 3', required: true },
    ];

    return NextResponse.json(mockLevelData);
  } catch (error) {
    console.error('Erreur lors de la récupération des données de niveau:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
} 