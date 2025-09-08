"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

type HistoriqueItem = {
  id: string;
  annee: string;
  session: string;
  commentaire: string | null;
  createdAt: string;
  document: {
    id: string;
    nom: string;
    url: string;
  };
};

export default function HistoriqueManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [annee, setAnnee] = useState<string>('');
  const [sessionLabel, setSessionLabel] = useState<string>('');
  const [commentaire, setCommentaire] = useState<string>('');
  const [files, setFiles] = useState<FileList | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<HistoriqueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<HistoriqueItem | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/');
    } else if (status === 'authenticated') {
      fetchItems();
    }
  }, [status, session, router]);

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/admin/historique');
      if (!res.ok) throw new Error('Erreur chargement');
      const data = await res.json();
      setItems(data.items || []);
    } catch (e) {
      setError('Erreur lors du chargement des images');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!files || files.length === 0) {
      setError('Veuillez sélectionner au moins une image');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const form = new FormData();
      Array.from(files).forEach((f) => form.append('files', f));
      form.append('annee', annee);
      form.append('session', sessionLabel);
      form.append('commentaire', commentaire);
      const res = await fetch('/api/admin/historique', { method: 'POST', body: form });
      if (!res.ok) throw new Error('Échec de téléversement');
      setAnnee('');
      setSessionLabel('');
      setCommentaire('');
      setFiles(null);
      await fetchItems();
    } catch (e) {
      setError('Échec de téléversement');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="max-w-6xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-semibold">Gestion Historique des Formations</h1>

      <section className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-medium mb-4">Ajouter des images</h2>
        {error && (
          <div className="mb-4 rounded bg-red-50 text-red-700 px-3 py-2 text-sm">{error}</div>
        )}
        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="flex flex-col">
            <label className="text-sm text-gray-700 mb-1">Année</label>
            <input
              type="number"
              value={annee}
              onChange={(e) => setAnnee(e.target.value)}
              placeholder="2025"
              className="border rounded px-3 py-2"
              required
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm text-gray-700 mb-1">Session</label>
            <input
              type="text"
              value={sessionLabel}
              onChange={(e) => setSessionLabel(e.target.value)}
              placeholder="Janvier / Session 1"
              className="border rounded px-3 py-2"
              required
            />
          </div>
          <div className="flex flex-col md:col-span-2">
            <label className="text-sm text-gray-700 mb-1">Commentaire</label>
            <input
              type="text"
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
              placeholder="Commentaires..."
              className="border rounded px-3 py-2"
            />
          </div>
          <div className="md:col-span-4">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setFiles(e.target.files)}
            />
          </div>
          <div className="md:col-span-4">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {submitting ? 'Envoi...' : 'Téléverser'}
            </button>
          </div>
        </form>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Historique</h2>
        {loading ? (
          <div className="text-gray-600">Chargement...</div>
        ) : items.length === 0 ? (
          <div className="text-gray-600">Aucune image pour le moment.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="relative w-full h-56">
                  <Image src={item.document.url} alt={item.document.nom} fill className="object-cover" />
                </div>
                <div className="p-3 space-y-2">
                  <div className="text-sm font-semibold">{item.document.nom}</div>
                  <div className="text-xs text-gray-600">{item.annee} • {item.session}</div>
                  {item.commentaire && (
                    <div className="text-xs text-gray-600">{item.commentaire}</div>
                  )}
                  <div className="flex gap-2 pt-2">
                    <button
                      className="px-2 py-1 text-xs rounded bg-yellow-500 text-white hover:bg-yellow-600"
                      onClick={() => setEditing(item)}
                    >
                      Modifier
                    </button>
                    <button
                      className="px-2 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-700"
                      onClick={() => setConfirmDeleteId(item.id)}
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-lg shadow p-4 space-y-3">
            <h3 className="text-lg font-medium">Modifier</h3>
            <div className="grid grid-cols-1 gap-3">
              <input
                className="border rounded px-3 py-2"
                value={editing.annee}
                onChange={(e) => setEditing({ ...editing, annee: e.target.value })}
              />
              <input
                className="border rounded px-3 py-2"
                value={editing.session}
                onChange={(e) => setEditing({ ...editing, session: e.target.value })}
              />
              <input
                className="border rounded px-3 py-2"
                value={editing.commentaire ?? ''}
                onChange={(e) => setEditing({ ...editing, commentaire: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button className="px-3 py-2 text-sm" onClick={() => setEditing(null)}>Annuler</button>
              <button
                className="px-3 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
                onClick={async () => {
                  if (!editing) return;
                  const res = await fetch('/api/admin/historique', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: editing.id, annee: editing.annee, session: editing.session, commentaire: editing.commentaire }),
                  });
                  if (res.ok) {
                    setEditing(null);
                    fetchItems();
                  }
                }}
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-lg shadow p-4 space-y-4">
            <div>Confirmer la suppression ?</div>
            <div className="flex justify-end gap-2">
              <button className="px-3 py-2 text-sm" onClick={() => setConfirmDeleteId(null)}>Annuler</button>
              <button
                className="px-3 py-2 text-sm rounded bg-red-600 text-white hover:bg-red-700"
                onClick={async () => {
                  const res = await fetch('/api/admin/historique', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: confirmDeleteId }),
                  });
                  if (res.ok) {
                    setConfirmDeleteId(null);
                    fetchItems();
                  }
                }}
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}


