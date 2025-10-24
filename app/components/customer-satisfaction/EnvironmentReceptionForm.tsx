'use client';

import { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import HeaderInfoTable from '@/app/components/HeaderInfoTable';
import Image from 'next/image';

type EnvironmentReceptionFormProps = {
  date?: string;
  traineeName?: string;
  onNext?: () => void;
  step?: number;
  totalSteps?: number;
  onNextWithData?: (data: {
    traineeName?: string;
    session?: string;
    items: { label: string; rating: string; comment?: string }[];
  }) => void;
  onPrev?: () => void;
};

export default function EnvironmentReceptionForm({ date, traineeName, onNext, step, totalSteps, onNextWithData, onPrev }: EnvironmentReceptionFormProps) {
  const items: string[] = [
    "Accueil par notre chauffeur à votre arrivée à l'aéroport ou à la gare",
    'La localisation ou la zone du centre de formation',
    'La structure de la formation',
    'Le bureau du secrétaire général et l\'accueil',
    'À l\'intérieur du bâtiment du centre de formation',
    'La salle de classe et la salle de réunion',
    "Disponibilité des accessoires, consommables de 'l'environnement de vie' et leurs conditions",
    'Les installations sanitaires et leur état de propreté',
    "Affichage des informations d'urgence et de prévention",
    "Globalement l'environnement",
    'Performance sécurité de l\'instructeur et de l\'entreprise'
  ];

  const [name, setName] = useState(traineeName ?? '');
  const [rows, setRows] = useState(items.map((label) => ({ label, rating: null as null | string, comment: '' })));
  const [sessionName, setSessionName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const ratingOptions = ['Très satisfaisant', 'Satisfaisant', 'Insatisfaisant', 'Très insatisfaisant'];
  
  useEffect(() => {
    if (traineeName && traineeName !== name) {
      setName(traineeName);
    }
  }, [traineeName]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupérer les réponses existantes
        const responsesRes = await fetch('/api/user/customer-satisfaction/responses');
        if (responsesRes.ok) {
          const responsesData = await responsesRes.json();
          const existingResponse = responsesData.responses?.find((r: any) => r.type === 'ENVIRONMENT_RECEPTION');
          
          if (existingResponse && existingResponse.items) {
            // Charger les données existantes
            const existingItems = Array.isArray(existingResponse.items) ? existingResponse.items : [];
            setRows(items.map((label) => {
              const existingItem = existingItems.find((item: any) => item.label === label);
              return {
                label,
                rating: existingItem?.rating || null,
                comment: existingItem?.comment || ''
              };
            }));
            
            if (existingResponse.traineeName) {
              setName(existingResponse.traineeName);
            }
            if (existingResponse.session) {
              setSessionName(existingResponse.session);
            }
          }
        }
        
        // Récupérer la session de formation
        const sessionRes = await fetch('/api/user/training-session');
        if (sessionRes.ok) {
          const sessionData = await sessionRes.json();
          if (sessionData?.name && !sessionName) {
            setSessionName(sessionData.name);
          }
        }
        
        // Récupérer le profil utilisateur
        const profileRes = await fetch('/api/user/profile');
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          const fullName = [profileData?.prenom, profileData?.nom].filter(Boolean).join(' ').trim();
          if (fullName && !name) {
            setName(fullName);
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setIsLoaded(true);
      }
    };
    
    fetchData();
  }, []);

  const setRowRating = (index: number, rating: string) => {
    // Force la mise à jour immédiate avec flushSync
    flushSync(() => {
      setRows((prev) => {
        const newRows = [...prev];
        newRows[index] = { ...newRows[index], rating };
        return newRows;
      });
    });
  };
  
  const setRowComment = (index: number, comment: string) => {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, comment } : r)));
  };

  // Sauvegarde automatique des données
  useEffect(() => {
    if (!isLoaded || rows.every(r => !r.rating)) return;
    
    const autoSave = async () => {
      try {
        await fetch('/api/user/customer-satisfaction', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'ENVIRONMENT_RECEPTION',
            traineeName: name || undefined,
            session: sessionName || undefined,
            items: rows.map((r) => ({
              label: r.label,
              rating: r.rating as string,
              ...(r.comment.trim() ? { comment: r.comment.trim() } : {}),
            })),
          }),
        });
      } catch (error) {
        console.error('Erreur lors de la sauvegarde automatique:', error);
      }
    };

    const timeoutId = setTimeout(autoSave, 1000); // Sauvegarde après 1 seconde d'inactivité
    return () => clearTimeout(timeoutId);
  }, [rows, name, sessionName, isLoaded]);
  
  const handleNext = async () => {
    if (rows.some((r) => !r.rating)) {
      alert('Veuillez sélectionner une note pour chaque ligne.');
      return;
    }
    
    setSubmitting(true);
    try {
      const formData = {
        traineeName: name || undefined,
        session: sessionName || undefined,
        items: rows.map((r) => ({
          label: r.label,
          rating: r.rating as string,
          ...(r.comment.trim() ? { comment: r.comment.trim() } : {}),
        })),
      };

      // Sauvegarder les données en base
      const response = await fetch('/api/user/customer-satisfaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'ENVIRONMENT_RECEPTION',
          ...formData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Erreur lors de la sauvegarde');
      }

      onNextWithData?.(formData);
      onNext?.();
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert(error.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSubmitting(false);
    }
  };
  
  const today = new Date().toLocaleDateString('fr-FR');

  return (
    <div className="bg-white shadow rounded-lg p-4 sm:p-6">
      <HeaderInfoTable
        title="CI.DES FORMULAIRE D'ENQUÊTE DE SATISFACTION CLIENT"
        codeNumberLabel="Numéro de code"
        codeNumber="ENR-CIFRA-QHSE 007"
        revisionLabel="Révision"
        revision="00"
        creationDateLabel="Date"
        creationDate={date ?? today}
      />

      <p className="text-sm text-gray-700 mt-4">
        L'objectif de ce document est d'améliorer en continu la qualité de nos services.
      </p>
      <p className="text-sm text-gray-700">À cette fin, nous souhaitons recueillir votre avis via le questionnaire ci-dessous.</p>

      <fieldset className="border p-3 sm:p-4 rounded mt-4 sm:mt-6">
        <legend className="font-semibold text-base sm:text-lg px-2">
          Environnement et réception
          {isLoaded && rows.some(r => r.rating) && (
            <span className="ml-2 text-sm text-green-600 font-normal">
              ✓ Réponses sauvegardées
            </span>
          )}
        </legend>
        
        {/* Informations utilisateur responsive */}
        <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">Nom du stagiaire :</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">Session :</label>
            <input
              type="text"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Session inscrite"
            />
          </div>
        </div>

        {/* Version mobile : Cartes empilées */}
        <div className="block sm:hidden space-y-4">
          {rows.map((row, idx) => (
            <div key={row.label} className="border rounded-lg p-3 bg-gray-50">
              <h4 className="font-medium text-sm text-gray-800 mb-3 leading-tight">
                {row.label}
              </h4>
              
              {/* Options de notation */}
              <div className="space-y-2 mb-3">
                <label className="text-xs font-medium text-gray-700">Votre évaluation :</label>
                <div className="grid grid-cols-2 gap-2">
                  {ratingOptions.map((opt) => (
                    <label key={opt} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        name={`row-${idx}`}
                        type="radio"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 transition-all duration-150"
                        checked={row.rating === opt}
                        onChange={() => setRowRating(idx, opt)}
                        value={opt}
                      />
                      <span className="text-xs text-gray-700">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Commentaire */}
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Commentaire :</label>
                <input
                  type="text"
                  value={row.comment}
                  onChange={(e) => setRowComment(idx, e.target.value)}
                  className="w-full border rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Votre commentaire (optionnel)"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Version desktop : Tableau */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead>
              <tr>
                <th className="border p-2 text-left w-[40%] bg-blue-900 text-white">Comment avez-vous trouvé ... ?</th>
                {ratingOptions.map((opt) => (
                  <th key={opt} className="border p-2 text-center">{opt}</th>
                ))}
                <th className="border p-2 w-[25%] bg-blue-900 text-white">Commentaires</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={`${row.label}-${idx}`}>
                  <td className="border p-2 text-sm">{row.label}</td>
                  {ratingOptions.map((opt) => (
                    <td key={opt} className="border p-2 text-center align-middle">
                      <input
                        name={`row-${idx}`}
                        type="radio"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 cursor-pointer transition-all duration-150"
                        checked={row.rating === opt}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setRowRating(idx, opt);
                          }
                        }}
                        value={opt}
                      />
                    </td>
                  ))}
                  <td className="border p-2">
                    <input
                      type="text"
                      value={row.comment}
                      onChange={(e) => setRowComment(idx, e.target.value)}
                      className="w-full border rounded px-2 py-1 text-sm"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </fieldset>

      {/* Pied de page responsive */}
      <footer className="mt-4 sm:mt-6 p-3 sm:p-4 bg-white">
        <div className="flex flex-col sm:flex-row justify-between items-center text-xs text-gray-600 space-y-2 sm:space-y-0">
          <div className="text-center sm:text-left">
            CI.DES - Satisfaction Client
          </div>
          <div className="text-center text-xs">
            <div>CI.DES sasu Capital 2 500 Euros</div>
            <div>SIRET : 87840789900011 VAT : FR71878407899</div>
            <div>Page 1 sur 1</div>
          </div>
          <div>
            <Image src="/logo.png" alt="CI.DES" width={32} height={32} />
          </div>
        </div>
      </footer>
      
      {/* Navigation responsive */}
      <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-sm text-gray-600 text-center sm:text-left">
          {typeof step === 'number' && typeof totalSteps === 'number' && (
            <span>Formulaire {step} / {totalSteps}</span>
          )}
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          {typeof step === 'number' && step > 1 && (
            <button
              type="button"
              disabled={submitting}
              onClick={onPrev}
              className="flex-1 sm:flex-none px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors text-sm"
            >
              Précédent
            </button>
          )}
          {typeof step === 'number' && typeof totalSteps === 'number' && step < totalSteps && (
            <button
              type="button"
              disabled={submitting}
              onClick={handleNext}
              className="flex-1 sm:flex-none px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
            >
              {submitting ? '...' : 'Suivant'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}


