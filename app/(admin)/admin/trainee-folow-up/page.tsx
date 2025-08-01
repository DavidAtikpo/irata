// app/trainee-follow-up/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { generateTraineeFollowUpPDF } from '../../../../lib/pdf-generator';

interface TraineeData {
  id: string;
  nom: string;
  prenom: string;
  email: string;
}

interface TraineeProgress {
  syllabusItem: string;
  traineeId: string;
  day: string;
  completed: boolean;
}

interface LevelData {
  syllabusItem: string;
  level: string;
  required: boolean;
}

interface SignatureData {
  traineeId: string;
  signature: string;
  adminSignature: string;
}

interface TrainingSession {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: string;
  traineeIds?: string[];
}

const days = ['J1', 'J2', 'J3', 'J4', 'J5'];

const levels = ['Level 1', 'Level 2', 'Level 3'];

const syllabus = [
  // Éléments du programme
  'Planification et gestion',
  'Système IRATA International',
  'Cadre légal',
  'Identification des dangers et évaluation des risques',
  'Sélection de la méthode d\'accès',
  'Sélection du personnel et compétences',
  'Déclaration de méthode de sécurité',
  'Zones de sélection, permis de travail, etc.',
  'Planification des urgences',
  'Premiers secours et tolérance à la suspension',
  
  // Équipement
  'Sélection de l\'équipement',
  'Inspection et maintenance de l\'équipement',
  'Contrôle de pression de l\'équipement',
  'Inspections détaillées et intermédiaires',
  'Assemblage de l\'équipement et vérification mutuelle',
  
  // Gréage
  'Sélection d\'ancrages',
  'Nœuds et manipulation de corde',
  'Système d\'ancrage de base',
  'Formes en Y',
  'Évitement des dangers et protection des cordes',
  'Réancrages',
  'Déviations',
  'Traction sur points d\'insertion',
  'Lignes de travail résistantes',
  'Système d\'arrêt de chute verticale',
  'Lignes tendues',
  
  // Gréage pour sauvetage et hissage
  'Systèmes de descente',
  'Systèmes de hissage',
  'Hissage croisé',
  'Systèmes de sauvetage complexes (exercice d\'équipe)',
  
  // Gestion des cordes
  'Dispositifs de secours',
  'Descente',
  'Montée',
  'Changements de mode',
  'Descente avec dispositifs de montée',
  'Montée avec dispositifs de descente',
  'Déviation simple',
  'Déviation double',
  'Transferts corde à corde',
  'Réancrages niveau 1 (<1.5 m)',
  'Réancrages niveau 2 et 3 (>1.5 m)',
  'Passage des nœuds en milieu de corde',
  'Obstacles de bord en haut',
  'Utilisation des sièges de travail (sièges confort)',
  'Passage des protections en milieu de corde',
  
  // Techniques d'escalade
  'Escalade aidée mobile horizontale',
  'Escalade aidée fixe horizontale',
  'Escalade aidée verticale',
  'Escalade avec équipement d\'arrêt de chute',
  
  // Sauvetages sur corde
  'Sauvetage en mode descente',
  'Sauvetage en mode montée',
  'Passage d\'une déviation avec victime',
  'Transfert corde à corde avec victime',
  'Passage d\'un petit réancrage avec victime',
  'Sauvetage en milieu de transfert',
  'Passage de nœuds en milieu de corde avec victime',
  'Utilisation de cordes tendues pour le sauvetage',
  
  // Sauvetages en escalade
  'Sauvetage en escalade aidée',
  'Sauvetage avec équipement d\'arrêt de chute',
  'Sauvetage en escalade aidée : liaison courte'
];

export default function TraineeFollowUpForm() {
  const { data: session } = useSession();
  const [trainees, setTrainees] = useState<TraineeData[]>([]);
  const [traineeProgress, setTraineeProgress] = useState<TraineeProgress[]>([]);
  const [levelData, setLevelData] = useState<LevelData[]>([]);
  const [signatures, setSignatures] = useState<SignatureData[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [globalCurrentDay, setGlobalCurrentDay] = useState<number>(1);
  const [currentSession, setCurrentSession] = useState<TrainingSession | null>(null);
  const [availableSessions, setAvailableSessions] = useState<TrainingSession[]>([]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Récupérer toutes les sessions disponibles
      const sessionResponse = await fetch('/api/admin/training-sessions');
      if (sessionResponse.ok) {
        const sessionsData = await sessionResponse.json();
        setAvailableSessions(sessionsData);
        // Prendre la session la plus récente par défaut
        if (sessionsData.length > 0) {
          const selectedSession = sessionsData[0];
          setCurrentSession(selectedSession);
          
          // Récupérer la liste des utilisateurs (stagiaires) pour cette session
          const usersResponse = await fetch(`/api/admin/session-trainees?session=${encodeURIComponent(selectedSession.name)}`);
          if (usersResponse.ok) {
            const usersData = await usersResponse.json();
            setTrainees(usersData);
          }
        }
      }

      // Récupérer les données de progression des stagiaires
      const progressResponse = await fetch('/api/admin/trainee-progress');
      if (progressResponse.ok) {
        const progressData = await progressResponse.json();
        setTraineeProgress(progressData);
      }

      // Récupérer les données de niveau
      const levelResponse = await fetch('/api/admin/level-data');
      if (levelResponse.ok) {
        const levelData = await levelResponse.json();
        setLevelData(levelData);
      }

      // Récupérer les signatures
      const signatureResponse = await fetch('/api/admin/trainee-signatures');
      if (signatureResponse.ok) {
        const signatureData = await signatureResponse.json();
        setSignatures(signatureData);
        
        // Extraire le jour global actuel (prendre le maximum de tous les stagiaires)
        const allDays = signatureData.map((sig: any) => sig.currentDay || 1);
        const maxDay = allDays.length > 0 ? Math.max(...allDays) : 1;
        setGlobalCurrentDay(maxDay);
        
        console.log('Jours récupérés:', allDays, 'Jour max:', maxDay);
      }

      // Récupérer le jour global actuel depuis l'API dédiée
      const globalDayResponse = await fetch('/api/admin/global-current-day');
      if (globalDayResponse.ok) {
        const globalDayData = await globalDayResponse.json();
        if (globalDayData.currentDay) {
          setGlobalCurrentDay(globalDayData.currentDay);
          console.log('Jour global depuis API:', globalDayData.currentDay);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
      setLastUpdate(new Date());
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Gestion des levels (seulement l'admin peut modifier)
  const handleLevelChange = async (syllabusItem: string, level: string, checked: boolean) => {
    // Mettre à jour l'état local immédiatement
    setLevelData(prev => {
      const existingItem = prev.find(item => 
        item.syllabusItem === syllabusItem && item.level === level
      );
      
      if (existingItem) {
        return prev.map(item => 
          item.syllabusItem === syllabusItem && item.level === level
            ? { ...item, required: checked }
            : item
        );
      } else {
        return [...prev, { syllabusItem, level, required: checked }];
      }
    });

    try {
      const response = await fetch('/api/admin/level-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          syllabusItem,
          level,
          required: checked,
        }),
      });

      if (!response.ok) {
        console.error('Erreur lors de la sauvegarde du niveau');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du niveau:', error);
    }
  };

  // Gestion de la signature de l'admin
  const handleAdminSignatureChange = async (signature: string) => {
    try {
      const response = await fetch('/api/admin/admin-signature', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          signature,
        }),
      });

      if (!response.ok) {
        console.error('Erreur lors de la sauvegarde de la signature admin');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la signature admin:', error);
    }
  };

  const handleUnlockNextDay = async () => {
    const nextDay = Math.min(globalCurrentDay + 1, 5); // Maximum jour 5
    
    try {
      // Débloquer pour tous les stagiaires
      const promises = trainees.map(trainee => 
        fetch('/api/admin/unlock-next-day', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            traineeId: trainee.id,
            nextDay,
          }),
        })
      );

      const responses = await Promise.all(promises);
      const allSuccessful = responses.every(response => response.ok);

      if (allSuccessful) {
        // Mettre à jour l'état local
        setGlobalCurrentDay(nextDay);
        alert(`Jour ${nextDay} débloqué pour tous les stagiaires`);
        
        // Recharger les données pour s'assurer de la synchronisation
        setTimeout(() => {
          fetchData();
        }, 1000);
      } else {
        alert('Erreur lors du déblocage du jour pour certains stagiaires');
      }
    } catch (error) {
      console.error('Erreur lors du déblocage:', error);
      alert('Erreur lors du déblocage du jour');
    }
  };

  const handleSessionChange = async (sessionName: string) => {
    const selectedSession = availableSessions.find(s => s.name === sessionName);
    if (selectedSession) {
      setCurrentSession(selectedSession);
      
      // Récupérer les stagiaires de cette session
      const usersResponse = await fetch(`/api/admin/session-trainees?session=${encodeURIComponent(sessionName)}`);
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setTrainees(usersData);
      }
    }
  };

  const handleDownloadPDF = () => {
    try {
      // Générer le PDF
      const doc = generateTraineeFollowUpPDF(
        trainees,
        traineeProgress,
        levelData,
        signatures,
        currentSession
      );

      // Nom du fichier avec la session
      const sessionName = currentSession?.name || 'trainee-follow-up';
      const fileName = `${sessionName.replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;

      // Télécharger le PDF
      doc.save(fileName);
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      alert('Erreur lors de la génération du PDF. Veuillez réessayer.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Chargement...</div>
      </div>
    );
  }

  return (
    <main className="w-full overflow-auto p-4 relative">
      {/* Sélecteur de session */}
      <div className="mb-4 p-4 bg-white border rounded shadow">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-semibold text-gray-700">
              Session de formation :
            </label>
            <select
              value={currentSession?.name || ''}
              onChange={(e) => handleSessionChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {availableSessions.map((session) => (
                <option key={session.id} value={session.name}>
                  {session.name} ({session.traineeIds?.length || 0} stagiaires)
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-xs text-gray-500">
              Dernière mise à jour : {lastUpdate.toLocaleTimeString()}
            </div>
            <button
              onClick={fetchData}
              className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              🔄 Rafraîchir
            </button>
          </div>
        </div>
      </div>

      {/* Indicateur de statut */}
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-blue-700">
              Vue administrateur - Session: {currentSession?.name || 'Aucune session sélectionnée'}
            </span>
          </div>
        </div>
      </div>

      {/* Résumé des statistiques */}
      <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
        <h3 className="font-bold text-green-800 mb-2">📊 Résumé des progrès</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-white p-3 rounded border">
            <div className="font-bold text-blue-600">Total stagiaires</div>
            <div className="text-2xl font-bold text-blue-800">{trainees.length}</div>
          </div>
          <div className="bg-white p-3 rounded border">
            <div className="font-bold text-green-600">Cases cochées</div>
            <div className="text-2xl font-bold text-green-800">
              {traineeProgress.filter(p => p.completed).length}
            </div>
          </div>
          <div className="bg-white p-3 rounded border">
            <div className="font-bold text-purple-600">Progression moyenne</div>
            <div className="text-2xl font-bold text-purple-800">
              {trainees.length > 0 
                ? Math.round((traineeProgress.filter(p => p.completed).length / (trainees.length * syllabus.length * 5)) * 100)
                : 0}%
            </div>
          </div>
        </div>
      </div>

      {/* Gestion globale des jours */}
      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-bold text-blue-800 mb-2">🔓 Gestion globale des jours d'accès</h3>
        <div className="bg-white p-4 rounded border">
          <div className="text-center mb-4">
            <div className="text-lg font-bold text-gray-800 mb-2">
              Jour actuel pour tous les stagiaires
            </div>
            <div className="text-3xl font-bold text-blue-600 mb-4">
              {globalCurrentDay}/5
            </div>
            <div className="flex justify-center space-x-2 mb-4">
              {[1, 2, 3, 4, 5].map((day) => (
                <div
                  key={day}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    day <= globalCurrentDay
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>
            <div className="flex space-x-2 justify-center">
              <button
                onClick={handleUnlockNextDay}
                disabled={globalCurrentDay >= 5}
                className={`px-6 py-2 text-sm rounded transition-colors ${
                  globalCurrentDay >= 5
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {globalCurrentDay >= 5 ? 'Tous les jours débloqués' : 'Débloquer jour suivant pour tous'}
              </button>
              <button
                onClick={() => {
                  fetchData();
                  alert('Données rafraîchies');
                }}
                className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                🔄 Rafraîchir
              </button>
            </div>
          </div>
          
          {/* Liste des stagiaires avec leur statut */}
          <div className="mt-4">
            <h4 className="font-semibold text-gray-700 mb-2">Statut des stagiaires :</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {trainees.map((trainee) => (
                <div key={trainee.id} className="text-sm p-2 bg-gray-50 rounded">
                  <span className="font-medium">{trainee.prenom} {trainee.nom}</span>
                  <span className="ml-2 text-green-600">✓ Jour {globalCurrentDay} accessible</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>



      <div className="overflow-auto border rounded shadow">
        
        <table className="table-auto border border-collapse text-xs w-full">
          {/* En-tête avec informations */}
          
          <thead className="bg-white">
            <tr>
              <td colSpan={4 + trainees.length * 5} className="border p-4">
                {/* Session de formation */}
                {currentSession && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
                    <div className="text-center">
                      <h2 className="text-lg font-bold text-blue-800 mb-1">
                        Session de Formation
                      </h2>
                      <p className="text-blue-700 font-semibold">
                        {currentSession.name}
                      </p>
                      <p className="text-sm text-blue-600">
                        Du {new Date(currentSession.startDate).toLocaleDateString('fr-FR')} 
                        au {new Date(currentSession.endDate).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Tableau d'informations avec logo */}
                <div className="flex items-start mb-4">
                  <div className="mr-4 flex-shrink-0">
                    <div className="w-16 h-16 bg-gray-200 border border-gray-400 flex items-center justify-center">
                      <Image src="/logo.png" alt="CI.DES Logo" width={100} height={100} />
                    </div>
                  </div>
                  <div className="flex-1">
                    <table className="w-full border-collapse">
                      <tbody>
                        <tr>
                          <td className="border p-2 font-bold">Titre</td>
                          <td className="border p-2 font-bold">Code Number</td>
                          <td className="border p-2 font-bold">Revision</td>
                          <td className="border p-2 font-bold">Creation date</td>
                        </tr>
                        <tr>
                          <td className="border p-2">CI.DES TRAINEE FOLLOW UP FORM</td>
                          <td className="border p-2">ENR-CIFRA-FORM 004</td>
                          <td className="border p-2">01</td>
                          <td className="border p-2">09/10/2023</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                
                {/* Titre principal */}
                <h1 className="text-2xl font-bold text-center mb-4">
                  TRAINEE FOLLOW UP FORM - VUE ADMIN
                </h1>
              </td>
            </tr>
          </thead>

          {/* En-têtes des colonnes */}
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2 sticky left-0 bg-gray-100 z-10">Éléments du programme</th>
              {levels.map((level) => (
                <th key={level} className="border p-2 text-center bg-yellow-100">
                  {level}
                </th>
              ))}
              {trainees.map((trainee) => (
                <th key={trainee.id} colSpan={5} className="border p-1 text-center bg-blue-100">
                  {trainee.prenom} {trainee.nom}
                </th>
              ))}
            </tr>
            <tr>
              <th className="border p-2 sticky left-0 bg-gray-100 z-10"></th>
              {levels.map((level) => (
                <th key={level} className="border p-2 text-center bg-yellow-100">
                  Requis
                </th>
              ))}
              {trainees.map((trainee) =>
                days.map((day) => {
                  const completedCount = traineeProgress.filter(p => 
                    p.syllabusItem === syllabus[0] && 
                    p.traineeId === trainee.id && 
                    p.day === day && 
                    p.completed
                  ).length;
                  
                  return (
                    <th key={`${trainee.id}_${day}`} className="border p-1 whitespace-nowrap text-center">
                      <div className="flex flex-col">
                        <span>{day}</span>
                        {completedCount > 0 && (
                          <span className="text-xs text-green-600 font-bold">
                            ✓ {completedCount}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })
              )}
            </tr>
          </thead>

          {/* Corps du tableau */}
          <tbody>
            {syllabus.map((item, index) => (
              <tr key={`syllabus-${index}`} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="border p-2 sticky left-0 bg-inherit z-10 font-medium">
                  {item}
                </td>
                
                {/* Colonnes Level (modifiables par l'admin) */}
                {levels.map((level) => (
                  <td key={level} className="border p-2 text-center">
                    <input
                      type="checkbox"
                      checked={levelData.find(l => l.syllabusItem === item && l.level === level)?.required || false}
                      onChange={(e) => handleLevelChange(item, level, e.target.checked)}
                      className="w-4 h-4"
                    />
                  </td>
                ))}
                
                {/* Colonnes des jours (lecture seule - données des stagiaires) */}
                {trainees.map((trainee) =>
                  days.map((day) => (
                    <td key={`${trainee.id}_${day}`} className="border p-2 text-center">
                      <div className="flex items-center justify-center">
                        {traineeProgress.find(p => 
                          p.syllabusItem === item && 
                          p.traineeId === trainee.id && 
                          p.day === day
                        )?.completed ? (
                          <div className="w-5 h-5 bg-green-500 border-2 border-green-600 rounded flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        ) : (
                          <div className="w-5 h-5 border-2 border-gray-300 rounded bg-gray-100"></div>
                        )}
                      </div>
                    </td>
                  ))
                )}
              </tr>
            ))}
          </tbody>

          {/* Ligne de séparation après le 8ème stagiaire */}
          <tbody>
            <tr>
              <td colSpan={3 + trainees.length * 5} className="border-t-4 border-gray-400"></td>
            </tr>
          </tbody>

          {/* Signatures des stagiaires */}
          <tbody>
            <tr className="bg-gray-100">
              <td className="border p-2 font-bold sticky left-0 bg-gray-100 z-10">
                Signature Stagiaire
              </td>
              {levels.map((level) => (
                <td key={level} className="border p-2"></td>
              ))}
              {trainees.map((trainee) => (
                <td key={trainee.id} colSpan={5} className="border p-2">
                  {signatures.find(s => s.traineeId === trainee.id)?.signature ? (
                    <div className="flex items-center justify-center">
                      <img 
                        src={signatures.find(s => s.traineeId === trainee.id)?.signature} 
                        alt="Signature" 
                        className="h-8 w-auto"
                      />
                    </div>
                  ) : (
                    <div className="w-full p-1 border rounded text-center bg-gray-50 text-gray-400">
                      Pas de signature
                    </div>
                  )}
                </td>
              ))}
            </tr>
          </tbody>

          {/* Signature de l'admin */}
          <tbody>
            <tr className="bg-blue-100">
              <td className="border p-2 font-bold sticky left-0 bg-blue-100 z-10">
                Signature Admin
              </td>
              {levels.map((level) => (
                <td key={level} className="border p-2"></td>
              ))}
              <td colSpan={trainees.length * 5} className="border p-2">
                <input
                  type="text"
                  placeholder="Signature de l'administrateur"
                  onChange={(e) => handleAdminSignatureChange(e.target.value)}
                  className="w-full p-1 border rounded text-center"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Légende */}
      <div className="mt-6 p-4 bg-white border rounded shadow">
        <h3 className="font-bold mb-2">Légende :</h3>
        <ul className="text-sm space-y-1">
          <li><strong>Level 1, 2, 3 :</strong> Niveaux requis définis par l'administrateur (modifiables)</li>
          <li><strong>J1, J2, J3, J4, J5 :</strong> Jours de formation cochés par les stagiaires (lecture seule)</li>
          <li><strong>Signature Stagiaire :</strong> Signatures des stagiaires (lecture seule)</li>
          <li><strong>Signature Admin :</strong> Signature de l'administrateur (modifiable)</li>
        </ul>
      </div>

      {/* Bouton de téléchargement PDF */}
      <div className="mt-6 p-4 bg-white border rounded shadow">
        <button
          onClick={handleDownloadPDF}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Télécharger en PDF</span>
        </button>
      </div>

      {/* Pied de page */}
      <footer className="mt-8 p-4 bg-gray-100 border-t border-gray-300">
        <div className="flex justify-between items-center text-xs text-gray-600">
          <div>
            <p>ENR-CIFRA-FORM 004 CI.DES Trainee Follow Up Form</p>
          </div>
          <div className="text-center">
            <p>CI.DES sasu Capital 2 500 Euros</p>
            <p>SIRET: 87840789900011 TVA: FR71878407899</p>
          </div>
          <div className="text-right">
            <p>Copie non contrôlée imprimée</p>
            <p>Page 1 sur 1</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
