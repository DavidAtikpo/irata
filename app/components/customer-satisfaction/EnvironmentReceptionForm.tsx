'use client';

import { useEffect, useState } from 'react';
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
  const ratingOptions = ['Très satisfaisant', 'Satisfaisant', 'Insatisfaisant', 'Très insatisfaisant'];
  useEffect(() => {
    if (traineeName && traineeName !== name) {
      setName(traineeName);
    }
  }, [traineeName]);
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const r = await fetch('/api/user/training-session');
        if (r.ok) {
          const data = await r.json();
          if (data?.name) setSessionName(data.name);
        }
      } catch {}
    };
    const fetchProfile = async () => {
      try {
        const r = await fetch('/api/user/profile');
        if (r.ok) {
          const data = await r.json();
          const fullName = [data?.prenom, data?.nom].filter(Boolean).join(' ').trim();
          if (fullName) setName(fullName);
        }
      } catch {}
    };
    fetchSession();
    fetchProfile();
  }, []);

  const setRowRating = (index: number, rating: string) => {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, rating } : r)));
  };
  const setRowComment = (index: number, comment: string) => {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, comment } : r)));
  };
  const handleNext = () => {
    if (rows.some((r) => !r.rating)) {
      alert('Veuillez sélectionner une note pour chaque ligne.');
      return;
    }
    onNextWithData?.({
      traineeName: name || undefined,
      session: sessionName || undefined,
      items: rows.map((r) => ({
        label: r.label,
        rating: r.rating as string,
        ...(r.comment.trim() ? { comment: r.comment.trim() } : {}),
      })),
    });
    onNext?.();
  };
  const today = new Date().toLocaleDateString('fr-FR');

  return (
    <div className="bg-white shadow rounded-lg p-6">
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

      <fieldset className="border p-4 rounded mt-6">
        <legend className="font-semibold">Environnement et réception</legend>
        <div className="mb-3 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-800">Nom du stagiaire :</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full border rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-800">Session :</label>
            <input
              type="text"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              className="mt-1 w-full border rounded px-3 py-2 text-sm"
              placeholder="Session inscrite"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead>
              <tr>
                <th className="border p-2 text-left w-[40%] bg-blue-900 text-white">Comment avez-vous trouvé ... ?</th>
                {ratingOptions.map((opt) => (
                  <th key={opt} className="border p-2">{opt}</th>
                ))}
                <th className="border p-2 w-[25%] bg-blue-900 text-white">Commentaires</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={row.label}>
                  <td className="border p-2">{row.label}</td>
                  {ratingOptions.map((opt) => (
                    <td key={opt} className="border p-2 text-center align-middle">
                      <input
                        name={`row-${idx}`}
                        type="radio"
                        className="h-4 w-4"
                        checked={row.rating === opt}
                        onChange={() => setRowRating(idx, opt)}
                      />
                    </td>
                  ))}
                  <td className="border p-2">
                    <input
                      type="text"
                      value={row.comment}
                      onChange={(e) => setRowComment(idx, e.target.value)}
                      className="w-full border rounded px-2 py-1"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </fieldset>

      {/* Signature sur le dernier formulaire uniquement */}

      {/* Pied de page - style similaire à devis */}
      <footer className="mt-6 p-4 bg-white ">
        <div className="flex justify-between items-center text-xs text-gray-600">
          <div>
            CI.DES - Satisfaction Client
          </div>
          <div className="text-center">
            <div>CI.DES sasu  Capital 2 500 Euros</div>
            <div>SIRET : 87840789900011  VAT : FR71878407899</div>
            <div>Page 1 sur 1</div>
          </div>
          <div>
            <Image src="/logo.png" alt="CI.DES" width={32} height={32} />
          </div>
        </div>
      </footer>
      <div className="mt-6 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {typeof step === 'number' && typeof totalSteps === 'number' && (
            <span>Formulaire {step} / {totalSteps}</span>
          )}
        </div>
        <div className="flex gap-2">
          {typeof step === 'number' && step > 1 && (
            <button
              type="button"
              disabled={submitting}
              onClick={onPrev}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              Précédent
            </button>
          )}
          {typeof step === 'number' && typeof totalSteps === 'number' && step < totalSteps && (
            <button
              type="button"
              disabled={submitting}
              onClick={handleNext}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              {submitting ? '...' : 'Suivant'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}


