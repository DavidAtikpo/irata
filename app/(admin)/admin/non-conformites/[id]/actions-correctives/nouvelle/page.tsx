'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import SignaturePad from '../../../../../../../components/SignaturePad';

interface User {
  id: string;
  nom?: string;
  prenom?: string;
  email: string;
}

interface NonConformite {
  id: string;
  numero: string;
  titre: string;
  type: string;
  gravite: string;
  statut: string;
  createdAt: string;
}

const typeLabels = {
  CORRECTION_IMMEDIATE: 'Correction immédiate',
  ACTION_CORRECTIVE: 'Action corrective',
  ACTION_PREVENTIVE: 'Action préventive',
  AMELIORATION_CONTINUE: 'Amélioration continue'
};

const prioriteLabels = {
  BASSE: 'Basse',
  MOYENNE: 'Moyenne',
  HAUTE: 'Haute',
  CRITIQUE: 'Critique'
};

export default function NouvelleActionCorrectiveFromNonConformitePage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const nonConformiteId = params.id as string;

  const [users, setUsers] = useState<User[]>([]);
  const [nonConformite, setNonConformite] = useState<NonConformite | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  // Etats pour la fiche CI.DES Action Corrective (UI fournie)
  const [issuer, setIssuer] = useState('');
  const [recipient, setRecipient] = useState('');
  const [date, setDate] = useState('');
  const [number, setNumber] = useState('');
  const [department, setDepartment] = useState('');

  const [originCustomer, setOriginCustomer] = useState(false);
  const [originProduction, setOriginProduction] = useState(false);
  const [originAdministration, setOriginAdministration] = useState(false);
  const [originOther, setOriginOther] = useState(false);
  const [category, setCategory] = useState('');
  const [issuerDescription, setIssuerDescription] = useState('');
  const [immediateCurative, setImmediateCurative] = useState(false);
  const [planned, setPlanned] = useState<'yes' | 'no' | ''>('');
  const [correctiveDescribed, setCorrectiveDescribed] = useState(false);
  const [preventiveDescribed, setPreventiveDescribed] = useState(false);
  const [recipientSignature, setRecipientSignature] = useState('');
  const [issuerSignature, setIssuerSignature] = useState('');
  const [collaboratorInCharge, setCollaboratorInCharge] = useState('');

  const [analysis, setAnalysis] = useState('');
  const [limitTime, setLimitTime] = useState('');
  const [collaboratorAppointed, setCollaboratorAppointed] = useState('');
  const [closingDate, setClosingDate] = useState('');
  const [effectiveness, setEffectiveness] = useState<'very' | 'moderate' | 'ineffective' | ''>('');
  const [effectivenessType, setEffectivenessType] = useState<'prestation' | 'administration' | 'autre' | ''>('');
  const [signatureReception, setSignatureReception] = useState('');
  const [observation, setObservation] = useState('');
  const [conclusionDocOnly, setConclusionDocOnly] = useState(false);
  const [conclusionToAudit, setConclusionToAudit] = useState(false);
  const [conclusionOpenBack, setConclusionOpenBack] = useState(false);
  const [conclusionSignature, setConclusionSignature] = useState('');

  // Champs requis API existants
  const [responsableId, setResponsableId] = useState('');
  const [priorite, setPriorite] = useState<'BASSE' | 'MOYENNE' | 'HAUTE' | 'CRITIQUE'>('MOYENNE');
  const [typeAction, setTypeAction] = useState<'CORRECTION_IMMEDIATE' | 'ACTION_CORRECTIVE' | 'ACTION_PREVENTIVE' | 'AMELIORATION_CONTINUE'>('ACTION_CORRECTIVE');
  const [dateEcheance, setDateEcheance] = useState('');

  useEffect(() => {
    fetchUsers();
    fetchNonConformite();
  }, [nonConformiteId]);

  useEffect(() => {
    // Pré-remplir le nom de l'utilisateur connecté
    if (session?.user?.email) {
      // Récupérer les informations complètes de l'utilisateur
      fetchUserInfo();
    }
    
    // Pré-remplir la date actuelle
    setDate(new Date().toISOString().split('T')[0]);
    
    // Pré-remplir le département par défaut
    setDepartment('QHSE');
  }, [session]);

  const fetchUserInfo = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        const userData = data.user; // Les données sont dans data.user
        if (userData.nom && userData.prenom) {
          setIssuer(`${userData.prenom} ${userData.nom}`);
        } else if (userData.nom) {
          setIssuer(userData.nom);
        } else {
          setIssuer(session?.user?.email || '');
        }
      } else {
        // Fallback sur l'email si l'API échoue
        setIssuer(session?.user?.email || '');
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error);
      // Fallback sur l'email en cas d'erreur
      setIssuer(session?.user?.email || '');
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
    }
  };

  const fetchNonConformite = async () => {
    try {
      const response = await fetch(`/api/admin/non-conformites/${nonConformiteId}`);
      if (response.ok) {
        const data = await response.json();
        setNonConformite(data);
        // pré-remplir titre/numéro si utile
        if (data?.numero) setNumber(data.numero);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la non-conformité:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // Debug pour voir les signatures
    console.log('Signatures before submit:');
    console.log('issuerSignature:', issuerSignature);
    console.log('recipientSignature:', recipientSignature);
    console.log('signatureReception:', signatureReception);
    console.log('conclusionSignature:', conclusionSignature);

    // Validation des signatures (optionnel - vous pouvez commenter si pas nécessaire)
    if (!issuerSignature || !signatureReception || !conclusionSignature) {
      alert('Veuillez signer dans tous les champs de signature avant de soumettre.');
      setSubmitting(false);
      return;
    }

    try {
      // Composer un titre et une description à partir de la fiche CI.DES
      const titre = `Corrective Action ${number ? `#${number}` : ''}`.trim();
      const description = [
        `Issuer: ${issuer || '—'} | Recipient: ${recipient || '—'} | Dept: ${department || '—'} | Date: ${date || '—'} | N°: ${number || '—'}`,
        '— PART RESERVED FOR THE ISSUER —',
        `Origin: ${[
          originCustomer && 'Customer',
          originProduction && 'Production',
          originAdministration && 'Administration',
          originOther && 'Other'
        ].filter(Boolean).join(', ') || '—'}`,
        `Category of anomaly: ${category || '—'}`,
        `Description: ${issuerDescription || '—'}`,
        `Immediate curative action: ${immediateCurative ? 'Yes' : 'No'}`,
        `Action planned? ${planned || '—'}`,
        `Corrective (described): ${correctiveDescribed ? 'Yes' : 'No'}`,
        `Preventive (described): ${preventiveDescribed ? 'Yes' : 'No'}`,
        `Collaborator in charge: ${collaboratorInCharge || '—'}`,
        '— PART RESERVED TO QUALITY MANAGER / Technical Authority / CEO —',
        `Analysis: ${analysis || '—'}`,
        `Limit Time: ${limitTime || '—'}`,
        `Collaborator appointed: ${collaboratorAppointed || '—'}`,
        `Closure of actions: ${closingDate || '—'}`,
        `Effectiveness: ${effectiveness || '—'}`,
        `Signature / Reception: ${signatureReception || '—'}`,
        `Observation: ${observation || '—'}`,
        `Conclusion: ${[
          conclusionDocOnly && 'Doc review only',
          conclusionToAudit && 'To be checked during audit',
          conclusionOpenBack && 'Open request sent back'
        ].filter(Boolean).join(' | ') || '—'}`,
        `Signature: ${conclusionSignature || '—'}`
      ].join('\n');

      const payload = {
        nonConformiteId,
        titre,
        description,
        type: 'ACTION_CORRECTIVE',
        priorite: 'MOYENNE',
        responsableId: users.length > 0 ? users[0].id : '',
        dateEcheance: undefined,
        // Champs CI.DES Action Corrective
        issuerName: issuer,
        recipientName: recipient,
        date: date,
        number: number,
        department: department,
        originCustomer: originCustomer,
        originProduction: originProduction,
        originAdministration: originAdministration,
        originOther: originOther,
        categoryOfAnomaly: category,
        issuerDescription: issuerDescription,
        immediateCurativeAction: immediateCurative,
        actionPlanned: planned,
        correctiveDescribed: correctiveDescribed,
        preventiveDescribed: preventiveDescribed,
        recipientSignature: recipientSignature,
        issuerSignature: issuerSignature,
        collaboratorInCharge: collaboratorInCharge,
        analysis: analysis,
        limitTime: limitTime,
        collaboratorAppointed: collaboratorAppointed,
        closingDate: closingDate,
        effectiveness: effectiveness,
        effectivenessType: effectivenessType,
        signatureReception: signatureReception,
        observation: observation,
        conclusion: [
          conclusionDocOnly && 'Doc review only',
          conclusionToAudit && 'To be checked during audit',
          conclusionOpenBack && 'Open request sent back'
        ].filter(Boolean).join(' | ') || '',
        conclusionSignature: conclusionSignature
      };

      const response = await fetch('/api/admin/actions-correctives', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/admin/non-conformites/${nonConformiteId}`);
      } else {
        const error = await response.json();
        alert(error.message || 'Erreur lors de la création de l\'action corrective');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la création de l\'action corrective');
    } finally {
      setSubmitting(false);
    }
  };

 

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!nonConformite) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Non-conformité non trouvée</h1>
            <p className="text-gray-600 mb-6">La non-conformité que vous recherchez n'existe pas.</p>
            <Link
              href="/admin/non-conformites"
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
            >
              Retour à la liste
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link
              href={`/admin/non-conformites/${nonConformiteId}`}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Action corrective</h1>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-800 mb-2">Non-conformité associée</h3>
            <p className="text-blue-700">
              <span className="font-medium">{nonConformite.numero}</span> - {nonConformite.titre}
            </p>
          </div>
        </div>

        {/* Formulaire CI.DES adapté */}
        <div className="bg-white rounded-lg shadow p-15">
          <form onSubmit={handleSubmit} className="space-y-6">

            <header className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <img src="/logo.png" alt="CI.DES Logo" className="w-16 h-20 object-contain" />
            </div>
            <div className="flex-1">
              <table className="w-full border-collapse text-xs">
                <tbody>
                  <tr>
                    <td className="border p-1 font-bold">Titre</td>
                    <td className="border p-1 font-bold">Numéro de code</td>
                    <td className="border p-1 font-bold">Révision</td>
                    <td className="border p-1 font-bold">Création date</td>
                  </tr>
                  <tr>
                    <td className="border p-1">CI.DES ACTION CORRECTIVE - (DIGITAL)</td>
                    <td className="border p-1">ENR-CIFRA-QHSE 002</td>
                    <td className="border p-1">00</td>
                    <td className="border p-1">{new Date(nonConformite.createdAt).toLocaleDateString('fr-FR')}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </header>

            {/* Header */}
            <section className="grid grid-cols-6 gap-4">
              <div>
                <div className="text-xs">Émetteur</div>
                <input className="w-full border rounded px-2 py-1" value={issuer} onChange={(e)=>setIssuer(e.target.value)} />
              </div>
              <div>
                <div className="text-xs">Destinataire</div>
                <input className="w-full border rounded px-2 py-1" value={recipient} onChange={(e)=>setRecipient(e.target.value)} />
              </div>
              <div>
                <div className="text-xs">Date</div>
                <input type="date" className="w-full border rounded px-2 py-1" value={date} onChange={(e)=>setDate(e.target.value)} />
              </div>
              <div>
                <div className="text-xs">N°</div>
                <input className="w-full border rounded px-2 py-1" value={number} onChange={(e)=>setNumber(e.target.value)} />
              </div>
              <div className="col-span-2">
                <div className="text-xs">Département</div>
                <input className="w-full border rounded px-2 py-1" value={department} onChange={(e)=>setDepartment(e.target.value)} />
              </div>
            </section>

            {/* Issuer part */}
            <section className="border border-gray-300 rounded p-4 space-y-3">
              <h2 className="font-medium text-sm mb-2">PARTIE RÉSERVÉE À L'ÉMETTEUR</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs mb-1">Origine</div>
                  <label className="block text-xs"><input type="checkbox" checked={originCustomer} onChange={(e)=>setOriginCustomer(e.target.checked)} /> Client</label>
                  <label className="block text-xs"><input type="checkbox" checked={originProduction} onChange={(e)=>setOriginProduction(e.target.checked)} /> Production</label>
                  <label className="block text-xs"><input type="checkbox" checked={originAdministration} onChange={(e)=>setOriginAdministration(e.target.checked)} /> Administration</label>
                  <label className="block text-xs"><input type="checkbox" checked={originOther} onChange={(e)=>setOriginOther(e.target.checked)} /> Autre</label>
                </div>
                <div>
                  <div className="text-xs mb-1">Catégorie d'anomalie</div>
                  <input className="w-full border rounded px-2 py-1" value={category} onChange={(e)=>setCategory(e.target.value)} />
                </div>
              </div>
              <textarea className="w-full h-24 border rounded p-2 text-sm" placeholder="Description" value={issuerDescription} onChange={(e)=>setIssuerDescription(e.target.value)} />

              <div className="grid grid-cols-2 gap-4 items-center">
                <label className="text-xs flex items-center gap-2">
                  <input type="checkbox" checked={immediateCurative} onChange={(e)=>setImmediateCurative(e.target.checked)} /> Action curative immédiate
                </label>
                <div className="flex items-center gap-2 text-xs">
                  Action planifiée ?
                  <label className="inline-flex items-center gap-1"><input type="radio" name="planned" checked={planned==='yes'} onChange={()=>setPlanned('yes')} /> Oui</label>
                  <label className="inline-flex items-center gap-1"><input type="radio" name="planned" checked={planned==='no'} onChange={()=>setPlanned('no')} /> Non</label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <label className="text-xs flex items-center gap-2">
                  <input type="checkbox" checked={correctiveDescribed} onChange={(e)=>setCorrectiveDescribed(e.target.checked)} /> Corrective (décrite)
                </label>
                <label className="text-xs flex items-center gap-2">
                  <input type="checkbox" checked={preventiveDescribed} onChange={(e)=>setPreventiveDescribed(e.target.checked)} /> Préventive (décrite)
                </label>
            </div>

              <div>
                <div className="text-xs">Collaborateur responsable de l'action</div>
                <input className="w-full border rounded px-2 py-1" value={collaboratorInCharge} onChange={(e)=>setCollaboratorInCharge(e.target.value)} />
              </div>

              <div>
                <div className="text-xs">Signature de l'émetteur</div>
                <SignaturePad 
                  onSave={(signature) => {
                    console.log('Signature émetteur sauvegardée:', signature);
                    setIssuerSignature(signature);
                  }}
                  initialValue={issuerSignature}
                  width={300}
                  height={100}
                />
                {issuerSignature && (
                  <div className="text-xs text-green-600 mt-1">✓ Signature émetteur sauvegardée</div>
                )}
              </div>
            </section>

            {/* Quality Manager part */}
            <section className="border border-gray-300 rounded p-4 space-y-3">
              <h2 className="font-medium text-sm mb-2">PARTIE RÉSERVÉE AU RESPONSABLE QUALITÉ / AUTORITÉ TECHNIQUE / PDG</h2>
              <textarea className="w-full h-24 border rounded p-2 text-sm" placeholder="Analyse de la cause / Proposition d'action à valider par le PDG" value={analysis} onChange={(e)=>setAnalysis(e.target.value)} />
              <div>
                <div className="text-xs">Délai limite :</div>
                <input type="date" className="border rounded px-2 py-1" value={limitTime} onChange={(e)=>setLimitTime(e.target.value)} />
              </div>
              <div>
                <div className="text-xs">Collaborateur responsable de l'action (désigné par le PDG)</div>
                <input className="w-full border rounded px-2 py-1" value={collaboratorAppointed} onChange={(e)=>setCollaboratorAppointed(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs">Clôture des actions</div>
                  <input type="date" className="border rounded px-2 py-1" value={closingDate} onChange={(e)=>setClosingDate(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                  <div className="text-xs">Efficacité des actions prises ?</div>
                  <label className="block text-xs"><input type="radio" name="effect" checked={effectiveness==='very'} onChange={()=>setEffectiveness('very')} /> Action très efficace</label>
                  <label className="block text-xs"><input type="radio" name="effect" checked={effectiveness==='moderate'} onChange={()=>setEffectiveness('moderate')} /> Action modérément efficace</label>
                  <label className="block text-xs"><input type="radio" name="effect" checked={effectiveness==='ineffective'} onChange={()=>setEffectiveness('ineffective')} /> Action inefficace</label>
                  </div>
                  <div>
                  <div className="text-xs mt-2">Type d'efficacité :</div>
                  <label className="block text-xs"><input type="radio" name="effectType" checked={effectivenessType==='prestation'} onChange={()=>setEffectivenessType('prestation')} /> Prestation</label>
                  <label className="block text-xs"><input type="radio" name="effectType" checked={effectivenessType==='administration'} onChange={()=>setEffectivenessType('administration')} /> Administration</label>
                  <label className="block text-xs"><input type="radio" name="effectType" checked={effectivenessType==='autre'} onChange={()=>setEffectivenessType('autre')} /> Autre</label>
                  </div>
                </div>
              </div>
              <div>
                <div className="text-xs">Signature / Réception</div>
                <SignaturePad 
                  onSave={(signature) => {
                    console.log('Signature réception sauvegardée:', signature);
                    setSignatureReception(signature);
                  }}
                  initialValue={signatureReception}
                  width={300}
                  height={100}
                />
                {signatureReception && (
                  <div className="text-xs text-green-600 mt-1">✓ Signature sauvegardée</div>
                )}
              </div>
              <div>
                <div className="text-xs">Observation du Responsable Qualité / Autorité Technique</div>
                <textarea className="w-full h-20 border rounded p-2 text-sm" value={observation} onChange={(e)=>setObservation(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-medium mb-1">Conclusion du Responsable Qualité / Autorité Technique</div>
                  <label className="block text-xs"><input type="checkbox" checked={conclusionDocOnly} onChange={(e)=>setConclusionDocOnly(e.target.checked)} /> Demande fermée par révision documentaire uniquement</label>
                  <label className="block text-xs"><input type="checkbox" checked={conclusionToAudit} onChange={(e)=>setConclusionToAudit(e.target.checked)} /> Demande fermée, à vérifier lors d'un audit</label>
                  <label className="block text-xs"><input type="checkbox" checked={conclusionOpenBack} onChange={(e)=>setConclusionOpenBack(e.target.checked)} /> Demande ouverte renvoyée à la hiérarchie</label>
                </div>
            <div>
                  <div className="text-xs">Signature</div>
                  <SignaturePad 
                    onSave={(signature) => {
                      console.log('Signature conclusion sauvegardée:', signature);
                      setConclusionSignature(signature);
                    }}
                    initialValue={conclusionSignature}
                    width={300}
                    height={100}
                  />
                  {conclusionSignature && (
                    <div className="text-xs text-green-600 mt-1">✓ Signature sauvegardée</div>
                  )}
                </div>
            </div>
            </section>

            <div className="flex justify-end space-x-4">
              <Link href={`/admin/non-conformites/${nonConformiteId}`} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                Annuler
              </Link>
              <button type="submit" disabled={submitting} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50">
                {submitting ? 'Création...' : 'Créer l\'action corrective'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
