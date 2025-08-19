"use client";

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';


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
  const [signingLoading, setSigningLoading] = useState(false);
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [irataNo, setIrataNo] = useState('');

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

  const groupSubmissionsBySession = (submissions: Submission[]) => {
    const grouped = submissions.reduce((acc, submission) => {
      const session = submission.session || 'Sans session';
      if (!acc[session]) {
        acc[session] = [];
      }
      acc[session].push(submission);
      return acc;
    }, {} as Record<string, Submission[]>);
    
    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
  };

  const generatePDFClientSide = async (submission: Submission, irataNo: string) => {
    // Import dynamique de jsPDF
    const { jsPDF } = await import('jspdf');
    const html2canvas = (await import('html2canvas')).default;

    // Créer un container temporaire pour le document
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '-9999px';
    tempContainer.style.width = '210mm';
    tempContainer.style.padding = '10mm';
    tempContainer.style.backgroundColor = 'white';
    tempContainer.style.fontFamily = 'Arial, sans-serif';
    
    tempContainer.innerHTML = `
      <div style="font-size: 12px; line-height: 1.4;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="/header declaimer.png" style="width: 100%; height: auto;" />
        </div>
        <div style="margin: 15px 0;">
          <img src="/corps1.png" style="width: 100%; height: auto;" />
          <img src="/corps2.png" style="width: 100%; height: auto;" />
        </div>
        <table style="width: 100%; border-collapse: collapse; border: 1px solid black; margin: 20px 0;">
          <tr>
            <td style="border: 1px solid black; padding: 8px; width: 15%;"><strong>Name:</strong></td>
            <td style="border: 1px solid black; padding: 8px; width: 50%;">${submission.name || ''}</td>
            <td style="border: 1px solid black; padding: 8px; width: 15%;"><strong>IRATA No:</strong></td>
            <td style="border: 1px solid black; padding: 8px; width: 20%;">${irataNo}</td>
          </tr>
          <tr>
            <td style="border: 1px solid black; padding: 8px;"><strong>Address:</strong></td>
            <td style="border: 1px solid black; padding: 8px;" colspan="3">${submission.address || ''}</td>
          </tr>
          <tr>
            <td style="border: 1px solid black; padding: 8px;"><strong>Signature:</strong></td>
            <td style="border: 1px solid black; padding: 8px; text-align: center;">
              ${submission.signature ? `<img src="${submission.signature}" style="max-height: 40px; max-width: 100%;" />` : ''}
            </td>
            <td style="border: 1px solid black; padding: 8px;"><strong>Date:</strong></td>
            <td style="border: 1px solid black; padding: 8px;">${new Date(submission.createdAt).toLocaleDateString('en-GB')}</td>
          </tr>
        </table>
        <div style="border-bottom: 2px solid #3365BE; margin: 20px 0;"></div>
        <div style="text-align: center; font-size: 10px; color: #666; letter-spacing: 1px;">
          UNCONTROLLED WHEN PRINTED
        </div>
      </div>
    `;

    document.body.appendChild(tempContainer);

    try {
      // Attendre que les images se chargent
      await new Promise(resolve => setTimeout(resolve, 1000));

      const canvas = await html2canvas(tempContainer, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 190; // A4 width minus margins
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.save(`IRATA_Disclaimer_${submission.name?.replace(/\s+/g, '_') || 'Document'}_${submission.id}.pdf`);
      
    } finally {
      document.body.removeChild(tempContainer);
    }
  };

  const handleDownloadPDF = async (submission: Submission) => {
    setDownloadingPDF(true);
    setError(null);

    try {
      // Tenter la génération PDF côté serveur
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
        const errorData = await response.json().catch(() => ({}));
        
        // Si l'erreur contient un fallback client-side, l'utiliser
        if (errorData.fallbackToClientSide) {
          console.log('Utilisation du fallback client-side après erreur serveur');
          await generatePDFClientSide(submission, errorData.irataNo || submission.irataNo || irataNo);
          return;
        }
        
        throw new Error(errorData.details || 'Erreur lors de la génération du PDF');
      }

      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        // Vérifier si c'est le fallback client-side
        const data = await response.json();
        if (data.fallbackToClientSide) {
          console.log('Utilisation du fallback client-side pour PDF');
          await generatePDFClientSide(submission, data.irataNo || irataNo);
          return;
        }
      } else if (contentType?.includes('application/pdf')) {
        // Si c'est du PDF, télécharger normalement
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `IRATA_Disclaimer_${submission.name?.replace(/\s+/g, '_') || 'Document'}_${submission.id}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else if (contentType?.includes('text/html')) {
        // Si c'est du HTML, ouvrir dans un nouvel onglet pour impression
        const htmlContent = await response.text();
        const newWindow = window.open('', '_blank');
        if (newWindow) {
          newWindow.document.write(htmlContent);
          newWindow.document.close();
          newWindow.focus();
          setTimeout(() => {
            newWindow.print();
          }, 1000);
        }
      }
    } catch (err) {
      console.error('Erreur lors de la génération du PDF:', err);
      // En cas d'erreur, essayer le fallback client-side
      try {
        console.log('Tentative de fallback client-side après erreur');
        await generatePDFClientSide(submission, submission.irataNo || irataNo);
      } catch (fallbackErr) {
        console.error('Erreur du fallback client-side:', fallbackErr);
        setError('Erreur lors de la génération du PDF');
      }
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
               <tbody>
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
               </tbody>
             </table>
           </div>

           <div className="mt-8 ml-5 mr-5 border-b-3" style={{ borderBottomColor: '#3365BE' }}></div>
           
           {/* Footer */}
           <div className="text-center text-xs tracking-wide text-neutral-800 py-3">
             UNCONTROLLED WHEN PRINTED
           </div>

          {/* Boutons d'action */}
          <div className="flex justify-center gap-4 no-print mt-6">
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
        <div className="space-y-6">
          {groupSubmissionsBySession(submissions).map(([session, sessionSubmissions]) => (
            <div key={session} className="border rounded-lg p-4 bg-white shadow-sm">
              <h3 className="text-lg font-semibold mb-4 text-blue-600 border-b pb-2">
                Session: {session}
              </h3>
              <div className="space-y-3">
                {sessionSubmissions.map((s) => (
                  <div key={s.id} className="border rounded p-3 bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-semibold text-lg">{s.name || (s.user && s.user.name) || '—'}</p>
                        <p className="text-sm text-gray-600 mb-1">{s.address}</p>
                        <p className="text-xs text-gray-500">Soumis le {new Date(s.createdAt).toLocaleString('fr-FR')}</p>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedSubmission(s)}
                          className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                        >
                          Voir
                        </button>
                        
                        <button
                          onClick={() => handleDownloadPDF(s)}
                          disabled={downloadingPDF}
                          className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
                        >
                          PDF
                        </button>
                        
                        <button
                          onClick={() => window.print()}
                          className="px-4 py-2 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition-colors"
                        >
                          Imprimer
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}


    </div>
  );
}


