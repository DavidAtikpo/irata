'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface Investment {
  id: string;
  amount: number;
  type: 'preformation' | 'financial' | 'material';
  status: 'pending' | 'confirmed' | 'processed' | 'cancelled';
  date: string;
  returnAmount: number;
  returnDescription: string;
  paymentMethod: string;
  expectedReturn: string;
  maturityDate?: string;
}

interface ProjectUpdate {
  id: string;
  title: string;
  description: string;
  date: string;
  category: 'progress' | 'financial' | 'milestone' | 'communication';
  images?: string[];
  impact: 'low' | 'medium' | 'high';
}

interface ProjectStats {
  totalRaised: number;
  goal: number;
  progressPercentage: number;
  contributorCount: number;
  myTotalInvestment: number;
  myExpectedReturn: number;
  nextMilestone: {
    name: string;
    amount: number;
    progress: number;
  };
}

export default function InvestorDashboard() {
  const { data: session, status } = useSession();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [projectUpdates, setProjectUpdates] = useState<ProjectUpdate[]>([]);
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'investments' | 'updates' | 'returns'>('overview');

  useEffect(() => {
    if (status === 'authenticated') {
      fetchInvestorData();
    }
  }, [status]);

  const fetchInvestorData = async () => {
    try {
      setLoading(true);
      
      // Fetch user's investments
      const investmentsRes = await fetch('/api/user/investments');
      const investmentsData = await investmentsRes.json();
      
      // Fetch project updates
      const updatesRes = await fetch('/api/crowdfunding/project-updates');
      const updatesData = await updatesRes.json();
      
      // Fetch project stats
      const statsRes = await fetch('/api/crowdfunding/stats');
      const statsData = await statsRes.json();

      if (investmentsData.success) {
        setInvestments(investmentsData.data.investments);
        setStats(investmentsData.data.stats);
      }
      
      if (updatesData.success) {
        setProjectUpdates(updatesData.data);
      }

    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  // Données simulées pour la démo
  const mockInvestments: Investment[] = [
    {
      id: '1',
      amount: 152000,
      type: 'financial',
      status: 'confirmed',
      date: '2025-01-15T10:00:00Z',
      returnAmount: 164160,
      returnDescription: '8% de rendement en maximum 4 mois',
      paymentMethod: 'Carte bancaire',
      expectedReturn: '8%',
      maturityDate: '2025-05-15'
    },
    {
      id: '2',
      amount: 76000,
      type: 'preformation',
      status: 'processed',
      date: '2025-01-10T14:30:00Z',
      returnAmount: 83600,
      returnDescription: '10% de remise sur la formation',
      paymentMethod: 'Mobile Money',
      expectedReturn: '10% remise formation'
    }
  ];

  const mockUpdates: ProjectUpdate[] = [
    {
      id: '1',
      title: 'Installation des équipements cordistes en cours',
      description: 'Les premiers équipements de formation cordiste IRATA ont été réceptionnés et sont en cours d\'installation dans les ateliers pratiques.',
      date: '2025-01-25',
      category: 'progress',
      impact: 'high',
      images: ['/updates/equipment-1.jpg', '/updates/equipment-2.jpg']
    },
    {
      id: '2',
      title: 'Certification IRATA officielle obtenue',
      description: 'Le centre a officiellement obtenu sa certification IRATA Level 1, 2 et 3, permettant de délivrer des certifications reconnues internationalement.',
      date: '2025-01-20',
      category: 'milestone',
      impact: 'high'
    },
    {
      id: '3',
      title: 'Financement : 15% de l\'objectif atteint',
      description: 'Grâce à vos contributions, nous avons atteint 15% de notre objectif de financement participatif. Les fonds collectés permettent de commencer l\'achat d\'équipements.',
      date: '2025-01-18',
      category: 'financial',
      impact: 'medium'
    }
  ];

  const mockStats: ProjectStats = {
    totalRaised: 7500000,
    goal: 50000000,
    progressPercentage: 15,
    contributorCount: 42,
    myTotalInvestment: 228000,
    myExpectedReturn: 247760,
    nextMilestone: {
      name: 'Premier équipement CND',
      amount: 15000000,
      progress: 50
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount);
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return `px-2 py-1 rounded-full text-xs font-semibold ${badges[status] || ''}`;
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      preformation: '🎓 Formation',
      financial: '💰 Financier',
      material: '🎁 Matériel'
    };
    return labels[type] || type;
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      progress: '🏗️',
      financial: '💰',
      milestone: '🎯',
      communication: '📢'
    };
    return icons[category] || '📝';
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <h2 className="mt-4 text-xl font-semibold text-gray-900">Chargement de votre dashboard...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Connexion Requise</h2>
            <p className="text-gray-600 mb-6">
              Vous devez être connecté pour accéder à votre dashboard d'investisseur
            </p>
            <Link 
              href="/login" 
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition duration-300"
            >
              Se Connecter
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                📊 Dashboard Investisseur
              </h1>
              <p className="text-gray-600 mt-2">
                Bonjour {session?.user?.name}, suivez l'évolution de vos investissements
              </p>
            </div>
            <Link 
              href="/financement-participatif"
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition duration-300"
            >
              ➕ Nouveau Don
            </Link>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: '📈 Vue d\'ensemble', icon: '📊' },
              { id: 'investments', label: '💼 Mes Investissements', icon: '💰' },
              { id: 'updates', label: '📰 Actualités Projet', icon: '📢' },
              { id: 'returns', label: '💎 Mes Retours', icon: '🎁' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition duration-200 ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-2xl">💰</div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Mon Investissement</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {formatCurrency(mockStats.myTotalInvestment)} FCFA
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-2xl">📈</div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Retour Attendu</p>
                    <p className="text-2xl font-semibold text-green-600">
                      {formatCurrency(mockStats.myExpectedReturn)} FCFA
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-2xl">🎯</div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Progression Projet</p>
                    <p className="text-2xl font-semibold text-blue-600">
                      {mockStats.progressPercentage}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-2xl">🤝</div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Co-investisseurs</p>
                    <p className="text-2xl font-semibold text-purple-600">
                      {mockStats.contributorCount}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Project Progress */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                🎯 Progression Générale du Projet
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span>Financement collecté</span>
                  <span className="font-semibold">
                    {formatCurrency(mockStats.totalRaised)} / {formatCurrency(mockStats.goal)} FCFA
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${mockStats.progressPercentage}%` }}
                  />
                </div>
                <div className="text-sm text-gray-600">
                  Prochain jalon: {mockStats.nextMilestone.name} ({mockStats.nextMilestone.progress}% atteint)
                </div>
              </div>
            </div>

            {/* Recent Updates */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                📰 Dernières Actualités
              </h3>
              <div className="space-y-4">
                {mockUpdates.slice(0, 3).map((update) => (
                  <div key={update.id} className="border-l-4 border-indigo-400 pl-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-800">
                          {getCategoryIcon(update.category)} {update.title}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">{update.description}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(update.date).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Investments Tab */}
        {activeTab === 'investments' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">
                  💼 Historique de mes Investissements
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Montant
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Retour Attendu
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {mockInvestments.map((investment) => (
                      <tr key={investment.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(investment.date).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                          {formatCurrency(investment.amount)} FCFA
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {getTypeLabel(investment.type)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={getStatusBadge(investment.status)}>
                            {investment.status === 'pending' && 'En attente'}
                            {investment.status === 'confirmed' && 'Confirmé'}
                            {investment.status === 'processed' && 'Traité'}
                            {investment.status === 'cancelled' && 'Annulé'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(investment.returnAmount)} FCFA
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Updates Tab */}
        {activeTab === 'updates' && (
          <div className="space-y-6">
            {mockUpdates.map((update) => (
              <div key={update.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getCategoryIcon(update.category)}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {update.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {new Date(update.date).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    update.impact === 'high' ? 'bg-red-100 text-red-800' :
                    update.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    Impact {update.impact === 'high' ? 'Élevé' : update.impact === 'medium' ? 'Moyen' : 'Faible'}
                  </span>
                </div>
                <p className="text-gray-700">{update.description}</p>
                {update.images && (
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    {update.images.map((image, idx) => (
                      <div key={idx} className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-gray-500">📷 Image {idx + 1}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Returns Tab */}
        {activeTab === 'returns' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                💎 Mes Retours sur Investissement
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {mockInvestments.map((investment) => (
                  <div key={investment.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium text-gray-800">
                        {getTypeLabel(investment.type)}
                      </span>
                      <span className={getStatusBadge(investment.status)}>
                        {investment.status === 'pending' && 'En attente'}
                        {investment.status === 'confirmed' && 'Confirmé'}
                        {investment.status === 'processed' && 'Traité'}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Investissement:</span>
                        <span className="font-semibold">{formatCurrency(investment.amount)} FCFA</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Retour attendu:</span>
                        <span className="font-semibold text-green-600">
                          {formatCurrency(investment.returnAmount)} FCFA
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Gain:</span>
                        <span className="font-semibold text-blue-600">
                          +{formatCurrency(investment.returnAmount - investment.amount)} FCFA
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-3 text-sm text-gray-600">
                      {investment.returnDescription}
                    </div>
                    
                    {investment.maturityDate && (
                      <div className="mt-3 text-sm text-gray-500">
                        Échéance: {new Date(investment.maturityDate).toLocaleDateString('fr-FR')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}