'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
// Le layout est maintenant géré automatiquement par le layout.tsx parent
import {
  UserGroupIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  DocumentArrowDownIcon,
  PrinterIcon
} from '@heroicons/react/24/outline';

interface Presence {
  id: string;
  stagiaire: {
    nom: string;
    prenom: string;
    email: string;
  };
  session: string;
  date: string;
  statut: 'PRESENT' | 'ABSENT' | 'RETARD' | 'EXCUSE';
  heureArrivee?: string;
  heureDepart?: string;
  commentaire?: string;
}

interface Session {
  id: string;
  nom: string;
  dateDebut: string;
  dateFin: string;
  stagiaires: number;
}

export default function ListePresencePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [presences, setPresences] = useState<Presence[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [showBulkActions, setShowBulkActions] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/');
    } else if (status === 'authenticated') {
      // Simuler des données pour l'instant
      setSessions([
        {
          id: '1',
          nom: '2025 février 03 au 08',
          dateDebut: '2025-02-03',
          dateFin: '2025-02-08',
          stagiaires: 12
        },
        {
          id: '2',
          nom: '2025 avril 31 mars au 05 avril',
          dateDebut: '2025-03-31',
          dateFin: '2025-04-05',
          stagiaires: 8
        }
      ]);

      setPresences([
        {
          id: '1',
          stagiaire: { nom: 'Dupont', prenom: 'Jean', email: 'jean.dupont@email.com' },
          session: '2025 février 03 au 08',
          date: '2025-02-03',
          statut: 'PRESENT',
          heureArrivee: '08:00',
          heureDepart: '17:00'
        },
        {
          id: '2',
          stagiaire: { nom: 'Martin', prenom: 'Marie', email: 'marie.martin@email.com' },
          session: '2025 février 03 au 08',
          date: '2025-02-03',
          statut: 'RETARD',
          heureArrivee: '08:30',
          heureDepart: '17:00',
          commentaire: 'Transport en retard'
        },
        {
          id: '3',
          stagiaire: { nom: 'Bernard', prenom: 'Pierre', email: 'pierre.bernard@email.com' },
          session: '2025 février 03 au 08',
          date: '2025-02-03',
          statut: 'ABSENT',
          commentaire: 'Maladie'
        },
        {
          id: '4',
          stagiaire: { nom: 'Dubois', prenom: 'Sophie', email: 'sophie.dubois@email.com' },
          session: '2025 février 03 au 08',
          date: '2025-02-03',
          statut: 'PRESENT',
          heureArrivee: '07:55',
          heureDepart: '17:05'
        }
      ]);
      
      setSelectedSession('1');
      setSelectedDate('2025-02-03');
      setLoading(false);
    }
  }, [status, session, router]);

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'PRESENT': return 'bg-green-100 text-green-800';
      case 'ABSENT': return 'bg-red-100 text-red-800';
      case 'RETARD': return 'bg-yellow-100 text-yellow-800';
      case 'EXCUSE': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatutIcon = (statut: string) => {
    switch (statut) {
      case 'PRESENT': return CheckCircleIcon;
      case 'ABSENT': return XCircleIcon;
      case 'RETARD': return ClockIcon;
      case 'EXCUSE': return ExclamationTriangleIcon;
      default: return UserGroupIcon;
    }
  };

  const filteredPresences = presences.filter(presence => {
    const sessionMatch = !selectedSession || presence.session === sessions.find(s => s.id === selectedSession)?.nom;
    const dateMatch = !selectedDate || presence.date === selectedDate;
    return sessionMatch && dateMatch;
  });

  const getSessionDates = () => {
    if (!selectedSession) return [];
    const session = sessions.find(s => s.id === selectedSession);
    if (!session) return [];
    
    const dates = [];
    const start = new Date(session.dateDebut);
    const end = new Date(session.dateFin);
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d).toISOString().split('T')[0]);
    }
    
    return dates;
  };

  const updatePresence = (id: string, updates: Partial<Presence>) => {
    setPresences(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const exportToCSV = () => {
    const headers = ['Nom', 'Prénom', 'Email', 'Date', 'Statut', 'Heure arrivée', 'Heure départ', 'Commentaire'];
    const csvContent = [
      headers.join(','),
      ...filteredPresences.map(p => [
        p.stagiaire.nom,
        p.stagiaire.prenom,
        p.stagiaire.email,
        p.date,
        p.statut,
        p.heureArrivee || '',
        p.heureDepart || '',
        p.commentaire || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `presence_${selectedDate || 'all'}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <h2 className="mt-4 text-xl font-semibold text-gray-900">Chargement...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Liste de présence</h1>
        <p className="mt-2 text-sm text-gray-600">
          Gérez les présences des stagiaires pour chaque session de formation
        </p>
      </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircleIcon className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Présents</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {filteredPresences.filter(p => p.statut === 'PRESENT').length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <XCircleIcon className="h-6 w-6 text-red-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Absents</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {filteredPresences.filter(p => p.statut === 'ABSENT').length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ClockIcon className="h-6 w-6 text-yellow-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Retards</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {filteredPresences.filter(p => p.statut === 'RETARD').length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UserGroupIcon className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Taux présence</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {filteredPresences.length > 0 
                        ? Math.round((filteredPresences.filter(p => p.statut === 'PRESENT' || p.statut === 'RETARD').length / filteredPresences.length) * 100)
                        : 0}%
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtres et actions */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Session</label>
                <select
                  value={selectedSession}
                  onChange={(e) => {
                    setSelectedSession(e.target.value);
                    setSelectedDate('');
                  }}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="">Toutes les sessions</option>
                  {sessions.map(session => (
                    <option key={session.id} value={session.id}>{session.nom}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <select
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  disabled={!selectedSession}
                >
                  <option value="">Toutes les dates</option>
                  {getSessionDates().map(date => (
                    <option key={date} value={date}>
                      {new Date(date).toLocaleDateString('fr-FR', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={exportToCSV}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                Exporter CSV
              </button>
              
              <button
                onClick={() => window.print()}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <PrinterIcon className="h-4 w-4 mr-2" />
                Imprimer
              </button>
            </div>
          </div>
        </div>

        {/* Liste de présence */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Présences ({filteredPresences.length})
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              {selectedDate 
                ? `Liste de présence pour le ${new Date(selectedDate).toLocaleDateString('fr-FR')}`
                : 'Vue d\'ensemble des présences'
              }
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stagiaire
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Horaires
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Commentaire
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPresences.map((presence) => {
                  const StatusIcon = getStatutIcon(presence.statut);
                  
                  return (
                    <tr key={presence.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center">
                              <span className="text-xs font-medium text-white">
                                {presence.stagiaire.prenom.charAt(0)}{presence.stagiaire.nom.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {presence.stagiaire.prenom} {presence.stagiaire.nom}
                            </div>
                            <div className="text-sm text-gray-500">
                              {presence.stagiaire.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(presence.date).toLocaleDateString('fr-FR')}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <StatusIcon className="h-4 w-4 mr-2" />
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatutColor(presence.statut)}`}>
                            {presence.statut}
                          </span>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          {presence.heureArrivee && (
                            <div>Arrivée: {presence.heureArrivee}</div>
                          )}
                          {presence.heureDepart && (
                            <div>Départ: {presence.heureDepart}</div>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="max-w-xs truncate" title={presence.commentaire}>
                          {presence.commentaire || '-'}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <select
                          value={presence.statut}
                          onChange={(e) => updatePresence(presence.id, { statut: e.target.value as any })}
                          className="text-xs border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="PRESENT">Présent</option>
                          <option value="ABSENT">Absent</option>
                          <option value="RETARD">Retard</option>
                          <option value="EXCUSE">Excusé</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredPresences.length === 0 && (
            <div className="text-center py-12">
              <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune présence</h3>
              <p className="mt-1 text-sm text-gray-500">
                Aucune donnée de présence pour les filtres sélectionnés.
              </p>
            </div>
          )}
        </div>
      </div>
  );
} 