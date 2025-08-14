'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useDevisNotifications } from '../../../../../hooks/useDevisNotifications';
import HeaderInfoTable from '@/app/components/HeaderInfoTable';
import Image from 'next/image';

export default function DevisDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [devis, setDevis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [devisId, setDevisId] = useState<string>('');

  // Utiliser le hook pour les notifications de devis
  useDevisNotifications();

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
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/');
    } else if (status === 'authenticated' && devisId) {
      fetchDevis();
    }
  }, [status, session, router, devisId]);

  const fetchDevis = async () => {
    try {
      const response = await fetch(`/api/admin/devis/${devisId}`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération du devis');
      }
      const data = await response.json();
      setDevis(data);
    } catch (error) {
      setError('Erreur lors de la récupération du devis');
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 px-2 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white shadow rounded-lg p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <h2 className="mt-4 text-xl font-semibold text-gray-900">Chargement...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (!devis) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 px-2 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white shadow rounded-lg p-6">
          <div className="p-8 text-center text-red-600">Devis introuvable.</div>
        </div>
      </div>
    );
  }

  const adresseFacturationFixe = 'CI.DES BP212 Votokondji TOGO';
  const numeroCode = 'ENR-CIFRA-COMP 00X';
  const referenceAffaire = 'CI.DES';
  const titre = 'TRAME BDC DEVIS FACTURE';

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-2 sm:px-6 lg:px-8">
      {/* Session de formation en haut, séparée */}
      {devis.demande && (
        <div className="max-w-4xl mx-auto bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Session de formation demandée</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="font-medium text-blue-800">Session:</span>
              <span className="ml-2 text-blue-900">{devis.demande.session}</span>
            </div>
            <div>
              <span className="font-medium text-blue-800">Client:</span>
              <span className="ml-2 text-blue-900">{devis.client}</span>
            </div>
          </div>
          {devis.demande.message && (
            <div className="mt-3">
              <span className="font-medium text-blue-800">Message du client:</span>
              <p className="mt-1 text-blue-900 text-sm">{devis.demande.message}</p>
            </div>
          )}
        </div>
      )}

      <div className="max-w-4xl mx-auto bg-white shadow rounded-lg p-6">
        <HeaderInfoTable
          title={titre}
          codeNumberLabel="Numéro de code"
          codeNumber={numeroCode}
          revisionLabel="Révision"
          revision="00"
          creationDateLabel="Création date"
          creationDate={new Date().toLocaleDateString('fr-FR')}
        />

        {/* Section Informations principales */}
        <fieldset className="border p-6 rounded mb-6 bg-gray-50">
          <legend className="text-xl font-bold text-gray-900 px-2">Informations principales</legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="block text-base font-semibold text-gray-900 mb-1">Numéro de facture</div>
              <div className="input text-gray-900 bg-gray-100">{devis.numero}</div>
            </div>
            <div>
              <div className="block text-base font-semibold text-gray-900 mb-1">Notre référence Affaire</div>
              <div className="input text-gray-900 bg-gray-100">{referenceAffaire}</div>
            </div>
            <div>
              <div className="block text-base font-semibold text-gray-900 mb-1">Client</div>
              <div className="input text-gray-900 bg-gray-100">{devis.client}</div>
            </div>
            <div>
              <div className="block text-base font-semibold text-gray-900 mb-1">Email</div>
              <div className="input text-gray-900 bg-gray-100">{devis.mail}</div>
            </div>
          </div>
        </fieldset>

        {/* Section Adresses */}
        <fieldset className="border p-6 rounded mb-6 bg-gray-50">
          <legend className="text-xl font-bold text-gray-900 px-2">Adresses</legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="block text-base font-semibold text-gray-900 mb-1">Adresse de facturation</div>
              <div className="input text-gray-900 bg-gray-100">{adresseFacturationFixe}</div>
            </div>
            <div>
              <div className="block text-base font-semibold text-gray-900 mb-1">Adresse de livraison</div>
              <div className="input text-gray-900 bg-gray-100">{devis.adresseLivraison || '-'}</div>
            </div>
            <div>
              <div className="block text-base font-semibold text-gray-900 mb-1">Date de formation</div>
              <div className="input text-gray-900 bg-gray-100">{devis.dateFormation ? new Date(devis.dateFormation).toLocaleDateString() : '-'}</div>
            </div>
            <div>
              <div className="block text-base font-semibold text-gray-900 mb-1">Date examen</div>
              <div className="input text-gray-900 bg-gray-100">{devis.dateExamen ? new Date(devis.dateExamen).toLocaleDateString() : '-'}</div>
            </div>
            <div>
              <div className="block text-base font-semibold text-gray-900 mb-1">SIRET / NIF</div>
              <div className="input text-gray-900 bg-gray-100">{devis.siret || '-'}</div>
            </div>
          </div>
        </fieldset>

        {/* Section Intervention */}
        <fieldset className="border p-6 rounded mb-6 bg-gray-50">
          <legend className="text-xl font-bold text-gray-900 px-2">Informations administratives</legend>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="block text-base font-semibold text-gray-900 mb-1">Numéro NDA</div>
              <div className="input text-gray-900 bg-gray-100">{devis.numNDA || '-'}</div>
            </div>
            {/* <div>
              <div className="block text-base font-semibold text-gray-900 mb-1">Numero --</div>
              <div className="input text-gray-900 bg-gray-100">{devis.numKlio || '-'}</div>
            </div> */}
            <div>
              <div className="block text-base font-semibold text-gray-900 mb-1">Centre Irata</div>
              <div className="input text-gray-900 bg-gray-100">{devis.suiviPar || '-'}</div>
            </div>
          </div>

          <fieldset className=" mb-6 bg-gray-50">
          <legend className="text-xl font-bold text-gray-900 px-2">--</legend>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="block text-base font-semibold text-gray-900 mb-1">TVA (%)</div>
              <div className="input text-gray-900 bg-gray-100">{devis.tva}</div>
            </div>
            <div>
              <div className="block text-base font-semibold text-gray-900 mb-1">Exonération</div>
              <div className="input text-gray-900 bg-gray-100">{devis.exoneration || '-'}</div>
            </div>
            <div>
              <div className="block text-base font-semibold text-gray-900 mb-1">Date de prise d'effet</div>
              <div className="input text-gray-900 bg-gray-100">{devis.datePriseEffet ? new Date(devis.datePriseEffet).toLocaleDateString() : '-'}</div>
            </div>
          </div>
        </fieldset>
        </fieldset>

        {/* Section Désignation (tableau) */}
        <fieldset className="border p-6 rounded mb-6 bg-gray-50">
          <legend className="text-xl font-bold text-gray-900 px-2">Désignation</legend>
          <div className="overflow-x-auto">
            <table className="min-w-full border text-base text-gray-900">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border px-2 py-1">Désignation</th>
                  <th className="border px-2 py-1">Quantité</th>
                  <th className="border px-2 py-1">Unité</th>
                  <th className="border px-2 py-1">Prix unitaire HT</th>
                  <th className="border px-2 py-1">Prix total HT</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border px-2 py-1">{devis.designation}</td>
                  <td className="border px-2 py-1">{devis.quantite}</td>
                  <td className="border px-2 py-1">{devis.unite}</td>
                  <td className="border px-2 py-1">{devis.prixUnitaire} €</td>
                  <td className="border px-2 py-1">{(devis.prixUnitaire * devis.quantite).toFixed(2)} €</td>
                </tr>
              </tbody>
            </table>
          </div>
        </fieldset>

        {/* Section TVA et Exonération */}


        {/* Section Informations bancaires */}
        <fieldset className="border p-6 rounded mb-6 bg-gray-50">
          <legend className="text-xl font-bold text-gray-900 px-2">Informations bancaires</legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="block text-base font-semibold text-gray-900 mb-1">IBAN</div>
              <div className="input text-gray-900 bg-gray-100">{devis.iban || '-'}</div>
            </div>
            <div>
              <div className="block text-base font-semibold text-gray-900 mb-1">BIC</div>
              <div className="input text-gray-900 bg-gray-100">{devis.bic || '-'}</div>
            </div>
            <div>
              <div className="block text-base font-semibold text-gray-900 mb-1">Banque</div>
              <div className="input text-gray-900 bg-gray-100">{devis.banque || '-'}</div>
            </div>
            <div>
              <div className="block text-base font-semibold text-gray-900 mb-1">Intitulé du compte</div>
              <div className="input text-gray-900 bg-gray-100">{devis.intituleCompte || '-'}</div>
            </div>
          </div>
        </fieldset>

        {/* Section Statut et dates */}
        <fieldset className="border p-6 rounded mb-6 bg-gray-50">
          <legend className="text-xl font-bold text-gray-900 px-2">Statut et dates</legend>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="block text-base font-semibold text-gray-900 mb-1">Statut</div>
              <div className="input text-gray-900 bg-gray-100">{devis.statut}</div>
            </div>
            <div>
              <div className="block text-base font-semibold text-gray-900 mb-1">Date de création</div>
              <div className="input text-gray-900 bg-gray-100">{devis.createdAt ? new Date(devis.createdAt).toLocaleDateString() : '-'}</div>
            </div>
            <div>
              <div className="block text-base font-semibold text-gray-900 mb-1">Date de mise à jour</div>
              <div className="input text-gray-900 bg-gray-100">{devis.updatedAt ? new Date(devis.updatedAt).toLocaleDateString() : '-'}</div>
            </div>
          </div>
        </fieldset>

        {/* Section Signature */}
        <fieldset className=" mb-6 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="block text-base font-semibold text-gray-900 mb-1">Signature: Administration</div>
              {devis.signature ? (
                <img src={devis.signature} alt="Signature" className=" bg-white max-h-22" />
              ) : (
                <div className="input text-gray-900 bg-gray-100">-</div>
              )}
            </div>
          </div>
        </fieldset>

        {/* Pied de page */}
        <footer className="mt-6 p-4 bg-white ">
          <div className="flex justify-between items-center text-xs text-gray-600">
            <div>
              {devis.numero} Trame
            </div>
            <div className="text-center">
              <div>CI.DES sasu  Capital 2 500 Euros</div>
              <div>SIRET : 87840789900011  VAT : FR71878407899</div>
              <div>Page 1 sur 2</div>
            </div>
            <div>
              <Image src="/logo.png" alt="CI.DES" width={32} height={32} />
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}