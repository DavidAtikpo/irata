'use client';

import React from 'react';
import { BaseContribution, ContributionStats } from '@/types/crowdfunding';

interface CrowdfundingDashboardProps {
  stats: ContributionStats;
  recentContributions: BaseContribution[];
  showAdminView?: boolean;
}

export default function CrowdfundingDashboard({ 
  stats, 
  recentContributions, 
  showAdminView = false 
}: CrowdfundingDashboardProps) {
  const progressPercentage = Math.round((stats.totalRaised / stats.goal) * 100);

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'preformation': return '🎓 Formation';
      case 'financial': return '💰 Financier';
      case 'material': return '🎁 Matériel';
      default: return type;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-semibold";
    switch (status) {
      case 'pending': return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'confirmed': return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'processed': return `${baseClasses} bg-green-100 text-green-800`;
      case 'cancelled': return `${baseClasses} bg-red-100 text-red-800`;
      default: return baseClasses;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          📊 Tableau de Bord - Financement Participatif
        </h2>
        <p className="text-gray-600">
          Centre de Multi Formations en Sécurité du Togo
        </p>
      </div>

      {/* Progress Section */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl">
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Progression du Financement</h3>
          <div className="text-3xl font-bold text-green-600">
            {formatCurrency(stats.totalRaised)} FCFA
          </div>
          <p className="text-gray-600">sur {formatCurrency(stats.goal)} FCFA ({progressPercentage}%)</p>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
          <div 
            className="bg-gradient-to-r from-green-400 to-blue-500 h-4 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {stats.contributorCount}
            </div>
            <p className="text-sm text-gray-600">Contributeurs</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(stats.averageContribution)}
            </div>
            <p className="text-sm text-gray-600">Don moyen (FCFA)</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {100 - progressPercentage}%
            </div>
            <p className="text-sm text-gray-600">Restant</p>
          </div>
        </div>
      </div>

      {/* Recent Contributions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          🎯 Contributions Récentes
        </h3>
        
        {recentContributions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">🤝</div>
            <p>Aucune contribution pour le moment</p>
            <p className="text-sm">Soyez le premier à soutenir notre projet !</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentContributions.map((contribution) => (
              <div 
                key={contribution.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-semibold text-sm">
                      {contribution.donorName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">
                      {showAdminView ? contribution.donorName : `${contribution.donorName.charAt(0)}***`}
                    </p>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span>{getTypeLabel(contribution.type)}</span>
                      <span>•</span>
                      <span>{new Date(contribution.date).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-bold text-green-600">
                    {formatCurrency(contribution.amount)} FCFA
                  </div>
                  <div className={getStatusBadge(contribution.status)}>
                    {contribution.status === 'pending' && 'En attente'}
                    {contribution.status === 'confirmed' && 'Confirmé'}
                    {contribution.status === 'processed' && 'Traité'}
                    {contribution.status === 'cancelled' && 'Annulé'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t">
        <button className="flex-1 inline-flex justify-center items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-300">
          💰 Faire un Don
        </button>
        <button className="flex-1 inline-flex justify-center items-center px-6 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-300">
          📤 Partager le Projet
        </button>
        {showAdminView && (
          <button className="flex-1 inline-flex justify-center items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition duration-300">
            ⚙️ Gérer les Dons
          </button>
        )}
      </div>

      {/* Milestone Indicators */}
      <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
        <h4 className="font-semibold text-indigo-800 mb-3">🎯 Prochains Jalons</h4>
        <div className="space-y-2">
          <div className={`flex items-center space-x-2 ${stats.totalRaised >= 15000000 ? 'text-indigo-600' : 'text-gray-600'}`}>
            <div className={`w-3 h-3 rounded-full ${stats.totalRaised >= 15000000 ? 'bg-indigo-500' : 'bg-gray-300'}`} />
            <span className="text-sm">15M FCFA - Achat du premier équipement cordiste</span>
          </div>
          <div className={`flex items-center space-x-2 ${stats.totalRaised >= 30000000 ? 'text-indigo-600' : 'text-gray-600'}`}>
            <div className={`w-3 h-3 rounded-full ${stats.totalRaised >= 30000000 ? 'bg-indigo-500' : 'bg-gray-300'}`} />
            <span className="text-sm">30M FCFA - Installation de l'appareil à ultrasons</span>
          </div>
          <div className={`flex items-center space-x-2 ${stats.totalRaised >= 50000000 ? 'text-indigo-600' : 'text-gray-600'}`}>
            <div className={`w-3 h-3 rounded-full ${stats.totalRaised >= 50000000 ? 'bg-indigo-500' : 'bg-gray-300'}`} />
            <span className="text-sm">50M FCFA - Équipement complet et ouverture du centre</span>
          </div>
        </div>
      </div>
    </div>
  );
}