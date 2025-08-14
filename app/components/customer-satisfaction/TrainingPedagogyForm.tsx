'use client';

import { useState } from 'react';
import HeaderInfoTable from '@/app/components/HeaderInfoTable';

type TrainingPedagogyFormProps = {
  date?: string;
  traineeName?: string;
};

export default function TrainingPedagogyForm({ date, traineeName }: TrainingPedagogyFormProps) {
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
  const ratingOptions = ['Très satisfaisant', 'Satisfaisant', 'Insatisfaisant', 'Très insatisfaisant'];
  const setRowRating = (index: number, rating: string) => {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, rating } : r)));
  };
  const setRowComment = (index: number, comment: string) => {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, comment } : r)));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rows.some((r) => !r.rating)) {
      alert('Veuillez sélectionner une note pour chaque ligne.');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        type: 'TRAINING_PEDAGOGY' as const,
        traineeName: name || undefined,
        items: rows.map((r) => ({
          label: r.label,
          rating: r.rating as string,
          ...(r.comment.trim() ? { comment: r.comment.trim() } : {}),
        })),
      };
      const res = await fetch('/api/user/customer-satisfaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Erreur lors de l'enregistrement");
      }
      alert('Merci, votre réponse a été enregistrée.');
      setRows(items.map((label) => ({ label, rating: null as null | string, comment: '' })));
    } catch (err: any) {
      alert(err.message || 'Erreur inattendue');
    } finally {
      setSubmitting(false);
    }
  };
  const today = new Date().toLocaleDateString('fr-FR');

  return (
    <form className="bg-white shadow rounded-lg p-6" onSubmit={handleSubmit}>
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

      <fieldset className="border p-4 rounded mt-6">
        <legend className="font-semibold">Équipe de formation et programme pédagogique</legend>
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-800">Nom du stagiaire :</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full border rounded px-3 py-2 text-sm"
          />
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
      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? 'Envoi...' : 'Soumettre'}
        </button>
      </div>
    </form>
  );
}


