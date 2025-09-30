'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { EditablePDF } from '@/app/components/EditablePDF';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import HeaderInfoTable from '@/app/components/HeaderInfoTable';
import Image from 'next/image';

export default function ContratPage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [devis, setDevis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [devisId, setDevisId] = useState<string>('');
  const [contratInfo, setContratInfo] = useState<any>(null);
  const [pays, setPays] = useState('');
  const [codePostal, setCodePostal] = useState('');
  const [ville, setVille] = useState('');
  const [telephone, setTelephone] = useState('');


  useEffect(() => {
    const getParams = async () => {
      const { id } = await params;
      setDevisId(id);
    };
    getParams();
  }, [params]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && devisId) {
      fetchDevis();
    }
  }, [status, session, router, devisId]);

  const fetchDevis = async () => {
    try {
      const response = await fetch(`/api/user/devis/${devisId}`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération du devis');
      }
      const data = await response.json();
      if (data.statut !== 'VALIDE') {
        router.push(`/mes-devis/${devisId}`);
        return;
      }
      setDevis(data);
      // Récupérer les informations du contrat pour ce devis
      try {
        const contratResp = await fetch(`/api/user/devis/${devisId}/contrat/check`);
        if (contratResp.ok) {
          const contratData = await contratResp.json();
          if (contratData.contrat) {
            setContratInfo(contratData.contrat);
          }
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du contrat:', error);
      }
    } catch (error) {
      setError('Erreur lors de la récupération du devis');
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      const response = await fetch(`/api/user/devis/${devisId}/contrat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          pays,
          codePostal,
          ville,
          telephone,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la soumission du contrat');
      }

      router.push(`/mes-devis/${devisId}`);
    } catch (error) {
      setError('Erreur lors de la soumission du contrat');
      console.error('Erreur:', error);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <h2 className="mt-4 text-xl font-semibold text-gray-900">Chargement...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (!devis) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto bg-white shadow  p-6">

        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Remplissez le formulaire ci-dessous avec vos informations personnelles et signez électroniquement pour finaliser votre inscription
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="h-5 w-5 text-red-400">!</div>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white  p-10">
          <div className="h-4" />
          <div className="mt-6">
            <EditablePDF devis={devis} onSubmit={handleSubmit} />
          </div>
        </div>
      </div>
      {/* Pas d'entête/pied externe ici – gérés par le contenu du contrat */}
    </div>
  );
} 