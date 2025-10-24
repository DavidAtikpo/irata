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
  onSubmitAll?: (payloads: any[]) => Promise<void> | void;
};

export default function TrainingPedagogyForm({ date, traineeName, aggregated, onSubmitAll }: TrainingPedagogyFormProps) {
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
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  
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
        // Récupérer les réponses existantes
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
    setRows((prev) => {
      const newRows = [...prev];
      newRows[index] = { ...newRows[index], rating };
      return newRows;
    });
  };
  
  const setRowComment = (index: number, comment: string) => {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, comment } : r)));
  };

  // Sauvegarde automatique des données
  useEffect(() => {
    if (!isLoaded) return;
    
    // Attendre un délai avant de sauvegarder pour éviter trop de requêtes
    const timeoutId = setTimeout(async () => {
      try {
        setIsAutoSaving(true);
        console.log('🔄 Sauvegarde automatique TRAINING_PEDAGOGY en cours...', { 
          rowsCount: rows.length, 
          hasRatings: rows.some(r => r.rating),
          name,
          sessionName 
        });
        
        // Sauvegarder toutes les lignes, même celles sans rating
        const itemsToSave = rows.map((r) => ({
          label: r.label,
          rating: r.rating || '',
          ...(r.comment.trim() ? { comment: r.comment.trim() } : {}),
        }));

        console.log('📦 Données TRAINING_PEDAGOGY à sauvegarder:', itemsToSave);

        const response = await fetch('/api/user/customer-satisfaction', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'TRAINING_PEDAGOGY',
            traineeName: name || undefined,
            session: sessionName || undefined,
            items: itemsToSave,
          }),
        });
        
        if (response.ok) {
          console.log('✅ Sauvegarde automatique TRAINING_PEDAGOGY réussie');
        } else {
          const errorText = await response.text();
          console.error('❌ Erreur sauvegarde automatique TRAINING_PEDAGOGY:', errorText);
        }
      } catch (error) {
        console.error('❌ Erreur lors de la sauvegarde automatique TRAINING_PEDAGOGY:', error);
      } finally {
        setIsAutoSaving(false);
      }
    }, 2000); // Délai de 2 secondes

    return () => clearTimeout(timeoutId);
  }, [rows, name, sessionName, isLoaded]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rows.some((r) => !r.rating)) {
      alert('Veuillez sélectionner une note pour chaque ligne.');
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

      <fieldset className="border p-3 sm:p-4 rounded mt-4 sm:mt-6">
        <legend className="font-semibold text-base sm:text-lg px-2">
          Équipe pédagogique et programme
          {isAutoSaving && (
            <span className="ml-2 text-sm text-blue-600 font-normal">
              💾 Sauvegarde en cours...
            </span>
          )}
          {!isAutoSaving && isLoaded && rows.some(r => r.rating) && (
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

        {/* Bouton de test pour la sauvegarde */}
        {!isAlreadySubmitted && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <button
              type="button"
              onClick={async () => {
                console.log('🧪 Test de sauvegarde TRAINING_PEDAGOGY...');
                try {
                  const itemsToSave = rows.map((r) => ({
                    label: r.label,
                    rating: r.rating || '',
                    ...(r.comment.trim() ? { comment: r.comment.trim() } : {}),
                  }));

                  const response = await fetch('/api/user/customer-satisfaction', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      type: 'TRAINING_PEDAGOGY',
                      traineeName: name || undefined,
                      session: sessionName || undefined,
                      items: itemsToSave,
                    }),
                  });

                  if (response.ok) {
                    console.log('✅ Test de sauvegarde TRAINING_PEDAGOGY réussi');
                    alert('Test de sauvegarde TRAINING_PEDAGOGY réussi ! Vérifiez la console.');
                  } else {
                    const errorText = await response.text();
                    console.error('❌ Test de sauvegarde TRAINING_PEDAGOGY échoué:', errorText);
                    alert('Test de sauvegarde TRAINING_PEDAGOGY échoué. Vérifiez la console.');
                  }
                } catch (error) {
                  console.error('❌ Erreur test de sauvegarde TRAINING_PEDAGOGY:', error);
                  alert('Erreur lors du test de sauvegarde TRAINING_PEDAGOGY. Vérifiez la console.');
                }
              }}
              className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
            >
              🧪 Tester la sauvegarde TRAINING_PEDAGOGY
            </button>
            <p className="text-xs text-gray-600 mt-1">
              Cliquez sur ce bouton pour tester si la sauvegarde TRAINING_PEDAGOGY fonctionne. Vérifiez la console (F12) pour voir les logs.
            </p>
          </div>
        )}

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
                        disabled={isAlreadySubmitted}
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
            disabled={submitting}
            className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium text-sm sm:text-base"
          >
            {submitting ? 'Envoi...' : 'Signer et soumettre tous les formulaires'}
          </button>
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


