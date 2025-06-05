'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

interface Demande {
  id: string;
  user: {
    nom: string;
    prenom: string;
    email: string;
  };
  formation: {
    titre: string;
  };
}

export default function NouveauDevisPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const demandeId = searchParams.get('demandeId');

  // Champs fixes
  const titre = 'TRAME BDC DEVIS FACTURE';
  const numeroCode = 'ENR-CIFRA-COMP 00X';
  const suiviPar = 'CI.DES';
  const intituleCompte = 'CI.DES';
  const banque = 'Revolut Bank UAB';
  const bic = 'REVOFRP2';
  const iban = 'FR 76 2823 3000 0180 0703 6884 878';
  const adresseLivraison = 'CI.DES BP212 Votokondji TOGO';
  const siret = 'TGO 00000000000000';
  const numNDA = '75170322717';
  const adresseFacturationFixe = 'CI.DES BP212 Votokondji TOGO';
  const referenceAffaire = 'CI.DES';

  // Génération automatique du numéro de facture (ex: DEVIS-20240509-001)
  const today = new Date();
  const numeroAuto = `DEVIS-${today.getFullYear()}${String(today.getMonth()+1).padStart(2,'0')}${String(today.getDate()).padStart(2,'0')}-${Math.floor(Math.random()*900+100)}`;

  // Champs principaux du formulaire
  const [numero, setNumero] = useState(numeroAuto);
  const [client, setClient] = useState('');
  const [mail, setMail] = useState('');
  const [dateLivraison, setDateLivraison] = useState('');
  const [dateExamen, setDateExamen] = useState('');
  const [adresse, setAdresse] = useState('');
  const [dateFormation, setDateFormation] = useState('');
  // const [suiviPar, setSuiviPar] = useState('');
  const [designation, setDesignation] = useState('');
  const [quantite, setQuantite] = useState(1);
  const [unite, setUnite] = useState('lot');
  const [prixUnitaire, setPrixUnitaire] = useState('');
  const [tva, setTva] = useState('0');
  const [exoneration, setExoneration] = useState('0');
  const [datePriseEffet, setDatePriseEffet] = useState('');
  const [montant, setMontant] = useState('');
  // const [iban, setIban] = useState('');
  // const [bic, setBic] = useState('');
  // const [banque, setBanque] = useState('');
  // const [intituleCompte, setIntituleCompte] = useState('');
  const [signature, setSignature] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [demande, setDemande] = useState<Demande | null>(null);

  useEffect(() => {
    if (demandeId) {
      fetchDemande();
    }
  }, [demandeId]);

  const fetchDemande = async () => {
    try {
      const response = await fetch(`/api/admin/demandes/${demandeId}`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération de la demande');
      }
      const data = await response.json();
      setDemande(data);
      // Pré-remplir les champs avec les informations du client
      setClient(`${data.user.prenom} ${data.user.nom}`);
      setMail(data.user.email);
      setDesignation(data.formation.titre);
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur lors de la récupération de la demande');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const response = await fetch('/api/admin/devis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        demandeId,
        numero,
        client,
        mail,
        adresseLivraison,
        dateLivraison,
        dateExamen,
        adresse,
        siret,
        numNDA,
        dateFormation,
        suiviPar,
        designation,
        quantite,
        unite,
        prixUnitaire,
        tva,
        exoneration,
        datePriseEffet,
        montant,
        iban,
        bic,
        banque,
        intituleCompte,
        signature,
      }),
    });
    setLoading(false);
    if (response.ok) {
      router.push('/admin/devis');
    } else {
      const errorData = await response.json();
      setError(errorData.message || 'Erreur lors de la création du devis');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-2 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white shadow rounded-lg p-6">
        <h2 className="text-3xl font-bold mb-8 text-center text-gray-900">{titre}</h2>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section Titre & Code */}
          <fieldset className="border p-6 rounded mb-6 bg-gray-50">
            <legend className="text-xl font-bold text-gray-900 px-2">En-tête</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-1">Titre</label>
                <input type="text" className="input text-gray-900" value={titre} readOnly />
              </div>
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-1">Numéro de code</label>
                <input type="text" className="input text-gray-900" value={numeroCode} readOnly />
              </div>
            </div>
          </fieldset>

          {/* Section Informations principales */}
          <fieldset className="border p-6 rounded mb-6 bg-gray-50">
            <legend className="text-xl font-bold text-gray-900 px-2">Informations principales</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-1">Numéro de facture</label>
                <input type="text" className="input text-gray-900" value={numero} readOnly />
              </div>
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-1">Notre référence Affaire</label>
                <input type="text" className="input text-gray-900" value={referenceAffaire} readOnly />
              </div>
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-1">Client</label>
                <input type="text" className="input text-gray-900" value={client} onChange={e => setClient(e.target.value)} required />
              </div>
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-1">Email</label>
                <input type="email" className="input text-gray-900" value={mail} onChange={e => setMail(e.target.value)} required />
              </div>
            </div>
          </fieldset>

          {/* Section Adresses */}
          <fieldset className="border p-6 rounded mb-6 bg-gray-50">
            <legend className="text-xl font-bold text-gray-900 px-2">Adresses</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-1">Adresse de facturation</label>
                <input type="text" className="input text-gray-900" value={adresseFacturationFixe} readOnly />
              </div>
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-1">Adresse de livraison</label>
                <input type="text" className="input text-gray-900" value={adresseLivraison} readOnly />
              </div>
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-1">Date de livraison</label>
                <input type="date" className="input text-gray-900" value={dateLivraison} onChange={e => setDateLivraison(e.target.value)} />
              </div>
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-1">Date examen</label>
                <input type="date" className="input text-gray-900" value={dateExamen} onChange={e => setDateExamen(e.target.value)} />
              </div>
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-1">Adresse client</label>
                <input type="text" className="input text-gray-900" value={adresse} onChange={e => setAdresse(e.target.value)} />
              </div>
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-1">SIRET / NIF</label>
                <input type="text" className="input text-gray-900" value={siret} readOnly />
              </div>
            </div>
          </fieldset>

          {/* Section Intervention */}
          <fieldset className="border p-6 rounded mb-6 bg-gray-50">
            <legend className="text-xl font-bold text-gray-900 px-2">Intervention</legend>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-1">Numéro NDA</label>
                <input type="text" className="input text-gray-900" value={numNDA} readOnly />
              </div>
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-1">Date formation</label>
                <input type="date" className="input text-gray-900" value={dateFormation} onChange={e => setDateFormation(e.target.value)} />
              </div>
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-1">Suivi par</label>
                <input type="text" className="input text-gray-900" value={suiviPar} readOnly />
              </div>
            </div>
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
                    <td className="border px-2 py-1">
                      <input type="text" className="input w-full" value={designation} onChange={e => setDesignation(e.target.value)} required />
                    </td>
                    <td className="border px-2 py-1">
                      <input type="number" className="input w-full" value={quantite} onChange={e => setQuantite(parseInt(e.target.value))} required />
                    </td>
                    <td className="border px-2 py-1">
                      <input type="text" className="input w-full" value={unite} onChange={e => setUnite(e.target.value)} required />
                    </td>
                    <td className="border px-2 py-1">
                      <input type="number" className="input w-full" value={prixUnitaire} onChange={e => {
                        setPrixUnitaire(e.target.value);
                        const total = parseFloat(e.target.value) * quantite;
                        setMontant(total.toString());
                      }} required />
                    </td>
                    <td className="border px-2 py-1">
                      <input type="number" className="input w-full" value={montant} readOnly />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </fieldset>

          {/* Section TVA et Exonération */}
          <fieldset className="border p-6 rounded mb-6 bg-gray-50">
            <legend className="text-xl font-bold text-gray-900 px-2">TVA et Exonération</legend>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-1">TVA (%)</label>
                <input type="number" className="input text-gray-900" value={tva} onChange={e => setTva(e.target.value)} />
              </div>
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-1">Exonération</label>
                <input type="text" className="input text-gray-900" value={exoneration} onChange={e => setExoneration(e.target.value)} />
              </div>
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-1">Date de prise d'effet</label>
                <input type="date" className="input text-gray-900" value={datePriseEffet} onChange={e => setDatePriseEffet(e.target.value)} />
              </div>
            </div>
          </fieldset>

          {/* Section Informations bancaires */}
          <fieldset className="border p-6 rounded mb-6 bg-gray-50">
            <legend className="text-xl font-bold text-gray-900 px-2">Informations bancaires</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-1">IBAN</label>
                <input type="text" className="input text-gray-900" value={iban} readOnly />
              </div>
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-1">BIC</label>
                <input type="text" className="input text-gray-900" value={bic} readOnly />
              </div>
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-1">Banque</label>
                <input type="text" className="input text-gray-900" value={banque} readOnly />
              </div>
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-1">Intitulé du compte</label>
                <input type="text" className="input text-gray-900" value={intituleCompte} readOnly />
              </div>
            </div>
          </fieldset>

          {/* Section Signature */}
          <fieldset className="border p-6 rounded mb-6 bg-gray-50">
            <legend className="text-xl font-bold text-gray-900 px-2">Signature</legend>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-1">Signature</label>
                <input type="text" className="input text-gray-900" value={signature} onChange={e => setSignature(e.target.value)} required />
              </div>
            </div>
          </fieldset>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Création en cours...' : 'Créer le devis'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Style utilitaire pour les inputs
// Ajoute ceci dans ton fichier CSS global si besoin :
// .input { @apply mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm; } 
// .input { @apply mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm; } 