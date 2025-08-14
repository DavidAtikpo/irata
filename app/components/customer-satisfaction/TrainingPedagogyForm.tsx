'use client';

import { useEffect, useState } from 'react';
import HeaderInfoTable from '@/app/components/HeaderInfoTable';
import SignaturePad from '@/components/SignaturePad';
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
      if (aggregated?.env) {
        payloads.push({
          type: 'ENVIRONMENT_RECEPTION' as const,
          traineeName: aggregated.env.traineeName || name || undefined,
          items: aggregated.env.items,
          session: aggregated.env.session || sessionName || undefined,
          signature: signatureData,
        });
      }
      if (aggregated?.equip) {
        payloads.push({
          type: 'EQUIPMENT' as const,
          traineeName: aggregated.equip.traineeName || name || undefined,
          items: aggregated.equip.items,
          suggestions: aggregated.equip.suggestions,
          session: aggregated.equip.session || sessionName || undefined,
          signature: signatureData,
        });
      }
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
      alert('Merci, vos réponses ont été enregistrées.');
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
        <legend className="font-semibold">Equipe pédagogique et le programme</legend>
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

      {/* Signature */}
      <fieldset className="border p-4 rounded mt-6">
        <legend className="font-semibold">Signature du stagiaire</legend>
        <SignaturePad onSave={(sig) => setSignatureData(sig)} width={600} height={150} />
      </fieldset>

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


