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
  client: string;
  mail: string;
  montant: number;
  statut: string;
  createdAt: string;
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
          <h2 className="text-3xl font-bold text-gray-900">Liste des devis</h2>
          <Link href="/admin/devis/nouveau" className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Nouveau devis</Link>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-800">{error}</div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full border text-base text-gray-900">
            <thead>
              <tr className="bg-gray-200">
                <th className="border px-2 py-1">Numéro</th>
                <th className="border px-2 py-1">Client</th>
                <th className="border px-2 py-1">Email</th>
                <th className="border px-2 py-1">Date</th>
                <th className="border px-2 py-1">Montant</th>
                <th className="border px-2 py-1">Statut</th>
                <th className="border px-2 py-1">Actions</th>
              </tr>
            </thead>
            <tbody>
              {devis.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-4">Aucun devis trouvé.</td>
                </tr>
              ) : (
                devis.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50">
                    <td className="border px-2 py-1">{d.numero}</td>
                    <td className="border px-2 py-1">{d.client}</td>
                    <td className="border px-2 py-1">{d.mail}</td>
                    <td className="border px-2 py-1">{d.createdAt ? new Date(d.createdAt).toLocaleDateString() : ''}</td>
                    <td className="border px-2 py-1">{d.montant} €</td>
                    <td className="border px-2 py-1">{d.statut || '-'}</td>
                    <td className="border px-2 py-1">
                      <div className="flex space-x-2">
                        <Link href={`/admin/devis/${d.id}`} className="text-indigo-600 hover:underline">Voir</Link>
                        <button
                          onClick={() => downloadDevis(d.id, d.numero)}
                          className="inline-flex items-center text-sm text-gray-700 hover:text-gray-900"
                          title="Télécharger le PDF"
                        >
                          <DocumentArrowDownIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 