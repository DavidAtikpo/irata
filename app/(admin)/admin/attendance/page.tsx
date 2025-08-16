'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface AttendanceSignature {
  userId: string;
  userName: string;
  userEmail: string;
  signatureKey: string; // "Lundi-matin", "Mardi-soir", etc.
  signatureData: string;
  timestamp: string;
  generatedFromFollowUp?: boolean;
}

interface UserAttendanceData {
  userId: string;
  userName: string;
  userEmail: string;
  sessionName?: string;
  signatures: Record<string, {
    signatureData: string;
    timestamp: string;
    generatedFromFollowUp?: boolean;
  }>;
}

export default function AdminAttendancePage() {
  const { data: session } = useSession();
  const [attendanceData, setAttendanceData] = useState<UserAttendanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDay, setFilterDay] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserAttendanceData | null>(null);

  const daysOfWeek = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  const periods = ['matin', 'soir'];

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/attendance');
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des données');
      }
      
      const data = await response.json();
      setAttendanceData(data.attendanceData || []);
    } catch (err) {
      console.error('Erreur:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const filteredData = attendanceData.filter(user => {
    const matchesSearch = user.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.userEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!filterDay) return matchesSearch;
    
    const hasSignatureForDay = Object.keys(user.signatures).some(key => 
      key.startsWith(filterDay)
    );
    
    return matchesSearch && hasSignatureForDay;
  });

  const getAttendanceStats = (userData: UserAttendanceData) => {
    const totalSlots = daysOfWeek.length * periods.length; // 7 jours × 2 périodes = 14
    const signedSlots = Object.keys(userData.signatures).length;
    const percentage = totalSlots > 0 ? Math.round((signedSlots / totalSlots) * 100) : 0;
    
    return { signedSlots, totalSlots, percentage };
  };

  const exportToCSV = () => {
    const headers = ['Utilisateur', 'Email', 'Session'];
    daysOfWeek.forEach(day => {
      headers.push(`${day} Matin`, `${day} Soir`);
    });
    
    const csvData = [headers.join(',')];
    
    filteredData.forEach(user => {
      const row = [user.userName, user.userEmail, user.sessionName || ''];
      
      daysOfWeek.forEach(day => {
        periods.forEach(period => {
          const key = `${day}-${period}`;
          const hasSignature = user.signatures[key] ? 'Présent' : 'Absent';
          row.push(hasSignature);
        });
      });
      
      csvData.push(row.join(','));
    });
    
    const blob = new Blob([csvData.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `attendance_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="text-lg">Chargement des données d'attendance...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Erreur: {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Gestion de l'Attendance</h1>
            <p className="text-gray-600 mt-1">Visualisez et gérez la présence de tous les stagiaires</p>
          </div>

          {/* Filtres et actions */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex flex-wrap gap-4">
                <div className="min-w-64">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rechercher</label>
                  <input
                    type="text"
                    placeholder="Nom ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="min-w-48">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jour</label>
                  <select
                    value={filterDay}
                    onChange={(e) => setFilterDay(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Tous les jours</option>
                    {daysOfWeek.map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={exportToCSV}
                  disabled={filteredData.length === 0}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  📊 Exporter CSV
                </button>
                <button
                  onClick={fetchAttendanceData}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  🔄 Actualiser
                </button>
              </div>
            </div>
          </div>

          {/* Statistiques */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{filteredData.length}</div>
                <div className="text-sm text-blue-800">Stagiaires</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {filteredData.reduce((sum, user) => sum + getAttendanceStats(user).signedSlots, 0)}
                </div>
                <div className="text-sm text-green-800">Présences totales</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {daysOfWeek.length * periods.length}
                </div>
                <div className="text-sm text-yellow-800">Créneaux par stagiaire</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {filteredData.length > 0 ? 
                    Math.round(filteredData.reduce((sum, user) => 
                      sum + getAttendanceStats(user).percentage, 0) / filteredData.length) 
                    : 0}%
                </div>
                <div className="text-sm text-purple-800">Taux de présence moyen</div>
              </div>
            </div>
          </div>

          {/* Liste des utilisateurs */}
          <div className="p-6">
            {filteredData.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Aucune donnée d'attendance trouvée</p>
                <p className="text-sm mt-2">Les signatures des stagiaires apparaîtront ici</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredData.map((user) => {
                  const stats = getAttendanceStats(user);
                  return (
                    <div key={user.userId} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">{user.userName}</h3>
                          <p className="text-sm text-gray-600">{user.userEmail}</p>
                          {user.sessionName && (
                            <p className="text-sm text-blue-600">Session: {user.sessionName}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">{stats.percentage}%</div>
                          <div className="text-sm text-gray-600">{stats.signedSlots}/{stats.totalSlots} présences</div>
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="mt-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                          >
                            Voir détails
                          </button>
                        </div>
                      </div>

                      {/* Grille de présence rapide */}
                      <div className="grid grid-cols-7 gap-2">
                        {daysOfWeek.map(day => (
                          <div key={day} className="text-center">
                            <div className="text-xs font-medium text-gray-700 mb-1">{day.slice(0, 3)}</div>
                            <div className="space-y-1">
                              {periods.map(period => {
                                const key = `${day}-${period}`;
                                const hasSignature = user.signatures[key];
                                const isGenerated = hasSignature?.generatedFromFollowUp;
                                
                                return (
                                  <div
                                    key={period}
                                    className={`w-full h-6 rounded text-xs flex items-center justify-center ${
                                      hasSignature
                                        ? isGenerated 
                                          ? 'bg-yellow-200 text-yellow-800' 
                                          : 'bg-green-200 text-green-800'
                                        : 'bg-gray-200 text-gray-500'
                                    }`}
                                    title={`${day} ${period}${hasSignature ? (isGenerated ? ' (Auto)' : ' (Manuel)') : ' (Absent)'}`}
                                  >
                                    {period === 'matin' ? 'M' : 'S'}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal de détails */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-90vh overflow-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedUser.userName}</h2>
                    <p className="text-gray-600">{selectedUser.userEmail}</p>
                    {selectedUser.sessionName && (
                      <p className="text-blue-600">Session: {selectedUser.sessionName}</p>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Détail des signatures</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr>
                        <th className="border border-gray-300 p-2 bg-gray-50">Jour</th>
                        <th className="border border-gray-300 p-2 bg-gray-50">Matin</th>
                        <th className="border border-gray-300 p-2 bg-gray-50">Après-midi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {daysOfWeek.map(day => (
                        <tr key={day}>
                          <td className="border border-gray-300 p-2 font-medium">{day}</td>
                          {periods.map(period => {
                            const key = `${day}-${period}`;
                            const signature = selectedUser.signatures[key];
                            
                            return (
                              <td key={period} className="border border-gray-300 p-2 text-center">
                                {signature ? (
                                  <div className="space-y-2">
                                    <img 
                                      src={signature.signatureData} 
                                      alt="Signature" 
                                      className="h-8 w-auto mx-auto"
                                    />
                                    <div className="text-xs text-gray-500">
                                      {new Date(signature.timestamp).toLocaleDateString('fr-FR')}
                                      {signature.generatedFromFollowUp && (
                                        <span className="block text-yellow-600">(Auto)</span>
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-gray-400">Non signé</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Légende */}
        <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
          <h3 className="font-bold mb-4">Légende :</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-200 rounded"></div>
              <span>Présence confirmée (signature manuelle)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-200 rounded"></div>
              <span>Présence automatique (depuis suivi stagiaire)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-200 rounded"></div>
              <span>Absence</span>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <p><strong>M</strong> = Matin (4h) | <strong>S</strong> = Soir/Après-midi (4h)</p>
            <p>Les signatures automatiques sont générées quand les stagiaires cochent leurs jours dans le suivi de formation.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
