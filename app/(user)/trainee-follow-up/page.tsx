"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import SignaturePad from '../../../components/SignaturePad';
import { generateTraineeIndividualPDF } from '../../../lib/pdf-generator';

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
  currentDay?: number;
}

interface TrainingSession {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: string;
}

export default function TraineeFollowUpForm() {
  const { data: session } = useSession();
  const [traineeProgress, setTraineeProgress] = useState<TraineeProgress[]>([]);
  const [levelData, setLevelData] = useState<LevelData[]>([]);
  const [signatures, setSignatures] = useState<SignatureData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isValidated, setIsValidated] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<{[key: string]: boolean}>({});
  const [hasValidContract, setHasValidContract] = useState(false);
  const [currentDay, setCurrentDay] = useState(1);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');
  const [currentSession, setCurrentSession] = useState<TrainingSession | null>(null);

  // L'utilisateur connecté est le seul stagiaire visible
  const currentTraineeId = session?.user?.id || '';
  const currentTraineeName = session?.user?.prenom && session?.user?.nom 
    ? `${session.user.prenom} ${session.user.nom}`
    : session?.user?.email || 'Utilisateur';
  
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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Récupérer la session de formation actuelle
      const sessionResponse = await fetch('/api/user/training-session');
      if (sessionResponse.ok) {
        const sessionData = await sessionResponse.json();
        setCurrentSession(sessionData);
      }

      // Vérifier d'abord si l'utilisateur a un contrat validé
      const contractResponse = await fetch('/api/user/contract-status');
      if (contractResponse.ok) {
        const contractData = await contractResponse.json();
        setHasValidContract(contractData.hasValidContract);
        
        if (!contractData.hasValidContract) {
          setLoading(false);
          return; // Arrêter ici si pas de contrat validé
        }
      }

      // Récupérer les données de progression des stagiaires
      const progressResponse = await fetch('/api/user/trainee-progress');
      if (progressResponse.ok) {
        const progressData = await progressResponse.json();
        setTraineeProgress(progressData);
      }

      // Récupérer les données de niveau définies par l'admin
      const levelResponse = await fetch('/api/user/level-data');
      if (levelResponse.ok) {
        const levelData = await levelResponse.json();
        setLevelData(levelData);
      }

      // Récupérer les signatures et le jour actuel
      const signatureResponse = await fetch('/api/user/trainee-signatures');
      if (signatureResponse.ok) {
        const signatureData = await signatureResponse.json();
        console.log('Données de signature reçues:', signatureData);
        setSignatures(signatureData);
        
        let newCurrentDay = 1;
        if (signatureData.length > 0 && signatureData[0].currentDay) {
          newCurrentDay = signatureData[0].currentDay;
          console.log('Jour actuel défini:', newCurrentDay);
        } else {
          console.log('Aucun jour actuel trouvé, utilisation du jour 1 par défaut');
        }
        
        setCurrentDay(newCurrentDay);
        setDebugInfo(`Jour actuel: ${newCurrentDay} | Données: ${JSON.stringify(signatureData)}`);
      }

      // Vérifier si le formulaire est déjà validé
      const validationResponse = await fetch('/api/user/form-validation-status');
      if (validationResponse.ok) {
        const validationData = await validationResponse.json();
        setIsValidated(validationData.isValidated);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  // Gestion des jours (les stagiaires peuvent cocher leurs jours)
  const handleDayChange = (syllabusItem: string, trainee: string, day: string, checked: boolean) => {
    // Vérifier si le jour est autorisé
    const dayNumber = parseInt(day.replace('J', ''));
    if (dayNumber > currentDay) {
      alert(`Vous n'avez pas encore accès au jour ${day}. L'administrateur doit d'abord vous autoriser.`);
      return;
    }

    // Vérifier si le jour a déjà été validé (pour les jours précédents)
    const existingProgress = traineeProgress.find(p => 
      p.syllabusItem === syllabusItem && 
      p.traineeId === trainee && 
      p.day === day
    );
    
    // Si le jour a déjà été validé ET que le formulaire est validé, on ne peut plus le modifier
    if (isValidated && existingProgress?.completed) {
      alert('Ce jour a déjà été validé et ne peut plus être modifié.');
      return;
    }

    const key = `${syllabusItem}-${trainee}-${day}`;
    
    // Mettre à jour les changements en attente
    setPendingChanges(prev => ({
      ...prev,
      [key]: checked
    }));

    // Mettre à jour l'état local pour l'affichage
    setTraineeProgress(prev => {
      const existingProgress = prev.find(p => 
        p.syllabusItem === syllabusItem && 
        p.traineeId === trainee && 
        p.day === day
      );
      
      if (existingProgress) {
        return prev.map(item => 
          item.syllabusItem === syllabusItem && 
          item.traineeId === trainee && 
          item.day === day
            ? { ...item, completed: checked }
            : item
        );
      } else {
        return [...prev, { syllabusItem, traineeId: trainee, day, completed: checked }];
      }
    });
  };

  // Gestion de la signature du stagiaire
  const handleTraineeSignatureChange = (traineeId: string, signature: string) => {
    // Mettre à jour l'état local pour l'affichage
    setSignatures(prev => {
      const existingSignature = prev.find(s => s.traineeId === traineeId);
      
      if (existingSignature) {
        return prev.map(item => 
          item.traineeId === traineeId
            ? { ...item, signature }
            : item
        );
      } else {
        return [...prev, { traineeId, signature, adminSignature: '' }];
      }
    });
    
    setShowSignatureModal(false);
  };

  // Validation et soumission du formulaire
  const handleSubmitForm = async () => {
    if (Object.keys(pendingChanges).length === 0) {
      alert('Aucune modification à soumettre.');
      return;
    }

    try {
      // Sauvegarder toutes les modifications en attente
      for (const [key, completed] of Object.entries(pendingChanges)) {
        const [syllabusItem, traineeId, day] = key.split('-');
        
        const response = await fetch('/api/user/trainee-progress', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            syllabusItem,
            traineeId,
            day,
            completed,
          }),
        });

        if (!response.ok) {
          throw new Error(`Erreur lors de la sauvegarde de ${key}`);
        }
      }

      // Sauvegarder la signature si elle a été modifiée
      const currentSignature = signatures.find(s => s.traineeId === currentTraineeId)?.signature || '';
      if (currentSignature) {
        const signatureResponse = await fetch('/api/user/trainee-signatures', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            traineeId: currentTraineeId,
            signature: currentSignature,
          }),
        });

        if (!signatureResponse.ok) {
          throw new Error('Erreur lors de la sauvegarde de la signature');
        }
      }

      // Marquer le formulaire comme validé
      const validationResponse = await fetch('/api/user/validate-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          traineeId: currentTraineeId,
        }),
      });

      if (validationResponse.ok) {
        // Si c'est la première validation, marquer comme validé
        if (!isValidated) {
          setIsValidated(true);
          alert('Formulaire validé avec succès ! Les jours déjà complétés ne peuvent plus être modifiés.');
        } else {
          alert('Modifications sauvegardées avec succès !');
        }
        setPendingChanges({});
      } else {
        throw new Error('Erreur lors de la validation du formulaire');
      }
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      alert('Erreur lors de la soumission du formulaire. Veuillez réessayer.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Chargement...</div>
      </div>
    );
  }

  if (!hasValidContract) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center p-8 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h2 className="text-2xl font-bold text-yellow-800 mb-4">⚠️ Contrat requis</h2>
          <p className="text-yellow-700 mb-4">
            Vous devez d'abord signer et valider votre contrat avant d'accéder au formulaire de suivi.
          </p>
          <a 
            href="/user/mon-contrat" 
            className="bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 transition-colors"
          >
            Voir mon contrat
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* QR Code */}
      <div className="mb-4 p-4">
        <div className="w-16 h-16 bg-gray-200 border border-gray-400 flex items-center justify-center">
          <span className="text-xs text-gray-500">QR</span>
        </div>
      </div>

      <div className="overflow-auto border rounded shadow">
        <table className="table-auto border border-collapse text-xs w-full">
          {/* En-tête avec informations */}
          <thead className="bg-white">
            <tr>
              <td colSpan={3 + 5} className="border p-4">
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
                
                {/* Tableau d'informations */}
                <div className="mb-4">
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
                
                {/* Titre principal */}
                <h1 className="text-2xl font-bold text-center mb-4">
                  TRAINEE FOLLOW UP FORM - VUE STAGIAIRE
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
                              <th colSpan={5} className="border p-1 text-center bg-blue-100">
                  {currentTraineeName}
                </th>
            </tr>
            <tr>
              <th className="border p-2 sticky left-0 bg-gray-100 z-10"></th>
              {levels.map((level) => (
                <th key={level} className="border p-2 text-center bg-yellow-100">
                  Requis
                </th>
              ))}
              {days.map((day) => (
                <th key={day} className="border p-1 whitespace-nowrap text-center">
                  {day}
                </th>
              ))}
            </tr>
          </thead>

          {/* Corps du tableau */}
          <tbody>
            {syllabus.map((item, index) => (
              <tr key={item} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="border p-2 sticky left-0 bg-inherit z-10 font-medium">
                  {item}
                </td>
                
                {/* Colonnes Level (lecture seule pour les stagiaires) */}
                {levels.map((level) => (
                  <td key={level} className="border p-2 text-center">
                    <div className="flex items-center justify-center">
                      {levelData.find(l => l.syllabusItem === item && l.level === level)?.required ? (
                        <div className="w-5 h-5 bg-blue-500 border-2 border-blue-600 rounded flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      ) : (
                        <div className="w-5 h-5 border-2 border-gray-300 rounded bg-gray-100"></div>
                      )}
                    </div>
                  </td>
                ))}
                
                                {/* Colonnes des jours (modifiables par les stagiaires) */}
                {days.map((day) => {
                  const dayNumber = parseInt(day.replace('J', ''));
                  const isDayAccessible = dayNumber <= currentDay;
                  const isCompleted = traineeProgress.find(p => 
                    p.syllabusItem === item && 
                    p.traineeId === currentTraineeId && 
                    p.day === day
                  )?.completed || false;
                  
                  // Un jour est modifiable si :
                  // 1. Il est accessible (débloqué par l'admin)
                  // 2. ET soit le formulaire n'est pas validé, soit le jour n'a pas encore été complété
                  const isModifiable = isDayAccessible && (!isValidated || !isCompleted);
                  
                  return (
                    <td key={day} className="border p-2 text-center">
                      <input
                        type="checkbox"
                        checked={isCompleted}
                        onChange={(e) => handleDayChange(item, currentTraineeId, day, e.target.checked)}
                        disabled={!isModifiable}
                        className={`w-4 h-4 ${
                          !isModifiable 
                            ? 'opacity-50 cursor-not-allowed' 
                            : ''
                        }`}
                        title={!isDayAccessible ? `Jour ${day} non encore autorisé` : 
                               !isModifiable ? `Jour ${day} déjà validé` : ''}
                      />
                      {!isDayAccessible && (
                        <div className="text-xs text-gray-400 mt-1">🔒</div>
                      )}
                      {isValidated && isCompleted && (
                        <div className="text-xs text-green-600 mt-1">✅</div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>

          {/* Ligne de séparation */}
          <tbody>
            <tr>
              <td colSpan={3 + 5} className="border-t-4 border-gray-400"></td>
            </tr>
          </tbody>

          {/* Signature du stagiaire */}
          <tbody>
            <tr className="bg-gray-100">
              <td className="border p-2 font-bold sticky left-0 bg-gray-100 z-10">
                Ma Signature
              </td>
              {levels.map((level) => (
                <td key={level} className="border p-2"></td>
              ))}
                            <td colSpan={5} className="border p-2">
                {signatures.find(s => s.traineeId === currentTraineeId)?.signature ? (
                  <div className="flex items-center justify-center">
                    <img 
                      src={signatures.find(s => s.traineeId === currentTraineeId)?.signature} 
                      alt="Signature" 
                      className="h-8 w-auto"
                    />
                    <button
                      onClick={() => setShowSignatureModal(true)}
                      className="ml-2 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Modifier
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowSignatureModal(true)}
                    className="w-full p-2 border rounded text-center bg-blue-50 text-blue-600 hover:bg-blue-100"
                  >
                    Signer ici
                  </button>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Statut de validation */}
      <div className="mt-6 p-4 bg-white border rounded shadow">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            {isValidated ? (
              <>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-green-700 font-bold">✅ Formulaire validé</span>
              </>
            ) : (
              <>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-yellow-700 font-bold">⚠️ En cours de modification</span>
              </>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {!isValidated && Object.keys(pendingChanges).length > 0 && (
              <span className="text-sm text-blue-600">
                {Object.keys(pendingChanges).length} modification(s) en attente
              </span>
            )}
            <button
              onClick={fetchData}
              className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              🔄 Rafraîchir
            </button>
          </div>
        </div>
      </div>

      {/* Bouton de validation */}
      {Object.keys(pendingChanges).length > 0 && (
        <div className="mt-4 p-4 bg-white border rounded shadow">
          <div className="flex justify-center">
            <button
              onClick={handleSubmitForm}
              className="px-6 py-3 rounded-lg font-semibold transition-colors bg-green-600 text-white hover:bg-green-700"
            >
              {isValidated ? '💾 Sauvegarder les modifications' : '✅ Valider et soumettre le formulaire'}
            </button>
          </div>
          <p className="text-sm text-gray-600 text-center mt-2">
            {isValidated 
              ? 'Sauvegardez vos nouvelles modifications pour les jours débloqués.'
              : 'Attention : Une fois validé, les jours complétés ne pourront plus être modifiés.'
            }
          </p>
        </div>
      )}

      {/* Légende */}
      <div className="mt-6 p-4 bg-white border rounded shadow">
        <h3 className="font-bold mb-2">Légende :</h3>
        <ul className="text-sm space-y-1">
          <li><strong>Level 1, 2, 3 :</strong> Niveaux requis définis par l'administrateur (lecture seule)</li>
          <li><strong>J1, J2, J3, J4, J5 :</strong> Vos jours de formation (modifiables jusqu'à validation)</li>
          <li><strong>Ma Signature :</strong> Votre signature pour les 5 jours de formation</li>
        </ul>
      </div>

      {/* Bouton de téléchargement PDF */}
      <div className="mt-6 p-4 bg-white border rounded shadow">
        <div className="flex justify-center">
          <button
            onClick={() => {
              try {
                const doc = generateTraineeIndividualPDF(
                  currentTraineeName,
                  traineeProgress,
                  levelData,
                  signatures.find(s => s.traineeId === currentTraineeId)?.signature,
                  currentSession,
                  currentDay
                );
                
                const fileName = `${currentTraineeName.replace(/[^a-zA-Z0-9]/g, '-')}-follow-up-${new Date().toISOString().split('T')[0]}.pdf`;
                doc.save(fileName);
              } catch (error) {
                console.error('Erreur lors de la génération du PDF:', error);
                alert('Erreur lors de la génération du PDF. Veuillez réessayer.');
              }
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Télécharger mon formulaire en PDF</span>
          </button>
        </div>
      </div>

      {/* Informations de pied de page */}
      <div className="mt-6 p-4 bg-white border rounded shadow">
        <h3 className="font-bold mb-2">Informations importantes :</h3>
        <ul className="text-sm space-y-1">
          <li>• Les niveaux (Level 1, 2, 3) sont définis par l'administrateur et ne peuvent pas être modifiés</li>
          <li>• Vous avez actuellement accès au jour {currentDay} sur 5</li>
          <li>• Les jours verrouillés (🔒) nécessitent l'autorisation de l'administrateur</li>
          <li>• Cochez les cases des jours autorisés pour indiquer votre progression</li>
          <li>• Les jours déjà validés (✅) ne peuvent plus être modifiés</li>
          <li>• Vous pouvez toujours compléter les nouveaux jours débloqués par l'admin</li>
          <li>• Votre signature peut être modifiée à tout moment</li>
          <li>• Cette page est synchronisée avec la vue administrateur</li>
        </ul>
        <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
          <strong>Debug:</strong> {debugInfo}
        </div>
      </div>

      {/* Modal de signature */}
      {showSignatureModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Signature</h3>
            <SignaturePad
              onSave={(signature) => handleTraineeSignatureChange(currentTraineeId, signature)}
              initialValue={signatures.find(s => s.traineeId === currentTraineeId)?.signature || ''}
              disabled={false}
            />
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowSignatureModal(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 