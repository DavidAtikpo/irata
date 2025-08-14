'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import { useDevisNotifications } from '../../../../hooks/useDevisNotifications';

interface Devis {
  id: string;
  numero: string;
  client?: string;
  mail?: string;
  montant?: number;
  statut: string;
  createdAt?: string;
  demande?: { user?: { prenom?: string; nom?: string } };
}

export default function DevisListPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [devis, setDevis] = useState<Devis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Utiliser le hook pour les notifications de devis
  useDevisNotifications();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/');
    } else if (status === 'authenticated') {
      fetchDevis();
    }
  }, [status, session, router]);



  const fetchDevis = async () => {
    try {
      const response = await fetch('/api/admin/devis');
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des devis');
      }
      const data = await response.json();
      setDevis(data);
    } catch (error) {
      setError('Erreur lors de la récupération des devis');
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadDevis = async (devisId: string, numero: string) => {
    try {
      const response = await fetch(`/api/admin/devis/${devisId}/pdf`);
      if (!response.ok) {
        throw new Error('Erreur lors du téléchargement du devis');
      }
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `devis_${numero}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur lors du téléchargement du devis');
    }
  };

  // Supprimer un devis (ADMIN)
  const deleteDevis = async (devisId: string) => {
    const confirmed = window.confirm('Confirmer la suppression de ce devis ? Cette action est irréversible.');
    if (!confirmed) return;
    try {
      const res = await fetch(`/api/admin/devis/${devisId}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Erreur lors de la suppression');
      }
      // Mise à jour locale de la liste
      setDevis(prev => prev.filter(d => d.id !== devisId));
    } catch (err) {
      console.error(err);
      setError((err as Error).message || 'Erreur lors de la suppression du devis');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 px-2 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto bg-white shadow rounded-lg p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <h2 className="mt-4 text-xl font-semibold text-gray-900">Chargement...</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-2 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Gestion des devis</h2>
          <Link href="/admin/devis/nouveau" className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Nouveau devis</Link>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-800">{error}</div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {devis.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 py-8">Aucun devis trouvé.</div>
          ) : (
            devis.map((d) => (
              <div key={d.id} className="border rounded-lg p-4 bg-white shadow-sm hover:shadow transition">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-gray-500">N° {d.numero}</div>
                  <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700">{d.statut || '-'}</span>
                </div>
                <div className="space-y-1 text-sm">
                  <div><span className="text-gray-500">Stagiaire:</span> <span className="font-medium">{d.demande?.user ? `${d.demande.user.prenom ?? ''} ${d.demande.user.nom ?? ''}`.trim() : (d.client ?? '-')}</span></div>
                  <div><span className="text-gray-500">Email:</span> <span>{d.mail ?? '-'}</span></div>
                  <div><span className="text-gray-500">Date:</span> <span>{d.createdAt ? new Date(d.createdAt).toLocaleDateString('fr-FR') : '-'}</span></div>
                  <div><span className="text-gray-500">Montant:</span> <span className="font-semibold">{typeof d.montant === 'number' ? d.montant.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }) : '-'}</span></div>
                </div>
                <div className="mt-3 flex justify-between items-center">
                  <Link href={`/admin/devis/${d.id}`} className="text-indigo-600 hover:underline text-sm">Voir</Link>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => downloadDevis(d.id, d.numero)}
                      className="inline-flex items-center text-sm text-gray-700 hover:text-gray-900"
                      title="Télécharger le PDF"
                    >
                      <DocumentArrowDownIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteDevis(d.id)}
                      className="text-sm text-red-600 hover:text-red-700"
                      title="Supprimer le devis"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
} 