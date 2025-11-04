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
    <div className="p-2 sm:p-3 bg-gray-50 min-h-screen font-sans text-gray-800">
        <div className="p-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-gray-100">
          <div className="text-[10px] text-gray-600">Remplissez les champs puis cliquez sur "Enregistrer".</div>
            <button
            type="button"
            onClick={handlePrint}
            className="w-full sm:w-auto px-2 py-1 rounded bg-indigo-600 text-white text-[10px] hover:bg-indigo-700 print:hidden"
            >
            Imprimer
            </button>
        </div>

      <div className="max-w-6xl mx-auto bg-white shadow-sm border border-gray-200 print:border-none print:shadow-none p-3">
        {/* Header */}
        <header className="p-2 sm:p-3 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <div className="flex-shrink-0">
              <img src="/logo.png" alt="CI.DES Logo" className="w-12 h-14 sm:w-16 sm:h-20 object-contain" />
            </div>
            <div className="flex-1 w-full overflow-x-auto">
              <table className="w-full border-collapse text-[9px]">
                <tbody>
                  <tr>
                    <td className="border p-1 font-bold">Titre</td>
                    <td className="border p-1 font-bold">N° code</td>
                    <td className="border p-1 font-bold">Rév</td>
                    <td className="border p-1 font-bold">Date</td>
                  </tr>
                  <tr>
                    <td className="border p-1">CI.DES NO CONFORMITY</td>
                    <td className="border p-1">ENR-CIFRA-QHSE 002</td>
                    <td className="border p-1">00</td>
                    <td className="border p-1">{new Date().toLocaleDateString('fr-FR', {day: '2-digit', month: '2-digit', year: '2-digit'})}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </header>
        {/* Form body */}
        <main className="p-3 sm:p-4">
          <form onSubmit={handleSubmit} className="space-y-3">
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
            <div>
              <label className="block text-[10px] font-medium mb-1">Theme</label>
              <input className="w-full border border-gray-300 rounded px-2 py-1 text-[10px]" placeholder="Thème" value={theme} onChange={(e)=>setTheme(e.target.value)} />
            </div>

            <div>
              <label className="block text-[10px] font-medium mb-1">Localisation / Site</label>
              <input className="w-full border border-gray-300 rounded px-2 py-1 text-[10px]" placeholder="Site" value={site} onChange={(e)=>setSite(e.target.value)} />
            </div>

            <div>
              <label className="block text-[10px] font-medium mb-1">Date of discovery</label>
              <input type="date" className="w-full border border-gray-300 rounded px-2 py-1 text-[10px]" value={dateDiscovery} onChange={(e)=>setDateDiscovery(e.target.value)} />
            </div>

            <div>
              <label className="block text-[10px] font-medium mb-1">Issuer</label>
              <input className="w-full border border-gray-300 rounded px-2 py-1 text-[10px]" placeholder="Émetteur" value={issuer} onChange={(e)=>setIssuer(e.target.value)} />
            </div>
          </section>

          {/* Description box */}
          <section className="mb-3">
            <div className="text-[11px] font-medium mb-1">1. Description</div>
            <div className="border border-gray-300 rounded">
              <div className="p-2 grid grid-cols-1 gap-1">
                <label className="text-[9px] flex items-start gap-1">
                  <input type="checkbox" checked={flagBaseline} onChange={(e)=>setFlagBaseline(e.target.checked)} /> no conformity (deviation / baseline)
                </label>
                <label className="text-[9px] flex items-start gap-1">
                  <input type="checkbox" checked={flagClaim} onChange={(e)=>setFlagClaim(e.target.checked)} /> claim (customer satisfaction incident)
                </label>
                <label className="text-[9px] flex items-start gap-1">
                  <input type="checkbox" checked={flagMalfunction} onChange={(e)=>setFlagMalfunction(e.target.checked)} /> malfunction (internal anomaly)
              </label>
                <textarea className="w-full h-20 border border-gray-200 rounded p-2 text-[10px]" placeholder="Détails..." value={descriptionText} onChange={(e)=>setDescriptionText(e.target.value)} />
                
                {/* Upload de fichiers */}
                <div className="mt-1 flex flex-wrap gap-2">
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
                    className="inline-flex items-center px-2 py-1 border border-gray-300 rounded text-[9px] bg-white hover:bg-gray-50 cursor-pointer"
                  >
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    + Fichiers
              </label>
                  
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="camera-upload"
                  />
                  <label
                    htmlFor="camera-upload"
                    className="inline-flex items-center px-2 py-1 border border-gray-300 rounded text-[9px] bg-indigo-50 hover:bg-indigo-100 cursor-pointer text-indigo-700"
                  >
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    📷 Prendre photo
              </label>
                  
                  {/* Liste des fichiers uploadés */}
                  {uploadedFiles.length > 0 && (
                    <div className="mt-1 space-y-1">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 px-2 py-1 rounded text-[9px]">
                          <span className="flex items-center truncate">
                            <svg className="w-3 h-3 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            {file.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="text-red-500 hover:text-red-700 ml-2 flex-shrink-0"
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

          <section className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
            <div>
              <div className="text-[11px] font-medium mb-1">2. Consequences</div>
              <div className="border border-gray-300 rounded p-2 space-y-1">
                <label className="text-[9px] flex items-start gap-1"><input type="checkbox" checked={consObserved} onChange={(e)=>setConsObserved(e.target.checked)} /> Observed</label>
                <label className="text-[9px] flex items-start gap-1"><input type="checkbox" checked={consReported} onChange={(e)=>setConsReported(e.target.checked)} /> Reported</label>
              </div>
            </div>

            <div className="col-span-1 sm:col-span-2">
              <div className="text-[11px] font-medium mb-1">3. Treatment proposal</div>
              <div className="border border-gray-300 rounded p-2 grid grid-cols-1 sm:grid-cols-2 gap-1">
                <label className="text-[9px] flex items-start gap-1"><input type="checkbox" checked={tpAcceptance} onChange={(e)=>setTpAcceptance(e.target.checked)} /> Acceptance as is</label>
                <label className="text-[9px] flex items-start gap-1"><input type="checkbox" checked={tpRepair} onChange={(e)=>setTpRepair(e.target.checked)} /> Repair authorization</label>
                <label className="text-[9px] flex items-start gap-1"><input type="checkbox" checked={tpAdaptation} onChange={(e)=>setTpAdaptation(e.target.checked)} /> Adaptation</label>
                <label className="text-[9px] flex items-start gap-1"><input type="checkbox" checked={tpReturn} onChange={(e)=>setTpReturn(e.target.checked)} /> Return</label>
                <label className="text-[9px] flex items-start gap-1"><input type="checkbox" checked={tpDowngrading} onChange={(e)=>setTpDowngrading(e.target.checked)} /> Downgrading</label>
                <label className="text-[9px] flex items-start gap-1"><input type="checkbox" checked={tpPutOff} onChange={(e)=>setTpPutOff(e.target.checked)} /> Put Off</label>
              </div>
            </div>
          </section>

          <section className="mb-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="col-span-1 sm:col-span-2">
              <div className="text-[11px] font-medium mb-1">Possible Witness</div>
              <input className="w-full border border-gray-300 rounded px-2 py-1 text-[10px]" placeholder="Nom" value={witnessName} onChange={(e)=>setWitnessName(e.target.value)} />
            </div>
            <div>
              <div className="text-[11px] font-medium mb-1">Visa</div>
              <input className="w-full border border-gray-300 rounded px-2 py-1 text-[10px]" placeholder="Visa" value={witnessVisa} onChange={(e)=>setWitnessVisa(e.target.value)} />
            </div>
          </section>

          <section className="mb-3">
            <div className="text-[11px] font-medium mb-1">4. Curative action (repair) already performed</div>
            <textarea className="w-full h-20 border border-gray-200 rounded p-2 text-[10px]" value={curativeAction} onChange={(e)=>setCurativeAction(e.target.value)} />
          </section>

          <section className="mb-3">
            <div className="text-[11px] font-medium mb-1">5. Proposal of corrective actions to act on the causes</div>
            <textarea className="w-full h-24 border border-gray-200 rounded p-2 text-[10px]" value={correctiveProposal} onChange={(e)=>setCorrectiveProposal(e.target.value)} />
          </section>

          <section className="mb-3">
            <div className="text-[11px] font-medium mb-1">6. Registration and Monitoring (Digital Form)</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <div className="text-[9px]">Manager QHSE :</div>
                <input className="w-full border border-gray-300 rounded px-2 py-1 text-[10px]" placeholder="Nom" value={regManager} onChange={(e)=>setRegManager(e.target.value)} />
              </div>
              <div>
                <div className="text-[9px]">Date :</div>
                <input type="date" className="w-full border border-gray-300 rounded px-2 py-1 text-[10px]" value={regDate} onChange={(e)=>setRegDate(e.target.value)} />
              </div>
              <div>
                <div className="text-[9px]">Visa :</div>
                <input className="w-full border border-gray-300 rounded px-2 py-1 text-[10px]" placeholder="Visa" value={regVisa} onChange={(e)=>setRegVisa(e.target.value)} />
              </div>
            </div>
          </section>

          <div className="flex justify-end gap-2 print:hidden">
            <button type="submit" disabled={submitting} className="w-full sm:w-auto px-3 py-1 rounded bg-green-600 text-white text-[10px] hover:bg-green-700 disabled:opacity-50">
              {submitting ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </form>

          {/* Footer with company info (mimic original) */}
          <footer className="text-[9px] text-gray-600 border-t border-gray-100 pt-2 pb-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              CI.DES sasu<br />Capital 2 500 €<br />SIRET: 87840789900011
            </div>
            <div className="text-center">
              ENR-CIFRA-QHSE 002
            </div>
            <div className="sm:text-right">
              Page 1/1
        </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
