'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import HeaderInfoTable from '@/app/components/HeaderInfoTable';
import Image from 'next/image';

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
  session?: string | null;
  signature?: string | null;
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
  const [filterSession, setFilterSession] = useState<string>('all');
  const [availableSessions, setAvailableSessions] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [adminNotes, setAdminNotes] = useState<Record<string, { note1: string; note2: string }>>({});
  const [downloadingPdf, setDownloadingPdf] = useState<Set<string>>(new Set());
  const [downloadingAllPdfs, setDownloadingAllPdfs] = useState(false);

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
      fetchAvailableSessions();
    }
  }, [session, filterType, filterSession]);

  const fetchResponses = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterType !== 'all') params.append('type', filterType);
      if (filterSession !== 'all') params.append('session', filterSession);
      
      const query = params.toString() ? `?${params.toString()}` : '';
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

  const fetchAvailableSessions = async () => {
    try {
      const res = await fetch('/api/admin/customer-satisfaction?sessions=true');
      if (res.ok) {
        const sessions = await res.json() as string[];
        setAvailableSessions(sessions);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des sessions:', err);
    }
  };

  const downloadPdf = async (userEmail: string) => {
    try {
      setDownloadingPdf(prev => new Set(prev).add(userEmail));
      
      const response = await fetch('/api/admin/customer-satisfaction/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userEmail }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la génération du PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `satisfaction-client-${userEmail.replace('@', '-').replace('.', '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erreur lors du téléchargement PDF:', error);
      alert('Erreur lors de la génération du PDF');
    } finally {
      setDownloadingPdf(prev => {
        const newSet = new Set(prev);
        newSet.delete(userEmail);
        return newSet;
      });
    }
  };

  const downloadAllPdfs = async () => {
    try {
      setDownloadingAllPdfs(true);
      const userEmails = Object.keys(groupedResponses);
      
      for (const userEmail of userEmails) {
        await downloadPdf(userEmail);
        // Petite pause entre les téléchargements pour éviter de surcharger
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error('Erreur lors du téléchargement de tous les PDFs:', error);
      alert('Erreur lors du téléchargement de certains PDFs');
    } finally {
      setDownloadingAllPdfs(false);
    }
  };

  // Regrouper les réponses par utilisateur
  const groupedResponses = useMemo(() => {
    const grouped: Record<string, SatisfactionResponse[]> = {};
    
    responses.forEach(response => {
      const userId = response.user?.email || 'unknown';
      if (!grouped[userId]) {
        grouped[userId] = [];
      }
      grouped[userId].push(response);
    });
    
    return grouped;
  }, [responses]);

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
              <option value="all">Tous les types</option>
              <option value="ENVIRONMENT_RECEPTION">Cadre & Accueil</option>
              <option value="EQUIPMENT">Équipements</option>
              <option value="TRAINING_PEDAGOGY">Pédagogie & Formation</option>
            </select>
            <select
              className="border rounded px-3 py-2 text-sm"
              value={filterSession}
              onChange={(e) => setFilterSession(e.target.value)}
            >
              <option value="all">Toutes les sessions</option>
              {availableSessions.map((session) => (
                <option key={session} value={session}>
                  {session}
                </option>
              ))}
            </select>
            <button
              onClick={downloadAllPdfs}
              disabled={downloadingAllPdfs || Object.keys(groupedResponses).length === 0}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {downloadingAllPdfs ? 'Génération...' : 'Télécharger tous les PDFs'}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left p-3 border">Utilisateur</th>
                <th className="text-left p-3 border">Nom du stagiaire</th>
                <th className="text-left p-3 border">Session</th>
                <th className="text-left p-3 border">Formulaires complétés</th>
                <th className="text-left p-3 border">Statut signature</th>
                <th className="text-left p-3 border">Dernière activité</th>
                <th className="text-left p-3 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(groupedResponses).map(([userEmail, userResponses]) => {
                const firstResponse = userResponses[0];
                const completedForms = userResponses.length;
                const hasSignature = userResponses.some(r => r.signature);
                const lastActivity = userResponses.reduce((latest, current) => {
                  const currentDate = new Date(current.createdAt || current.date);
                  const latestDate = new Date(latest.createdAt || latest.date);
                  return currentDate > latestDate ? current : latest;
                });
                
                return (
                  <tr key={userEmail} className="border-b align-top">
                    <td className="p-3 border">
                      {firstResponse.user?.nom || firstResponse.user?.prenom ? (
                        <span>{[firstResponse.user?.prenom, firstResponse.user?.nom].filter(Boolean).join(' ')}</span>
                      ) : (
                        <span>{userEmail}</span>
                      )}
                      <div className="text-xs text-gray-500">{userEmail}</div>
                    </td>
                    <td className="p-3 border">{firstResponse.traineeName || '-'}</td>
                    <td className="p-3 border">{firstResponse.session || '-'}</td>
                    <td className="p-3 border">
                      <div className="flex flex-wrap gap-1">
                        {userResponses.map((response) => (
                          <span
                            key={response.id}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {typeLabels[response.type]}
                          </span>
                        ))}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {completedForms}/3 formulaires
                      </div>
                    </td>
                    <td className="p-3 border">
                      {hasSignature ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ✓ Signé
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          ⚠ Non signé
                        </span>
                      )}
                    </td>
                    <td className="p-3 border">
                      {new Date(lastActivity.createdAt || lastActivity.date).toLocaleString('fr-FR')}
                    </td>
                    <td className="p-3 border">
                      <div className="flex gap-2">
                        <button
                          className="text-blue-600 hover:underline text-sm"
                          onClick={() => setExpanded((e) => ({ ...e, [userEmail]: !e[userEmail] }))}
                        >
                          {expanded[userEmail] ? 'Masquer' : 'Voir détail'}
                        </button>
                        <button
                          className="text-green-600 hover:underline text-sm disabled:opacity-50"
                          onClick={() => downloadPdf(userEmail)}
                          disabled={downloadingPdf.has(userEmail)}
                        >
                          {downloadingPdf.has(userEmail) ? 'Génération...' : 'PDF'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {Object.entries(groupedResponses).map(([userEmail, userResponses]) => (
          <div key={userEmail} className="mt-4">
            {expanded[userEmail] && (
              <div className="bg-white shadow rounded-lg p-4">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Détails complets - {userResponses[0].user?.nom || userResponses[0].user?.prenom ? 
                    [userResponses[0].user?.prenom, userResponses[0].user?.nom].filter(Boolean).join(' ') : 
                    userEmail}
                </h2>
                
                {userResponses.map((r) => (
                  <div key={r.id} className="mb-8 border-b border-gray-200 pb-6 last:border-b-0">
                    {/* En-tête similaire aux formulaires user */}
                    <HeaderInfoTable
                      title={`CI.DES FORMULAIRE D'ENQUÊTE DE SATISFACTION CLIENT - ${typeLabels[r.type]}`}
                      codeNumberLabel="Numéro de code"
                      codeNumber="ENR-CIFRA-QHSE 007"
                      revisionLabel="Révision"
                      revision="00"
                      creationDateLabel="Date"
                      creationDate={new Date(r.createdAt || r.date).toLocaleDateString('fr-FR')}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <div className="text-sm text-gray-700"><span className="font-medium">Nom du stagiaire:</span> {r.traineeName || '-'}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-700"><span className="font-medium">Session:</span> {r.session || '-'}</div>
                      </div>
                    </div>

                    <h3 className="font-semibold mt-6 mb-3">Détails - {typeLabels[r.type]}</h3>
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

                    {/* Signature du stagiaire */}
                    {r.signature ? (
                      <div className="mt-3">
                        <h4 className="font-medium mb-2">Signature du stagiaire</h4>
                        <div className="border border-gray-300 p-2 bg-gray-50 rounded">
                          <img src={r.signature} alt="Signature du stagiaire" className="max-w-xs h-auto" />
                        </div>
                        <p className="text-sm text-green-600 mt-1">✓ Formulaire signé</p>
                      </div>
                    ) : (
                      <div className="mt-3">
                        <h4 className="font-medium mb-2">Signature du stagiaire</h4>
                        <div className="border border-gray-300 p-4 bg-gray-50 rounded text-center">
                          <p className="text-gray-500 text-sm">Aucune signature</p>
                        </div>
                        <p className="text-sm text-orange-600 mt-1">⚠ Formulaire non signé</p>
                      </div>
                    )}
                  </div>
                ))}

                {/* Commentaires Admin globaux pour l'utilisateur */}
                <div className="mt-6 border-t border-gray-200 pt-4">
                  <h4 className="font-medium mb-3">Commentaires administrateur</h4>
                  <div className="space-y-4">
                    <div className="max-w-xl">
                      <label className="block text-sm text-gray-700 mb-1">Note 1</label>
                      <input
                        type="text"
                        className="w-full border-0 border-b border-gray-400 focus:border-gray-600 focus:outline-none px-0 py-1"
                        value={adminNotes[userEmail]?.note1 || ''}
                        onChange={(e) => setAdminNotes((prev) => ({ ...prev, [userEmail]: { ...(prev[userEmail] || { note1: '', note2: '' }), note1: e.target.value } }))}
                        placeholder="Écrire ici..."
                      />
                    </div>
                    <div className="max-w-xl">
                      <label className="block text-sm text-gray-700 mb-1">Note 2</label>
                      <input
                        type="text"
                        className="w-full border-0 border-b border-gray-400 focus:border-gray-600 focus:outline-none px-0 py-1"
                        value={adminNotes[userEmail]?.note2 || ''}
                        onChange={(e) => setAdminNotes((prev) => ({ ...prev, [userEmail]: { ...(prev[userEmail] || { note1: '', note2: '' }), note2: e.target.value } }))}
                        placeholder="Écrire ici..."
                      />
                    </div>
                  </div>
                </div>

                {/* Pied de page style devis */}
                <footer className="mt-6 p-4 bg-white">
                  <div className="flex justify-between items-center text-xs text-gray-600">
                    <div>
                      CI.DES - Satisfaction Client
                    </div>
                    <div className="text-center">
                      <div>CI.DES sasu Capital 2 500 Euros</div>
                      <div>SIRET : 87840789900011 VAT : FR71878407899</div>
                      <div>Page 1 sur 1</div>
                    </div>
                    <div>
                      <Image src="/logo.png" alt="CI.DES" width={32} height={32} />
                    </div>
                  </div>
                </footer>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}


