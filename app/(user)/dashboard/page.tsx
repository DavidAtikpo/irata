'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

interface Contribution {
  id: string;
  amount: number;
  currency: string;
  optionId: string;
  status: string;
  createdAt: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      redirect('/auth/signin');
      return;
    }

    fetchUserData();
  }, [session, status]);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/user/profile');
      const data = await response.json();
      
      if (data.success) {
        setUser(data.user);
        setContributions(data.contributions || []);
      }
    } catch (error) {
      console.error('Erreur chargement données:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    const symbols: { [key: string]: string } = {
      'FCFA': 'FCFA',
      'XOF': 'FCFA',
      'EUR': '€',
      'USD': '$',
      'GBP': '£',
      'CHF': 'CHF',
      'GHS': '₵',
      'NGN': '₦'
    };
    
    const symbol = symbols[currency] || 'FCFA';
    
    if (currency === 'EUR') {
      return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
    } else if (currency === 'USD') {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    } else if (currency === 'GBP') {
      return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount);
    } else if (currency === 'CHF') {
      return new Intl.NumberFormat('de-CH', { style: 'currency', currency: 'CHF' }).format(amount);
    } else if (currency === 'GHS') {
      return new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(amount);
    } else if (currency === 'NGN') {
      return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
    } else {
      return new Intl.NumberFormat('fr-FR').format(amount) + ' ' + symbol;
    }
  };

  const getOptionTitle = (optionId: string) => {
    const options = {
      'preformation': '🎓 Pré-financement Formation',
      'financial': '💰 Don Financier à Rendement',
      'material': '🎁 Récompenses Matérielles'
    };
    return options[optionId as keyof typeof options] || optionId;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Erreur de chargement des données</p>
        </div>
      </div>
    );
  }

  const totalContributed = contributions.reduce((sum, contrib) => sum + contrib.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Bienvenue, {user.name}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Rôle</p>
              <p className="font-semibold text-blue-600 capitalize">{user.role.toLowerCase()}</p>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Contribué</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(totalContributed, contributions[0]?.currency || 'FCFA')}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Contributions</p>
                <p className="text-2xl font-bold text-gray-900">{contributions.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Statut</p>
                <p className="text-2xl font-bold text-gray-900">Actif</p>
              </div>
            </div>
          </div>
        </div>

        {/* Progression du projet */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">📊 Progression du Projet</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Financement global</span>
                <span className="text-gray-900 font-medium">5%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '5%' }}></div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Objectif</p>
                <p className="text-lg font-bold text-gray-900">15 000 000 FCFA</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Collecté</p>
                <p className="text-lg font-bold text-green-600">750 000 FCFA</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Reste</p>
                <p className="text-lg font-bold text-orange-600">14 250 000 FCFA</p>
              </div>
            </div>
          </div>
        </div>

        {/* Historique des contributions */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">📋 Historique de vos contributions</h2>
          
          {contributions.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🎁</div>
              <p className="text-gray-600">Aucune contribution pour le moment</p>
              <a 
                href="/financement-participatif" 
                className="inline-block mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Faire une contribution
              </a>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Montant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {contributions.map((contribution) => (
                    <tr key={contribution.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {getOptionTitle(contribution.optionId)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-semibold">
                          {formatCurrency(contribution.amount, contribution.currency)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(contribution.createdAt).toLocaleDateString('fr-FR')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          {contribution.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Actions rapides */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🚀 Actions rapides</h3>
            <div className="space-y-3">
              <a 
                href="/financement-participatif" 
                className="block w-full bg-blue-600 text-white text-center py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Faire une nouvelle contribution
              </a>
              <a 
                href="/user/profile" 
                className="block w-full bg-gray-600 text-white text-center py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Modifier mon profil
              </a>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📞 Support</h3>
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Besoin d'aide ? Contactez notre équipe :
              </p>
              <div className="text-sm">
                <p><strong>Email :</strong> gm@cides.tf</p>
                <p><strong>Téléphone :</strong> +228 XX XX XX XX</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 