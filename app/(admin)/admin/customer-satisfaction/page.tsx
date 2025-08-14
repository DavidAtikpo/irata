'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

type ResponseItem = {
  label: string;
  rating: string;
  comment?: string;
};

type SatisfactionResponse = {
  id: string;
  traineeName?: string | null;
  type: 'ENVIRONMENT_RECEPTION' | 'EQUIPMENT' | 'TRAINING_PEDAGOGY';
  date: string;
  createdAt: string;
  items: ResponseItem[];
  suggestions?: string | null;
  user?: {
    email?: string | null;
    nom?: string | null;
    prenom?: string | null;
  } | null;
};

const typeLabels: Record<SatisfactionResponse['type'], string> = {
  ENVIRONMENT_RECEPTION: 'Cadre & Accueil',
  EQUIPMENT: 'Équipements',
  TRAINING_PEDAGOGY: 'Pédagogie & Formation',
};

export default function AdminCustomerSatisfactionPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [responses, setResponses] = useState<SatisfactionResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | SatisfactionResponse['type']>('all');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/');
    }
  }, [status, session, router]);

  useEffect(() => {
    if (session?.user?.role === 'ADMIN') {
      fetchResponses();
    }
  }, [session, filterType]);

  const fetchResponses = async () => {
    try {
      setLoading(true);
      const query = filterType === 'all' ? '' : `?type=${filterType}`;
      const res = await fetch(`/api/admin/customer-satisfaction${query}`);
      if (!res.ok) throw new Error('Erreur lors du chargement');
      const data = (await res.json()) as SatisfactionResponse[];
      setResponses(data);
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la récupération des réponses");
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => responses, [responses]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900">Chargement...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-red-600">{error}</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Satisfaction Clients</h1>
          <div className="flex items-center gap-3">
            <select
              className="border rounded px-3 py-2 text-sm"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
            >
              <option value="all">Tous</option>
              <option value="ENVIRONMENT_RECEPTION">Cadre & Accueil</option>
              <option value="EQUIPMENT">Équipements</option>
              <option value="TRAINING_PEDAGOGY">Pédagogie & Formation</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left p-3 border">Date</th>
                <th className="text-left p-3 border">Type</th>
                <th className="text-left p-3 border">Nom du stagiaire</th>
                <th className="text-left p-3 border">Utilisateur</th>
                <th className="text-left p-3 border">Éléments</th>
                <th className="text-left p-3 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b align-top">
                  <td className="p-3 border">{new Date(r.createdAt || r.date).toLocaleString('fr-FR')}</td>
                  <td className="p-3 border">{typeLabels[r.type]}</td>
                  <td className="p-3 border">{r.traineeName || '-'}</td>
                  <td className="p-3 border">
                    {r.user?.nom || r.user?.prenom ? (
                      <span>{[r.user?.prenom, r.user?.nom].filter(Boolean).join(' ')} ({r.user?.email})</span>
                    ) : (
                      <span>{r.user?.email || '-'}</span>
                    )}
                  </td>
                  <td className="p-3 border">{r.items?.length || 0}</td>
                  <td className="p-3 border">
                    <button
                      className="text-blue-600 hover:underline"
                      onClick={() => setExpanded((e) => ({ ...e, [r.id]: !e[r.id] }))}
                    >
                      {expanded[r.id] ? 'Masquer' : 'Voir détail'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.map((r) => (
          <div key={r.id} className="mt-4">
            {expanded[r.id] && (
              <div className="bg-white shadow rounded-lg p-4">
                <h3 className="font-semibold mb-3">Détails</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left p-2 border">Élément</th>
                        <th className="text-left p-2 border">Note</th>
                        <th className="text-left p-2 border">Commentaire</th>
                      </tr>
                    </thead>
                    <tbody>
                      {r.items?.map((it, idx) => (
                        <tr key={idx} className="border-b">
                          <td className="p-2 border">{it.label}</td>
                          <td className="p-2 border">{it.rating}</td>
                          <td className="p-2 border">{it.comment || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {r.suggestions && (
                  <div className="mt-3">
                    <h4 className="font-medium">Suggestions</h4>
                    <p className="text-gray-700 whitespace-pre-wrap">{r.suggestions}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}


