"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function NoConformityForm() {
  const router = useRouter();
  const { data: session } = useSession();
  const [submitting, setSubmitting] = useState(false);

  const [theme, setTheme] = useState("");
  const [site, setSite] = useState("");
  const [dateDiscovery, setDateDiscovery] = useState("");
  const [issuer, setIssuer] = useState("");
  const [orderNumber, setOrderNumber] = useState("");

  const [flagBaseline, setFlagBaseline] = useState(false);
  const [flagClaim, setFlagClaim] = useState(false);
  const [flagMalfunction, setFlagMalfunction] = useState(false);
  const [descriptionText, setDescriptionText] = useState("");

  const [consObserved, setConsObserved] = useState(false);
  const [consReported, setConsReported] = useState(false);

  const [tpAcceptance, setTpAcceptance] = useState(false);
  const [tpRepair, setTpRepair] = useState(false);
  const [tpAdaptation, setTpAdaptation] = useState(false);
  const [tpReturn, setTpReturn] = useState(false);
  const [tpDowngrading, setTpDowngrading] = useState(false);
  const [tpPutOff, setTpPutOff] = useState(false);

  const [witnessName, setWitnessName] = useState("");
  const [witnessVisa, setWitnessVisa] = useState("");

  const [curativeAction, setCurativeAction] = useState("");
  const [correctiveProposal, setCorrectiveProposal] = useState("");

  const [regManager, setRegManager] = useState("");
  const [regDate, setRegDate] = useState("");
  const [regVisa, setRegVisa] = useState("");

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  useEffect(() => {
    // Pré-remplir le nom de l'utilisateur connecté
    if (session?.user?.email) {
      // Récupérer les informations complètes de l'utilisateur
      fetchUserInfo();
    }
    
    // Pré-remplir la date actuelle
    setDateDiscovery(new Date().toISOString().split('T')[0]);
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

  const handlePrint = () => {
    window.print();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!theme || !descriptionText) {
      alert("Veuillez saisir le Theme et la Description");
      return;
    }

    const actionPlanned = tpAcceptance || tpRepair || tpAdaptation || tpReturn || tpDowngrading || tpPutOff;
    const category = [
      flagBaseline ? "no conformity (deviation/baseline)" : "",
      flagClaim ? "claim (customer satisfaction incident)" : "",
      flagMalfunction ? "malfunction (internal anomaly)" : "",
    ]
      .filter(Boolean)
      .join(" | ");

    const correctiveDesc = [
      tpAdaptation ? "Adaptation / modification" : "",
      tpRepair ? "Trade-in or repair authorization" : "",
      tpReturn ? "Return to supplier" : "",
    ]
      .filter(Boolean)
      .join(", ");

    // Préparer les conséquences
    const consequences = [
      consObserved ? "Observed" : "",
      consReported ? "Reported" : "",
    ]
      .filter(Boolean)
      .join(", ");

    // Préparer les fichiers uploadés
    const fileNames = uploadedFiles.map(file => file.name).join(", ");

    try {
      setSubmitting(true);
      
      // Si des fichiers sont uploadés, les envoyer d'abord
      let uploadedFileUrls: string[] = [];
      if (uploadedFiles.length > 0) {
        const formData = new FormData();
        uploadedFiles.forEach((file, index) => {
          formData.append(`file_${index}`, file);
        });
        
        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        
        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          uploadedFileUrls = uploadData.urls || [];
        }
      }

      const res = await fetch("/api/user/non-conformites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Champs de base (schéma)
          titre: theme,
          description: descriptionText,
          lieu: site || undefined,
          dateDetection: dateDiscovery || undefined,

          // CI.DES: Issuer / Recipient
          issuerName: issuer || undefined,
          recipientNumber: orderNumber || undefined,

          // PART RESERVE FOR THE ISSUER
          categoryOfAnomaly: category || undefined,
          anomalyDescription: descriptionText,
          immediateCurativeAction: curativeAction || undefined,
          correctiveActionDescription: correctiveDesc || undefined,
          preventiveActionDescription: tpAcceptance ? "Acceptance as is with exemption" : undefined,
          recipientSignature: witnessVisa || undefined,
          collaboratorInCharge: witnessName || undefined,

          // Consequences et fichiers
          analysisCauses: consequences || undefined,
          qualityManagerObservation: uploadedFileUrls.length > 0 ? uploadedFileUrls.join(", ") : fileNames || undefined,

          // Registration (on stocke dans Recipient pour rester proche de la fiche)
          recipientName: regManager || undefined,
          recipientDate: regDate || undefined,
          // Note: regVisa conservé côté qualité si besoin ultérieur
          qualityManagerSignature: regVisa || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Erreur lors de l'envoi");
      }
      const data = await res.json();
      router.push(`/non-conformites/${data.nonConformite.id}`);
    } catch (err: any) {
      alert(err.message || "Erreur réseau");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans text-gray-800">
        <div className="p-4 flex justify-between items-center gap-2 border-b border-gray-100">
          <div className="text-sm text-gray-600">Remplissez les champs puis cliquez sur "Enregistrer".</div>
            <button
            type="button"
            onClick={handlePrint}
            className="px-3 py-1 rounded-md bg-indigo-600 text-white text-sm hover:bg-indigo-700 print:hidden"
            >
            Imprimer / Exporter
            </button>
        </div>

      <div className="max-w-6xl mx-auto bg-white shadow-md border border-gray-200 print:border-none print:shadow-none p-15">
        {/* Header */}
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
                    <td className="border p-1">CI.DES NO CONFORMITY - COMPLAINT - MALFUNCTION - (DIGITAL)</td>
                    <td className="border p-1">ENR-CIFRA-QHSE 002</td>
                    <td className="border p-1">00</td>
                    <td className="border p-1">{new Date().toLocaleDateString('fr-FR')}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </header>
        {/* Form body */}
        <main className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
          <section className="grid grid-cols-5 gap-4 mb-4">
            <label className="col-span-1 text-sm font-medium">Theme</label>
            <input className="col-span-2 border border-gray-300 rounded px-2 py-1" placeholder="Thème" value={theme} onChange={(e)=>setTheme(e.target.value)} />

            <label className="col-span-1 text-sm font-medium">Localisation / Site</label>
            <input className="col-span-1 border border-gray-300 rounded px-2 py-1" placeholder="Site" value={site} onChange={(e)=>setSite(e.target.value)} />

            <label className="col-span-1 text-sm font-medium">Date of discovery</label>
            <input type="date" className="col-span-1 border border-gray-300 rounded px-2 py-1" value={dateDiscovery} onChange={(e)=>setDateDiscovery(e.target.value)} />

            <label className="col-span-1 text-sm font-medium">Issuer</label>
            <input className="col-span-2 border border-gray-300 rounded px-2 py-1" placeholder="Émetteur" value={issuer} onChange={(e)=>setIssuer(e.target.value)} />

          </section>

          {/* Description box */}
          <section className="mb-4">
            <div className="text-sm font-medium mb-2">1. Description</div>
            <div className="border border-gray-300 rounded">
              <div className="p-3 grid grid-cols-1 gap-2">
                <label className="text-xs flex items-start gap-2">
                  <input type="checkbox" checked={flagBaseline} onChange={(e)=>setFlagBaseline(e.target.checked)} /> no conformity (deviation / baseline)
                </label>
                <label className="text-xs flex items-start gap-2">
                  <input type="checkbox" checked={flagClaim} onChange={(e)=>setFlagClaim(e.target.checked)} /> claim (customer satisfaction incident)
                </label>
                <label className="text-xs flex items-start gap-2">
                  <input type="checkbox" checked={flagMalfunction} onChange={(e)=>setFlagMalfunction(e.target.checked)} /> malfunction (internal anomaly)
                </label>
                <textarea className="w-full h-24 border border-gray-200 rounded p-2" placeholder="Détails / Référence de documents (standards, spécifications, photos...)" value={descriptionText} onChange={(e)=>setDescriptionText(e.target.value)} />
                
                {/* Upload de fichiers */}
                <div className="mt-2">
                  <input
                    type="file"
                    multiple
                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-xs bg-white hover:bg-gray-50 cursor-pointer"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Ajouter des documents/photos
                  </label>
                  
                  {/* Liste des fichiers uploadés */}
                  {uploadedFiles.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 px-2 py-1 rounded text-xs">
                          <span className="flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            {file.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <div className="text-sm font-medium mb-2">2. Consequences</div>
              <div className="border border-gray-300 rounded p-3 space-y-2">
                <label className="text-xs flex items-start gap-2"><input type="checkbox" checked={consObserved} onChange={(e)=>setConsObserved(e.target.checked)} /> Observed</label>
                <label className="text-xs flex items-start gap-2"><input type="checkbox" checked={consReported} onChange={(e)=>setConsReported(e.target.checked)} /> Reported</label>
              </div>
            </div>

            <div className="col-span-2">
              <div className="text-sm font-medium mb-2">3. Treatment proposal</div>
              <div className="border border-gray-300 rounded p-3 grid grid-cols-2 gap-2">
                <label className="text-xs flex items-start gap-2"><input type="checkbox" checked={tpAcceptance} onChange={(e)=>setTpAcceptance(e.target.checked)} /> Acceptance as is with exemption</label>
                <label className="text-xs flex items-start gap-2"><input type="checkbox" checked={tpRepair} onChange={(e)=>setTpRepair(e.target.checked)} /> Trade-in or repair authorization</label>
                <label className="text-xs flex items-start gap-2"><input type="checkbox" checked={tpAdaptation} onChange={(e)=>setTpAdaptation(e.target.checked)} /> Adaptation, modification</label>
                <label className="text-xs flex items-start gap-2"><input type="checkbox" checked={tpReturn} onChange={(e)=>setTpReturn(e.target.checked)} /> Return to supplier</label>
                <label className="text-xs flex items-start gap-2"><input type="checkbox" checked={tpDowngrading} onChange={(e)=>setTpDowngrading(e.target.checked)} /> Downgrading</label>
                <label className="text-xs flex items-start gap-2"><input type="checkbox" checked={tpPutOff} onChange={(e)=>setTpPutOff(e.target.checked)} /> Put Off</label>
              </div>
            </div>
          </section>

          <section className="mb-4 grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <div className="text-sm font-medium mb-2">Possible Witness</div>
              <input className="w-full border border-gray-300 rounded px-2 py-1" placeholder="Nom" value={witnessName} onChange={(e)=>setWitnessName(e.target.value)} />
            </div>
            <div>
              <div className="text-sm font-medium mb-2">Visa</div>
              <input className="w-full border border-gray-300 rounded px-2 py-1" placeholder="Visa" value={witnessVisa} onChange={(e)=>setWitnessVisa(e.target.value)} />
            </div>
          </section>

          <section className="mb-4">
            <div className="text-sm font-medium mb-2">4. Curative action (repair) already performed</div>
            <textarea className="w-full h-24 border border-gray-200 rounded p-2" value={curativeAction} onChange={(e)=>setCurativeAction(e.target.value)} />
          </section>

          <section className="mb-4">
            <div className="text-sm font-medium mb-2">5. Proposal of corrective actions to act on the causes</div>
            <textarea className="w-full h-32 border border-gray-200 rounded p-2" value={correctiveProposal} onChange={(e)=>setCorrectiveProposal(e.target.value)} />
          </section>

          <section className="mb-4">
            <div className="text-sm font-medium mb-2">6. Registration and Monitoring (Digital Form)</div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-xs">Manager QHSE / Technical Authority :</div>
                <input className="w-full border border-gray-300 rounded px-2 py-1" placeholder="Nom" value={regManager} onChange={(e)=>setRegManager(e.target.value)} />
              </div>
              <div>
                <div className="text-xs">Date :</div>
                <input type="date" className="w-full border border-gray-300 rounded px-2 py-1" value={regDate} onChange={(e)=>setRegDate(e.target.value)} />
              </div>
              <div>
                <div className="text-xs">Visa :</div>
                <input className="w-full border border-gray-300 rounded px-2 py-1" placeholder="Visa" value={regVisa} onChange={(e)=>setRegVisa(e.target.value)} />
              </div>
            </div>
          </section>

          <div className="flex justify-end gap-3 print:hidden">
            <button type="submit" disabled={submitting} className="px-3 py-1 rounded-md bg-green-600 text-white text-sm hover:bg-green-700 disabled:opacity-50">
              {submitting ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </form>

          {/* Footer with company info (mimic original) */}
          <footer className="text-xs text-gray-600 border-t border-gray-100 pt-4 pb-6 grid grid-cols-3 gap-4">
            <div>
              CI.DES sasu<br />Capital 2 500 Euros<br />SIRET: 87840789900011
            </div>
            <div className="text-center">
              ENR-CIFRA-QHSE 002 CI.DES No-Conformity Form
            </div>
            <div className="text-right">
              Page 1 sur 1
        </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
