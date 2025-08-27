import { NextRequest, NextResponse } from 'next/server';

interface ProjectUpdate {
  id: string;
  title: string;
  description: string;
  date: string;
  category: 'progress' | 'financial' | 'milestone' | 'communication';
  images?: string[];
  impact: 'low' | 'medium' | 'high';
}

// Données simulées des actualités du projet
const projectUpdates: ProjectUpdate[] = [
  {
    id: '1',
    title: 'Installation des équipements cordistes IRATA terminée',
    description: 'Les équipements de formation cordiste IRATA Level 1, 2 et 3 ont été installés avec succès dans nos ateliers pratiques. Les structures d\'entraînement en hauteur sont maintenant opérationnelles et conformes aux standards internationaux.',
    date: '2025-01-25',
    category: 'progress',
    impact: 'high',
    images: ['/updates/cordiste-equipment-1.jpg', '/updates/cordiste-structure.jpg']
  },
  {
    id: '2', 
    title: 'Réception du premier appareil à ultrasons CND',
    description: 'Le premier appareil de contrôle non destructif par ultrasons est arrivé au centre. Nos techniciens procèdent actuellement aux tests de calibration et à la formation du personnel.',
    date: '2025-01-22',
    category: 'milestone',
    impact: 'high',
    images: ['/updates/ultrasound-device.jpg']
  },
  {
    id: '3',
    title: 'Certification IRATA officielle obtenue',
    description: 'Le centre a officiellement reçu sa certification IRATA pour dispenser des formations Level 1, 2 et 3. Cette certification nous permet de délivrer des certifications reconnues internationalement à nos futurs stagiaires.',
    date: '2025-01-20',
    category: 'milestone',
    impact: 'high'
  },
  {
    id: '4',
    title: 'Financement participatif : 20% de l\'objectif atteint',
    description: 'Grâce à la générosité de nos 58 contributeurs, nous avons atteint 20% de notre objectif de financement. Les fonds collectés nous permettent de poursuivre l\'acquisition d\'équipements spécialisés.',
    date: '2025-01-18',
    category: 'financial',
    impact: 'medium'
  },
  {
    id: '5',
    title: 'Formation de l\'équipe pédagogique locale',
    description: 'Notre équipe de formateurs togolais a terminé sa formation certifiante en France. Ils sont maintenant qualifiés pour dispenser des formations de qualité internationale directement au Togo.',
    date: '2025-01-15',
    category: 'progress',
    impact: 'high',
    images: ['/updates/team-training.jpg', '/updates/certificates.jpg']
  },
  {
    id: '6',
    title: 'Finalisation des travaux de finition du bâtiment',
    description: 'Les derniers 5% de travaux de construction sont en cours de finalisation. L\'électricité, la plomberie et les systèmes de sécurité sont maintenant installés et fonctionnels.',
    date: '2025-01-12',
    category: 'progress',
    impact: 'medium',
    images: ['/updates/building-final.jpg', '/updates/safety-systems.jpg']
  },
  {
    id: '7',
    title: 'Partenariat avec l\'Université de Lomé',
    description: 'Signature d\'un accord de partenariat avec l\'Université de Lomé pour développer des programmes de formation continue et offrir des débouchés académiques à nos stagiaires.',
    date: '2025-01-10',
    category: 'communication',
    impact: 'medium'
  },
  {
    id: '8',
    title: 'Première commande d\'équipements SST',
    description: 'Commande passée pour l\'équipement de sécurité et santé au travail incluant masques de protection, harnais de sécurité, casques, et matériel de premiers secours conforme aux normes internationales.',
    date: '2025-01-08',
    category: 'progress',
    impact: 'medium'
  },
  {
    id: '9',
    title: 'Agrément ministériel pour la formation professionnelle',
    description: 'Obtention de l\'agrément officiel du Ministère de l\'Enseignement Technique et de la Formation Professionnelle du Togo. Cet agrément nous permet de délivrer des certificats reconnus par l\'État.',
    date: '2025-01-05',
    category: 'milestone',
    impact: 'high'
  },
  {
    id: '10',
    title: 'Lancement officiel de la campagne de financement',
    description: 'Lancement officiel de notre campagne de financement participatif avec pour objectif de collecter 50 millions de FCFA pour équiper entièrement le centre de formation.',
    date: '2025-01-01',
    category: 'communication',
    impact: 'medium'
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const category = searchParams.get('category');
    const impact = searchParams.get('impact');

    let filteredUpdates = [...projectUpdates];

    // Filtrer par catégorie
    if (category && category !== 'all') {
      filteredUpdates = filteredUpdates.filter(update => update.category === category);
    }

    // Filtrer par impact
    if (impact && impact !== 'all') {
      filteredUpdates = filteredUpdates.filter(update => update.impact === impact);
    }

    // Pagination
    const paginatedUpdates = filteredUpdates.slice(offset, offset + limit);
    
    // Statistiques des actualités
    const stats = {
      totalUpdates: filteredUpdates.length,
      recentHighImpact: filteredUpdates.filter(u => u.impact === 'high').length,
      categoryCounts: {
        progress: filteredUpdates.filter(u => u.category === 'progress').length,
        financial: filteredUpdates.filter(u => u.category === 'financial').length,
        milestone: filteredUpdates.filter(u => u.category === 'milestone').length,
        communication: filteredUpdates.filter(u => u.category === 'communication').length
      }
    };

    return NextResponse.json({
      success: true,
      data: paginatedUpdates,
      meta: {
        total: filteredUpdates.length,
        limit,
        offset,
        hasMore: offset + limit < filteredUpdates.length,
        stats
      }
    });

  } catch (error) {
    console.error('Erreur récupération actualités:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la récupération des actualités'
    }, { status: 500 });
  }
}

// POST pour ajouter une nouvelle actualité (réservé aux admins)
export async function POST(request: NextRequest) {
  try {
    // Ici on ajouterait la vérification des droits admin
    // const session = await getServerSession(authOptions);
    // if (!session?.user?.role === 'admin') return unauthorized...

    const updateData = await request.json();
    
    const newUpdate: ProjectUpdate = {
      id: Date.now().toString(),
      title: updateData.title,
      description: updateData.description,
      date: new Date().toISOString().split('T')[0],
      category: updateData.category,
      images: updateData.images || [],
      impact: updateData.impact
    };

    // Ici on sauvegarderait en base de données
    projectUpdates.unshift(newUpdate);

    return NextResponse.json({
      success: true,
      data: newUpdate
    });

  } catch (error) {
    console.error('Erreur création actualité:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la création de l\'actualité'
    }, { status: 500 });
  }
}