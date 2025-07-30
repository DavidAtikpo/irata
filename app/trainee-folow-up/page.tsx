"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: string;
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

interface CompetenceData {
  syllabusItem: string;
  levels: { [key: string]: boolean };
  days: { [key: string]: boolean };
}

interface FormData {
  [key: string]: CompetenceData;
}

interface SectionProps {
  title: string;
  items: string[];
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  trainees: User[];
  traineeProgress: TraineeProgress[];
  levelData: LevelData[];
  signatures: SignatureData[];
  adminSignature: string;
  onLevelChange: (syllabusItem: string, level: string, checked: boolean) => void;
  onAdminSignatureChange: (signature: string) => void;
}

export default function TraineeFollowUpForm() {
  const { data: session } = useSession();
  const [trainees, setTrainees] = useState<User[]>([]);
  const [traineeProgress, setTraineeProgress] = useState<TraineeProgress[]>([]);
  const [levelData, setLevelData] = useState<LevelData[]>([]);
  const [signatures, setSignatures] = useState<SignatureData[]>([]);
  const [adminSignature, setAdminSignature] = useState('');
  const [loading, setLoading] = useState(true);

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
      
      // Récupérer les utilisateurs (stagiaires)
      const usersResponse = await fetch('/api/admin/users?role=USER');
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setTrainees(usersData);
      }

      // Récupérer les données de progression des stagiaires
      const progressResponse = await fetch('/api/admin/trainee-progress');
      if (progressResponse.ok) {
        const progressData = await progressResponse.json();
        setTraineeProgress(progressData);
      }

      // Récupérer les données de niveau définies par l'admin
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
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  // Gestion des niveaux (admin peut modifier)
  const handleLevelChange = async (syllabusItem: string, level: string, checked: boolean) => {
    // Mise à jour optimiste de l'UI
    setLevelData(prev => {
      const existing = prev.find(l => l.syllabusItem === syllabusItem && l.level === level);
      if (existing) {
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
        // Revenir à l'état précédent en cas d'erreur
        fetchData();
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du niveau:', error);
      fetchData();
    }
  };

  // Gestion de la signature admin
  const handleAdminSignatureChange = async (signature: string) => {
    setAdminSignature(signature);
    
    try {
      const response = await fetch('/api/admin/admin-signature', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ signature }),
      });

      if (!response.ok) {
        console.error('Erreur lors de la sauvegarde de la signature admin');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la signature admin:', error);
    }
  };

  // Téléchargement PDF
  const handleDownloadPDF = () => {
    // TODO: Implémenter la génération et téléchargement PDF
    console.log('Téléchargement PDF...');
    alert('Fonctionnalité PDF à implémenter');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Chargement...</div>
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
              <td colSpan={3 + (trainees.length * 5)} className="border p-4">
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
              {trainees.map((trainee) => (
                days.map((day) => (
                  <th key={`${trainee.id}-${day}`} className="border p-1 whitespace-nowrap text-center">
                    {day}
                  </th>
                ))
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
                
                {/* Colonnes des jours (lecture seule pour l'admin) */}
                {trainees.map((trainee) => (
                  days.map((day) => (
                    <td key={`${trainee.id}-${day}`} className="border p-2 text-center">
                      <input
                        type="checkbox"
                        checked={traineeProgress.find(p => 
                          p.syllabusItem === item && 
                          p.traineeId === trainee.id && 
                          p.day === day
                        )?.completed || false}
                        disabled
                        className="w-4 h-4 opacity-50"
                      />
                    </td>
                  ))
                ))}
              </tr>
            ))}
          </tbody>

          {/* Ligne de séparation après le 8ème stagiaire */}
          <tbody>
            <tr>
              <td colSpan={3 + (trainees.length * 5)} className="border-t-4 border-gray-400"></td>
            </tr>
          </tbody>

          {/* Signatures des stagiaires */}
          {trainees.map((trainee) => (
            <tbody key={trainee.id}>
              <tr className="bg-gray-100">
                <td className="border p-2 font-bold sticky left-0 bg-gray-100 z-10">
                  Signature {trainee.prenom} {trainee.nom}
                </td>
                {levels.map((level) => (
                  <td key={level} className="border p-2"></td>
                ))}
                <td colSpan={5} className="border p-2">
                  <input
                    type="text"
                    placeholder="Signature du stagiaire"
                    value={signatures.find(s => s.traineeId === trainee.id)?.signature || ''}
                    disabled
                    className="w-full p-1 border rounded text-center bg-gray-50"
                  />
                </td>
              </tr>
            </tbody>
          ))}

          {/* Signature de l'admin */}
          <tbody>
            <tr className="bg-blue-100">
              <td className="border p-2 font-bold sticky left-0 bg-blue-100 z-10">
                Signature Admin
              </td>
              {levels.map((level) => (
                <td key={level} className="border p-2"></td>
              ))}
              <td colSpan={5} className="border p-2">
                <input
                  type="text"
                  placeholder="Signature de l'administrateur"
                  value={adminSignature}
                  onChange={(e) => handleAdminSignatureChange(e.target.value)}
                  className="w-full p-1 border rounded text-center"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Bouton de téléchargement PDF */}
      <div className="mt-6 p-4 flex justify-center">
        <button
          onClick={handleDownloadPDF}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Télécharger en PDF
        </button>
      </div>

      {/* Légende */}
      <div className="mt-6 p-4 bg-white border rounded shadow">
        <h3 className="font-bold mb-2">Légende :</h3>
        <ul className="text-sm space-y-1">
          <li><strong>Level 1, 2, 3 :</strong> Niveaux requis définis par l'administrateur (modifiables)</li>
          <li><strong>J1, J2, J3, J4, J5 :</strong> Jours de formation cochés par les stagiaires (lecture seule)</li>
          <li><strong>Signatures :</strong> Signatures des stagiaires et de l'administrateur</li>
        </ul>
      </div>

      {/* Informations de pied de page */}
      <div className="mt-6 p-4 bg-white border rounded shadow">
        <h3 className="font-bold mb-2">Informations importantes :</h3>
        <ul className="text-sm space-y-1">
          <li>• Vous pouvez modifier les niveaux requis (Level 1, 2, 3) en cochant/décochant les cases</li>
          <li>• Les jours cochés par les stagiaires sont en lecture seule</li>
          <li>• Les signatures des stagiaires sont automatiquement synchronisées</li>
          <li>• Utilisez le bouton "Télécharger en PDF" pour générer le rapport final</li>
        </ul>
      </div>
    </div>
  );
} 