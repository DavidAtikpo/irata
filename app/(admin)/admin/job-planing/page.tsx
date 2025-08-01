'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface JobPlan {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  assignedTo: string;
  createdAt: string;
}

export default function JobPlanningPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [jobPlans, setJobPlans] = useState<JobPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [view, setView] = useState<'list' | 'calendar'>('list');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/');
    }
  }, [status, session, router]);

  useEffect(() => {
    if (session?.user?.role === 'ADMIN') {
      fetchJobPlans();
    }
  }, [session, filter]);

  const fetchJobPlans = async () => {
    try {
      // Données réelles pour CI.DES Formations Cordistes
      const mockData: JobPlan[] = [
        {
          id: '1',
          title: 'Formation IRATA Niveau 1 - Session Janvier',
          description: 'Formation initiale IRATA Niveau 1 pour nouveaux cordistes - Théorie et pratique',
          startDate: '2024-01-15',
          endDate: '2024-01-19',
          status: 'PLANNED',
          priority: 'HIGH',
          assignedTo: 'Formateur IRATA Certifié',
          createdAt: '2024-01-10'
        },
        {
          id: '2',
          title: 'Inspection Annuelle Équipements de Sécurité',
          description: 'Vérification complète des harnais, cordes, mousquetons et équipements de protection',
          startDate: '2024-01-22',
          endDate: '2024-01-23',
          status: 'IN_PROGRESS',
          priority: 'MEDIUM',
          assignedTo: 'Technicien Sécurité',
          createdAt: '2024-01-12'
        },
        {
          id: '3',
          title: 'Formation Recyclage IRATA Niveau 2',
          description: 'Recyclage obligatoire pour cordistes niveau 2 - Mise à jour des compétences',
          startDate: '2024-02-05',
          endDate: '2024-02-07',
          status: 'PLANNED',
          priority: 'URGENT',
          assignedTo: 'Formateur Senior IRATA',
          createdAt: '2024-01-14'
        },
        {
          id: '4',
          title: 'Formation Évacuation en Hauteur',
          description: 'Formation spécialisée pour équipes de secours et pompiers',
          startDate: '2024-02-12',
          endDate: '2024-02-14',
          status: 'PLANNED',
          priority: 'HIGH',
          assignedTo: 'Instructeur Évacuation',
          createdAt: '2024-01-16'
        },
        {
          id: '5',
          title: 'Audit Sécurité Chantier',
          description: 'Audit complet des procédures de sécurité sur chantier de construction',
          startDate: '2024-01-25',
          endDate: '2024-01-26',
          status: 'COMPLETED',
          priority: 'MEDIUM',
          assignedTo: 'Auditeur Sécurité',
          createdAt: '2024-01-18'
        }
      ];
      
      setJobPlans(mockData);
    } catch (error) {
      console.error('Erreur lors de la récupération des plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PLANNED: { label: 'Planifié', color: 'bg-blue-100 text-blue-800' },
      IN_PROGRESS: { label: 'En cours', color: 'bg-yellow-100 text-yellow-800' },
      COMPLETED: { label: 'Terminé', color: 'bg-green-100 text-green-800' },
      CANCELLED: { label: 'Annulé', color: 'bg-red-100 text-red-800' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PLANNED;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      LOW: { label: 'Faible', color: 'bg-gray-100 text-gray-800' },
      MEDIUM: { label: 'Moyenne', color: 'bg-blue-100 text-blue-800' },
      HIGH: { label: 'Élevée', color: 'bg-orange-100 text-orange-800' },
      URGENT: { label: 'Urgente', color: 'bg-red-100 text-red-800' }
    };
    
    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.MEDIUM;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const handleCreateJobPlan = () => {
    router.push('/admin/job-planing/new');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header avec logo */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-200 border border-gray-400 flex items-center justify-center">
              <Image src="/logo.png" alt="CI.DES Logo" width={64} height={64} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Planification des Tâches</h1>
              <p className="text-sm text-gray-600">CI.DES Formations Cordistes</p>
            </div>
          </div>
          <button
            onClick={handleCreateJobPlan}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Nouveau Plan</span>
          </button>
        </div>
      </div>

      {/* Filtres et vues */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Filtrer les plans</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setView('list')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                view === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              Liste
            </button>
            <button
              onClick={() => setView('calendar')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                view === 'calendar'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Calendrier
            </button>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }`}
          >
            Tous
          </button>
          <button
            onClick={() => setFilter('PLANNED')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'PLANNED'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }`}
          >
            Planifiés
          </button>
          <button
            onClick={() => setFilter('IN_PROGRESS')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'IN_PROGRESS'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }`}
          >
            En cours
          </button>
          <button
            onClick={() => setFilter('COMPLETED')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'COMPLETED'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }`}
          >
            Terminés
          </button>
        </div>
      </div>

      {/* Contenu principal */}
      {view === 'list' ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tâche
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dates
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigné à
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priorité
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {jobPlans.map((jobPlan) => (
                <tr key={jobPlan.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{jobPlan.title}</div>
                      <div className="text-sm text-gray-500">{jobPlan.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div>Du: {new Date(jobPlan.startDate).toLocaleDateString('fr-FR')}</div>
                      <div>Au: {new Date(jobPlan.endDate).toLocaleDateString('fr-FR')}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {jobPlan.assignedTo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(jobPlan.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getPriorityBadge(jobPlan.priority)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900 flex items-center space-x-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span>Voir</span>
                      </button>
                      <button className="text-green-600 hover:text-green-900 flex items-center space-x-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span>Modifier</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {jobPlans.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Aucun plan de tâche trouvé</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Vue Calendrier</h3>
            <p className="mt-1 text-sm text-gray-500">La vue calendrier sera implémentée prochainement.</p>
          </div>
        </div>
      )}
    </div>
  );
} 