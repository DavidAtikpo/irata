'use client';

import { useEffect, useState } from 'react';
import HeaderInfoTable from '@/app/components/HeaderInfoTable';
import SignaturePad from '../../../components/SignaturePad';
import Image from 'next/image';

type TrainingPedagogyFormProps = {
  date?: string;
  traineeName?: string;
  aggregated?: {
    env: { traineeName?: string; session?: string; items: any[] } | null;
    equip: { traineeName?: string; session?: string; items: any[]; suggestions?: string } | null;
  };
  onDataChange?: (data: any) => void;
  onSubmitAll?: (payloads: any[]) => Promise<void> | void;
};

export default function TrainingPedagogyForm({ date, traineeName, aggregated, onDataChange, onSubmitAll }: TrainingPedagogyFormProps) {
  const items: string[] = [
    'Accueil, explication des cours par le(s) formateur(s)',
    "Disponibilité de l'équipe encadrante, démonstration des exercices pratiques",
    "Variété des explications et cohérence pour le bon déroulement de chaque stagiaire",
    'Le/les programme(s) et le rythme de la journée concernant les exercices pratiques',
    'Suivi du concept de sécurité en ligne et explication, ou film d\'incident',
    "Qualité des informations fournies",
    "Accueil et accessibilité des services annexes",
    'Mise à disposition des brochures de formation et induction site sur clé USB',
    'Traitement de vos demandes ou réclamations sur site',
    'Globalement, l\'accueil de notre service'
  ];

  const [name, setName] = useState(traineeName ?? '');
  const [rows, setRows] = useState(items.map((label) => ({ label, rating: null as null | string, comment: '' })));
  const [submitting, setSubmitting] = useState(false);
  const [sessionName, setSessionName] = useState('');
  const [signatureData, setSignatureData] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAlreadySubmitted, setIsAlreadySubmitted] = useState(false);
  
  // Log pour déboguer la signature
  useEffect(() => {
    console.log('Signature data changée:', signatureData ? 'Signature présente' : 'Aucune signature');
  }, [signatureData]);
  const ratingOptions = ['Très satisfaisant', 'Satisfaisant', 'Insatisfaisant', 'Très insatisfaisant'];
  
  useEffect(() => {
    if (traineeName && traineeName !== name) {
      setName(traineeName);
    }
  }, [traineeName]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // D'abord, essayer de charger les données depuis localStorage
        const savedData = localStorage.getItem('customer-satisfaction-training');
        if (savedData) {
          try {
            const parsedData = JSON.parse(savedData);
            if (parsedData.items) {
              setRows(items.map((label) => {
                const existingItem = parsedData.items.find((item: any) => item.label === label);
                return {
                  label,
                  rating: existingItem?.rating || null,
                  comment: existingItem?.comment || ''
                };
              }));
            }
            if (parsedData.traineeName) {
              setName(parsedData.traineeName);
            }
            if (parsedData.session) {
              setSessionName(parsedData.session);
            }
            if (parsedData.signature) {
              setSignatureData(parsedData.signature);
            }
          } catch (error) {
            console.error('Erreur lors du parsing des données localStorage:', error);
          }
        }

        // Récupérer les réponses existantes depuis la base de données
        const responsesRes = await fetch('/api/user/customer-satisfaction/responses');
        if (responsesRes.ok) {
          const responsesData = await responsesRes.json();
          console.log('Toutes les réponses récupérées:', responsesData.responses);
          const existingResponse = responsesData.responses?.find((r: any) => r.type === 'TRAINING_PEDAGOGY');
          console.log('Réponse TRAINING_PEDAGOGY trouvée:', existingResponse);
          
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
            if (existingResponse.signature) {
              console.log('Signature trouvée:', existingResponse.signature);
              setSignatureData(existingResponse.signature);
              setIsAlreadySubmitted(true); // Formulaire déjà soumis et signé
            } else {
              console.log('Aucune signature trouvée pour TRAINING_PEDAGOGY');
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
    // Force la mise à jour immédiate pour éviter le délai visuel
    setRows((prev) => {
      const newRows = [...prev];
      newRows[index] = { ...newRows[index], rating };
      return newRows;
    });
  };
  
  const setRowComment = (index: number, comment: string) => {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, comment } : r)));
  };

  // Sauvegarde locale des données du troisième formulaire
  useEffect(() => {
    if (rows.some(r => r.rating) || signatureData) {
      const formData = {
        traineeName: name || undefined,
        session: sessionName || undefined,
        items: rows.map((r) => ({
          label: r.label,
          rating: r.rating || '',
          ...(r.comment.trim() ? { comment: r.comment.trim() } : {}),
        })),
        signature: signatureData || undefined,
      };
      
      // Sauvegarder dans localStorage
      localStorage.setItem('customer-satisfaction-training', JSON.stringify(formData));
      
      // Notifier le parent (sans inclure onDataChange dans les dépendances)
      if (onDataChange) {
        onDataChange(formData);
      }
    }
  }, [rows, name, sessionName, signatureData]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation que tous les formulaires sont complétés
    if (!aggregated?.env) {
      alert('Veuillez d\'abord compléter le formulaire "Environnement et réception".');
      return;
    }
    
    if (!aggregated?.equip) {
      alert('Veuillez d\'abord compléter le formulaire "Équipements d\'entraînement".');
      return;
    }
    
    // Validation que tous les items des formulaires précédents ont des ratings
    if (aggregated.env.items.some((item: any) => !item.rating)) {
      alert('Veuillez sélectionner une note pour chaque ligne du formulaire "Environnement et réception".');
      return;
    }
    
    if (aggregated.equip.items.some((item: any) => !item.rating)) {
      alert('Veuillez sélectionner une note pour chaque ligne du formulaire "Équipements d\'entraînement".');
      return;
    }
    
    if (rows.some((r) => !r.rating)) {
      alert('Veuillez sélectionner une note pour chaque ligne du formulaire "Équipe pédagogique et programme".');
      return;
    }
    
    if (!signatureData) {
      alert('Veuillez signer avant de soumettre.');
      return;
    }
    setSubmitting(true);
    try {
      const payloads: any[] = [];
      
      // Soumettre le formulaire TRAINING_PEDAGOGY avec sa signature
      payloads.push({
        type: 'TRAINING_PEDAGOGY' as const,
        traineeName: name || undefined,
        items: rows.map((r) => ({
          label: r.label,
          rating: r.rating as string,
          ...(r.comment.trim() ? { comment: r.comment.trim() } : {}),
        })),
        session: sessionName || undefined,
        signature: signatureData,
      });

      // Si on a les données des autres formulaires, les soumettre aussi avec la même signature
      if (aggregated?.env) {
        payloads.push({
          type: 'ENVIRONMENT_RECEPTION' as const,
          traineeName: aggregated.env.traineeName || name || undefined,
          items: aggregated.env.items || [],
          session: aggregated.env.session || sessionName || undefined,
          signature: signatureData, // Même signature
        });
      }

      if (aggregated?.equip) {
        payloads.push({
          type: 'EQUIPMENT' as const,
          traineeName: aggregated.equip.traineeName || name || undefined,
          items: aggregated.equip.items || [],
          suggestions: aggregated.equip.suggestions || undefined,
          session: aggregated.equip.session || sessionName || undefined,
          signature: signatureData, // Même signature
        });
      }
      
      console.log('Soumission de tous les formulaires avec signature:', signatureData ? 'Oui' : 'Non');
      console.log('Nombre de formulaires à soumettre:', payloads.length);

      // Submit all in parallel
      await Promise.all(
        payloads.map((p) =>
          fetch('/api/user/customer-satisfaction', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(p),
          }).then(async (r) => {
            if (!r.ok) {
              const data = await r.json().catch(() => ({}));
              throw new Error(data.message || 'Erreur lors de la soumission');
            }
          })
        )
      );

      await onSubmitAll?.(payloads);
      alert('Merci, tous vos formulaires ont été enregistrés et signés.');
      setRows(items.map((label) => ({ label, rating: null as null | string, comment: '' })));
      setSignatureData('');
    } catch (err: any) {
      alert(err.message || 'Erreur inattendue');
    } finally {
      setSubmitting(false);
    }
  };
  
  const today = new Date().toLocaleDateString('fr-FR');

  return (
    <form className="bg-white shadow rounded-lg p-4 sm:p-6" onSubmit={handleSubmit}>
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
      <p className="text-sm text-gray-700">À cette fin, nous souhaitons recueillir votre avis via le questionnaire ci-dessous</p>

      {/* Indicateur de progression des formulaires */}
      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-sm font-semibold text-blue-800 mb-2">État des formulaires :</h3>
        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-2">
            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${
              aggregated?.env ? 'bg-green-500 text-white' : 'bg-gray-300'
            }`}>
              {aggregated?.env ? '✓' : '○'}
            </span>
            <span className={aggregated?.env ? 'text-green-700' : 'text-gray-500'}>
              Environnement et réception {aggregated?.env ? '(Complété)' : '(Non complété)'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${
              aggregated?.equip ? 'bg-green-500 text-white' : 'bg-gray-300'
            }`}>
              {aggregated?.equip ? '✓' : '○'}
            </span>
            <span className={aggregated?.equip ? 'text-green-700' : 'text-gray-500'}>
              Équipements d'entraînement {aggregated?.equip ? '(Complété)' : '(Non complété)'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${
              rows.every(r => r.rating) ? 'bg-green-500 text-white' : 'bg-gray-300'
            }`}>
              {rows.every(r => r.rating) ? '✓' : '○'}
            </span>
            <span className={rows.every(r => r.rating) ? 'text-green-700' : 'text-gray-500'}>
              Équipe pédagogique et programme {rows.every(r => r.rating) ? '(Complété)' : '(Non complété)'}
            </span>
          </div>
        </div>
        {(!aggregated?.env || !aggregated?.equip) && (
          <p className="text-xs text-orange-600 mt-2">
            ⚠️ Vous devez compléter tous les formulaires précédents avant de pouvoir soumettre.
          </p>
        )}
      </div>

      <fieldset className="border p-3 sm:p-4 rounded mt-4 sm:mt-6">
        <legend className="font-semibold text-base sm:text-lg px-2">
          Équipe pédagogique et programme
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
              disabled={isAlreadySubmitted}
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
              disabled={isAlreadySubmitted}
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
                        className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 transition-all duration-75 ${
                          row.rating === opt 
                            ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-500' 
                            : 'border-gray-300'
                        }`}
                        style={{
                          accentColor: row.rating === opt ? '#3b82f6' : '#d1d5db',
                          transform: row.rating === opt ? 'scale(1.1)' : 'scale(1)',
                          transition: 'all 0.1s ease-in-out'
                        }}
                        checked={row.rating === opt}
                        onChange={() => setRowRating(idx, opt)}
                        value={opt}
                        disabled={isAlreadySubmitted}
                      />
                      <span className={`text-xs transition-colors duration-150 ${
                        row.rating === opt ? 'text-blue-700 font-medium' : 'text-gray-700'
                      }`}>{opt}</span>
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
                  disabled={isAlreadySubmitted}
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
                    <td key={opt} className={`border p-2 text-center align-middle transition-colors duration-150 ${
                      row.rating === opt ? 'bg-blue-50' : ''
                    }`}>
                      <input
                        name={`row-${idx}`}
                        type="radio"
                        className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 cursor-pointer transition-all duration-75 ${
                          row.rating === opt ? 'ring-2 ring-blue-500 border-blue-500' : 'border-gray-300'
                        }`}
                        style={{
                          accentColor: row.rating === opt ? '#3b82f6' : '#d1d5db',
                          transform: row.rating === opt ? 'scale(1.1)' : 'scale(1)',
                          transition: 'all 0.1s ease-in-out'
                        }}
                        checked={row.rating === opt}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setRowRating(idx, opt);
                          }
                        }}
                        value={opt}
                        disabled={isAlreadySubmitted}
                      />
                    </td>
                  ))}
                  <td className="border p-2">
                    <input
                      type="text"
                      value={row.comment}
                      onChange={(e) => setRowComment(idx, e.target.value)}
                      className="w-full border rounded px-2 py-1 text-sm"
                      disabled={isAlreadySubmitted}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </fieldset>

      {/* Signature responsive */}
      <fieldset className="border p-3 sm:p-4 rounded mt-4 sm:mt-6">
        <legend className="font-semibold text-base sm:text-lg px-2">
          Signature du stagiaire
          {isLoaded && signatureData && (
            <span className="ml-2 text-sm text-green-600 font-normal">
              ✓ Signature sauvegardée
            </span>
          )}
        </legend>
        <div className="w-full overflow-x-auto">
          {isAlreadySubmitted ? (
            <div className="border border-gray-300 p-4 bg-gray-50 rounded">
              <div className="text-center mb-2">
                <p className="text-sm text-gray-600 mb-2">Signature existante :</p>
                <img src={signatureData} alt="Signature du stagiaire" className="max-w-xs h-auto mx-auto" />
              </div>
              <p className="text-center text-sm text-green-600 font-medium">✓ Formulaire déjà soumis et signé</p>
            </div>
          ) : (
            <SignaturePad 
              onSave={(sig) => setSignatureData(sig)} 
              initialValue={signatureData}
              width={Math.min(600, window.innerWidth - 40)} 
              height={150} 
            />
          )}
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
      
      {/* Bouton de soumission responsive */}
      {!isAlreadySubmitted && (
        <div className="mt-4 sm:mt-6 flex flex-col items-center sm:items-end gap-2">
          <div className="text-sm text-gray-600 text-center sm:text-right">
            En signant ce formulaire, vous signez automatiquement tous vos formulaires de satisfaction.
          </div>
          <button
            type="submit"
            disabled={submitting || !aggregated?.env || !aggregated?.equip || !rows.every(r => r.rating) || !signatureData}
            className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm sm:text-base"
          >
            {submitting ? 'Envoi...' : 'Signer et soumettre tous les formulaires'}
          </button>
          {(!aggregated?.env || !aggregated?.equip || !rows.every(r => r.rating) || !signatureData) && (
            <p className="text-xs text-red-600 text-center">
              {!aggregated?.env || !aggregated?.equip 
                ? 'Complétez d\'abord tous les formulaires précédents'
                : !rows.every(r => r.rating)
                ? 'Complétez tous les champs de ce formulaire'
                : !signatureData
                ? 'Ajoutez votre signature'
                : ''
              }
            </p>
          )}
        </div>
      )}
      
      {/* Message si déjà soumis */}
      {isAlreadySubmitted && (
        <div className="mt-4 sm:mt-6 flex justify-center">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <p className="text-green-800 font-medium">✓ Formulaire déjà soumis</p>
            <p className="text-green-600 text-sm mt-1">Ce formulaire a été soumis et signé avec succès</p>
          </div>
        </div>
      )}
    </form>
  );
}


