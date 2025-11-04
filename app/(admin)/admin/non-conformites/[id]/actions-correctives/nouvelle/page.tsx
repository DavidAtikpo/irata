'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import SignaturePad from '@/components/SignaturePad';

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
      <div className="min-h-screen bg-gray-50 py-2">
        <div className="max-w-3xl mx-auto px-2">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!nonConformite) {
    return (
      <div className="min-h-screen bg-gray-50 py-2">
        <div className="max-w-3xl mx-auto px-2">
          <div className="text-center py-6">
            <h1 className="text-sm font-bold text-gray-900 mb-2">NC non trouvée</h1>
            <p className="text-[10px] text-gray-600 mb-3">Non-conformité inexistante.</p>
            <Link
              href="/admin/non-conformites"
              className="bg-indigo-600 text-white px-2 py-1 rounded text-[10px] hover:bg-indigo-700 transition-colors"
            >
              Retour
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-2">
      <div className="max-w-6xl mx-auto px-2">
        {/* Header */}
        
        <div className="mb-2">
          <div className="flex items-center gap-2 mb-2">
            <Link
              href={`/admin/non-conformites/${nonConformiteId}`}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-sm font-bold text-gray-900">Nouvelle action corrective</h1>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded p-1.5">
            <h3 className="text-[9px] font-medium text-blue-800 mb-0.5">NC associée</h3>
            <p className="text-blue-700 text-[9px]">
              <span className="font-medium">{nonConformite.numero}</span> - {nonConformite.titre}
            </p>
          </div>
        </div>

        {/* Formulaire CI.DES adapté */}
        <div className="bg-white rounded shadow p-2">
          <form onSubmit={handleSubmit} className="space-y-2">

            <header className="p-1.5 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="flex-shrink-0">
              <img src="/logo.png" alt="CI.DES Logo" className="w-8 h-10 object-contain" />
            </div>
            <div className="flex-1">
              <table className="w-full border-collapse text-[8px]">
                <tbody>
                  <tr>
                    <td className="border p-0.5 font-bold">Titre</td>
                    <td className="border p-0.5 font-bold">Code</td>
                    <td className="border p-0.5 font-bold">Révision</td>
                    <td className="border p-0.5 font-bold">Date</td>
                  </tr>
                  <tr>
                    <td className="border p-0.5">CI.DES ACTION CORRECTIVE</td>
                    <td className="border p-0.5">ENR-CIFRA-QHSE 002</td>
                    <td className="border p-0.5">00</td>
                    <td className="border p-0.5">{new Date(nonConformite.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </header>

            {/* Header */}
            <section className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
              <div>
                <div className="text-[9px]">Émetteur</div>
                <input className="w-full border rounded px-1 py-0.5 text-[9px]" value={issuer} onChange={(e)=>setIssuer(e.target.value)} />
              </div>
              <div>
                <div className="text-[9px]">Destinataire</div>
                <input className="w-full border rounded px-1 py-0.5 text-[9px]" value={recipient} onChange={(e)=>setRecipient(e.target.value)} />
              </div>
              <div>
                <div className="text-[9px]">Date</div>
                <input type="date" className="w-full border rounded px-1 py-0.5 text-[9px]" value={date} onChange={(e)=>setDate(e.target.value)} />
              </div>
              <div>
                <div className="text-[9px]">N°</div>
                <input className="w-full border rounded px-1 py-0.5 text-[9px]" value={number} onChange={(e)=>setNumber(e.target.value)} />
              </div>
              <div className="col-span-2">
                <div className="text-[9px]">Département</div>
                <input className="w-full border rounded px-1 py-0.5 text-[9px]" value={department} onChange={(e)=>setDepartment(e.target.value)} />
              </div>
            </section>

            {/* Issuer part */}
            <section className="border border-gray-300 rounded p-2 space-y-1.5">
              <h2 className="font-medium text-[9px] mb-1">PARTIE RÉSERVÉE À L'ÉMETTEUR</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                <div>
                  <div className="text-[9px] mb-0.5">Origine</div>
                  <label className="block text-[8px]"><input type="checkbox" checked={originCustomer} onChange={(e)=>setOriginCustomer(e.target.checked)} className="w-3 h-3 mr-0.5" /> Client</label>
                  <label className="block text-[8px]"><input type="checkbox" checked={originProduction} onChange={(e)=>setOriginProduction(e.target.checked)} className="w-3 h-3 mr-0.5" /> Production</label>
                  <label className="block text-[8px]"><input type="checkbox" checked={originAdministration} onChange={(e)=>setOriginAdministration(e.target.checked)} className="w-3 h-3 mr-0.5" /> Administration</label>
                  <label className="block text-[8px]"><input type="checkbox" checked={originOther} onChange={(e)=>setOriginOther(e.target.checked)} className="w-3 h-3 mr-0.5" /> Autre</label>
                </div>
                <div>
                  <div className="text-[9px] mb-0.5">Catégorie d'anomalie</div>
                  <input className="w-full border rounded px-1 py-0.5 text-[9px]" value={category} onChange={(e)=>setCategory(e.target.value)} />
                </div>
              </div>
              <textarea className="w-full h-12 border rounded p-1 text-[9px]" placeholder="Description" value={issuerDescription} onChange={(e)=>setIssuerDescription(e.target.value)} />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 items-center">
                <label className="text-[9px] flex items-center gap-1">
                  <input type="checkbox" checked={immediateCurative} onChange={(e)=>setImmediateCurative(e.target.checked)} className="w-3 h-3" /> Action curative immédiate
                </label>
                <div className="flex items-center gap-1.5 text-[9px]">
                  Action planifiée ?
                  <label className="inline-flex items-center gap-0.5"><input type="radio" name="planned" checked={planned==='yes'} onChange={()=>setPlanned('yes')} className="w-3 h-3" /> Oui</label>
                  <label className="inline-flex items-center gap-0.5"><input type="radio" name="planned" checked={planned==='no'} onChange={()=>setPlanned('no')} className="w-3 h-3" /> Non</label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                <label className="text-[9px] flex items-center gap-1">
                  <input type="checkbox" checked={correctiveDescribed} onChange={(e)=>setCorrectiveDescribed(e.target.checked)} className="w-3 h-3" /> Corrective (décrite)
                </label>
                <label className="text-[9px] flex items-center gap-1">
                  <input type="checkbox" checked={preventiveDescribed} onChange={(e)=>setPreventiveDescribed(e.target.checked)} className="w-3 h-3" /> Préventive (décrite)
                </label>
            </div>

              <div>
                <div className="text-[9px]">Collaborateur responsable</div>
                <input className="w-full border rounded px-1 py-0.5 text-[9px]" value={collaboratorInCharge} onChange={(e)=>setCollaboratorInCharge(e.target.value)} />
              </div>

              <div>
                <div className="text-[9px]">Signature émetteur</div>
                <SignaturePad 
                  onSave={(signature) => {
                    console.log('Signature émetteur sauvegardée:', signature);
                    setIssuerSignature(signature);
                  }}
                  initialValue={issuerSignature}
                  width={250}
                  height={80}
                />
                {issuerSignature && (
                  <div className="text-[8px] text-green-600 mt-0.5">✓ Signature sauvegardée</div>
                )}
              </div>
            </section>

            {/* Quality Manager part */}
            <section className="border border-gray-300 rounded p-2 space-y-1.5">
              <h2 className="font-medium text-[9px] mb-1">PARTIE RÉSERVÉE AU RESPONSABLE QUALITÉ / AUTORITÉ TECHNIQUE / PDG</h2>
              <textarea className="w-full h-12 border rounded p-1 text-[9px]" placeholder="Analyse de la cause..." value={analysis} onChange={(e)=>setAnalysis(e.target.value)} />
              <div>
                <div className="text-[9px]">Délai limite :</div>
                <input type="date" className="border rounded px-1 py-0.5 text-[9px]" value={limitTime} onChange={(e)=>setLimitTime(e.target.value)} />
              </div>
              <div>
                <div className="text-[9px]">Collaborateur responsable (PDG)</div>
                <input className="w-full border rounded px-1 py-0.5 text-[9px]" value={collaboratorAppointed} onChange={(e)=>setCollaboratorAppointed(e.target.value)} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                <div>
                  <div className="text-[9px]">Clôture des actions</div>
                  <input type="date" className="border rounded px-1 py-0.5 text-[9px] w-full" value={closingDate} onChange={(e)=>setClosingDate(e.target.value)} />
                </div>
                <div>
                  <div className="text-[9px] mb-0.5">Efficacité des actions ?</div>
                  <label className="block text-[8px]"><input type="radio" name="effect" checked={effectiveness==='very'} onChange={()=>setEffectiveness('very')} className="w-3 h-3 mr-0.5" /> Très efficace</label>
                  <label className="block text-[8px]"><input type="radio" name="effect" checked={effectiveness==='moderate'} onChange={()=>setEffectiveness('moderate')} className="w-3 h-3 mr-0.5" /> Modérément efficace</label>
                  <label className="block text-[8px]"><input type="radio" name="effect" checked={effectiveness==='ineffective'} onChange={()=>setEffectiveness('ineffective')} className="w-3 h-3 mr-0.5" /> Inefficace</label>
                  <div className="text-[9px] mt-1">Type d'efficacité :</div>
                  <label className="block text-[8px]"><input type="radio" name="effectType" checked={effectivenessType==='prestation'} onChange={()=>setEffectivenessType('prestation')} className="w-3 h-3 mr-0.5" /> Prestation</label>
                  <label className="block text-[8px]"><input type="radio" name="effectType" checked={effectivenessType==='administration'} onChange={()=>setEffectivenessType('administration')} className="w-3 h-3 mr-0.5" /> Administration</label>
                  <label className="block text-[8px]"><input type="radio" name="effectType" checked={effectivenessType==='autre'} onChange={()=>setEffectivenessType('autre')} className="w-3 h-3 mr-0.5" /> Autre</label>
                </div>
              </div>
              <div>
                <div className="text-[9px]">Signature / Réception</div>
                <SignaturePad 
                  onSave={(signature) => {
                    console.log('Signature réception sauvegardée:', signature);
                    setSignatureReception(signature);
                  }}
                  initialValue={signatureReception}
                  width={250}
                  height={80}
                />
                {signatureReception && (
                  <div className="text-[8px] text-green-600 mt-0.5">✓ Signature sauvegardée</div>
                )}
              </div>
              <div>
                <div className="text-[9px]">Observation Responsable Qualité</div>
                <textarea className="w-full h-12 border rounded p-1 text-[9px]" value={observation} onChange={(e)=>setObservation(e.target.value)} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                <div>
                  <div className="text-[9px] font-medium mb-0.5">Conclusion Responsable Qualité</div>
                  <label className="block text-[8px]"><input type="checkbox" checked={conclusionDocOnly} onChange={(e)=>setConclusionDocOnly(e.target.checked)} className="w-3 h-3 mr-0.5" /> Révision documentaire</label>
                  <label className="block text-[8px]"><input type="checkbox" checked={conclusionToAudit} onChange={(e)=>setConclusionToAudit(e.target.checked)} className="w-3 h-3 mr-0.5" /> À vérifier audit</label>
                  <label className="block text-[8px]"><input type="checkbox" checked={conclusionOpenBack} onChange={(e)=>setConclusionOpenBack(e.target.checked)} className="w-3 h-3 mr-0.5" /> Renvoyée hiérarchie</label>
                </div>
            <div>
                  <div className="text-[9px]">Signature</div>
                  <SignaturePad 
                    onSave={(signature) => {
                      console.log('Signature conclusion sauvegardée:', signature);
                      setConclusionSignature(signature);
                    }}
                    initialValue={conclusionSignature}
                    width={250}
                    height={80}
                  />
                  {conclusionSignature && (
                    <div className="text-[8px] text-green-600 mt-0.5">✓ Signature sauvegardée</div>
                  )}
                </div>
            </div>
            </section>

            <div className="flex justify-end gap-2 pt-1">
              <Link href={`/admin/non-conformites/${nonConformiteId}`} className="px-2 py-1 border border-gray-300 rounded text-gray-700 text-[10px] hover:bg-gray-50">
                Annuler
              </Link>
              <button type="submit" disabled={submitting} className="px-2 py-1 bg-indigo-600 text-white rounded text-[10px] hover:bg-indigo-700 disabled:opacity-50">
                {submitting ? 'Création...' : 'Créer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

