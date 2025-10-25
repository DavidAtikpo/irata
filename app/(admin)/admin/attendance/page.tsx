'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import jsPDF from 'jspdf';

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
  const [expandedSessions, setExpandedSessions] = useState<Record<string, boolean>>({});

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

  // Grouper les utilisateurs par session
  const groupedBySession = filteredData.reduce((groups, user) => {
    const sessionName = user.sessionName || 'Sans session';
    if (!groups[sessionName]) {
      groups[sessionName] = [];
    }
    groups[sessionName].push(user);
    return groups;
  }, {} as Record<string, UserAttendanceData[]>);

  // Trier les sessions par ordre chronologique (récentes en premier)
  const sortedSessions = Object.keys(groupedBySession).sort((a, b) => {
    // Si c'est "Sans session", le mettre en dernier
    if (a === 'Sans session') return 1;
    if (b === 'Sans session') return -1;
    
    // Fonction pour extraire la date de début d'une session
    const extractStartDate = (sessionName: string) => {
      // Format attendu: "2025 septembre 01 au 06" ou "2025 aout 18 au 23"
      const match = sessionName.match(/(\d{4})\s+(\w+)\s+(\d{1,2})\s+au\s+(\d{1,2})/);
      if (match) {
        const [, year, month, startDay] = match;
        const monthNames = {
          'janvier': 1, 'février': 2, 'mars': 3, 'avril': 4, 'mai': 5, 'juin': 6,
          'juillet': 7, 'août': 8, 'aout': 8, 'septembre': 9, 'octobre': 10, 'novembre': 11, 'décembre': 12
        };
        const monthNum = monthNames[month.toLowerCase() as keyof typeof monthNames] || 0;
        return new Date(parseInt(year), monthNum - 1, parseInt(startDay));
      }
      // Si le format ne correspond pas, essayer de détecter une date dans le nom
      const dateMatch = sessionName.match(/(\d{4})/);
      if (dateMatch) {
        return new Date(parseInt(dateMatch[1]), 0, 1); // Utiliser l'année trouvée
      }
      return new Date(0); // Date par défaut si aucune date n'est trouvée
    };
    
    // Trier par date de début (récentes en premier)
    const dateA = extractStartDate(a);
    const dateB = extractStartDate(b);
    
    if (dateA.getTime() === dateB.getTime()) {
      // Si même date, trier par ordre alphabétique
      return a.localeCompare(b);
    }
    
    // Tri décroissant (récentes en premier)
    return dateB.getTime() - dateA.getTime();
  });

  const getAttendanceStats = (userData: UserAttendanceData) => {
    const totalSlots = daysOfWeek.length * periods.length; // 7 jours × 2 périodes = 14
    const signedSlots = Object.keys(userData.signatures).length;
    const percentage = totalSlots > 0 ? Math.round((signedSlots / totalSlots) * 100) : 0;
    
    return { signedSlots, totalSlots, percentage };
  };

  // Fonction pour basculer l'expansion d'une session
  const toggleSession = (sessionName: string) => {
    setExpandedSessions(prev => ({
      ...prev,
      [sessionName]: !prev[sessionName]
    }));
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

  const exportSessionToCSV = (sessionName: string, usersInSession: UserAttendanceData[]) => {
    const headers = ['Utilisateur', 'Email', 'Session'];
    daysOfWeek.forEach(day => {
      headers.push(`${day} Matin`, `${day} Soir`);
    });
    
    const csvData = [headers.join(',')];
    
    usersInSession.forEach(user => {
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
    link.download = `attendance_${sessionName.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportSessionToPDF = (sessionName: string, usersInSession: UserAttendanceData[]) => {
    // Créer un PDF en mode paysage (landscape)
    const doc = new jsPDF('landscape', 'mm', 'a4');
    
    // Définir les marges
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const rightMargin = 20; // Marge droite
    
    // Configuration des couleurs
    const primaryColor = [41, 128, 185]; // Bleu
    const headerColor = [52, 73, 94]; // Gris foncé
    const presentColor = [46, 204, 113]; // Vert
    const absentColor = [231, 76, 60]; // Rouge
    
    // En-tête exactement comme HeaderInfoTable
    const headerY = 20;
    const logoSize = 16; // 64px = 16mm
    
    // Logo (rectangle gris avec bordure)
    doc.setFillColor(229, 231, 235); // bg-gray-200
    doc.setDrawColor(156, 163, 175); // border-gray-400
    doc.rect(20, headerY, logoSize, logoSize, 'FD'); // Filled + Drawn
    
    // Logo (si disponible)
    try {
      doc.addImage('/logo.png', 'PNG', 20, headerY, logoSize, logoSize);
    } catch (error) {
      // Texte IRATA si logo non disponible
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(8);
      doc.text('IRATA', 20 + logoSize/2 - 8, headerY + logoSize/2 + 2);
    }
    // Tableau d'informations (version desktop comme dans HeaderInfoTable)
    const infoTableY = headerY; // Aligné avec le logo
    const tableStartX = 20 + logoSize + 10;
    const tableWidth = 230;
    const infoCellHeight = 8;
    
    // Ligne 1 du tableau (4 colonnes)
    doc.setFillColor(255, 255, 255); // Fond blanc
    doc.setDrawColor(0, 0, 0); // Bordure noire
    doc.rect(tableStartX, infoTableY, tableWidth/4, infoCellHeight, 'FD');
    doc.rect(tableStartX + tableWidth/4, infoTableY, tableWidth/4, infoCellHeight, 'FD');
    doc.rect(tableStartX + tableWidth/2, infoTableY, tableWidth/4, infoCellHeight, 'FD');
    doc.rect(tableStartX + (tableWidth * 3/4), infoTableY, tableWidth/4, infoCellHeight, 'FD');
    
    // Contenu ligne 1
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0); // Texte noir
    doc.text('Titre', tableStartX + 2, infoTableY + 5);
    doc.text('Numéro de code', tableStartX + tableWidth/4 + 2, infoTableY + 5);
    doc.text('Revision', tableStartX + tableWidth/2 + 2, infoTableY + 5);
    doc.text('Date de création', tableStartX + (tableWidth * 3/4) + 2, infoTableY + 5);
   
    // Ligne 2 du tableau (4 colonnes)
    doc.setFillColor(255, 255, 255); // Fond blanc
    doc.setDrawColor(0, 0, 0); // Bordure noire
    doc.rect(tableStartX, infoTableY + infoCellHeight, tableWidth/4, infoCellHeight, 'FD');
    doc.rect(tableStartX + tableWidth/4, infoTableY + infoCellHeight, tableWidth/4, infoCellHeight, 'FD');
    doc.rect(tableStartX + tableWidth/2, infoTableY + infoCellHeight, tableWidth/4, infoCellHeight, 'FD');
    doc.rect(tableStartX + (tableWidth * 3/4), infoTableY + infoCellHeight, tableWidth/4, infoCellHeight, 'FD');
    
    // Contenu ligne 2
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0); // Texte noir
    doc.text('FICHE DE PRÉSENCE', tableStartX + 2, infoTableY + infoCellHeight + 5);
    doc.text('ENR-CIFRA-COMP 00X' + new Date().getFullYear(), tableStartX + tableWidth/4 + 2, infoTableY + infoCellHeight + 5);
    doc.text('00', tableStartX + tableWidth/2 + 2, infoTableY + infoCellHeight + 5);
    doc.text(new Date().toLocaleDateString('fr-FR'), tableStartX + (tableWidth * 3/4) + 2, infoTableY + infoCellHeight + 5);
    
    // Informations de session après l'en-tête
    const sessionInfoY = infoTableY + (infoCellHeight * 2) + 2;
    doc.setFontSize(12);
    doc.setTextColor(headerColor[0], headerColor[1], headerColor[2]);
    
    // Informations de session (texte simple)
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Session: ${sessionName}`, 20, sessionInfoY + 5);
    doc.text(`Date de génération: ${new Date().toLocaleDateString('fr-FR')}`, 20, sessionInfoY + 10);
    doc.text(`Nombre de stagiaires: ${usersInSession.length}`, 20, sessionInfoY + 15);
    
    // Calculer les dimensions du tableau
    const cellWidth = 25;
    const cellHeight = 8;
    const startX = 20;
    const startY = sessionInfoY + 25; // Positionner après les informations de session
    const nameColumnWidth = 60;
    
    // Calculer la largeur totale disponible (en tenant compte des marges)
    const totalAvailableWidth = pageWidth - startX - rightMargin;
    const totalColumnsWidth = (daysOfWeek.length * periods.length * cellWidth) + nameColumnWidth;
    
    // Ajuster la largeur des cellules si nécessaire
    const adjustedCellWidth = totalColumnsWidth > totalAvailableWidth 
      ? (totalAvailableWidth - nameColumnWidth) / (daysOfWeek.length * periods.length)
      : cellWidth;
    
    // En-têtes du tableau
    doc.setFillColor(headerColor[0], headerColor[1], headerColor[2]);
    doc.rect(startX, startY, nameColumnWidth, cellHeight, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text('Stagiaire', startX + 2, startY + 5);
    
    // En-têtes des jours
    let currentX = startX + nameColumnWidth;
    daysOfWeek.forEach(day => {
      periods.forEach(period => {
        doc.setFillColor(headerColor[0], headerColor[1], headerColor[2]);
        doc.rect(currentX, startY, adjustedCellWidth, cellHeight, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.text(day.slice(0, 3), currentX + 1, startY + 3);
        doc.text(period === 'matin' ? 'M' : 'S', currentX + 1, startY + 6);
        currentX += adjustedCellWidth;
      });
    });
    
    // Lignes des stagiaires
    let currentY = startY + cellHeight;
    usersInSession.forEach((user, index) => {
      // Alternance des couleurs de fond
      if (index % 2 === 0) {
        doc.setFillColor(248, 249, 250);
        doc.rect(startX, currentY, nameColumnWidth + (daysOfWeek.length * periods.length * adjustedCellWidth), cellHeight, 'F');
      }
      
      // Nom du stagiaire
      doc.setFillColor(255, 255, 255);
      doc.rect(startX, currentY, nameColumnWidth, cellHeight, 'F');
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(9);
      doc.text(user.userName.length > 20 ? user.userName.substring(0, 20) + '...' : user.userName, startX + 2, currentY + 5);
      
      // Présences/Absences
      currentX = startX + nameColumnWidth;
      daysOfWeek.forEach(day => {
        periods.forEach(period => {
          const key = `${day}-${period}`;
          const hasSignature = user.signatures[key];
          
          if (hasSignature) {
            // Fond blanc pour la signature
            doc.setFillColor(255, 255, 255);
            doc.rect(currentX, currentY, adjustedCellWidth, cellHeight, 'F');
            // Bordure verte
            doc.setDrawColor(presentColor[0], presentColor[1], presentColor[2]);
            doc.rect(currentX, currentY, adjustedCellWidth, cellHeight, 'S');
            
            // Afficher la signature directement
            try {
              // Calculer les dimensions pour s'adapter dans la case
              const maxWidth = adjustedCellWidth - 2;
              const maxHeight = cellHeight - 2;
              
              // Ajouter l'image directement avec les dimensions calculées
              doc.addImage(hasSignature.signatureData, 'PNG', 
                currentX + 1, currentY + 1, maxWidth, maxHeight);
            } catch (error) {
              // En cas d'erreur, afficher un P vert
              doc.setTextColor(presentColor[0], presentColor[1], presentColor[2]);
              doc.setFontSize(12);
              doc.text('P', currentX + adjustedCellWidth/2 - 1, currentY + 5);
            }
          } else {
            // Case vide pour absent
            doc.setFillColor(255, 255, 255);
            doc.rect(currentX, currentY, adjustedCellWidth, cellHeight, 'F');
            // Bordure grise
            doc.setDrawColor(200, 200, 200);
            doc.rect(currentX, currentY, adjustedCellWidth, cellHeight, 'S');
            // Laisser vide
          }
          
          currentX += adjustedCellWidth;
        });
      });
      
      currentY += cellHeight;
    });
    
    // Légende
    const legendY = currentY + 5;
    doc.setFontSize(10);
    doc.setTextColor(headerColor[0], headerColor[1], headerColor[2]);
    doc.text('Légende:', 20, legendY);
    
    // Case avec signature (Présent)
    doc.setFillColor(255, 255, 255);
    doc.rect(20, legendY + 5, 8, 6, 'F');
    doc.setDrawColor(presentColor[0], presentColor[1], presentColor[2]);
    doc.rect(20, legendY + 5, 8, 6, 'S');
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(6);
    doc.text('Signature', 20, legendY + 9);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(8);
    doc.text('Présent', 30, legendY + 9);
    
    // Case vide (Absent)
    doc.setFillColor(255, 255, 255);
    doc.rect(60, legendY + 5, 8, 6, 'F');
    doc.setDrawColor(200, 200, 200);
    doc.rect(60, legendY + 5, 8, 6, 'S');
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(8);
    doc.text('Absent', 70, legendY + 9);
    
    // Informations supplémentaires
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('M = Matin (4h) | S = Soir/Après-midi (4h)', 20, legendY + 20);
    // doc.text('Généré automatiquement par le système IRATA', 20, legendY + 25);
    
    // Sauvegarder le PDF
    const fileName = `attendance_${sessionName.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
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


          {/* Liste des utilisateurs groupés par session */}
          <div className="p-6">
            {filteredData.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Aucune donnée d'attendance trouvée</p>
                <p className="text-sm mt-2">Les signatures des stagiaires apparaîtront ici</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedSessions.map((sessionName) => {
                  const usersInSession = groupedBySession[sessionName];
                  const sessionStats = usersInSession.reduce((total, user) => {
                    const userStats = getAttendanceStats(user);
                    return {
                      totalUsers: total.totalUsers + 1,
                      totalSignatures: total.totalSignatures + userStats.signedSlots,
                      totalSlots: total.totalSlots + userStats.totalSlots
                    };
                  }, { totalUsers: 0, totalSignatures: 0, totalSlots: 0 });

                  const sessionPercentage = sessionStats.totalSlots > 0 
                    ? Math.round((sessionStats.totalSignatures / sessionStats.totalSlots) * 100) 
                    : 0;

                  const isExpanded = expandedSessions[sessionName];

                  return (
                    <div key={sessionName} className="border border-gray-300 rounded-lg overflow-hidden">
                      {/* En-tête de session cliquable */}
                      <div 
                        className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white cursor-pointer hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
                        onClick={() => toggleSession(sessionName)}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <button className="text-white hover:text-blue-100 transition-colors">
                              {isExpanded ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              )}
                            </button>
                            <div>
                              <h2 className="text-xl font-bold">{sessionName}</h2>
                              <p className="text-blue-100 text-sm">
                                {sessionStats.totalUsers} stagiaire{sessionStats.totalUsers > 1 ? 's' : ''} • 
                                {sessionStats.totalSignatures} présences sur {sessionStats.totalSlots} créneaux
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                exportSessionToCSV(sessionName, usersInSession);
                              }}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors flex items-center gap-1"
                              title="Télécharger en CSV"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              CSV
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                exportSessionToPDF(sessionName, usersInSession);
                              }}
                              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors flex items-center gap-1"
                              title="Télécharger en PDF"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                              <span className="font-medium">PDF</span>
                            </button>
                            <div className="text-right">
                              <div className="text-3xl font-bold">{sessionPercentage}%</div>
                              <div className="text-blue-100 text-sm">Taux de présence</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Contenu de la session (collapsible) */}
                      {isExpanded && (
                        <div className="p-4 space-y-4 bg-gray-50">
                          {usersInSession.map((user) => {
                  const stats = getAttendanceStats(user);
                  return (
                              <div key={user.userId} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">{user.userName}</h3>
                          <p className="text-sm text-gray-600">{user.userEmail}</p>
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
