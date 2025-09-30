'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import HeaderInfoTable from '@/app/components/HeaderInfoTable';
import Image from 'next/image';
import SignaturePad from '../../../../../components/SignaturePad';

interface Demande {
  id: string;
  session: string;
  message?: string;
  entreprise?: string;
  typeInscription?: string;
  user: {
    nom: string;
    prenom: string;
    email: string;
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
  const defaultPrixUnitaire = '1350';
  const intituleCompte = 'CI.DES';
  const banque = 'Revolut Bank UAB';
  const bic = 'REVOFRP2';
  const iban = 'FR 76 2823 3000 0180 0703 6484 878';
  const adresseLivraison = 'CI.DES chez chagneau 17270 BORESSE-ET-MARTRON France';
  const siret = '878 407 899 00011';
  const numNDA = '75170322717';
  const adresseFacturationFixe = 'CI.DES chez chagneau 17270 BORESSE-ET-MARTRON France';
  // Champs principaux du formulaire
  const [numero, setNumero] = useState('');
  const [referenceAffaire, setReferenceAffaire] = useState('');
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
  const [prixUnitaire, setPrixUnitaire] = useState(defaultPrixUnitaire);
  const [tva, setTva] = useState('0');
  const [exoneration, setExoneration] = useState(
    "EXONÉRATION\nCONFORMÉMENT À L'INSTRUCTION FISCALE\nN° 31-3A-2-95 DU 3 FÉVRIER 1995 PRISE\nD'EFFET LE 28/10/2024"
  );
  const [datePriseEffet, setDatePriseEffet] = useState('');
  const [montant, setMontant] = useState('');
  // const [iban, setIban] = useState('');
  // const [bic, setBic] = useState('');
  // const [banque, setBanque] = useState('');
  // const [intituleCompte, setIntituleCompte] = useState('');
  const [signature, setSignature] = useState('');
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [savingSignature, setSavingSignature] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [demande, setDemande] = useState<Demande | null>(null);

  // Calcule automatiquement le montant total dès que le prix unitaire ou la quantité changent
  useEffect(() => {
    const total = Number(prixUnitaire || 0) * Number(quantite || 0);
    setMontant(total ? total.toFixed(2) : '');
  }, [prixUnitaire, quantite]);

  // Date d'émission: défaut à la date du jour
  useEffect(() => {
    if (!datePriseEffet) {
      const today = new Date().toISOString().slice(0, 10);
      setDatePriseEffet(today);
    }
  }, [datePriseEffet]);

  // Formateur d'affichage pour les sessions de type
  // « 2025 septembre 01 au 06 » ou « 2025 octobre du 20 au 24 (Examen 25) »
  const formatSessionFr = (raw: string) => {
    if (!raw) return '';
    // tolère "du" optionnel et ignore l'éventuel suffixe "(Examen xx)"
    const m = raw.match(/^(\d{4})\s+([a-zA-Zéèêàùîôïûç]+)\s+(?:du\s+)?(\d{2})\s+au\s+(\d{2})/i);
    if (!m) return raw;
    const [, year, monthFr, dayStart, dayEnd] = m;
    const monthMap: Record<string, string> = {
      janvier: '01', fevrier: '02', février: '02', mars: '03', avril: '04',
      mai: '05', juin: '06', juillet: '07', aout: '08', août: '08',
      septembre: '09', octobre: '10', novembre: '11', decembre: '12', décembre: '12'
    };
    const mm = monthMap[monthFr.toLowerCase()];
    if (!mm) return raw;
    return `${dayStart}/${mm}/${year} au ${dayEnd}/${mm}/${year}`;
  };

  // Formate un ISO "YYYY-MM-DD" en "DD/MM/YYYY" pour l'affichage
  const formatISOToFr = (iso: string) => {
    if (!iso) return '';
    const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return iso;
    const [, y, mo, d] = m;
    return `${d}/${mo}/${y}`;
  };

  // Affichage convivial de la session: du ... au ... (basé sur les dates ISO saisies)
  const sessionRangeFr = (dateFormation && dateExamen)
    ? `du ${formatISOToFr(dateFormation)} au ${formatISOToFr(dateExamen)}`
    : '';

  // Extrait la date de fin au format ISO (YYYY-MM-DD) depuis le format de session
  const parseSessionEndISO = (raw: string): string | '' => {
    if (!raw) return '';
    // Cas 1: présence explicite de "(Examen 25)"
    const mExam = raw.match(/^(\d{4})\s+([a-zA-Zéèêàùîôïûç]+).*?\(\s*Examen\s+(\d{1,2})\s*\)/i);
    if (mExam) {
      const [, year, monthFr, examDay] = mExam as unknown as [string, string, string, string];
      const monthMap: Record<string, string> = {
        janvier: '01', fevrier: '02', février: '02', mars: '03', avril: '04',
        mai: '05', juin: '06', juillet: '07', aout: '08', août: '08',
        septembre: '09', octobre: '10', novembre: '11', decembre: '12', décembre: '12'
      };
      const mm = monthMap[monthFr.toLowerCase()];
      if (!mm) return '';
      const dd = examDay.padStart(2, '0');
      return `${year}-${mm}-${dd}`;
    }
    // Cas 2: format classique avec "au"
    const m = raw.match(/^(\d{4})\s+([a-zA-Zéèêàùîôïûç]+)\s+(?:du\s+)?(\d{2})\s+au\s+(\d{2})/i);
    if (!m) return '';
    const [, year, monthFr, _dayStart, dayEnd] = m as unknown as [string, string, string, string, string?];
    const monthMap: Record<string, string> = {
      janvier: '01', fevrier: '02', février: '02', mars: '03', avril: '04',
      mai: '05', juin: '06', juillet: '07', aout: '08', août: '08',
      septembre: '09', octobre: '10', novembre: '11', decembre: '12', décembre: '12'
    };
    const mm = monthMap[monthFr.toLowerCase()];
    if (!mm) return '';
    return `${year}-${mm}-${dayEnd}`;
  };

  // Extrait la date de début au format ISO (YYYY-MM-DD) depuis le format de session
  const parseSessionStartISO = (raw: string): string | '' => {
    if (!raw) return '';
    const m = raw.match(/^(\d{4})\s+([a-zA-Zéèêàùîôïûç]+)\s+(?:du\s+)?(\d{2})\s+au\s+(\d{2})/i);
    if (!m) return '';
    const [, year, monthFr, dayStart] = m as unknown as [string, string, string, string, string?];
    const monthMap: Record<string, string> = {
      janvier: '01', fevrier: '02', février: '02', mars: '03', avril: '04',
      mai: '05', juin: '06', juillet: '07', aout: '08', août: '08',
      septembre: '09', octobre: '10', novembre: '11', decembre: '12', décembre: '12'
    };
    const mm = monthMap[monthFr.toLowerCase()];
    if (!mm) return '';
    return `${year}-${mm}-${dayStart}`;
  };

  useEffect(() => {
    if (demandeId) {
      fetchDemande();
    } else {
      // Si pas de demande spécifique, générer quand même les numéros avec une session par défaut
      generateNumbers('2025 septembre 01 au 06');
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
      
      // Générer les numéros automatiquement
      await generateNumbers(data.session);
      
      // Pré-remplir le client avec le nom complet (l'entreprise est affichée dans la section adresses)
      setClient(`${data.user.prenom} ${data.user.nom}`);
      setMail(data.user.email);
      setDesignation(`Formation Cordiste IRATA - ${data.session}`);
      // Utiliser la date de début ISO pour dateFormation (attendue par l'API/backend)
      const startISO = parseSessionStartISO(data.session || '');
      setDateFormation(startISO || '');
      // Renseigner automatiquement la date d'examen avec le dernier jour de la session
      const endISO = parseSessionEndISO(data.session || '');
      if (endISO) setDateExamen(endISO);
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur lors de la récupération de la demande');
    }
  };

  const generateNumbers = async (sessionString: string) => {
    try {
      const response = await fetch(`/api/admin/devis/generate-numbers?session=${encodeURIComponent(sessionString)}`);
      if (!response.ok) {
        throw new Error('Erreur lors de la génération des numéros');
      }
      const data = await response.json();
      setNumero(data.numeroDevis);
      // Harmoniser "Notre référence" pour commencer par CI.DEV si le numéro le fait
      let ref = data.referenceSession as string;
      if (typeof data.numeroDevis === 'string' && data.numeroDevis.startsWith('CI.DEV')) {
        if (!/^CI\.DEV/i.test(ref)) {
          ref = `CI.DEV ${ref?.replace(/^CI\.DEV\s*/i, '')}`.trim();
        }
      }
      setReferenceAffaire(ref);
    } catch (error) {
      console.error('Erreur lors de la génération des numéros:', error);
      setError('Erreur lors de la génération des numéros');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation de la signature
    if (!signature) {
      setError('La signature est requise pour créer le devis');
      return;
    }
    
    if (!signature.startsWith('data:image/')) {
      setError('La signature doit être au format image valide');
      return;
    }
    
    setLoading(true);
    
    // Assure que 'montant' est bien renseigné avant l'envoi
    const montantToSend = (Number(prixUnitaire || 0) * Number(quantite || 0)).toFixed(2);
    
    const devisData = {
      demandeId,
      numero,
      referenceAffaire,
      client,
      mail,
      entreprise: demande?.entreprise || null,
      adresseLivraison,
      // dateLivraison,
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
      montant: montantToSend,
      iban,
      bic,
      banque,
      intituleCompte,
      signature,
      statut: 'EN_ATTENTE'
    };
    
    const response = await fetch('/api/admin/devis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(devisData),
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
      {demande && (
        <div className="max-w-4xl mx-auto bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Session de {(sessionRangeFr || formatSessionFr(demande.session))} formation demandée</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="font-medium text-blue-800">Session:</span>
              <span className="ml-2 text-blue-900">{sessionRangeFr || formatSessionFr(demande.session)}</span>
            </div>
            <div>
              <span className="font-medium text-blue-800">Client:</span>
              <span className="ml-2 text-blue-900">{demande.user.prenom} {demande.user.nom}</span>
            </div>
          </div>
          {demande.message && (
            <div className="mt-3">
              <span className="font-medium text-blue-800">Message du client:</span>
              <p className="mt-1 text-blue-900 text-sm">{demande.message}</p>
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
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section Informations principales */}
          <fieldset className="border p-6 rounded mb-6 bg-gray-50">
            <legend className="text-xl font-bold text-gray-900 px-2">Informations principales</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-1">Numéro</label>
                <input type="text" className="input text-gray-900" value={numero} readOnly />
              </div>
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-1">Notre référence</label>
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
                <label className="block text-base font-semibold text-gray-900 mb-1">Date de formation</label>
                <input
                  type="text"
                  className="input text-gray-900"
                  value={sessionRangeFr || formatSessionFr(demande?.session || '')}
                  readOnly
                />
              </div>
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-1">Date examen</label>
                <input type="text" className="input text-gray-900" value={formatISOToFr(dateExamen)} readOnly />
              </div>
              {demande?.entreprise && (
                <div>
                  <label className="block text-base font-semibold text-gray-900 mb-1">Entreprise</label>
                  <input type="text" className="input text-gray-900" value={demande.entreprise} readOnly />
                </div>
              )}
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-1">SIRET / NIF</label>
                <input type="text" className="input text-gray-900" value={siret} readOnly />
              </div>
            </div>
          </fieldset>

          {/* Section Intervention */}
          <fieldset className="border p-6 rounded mb-6 bg-gray-50">
            <legend className="text-xl font-bold text-gray-900 px-2">Informations administratives</legend>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-1">Numéro NDA</label>
                <input type="text" className="input text-gray-900" value={numNDA} readOnly />
              </div>
              {/* <div>
                <label className="block text-base font-semibold text-gray-900 mb-1">Nemero kliop</label>
                <input type="text" className="input text-gray-900" value={numNDA} readOnly />
              </div> */}
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-1">Centre Irata</label>
                <input type="text" className="input text-gray-900" value={suiviPar} readOnly />
              </div>

            </div>
            <fieldset className=" mb-6 bg-gray-50">
            <legend className="text-xl font-bold text-gray-900 px-2">--</legend>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-1">TVA (%)</label>
                <input type="number" className="input text-gray-900" value={tva} onChange={e => setTva(e.target.value)} />
              </div>

              <div>
                <label className="block text-base font-semibold text-gray-900 mb-1">Date d'emission du devis</label>
                <input type="date" className="input text-gray-900" value={datePriseEffet} onChange={e => setDatePriseEffet(e.target.value)} />
              </div>
            </div>

            <div className="md:col-span-3">
                <label className="block text-base font-semibold text-gray-900 mb-1">Exonération</label>
                <div className="border rounded px-3 py-2 bg-white text-gray-900 whitespace-pre-wrap">
                  {exoneration}
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
                      <input type="number" className="input w-full" value={prixUnitaire} onChange={e => setPrixUnitaire(e.target.value)} required />
                    </td>
                    <td className="border px-2 py-1">
                      <input type="number" className="input w-full" value={montant} readOnly required />
                    </td>
                  </tr>
                </tbody>
              </table>
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
                <label className="block text-base font-semibold text-gray-900 mb-2">Signature: Administration</label>
                {signature ? (
                  <div className="flex items-center gap-4">
                    <img 
                      src={signature} 
                      alt="Signature" 
                      className="border rounded bg-white max-h-32 object-contain" 
                    />
                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => setShowSignatureModal(true)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
                      >
                        Modifier la signature
                      </button>
                      <div className="text-sm text-gray-600">
                        <p>Signature capturée</p>
                        <p className="text-xs text-gray-500">Format: Base64</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <div className="w-32 h-16 border-2 border-dashed border-gray-300 rounded bg-gray-50 flex items-center justify-center">
                      <span className="text-gray-400 text-sm">Aucune signature</span>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => setShowSignatureModal(true)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
                      >
                        Ajouter une signature
                      </button>
                      <div className="text-sm text-gray-600">
                        <p>Aucune signature capturée</p>
                        <p className="text-xs text-red-600">La signature est requise</p>
                      </div>
                    </div>
                  </div>
                )}
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
        <footer className="mt-6 p-4 bg-white ">
        <div className="max-w-4xl mx-auto flex justify-between items-center text-xs text-gray-600">
          <div>
            {numero} Trame
          </div>
          <div className="text-center">
            <div>CI.DES sasu&nbsp;&nbsp; Capital 2 500 Euros</div>
            <div>SIRET : 87840789900011&nbsp;&nbsp; VAT : FR71878407899</div>
            <div>Page 1 sur 2</div>
          </div>
          <div>
            <Image src="/logo.png" alt="CI.DES" width={32} height={32} />
          </div>
        </div>
      </footer>
      </div>
      {/* Pied de page */}

      {showSignatureModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Signer le devis</h3>
            <SignaturePad
              onSave={(sig) => {
                setSavingSignature(true);
                try {
                  setSignature(sig);
                  setShowSignatureModal(false);
                } finally {
                  setSavingSignature(false);
                }
              }}
              initialValue={signature}
              disabled={savingSignature}
              width={500}
              height={200}
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowSignatureModal(false)}
                disabled={savingSignature}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}