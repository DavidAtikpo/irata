"use client";

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import SignaturePad from '@/components/SignaturePad';


type Submission = {
  id: string;
  name: string | null;
  address: string | null;
  signature: string | null;
  session?: string | null;
  user: any;
  createdAt: string;
  adminSignature?: string | null;
  adminSignedAt?: string | null;
  status: 'pending' | 'signed' | 'sent';
  irataNo?: string | null;
};

export default function AdminIrataDisclaimerPage() {
  const { data: session } = useSession();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [adminSignature, setAdminSignature] = useState('');
  const [signingLoading, setSigningLoading] = useState(false);
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [irataNo, setIrataNo] = useState('');
  const [showSignaturePad, setShowSignaturePad] = useState(false);

  useEffect(() => {
    fetchSubmissions();
    fetchGlobalIrataNo();
  }, []);

  const fetchGlobalIrataNo = async () => {
    try {
      const res = await fetch('/api/admin/irata-disclaimer/update-global-irata');
      if (res.ok) {
        const data = await res.json();
        if (data.irataNo) {
          setIrataNo(data.irataNo);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du numéro IRATA global:', error);
    }
  };

  const fetchSubmissions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/documents/irata-disclaimer');
      if (!res.ok) throw new Error('Erreur lors de la récupération');
      const data = await res.json();
      setSubmissions(data.submissions || []);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  const saveGlobalIrataNo = async () => {
    if (!irataNo.trim()) {
      setError('Veuillez saisir le numéro IRATA');
      return;
    }

    setSigningLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/irata-disclaimer/update-global-irata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          irataNo: irataNo.trim()
        })
      });

      if (!res.ok) throw new Error('Erreur lors de la mise à jour');
      
      // Rafraîchir la liste
      await fetchSubmissions();
      setError(null);
      
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setSigningLoading(false);
    }
  };

  const saveIrataNo = async (submissionId: string) => {
    if (!irataNo.trim()) {
      setError('Veuillez saisir le numéro IRATA');
      return;
    }

    setSigningLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/irata-disclaimer/update-irata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId,
          irataNo: irataNo.trim()
        })
      });

      if (!res.ok) throw new Error('Erreur lors de la mise à jour');
      
      // Rafraîchir la liste
      await fetchSubmissions();
      setIrataNo('');
      
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setSigningLoading(false);
    }
  };

  const handleSignatureSave = (data: string) => {
    setAdminSignature(data);
    setShowSignaturePad(false);
  };

  const signDocument = async (submissionId: string) => {
    if (!adminSignature) {
      setError('Veuillez fournir votre signature');
      return;
    }

    setSigningLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/irata-disclaimer/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId,
          adminSignature,
          adminName: session?.user?.name || 'Administrateur'
        })
      });

      if (!res.ok) throw new Error('Erreur lors de la signature');
      
      // Rafraîchir la liste
      await fetchSubmissions();
      setSelectedSubmission(null);
      setAdminSignature('');
      
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setSigningLoading(false);
    }
  };

  const sendToUser = async (submissionId: string) => {
    setSigningLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/irata-disclaimer/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId })
      });

      if (!res.ok) throw new Error('Erreur lors de l\'envoi');
      
      // Rafraîchir la liste
      await fetchSubmissions();
      
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setSigningLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const classes = {
      pending: 'bg-yellow-100 text-yellow-800',
      signed: 'bg-blue-100 text-blue-800',
      sent: 'bg-green-100 text-green-800'
    };
    const labels = {
      pending: 'En attente',
      signed: 'Signé par admin',
      sent: 'Envoyé à l\'utilisateur'
    };
    
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${classes[status as keyof typeof classes]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const handleDownloadPDF = async (submission: Submission) => {
    setDownloadingPDF(true);
    setError(null);

    try {
      // Générer le PDF avec le document exact
      const response = await fetch('/api/admin/irata-disclaimer/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          submissionId: submission.id,
          irataNo: submission.irataNo || irataNo,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la génération du PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `IRATA_Disclaimer_${submission.name?.replace(/\s+/g, '_') || 'Document'}_${submission.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Erreur lors de la génération du PDF:', err);
      setError('Erreur lors de la génération du PDF');
    } finally {
      setDownloadingPDF(false);
    }
  };

  if (selectedSubmission) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6 no-print">
          <h1 className="text-2xl font-bold">Signature Admin - IRATA Disclaimer</h1>
          <button
            onClick={() => setSelectedSubmission(null)}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            Retour
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 no-print">
            {error}
          </div>
        )}

        {/* Document complet */}
        <div className="bg-white border border-gray-300 p-10  shadow-md mb-6 print-document">
          <style jsx>{`
            @media print {
              body * {
                visibility: hidden;
              }
              .print-document, .print-document * {
                visibility: visible;
              }
              .print-document {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                margin: 0;
                padding: 20px;
                border: none;
                box-shadow: none;
              }
              .no-print {
                display: none !important;
              }
            }
          `}</style>
                     {/* Header image */}
           <div className="w-full">
             <img src="/header declaimer.png" alt="IRATA Disclaimer Header" className="w-full h-auto" />
           </div>

           {/* Body content images */}
           <div className="w-full mt-3">
             <img src="/corps1.png" alt="IRATA Disclaimer Body Content Part 1" className="w-full h-auto" />
             <img src="/corps2.png" alt="IRATA Disclaimer Body Content Part 2" className="w-full h-auto" />
           </div>

                     {/* Signature block */}
           <div className="px-3 mt-4">
             <table className="w-full border-collapse" style={{ border: '1px solid black' }}>
               <tr>
                 <td className="p-1 border border-black" style={{ width: '15%' }}>
                   <strong>Name:</strong>
                 </td>
                 <td className="p-1 border border-black" style={{ width: '50%' }}>
                   <input 
                     value={selectedSubmission.name || ''} 
                     readOnly
                     className="w-full border-none outline-none bg-transparent" 
                   />
                 </td>
                 <td className="p-1 border border-black" style={{ width: '15%' }}>
                   <strong>IRATA No :</strong>
                 </td>
                 <td className="p-1 border border-black" style={{ width: '20%' }}>
                   <input 
                     value={selectedSubmission.irataNo || ''} 
                     readOnly 
                     className="w-full border-none outline-none bg-transparent" 
                   />
                 </td>
               </tr>
               <tr>
                 <td className="p-1 border border-black" style={{ width: '15%' }}>
                   <strong>Address:</strong>
                 </td>
                 <td className="p-1 border border-black" colSpan={3} style={{ width: '85%' }}>
                   <input 
                     value={selectedSubmission.address || ''} 
                     readOnly 
                     className="w-full border-none outline-none bg-transparent" 
                   />
                 </td>
               </tr>
               <tr>
                 <td className="p-1 border border-black" style={{ width: '15%' }}>
                   <strong>Signature:</strong>
                 </td>
                 <td className="p-1 border border-black" style={{ width: '50%' }}>
                   <div className="h-4 flex items-center justify-center">
                     {selectedSubmission.signature ? (
                       <img src={selectedSubmission.signature} alt="Signature" className="max-h-12 max-w-full" />
                     ) : (
                       <span className="text-gray-400 text-sm">Aucune signature</span>
                     )}
                   </div>
                 </td>
                 <td className="p-1 border border-black" style={{ width: '15%' }}>
                   <strong>Date:</strong>
                 </td>
                 <td className="p-1 border border-black" style={{ width: '20%' }}>
                   <input 
                     value={new Date(selectedSubmission.createdAt).toLocaleDateString('en-GB')} 
                     readOnly 
                     className="w-full border-none outline-none bg-transparent" 
                   />
                 </td>
               </tr>
             </table>
           </div>

           <div className="mt-8 ml-5 mr-5 border-b-3" style={{ borderBottomColor: '#3365BE' }}></div>
           
           {/* Footer */}
           <div className="text-center text-xs tracking-wide text-neutral-800 py-3">
             UNCONTROLLED WHEN PRINTED
           </div>

          {/* Section signature admin */}
          <div className="border-t pt-6">
            <h4 className="font-semibold mb-4">IRATA Administrator Signature:</h4>
            
            {selectedSubmission.adminSignature ? (
              <div className="space-y-4">
                <div className="border rounded p-4 bg-green-50">
                  <p className="text-sm text-green-700 mb-2">Document signed by administrator on {new Date(selectedSubmission.adminSignedAt!).toLocaleDateString('en-GB')}</p>
                  <img 
                    src={selectedSubmission.adminSignature} 
                    alt="Administrator signature" 
                    className="max-h-32 mx-auto border"
                  />
                </div>
                
                {selectedSubmission.status === 'signed' && (
                  <div className="flex justify-center gap-4 no-print">
                    <button
                      onClick={() => handleDownloadPDF(selectedSubmission)}
                      disabled={downloadingPDF}
                      className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      {downloadingPDF ? 'Generating...' : 'Download PDF'}
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                    >
                      Print
                    </button>
                    <button
                      onClick={() => sendToUser(selectedSubmission.id)}
                      disabled={signingLoading}
                      className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      {signingLoading ? 'Sending...' : 'Send document to user'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4 no-print">
                <div>
                  <label className="block font-medium text-gray-700 mb-2">Your signature:</label>
                  <div 
                    className={`h-12 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center ${!adminSignature ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                    onClick={() => !adminSignature && setShowSignaturePad(true)}
                  >
                    {adminSignature ? (
                      <div className="flex items-center gap-2">
                        <img src={adminSignature} alt="Admin signature" className="max-h-8 max-w-full" />
                        <span className="text-green-600 text-xs">✓ Signé</span>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">Cliquez pour signer</span>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-center">
                  <button
                    onClick={() => signDocument(selectedSubmission.id)}
                    disabled={signingLoading || !adminSignature}
                    className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {signingLoading ? 'Signing...' : 'Sign document'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Soumissions IRATA - Administration</h1>
        <button
          onClick={fetchSubmissions}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Actualiser
        </button>
      </div>

      {/* Section pour enregistrer le numéro IRATA global */}
      <div className="bg-white border border-gray-300 rounded-lg p-6 mb-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Numéro IRATA Global</h2>
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <label className="block font-medium text-gray-700 mb-2">Numéro IRATA pour tous les documents :</label>
            <input
              type="text"
              value={irataNo}
              onChange={(e) => setIrataNo(e.target.value)}
              placeholder="Ex: ENR-CIFRA-FORM 004"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => saveGlobalIrataNo()}
            disabled={signingLoading || !irataNo.trim()}
            className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {signingLoading ? 'Saving...' : 'Enregistrer pour tous'}
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Ce numéro sera automatiquement appliqué à tous les documents IRATA Disclaimer.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p>Chargement...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      ) : submissions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>Aucune soumission pour le moment.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((s) => (
            <div key={s.id} className="border rounded-lg p-4 bg-white shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <p className="font-semibold text-lg">{s.name || (s.user && s.user.name) || '—'}</p>
                    {getStatusBadge(s.status || 'pending')}
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{s.address}</p>
                  <p className="text-sm text-blue-600 mb-1"><strong>Session :</strong> {s.session || 'Non spécifiée'}</p>
                  <p className="text-xs text-gray-500">Soumis le {new Date(s.createdAt).toLocaleString('fr-FR')}</p>
                  {s.adminSignedAt && (
                    <p className="text-xs text-green-600">Signé par admin le {new Date(s.adminSignedAt).toLocaleString('fr-FR')}</p>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedSubmission(s)}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                  >
                    {s.adminSignature ? 'Voir document' : 'Signer'}
                  </button>
                  
                  {(s.status === 'signed' || s.status === 'sent') && (
                    <button
                      onClick={() => handleDownloadPDF(s)}
                      disabled={downloadingPDF}
                      className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      PDF
                    </button>
                  )}
                  
                  {s.status === 'signed' && (
                    <button
                      onClick={() => sendToUser(s.id)}
                      disabled={signingLoading}
                      className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      Envoyer
                    </button>
                  )}
                </div>
              </div>

              {/* Aperçu des signatures */}

            </div>
          ))}
        </div>
      )}

      {/* Signature Pad Popup */}
      {showSignaturePad && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Signature Administrateur</h3>
            <p className="text-sm text-gray-600 mb-4">Attention : Vous ne pourrez plus modifier votre signature après l'avoir sauvegardée.</p>
            <SignaturePad onSave={handleSignatureSave} />
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowSignaturePad(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
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


