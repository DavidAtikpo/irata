'use client';

import { useState, useEffect } from 'react';

interface TraineeSignature {
  id: string;
  inductionId: string;
  sessionName: string;
  userId: string;
  userName: string;
  userEmail: string;
  userSignature: string;
  createdAt: string;
}

interface InductionData {
  id: string;
  sessionId: string;
  courseDate: string;
  courseLocation: string;
  diffusion: string;
  copie: string;
  adminSignature: string;
  createdAt: string;
  updatedAt: string;
}

export default function TraineeSignaturesPage() {
  const [signatures, setSignatures] = useState<TraineeSignature[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<string>('');

  useEffect(() => {
    fetchSignatures();
  }, []);

  const fetchSignatures = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/trainee-induction-signatures');
      if (response.ok) {
        const data = await response.json();
        setSignatures(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des signatures:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async (inductionId: string) => {
    try {
      const response = await fetch(`/api/admin/trainee-induction-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inductionId }),
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `induction_document_${inductionId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        throw new Error('Erreur lors du téléchargement');
      }
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      alert('Erreur lors du téléchargement du PDF');
    }
  };



  const uniqueSessions = Array.from(new Set(signatures.map(s => s.sessionName)));
  const filteredSignatures = selectedSession 
    ? signatures.filter(s => s.sessionName === selectedSession)
    : signatures;

  const groupedByDocument = filteredSignatures.reduce((acc, signature) => {
    const docId = signature.inductionId;
    if (!acc[docId]) {
      acc[docId] = {
        sessionName: signature.sessionName,
        signatures: []
      };
    }
    acc[docId].signatures.push(signature);
    return acc;
  }, {} as Record<string, { sessionName: string; signatures: TraineeSignature[] }>);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="text-lg">Chargement des signatures...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Signatures des Stagiaires - Documents d'Induction</h1>
            <p className="text-gray-600 mt-1">Consultez et téléchargez les documents signés par les stagiaires</p>
          </div>

          <div className="p-6">
            {/* Filtres */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtrer par session :
              </label>
              <select
                value={selectedSession}
                onChange={(e) => setSelectedSession(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Toutes les sessions</option>
                {uniqueSessions.map((sessionName) => (
                  <option key={sessionName} value={sessionName}>
                    {sessionName}
                  </option>
                ))}
              </select>
            </div>

            {/* Résultats */}
            {Object.keys(groupedByDocument).length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500">Aucune signature trouvée</div>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedByDocument).map(([documentId, data]) => (
                  <div key={documentId} className="border border-gray-200 rounded-lg p-4">
                                         <div className="flex justify-between items-center mb-4">
                       <div>
                         <h3 className="text-lg font-semibold text-gray-900">
                           Session: {data.sessionName}
                         </h3>
                         <p className="text-sm text-gray-600">
                           {data.signatures.length} signature(s) collectée(s)
                         </p>
                       </div>
                       <div className="flex gap-2">
                         <button
                           onClick={() => downloadPDF(documentId)}
                           className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                         >
                           Télécharger PDF
                         </button>
                         <button
                           onClick={() => window.open(`/api/admin/trainee-induction/pdf/${documentId}`, '_blank')}
                           className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                         >
                           Voir le document
                         </button>
                       </div>
                     </div>

                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-300">
                        <thead>
                          <tr>
                            <th className="border border-gray-400 bg-gray-100 text-xs font-semibold px-3 py-2 text-left">Stagiaire</th>
                            <th className="border border-gray-400 bg-gray-100 text-xs font-semibold px-3 py-2 text-left">Email</th>
                            <th className="border border-gray-400 bg-gray-100 text-xs font-semibold px-3 py-2 text-left">Signature</th>
                            <th className="border border-gray-400 bg-gray-100 text-xs font-semibold px-3 py-2 text-left">Date de signature</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.signatures.map((signature) => (
                            <tr key={signature.id} className="hover:bg-gray-50">
                              <td className="border border-gray-400 text-xs px-3 py-2 font-medium">
                                {signature.userName}
                              </td>
                              <td className="border border-gray-400 text-xs px-3 py-2">
                                {signature.userEmail}
                              </td>
                              <td className="border border-gray-400 text-xs px-3 py-2">
                                {signature.userSignature ? (
                                  <img 
                                    src={signature.userSignature} 
                                    alt="Signature" 
                                    className="h-8 w-auto" 
                                  />
                                ) : (
                                  <span className="text-gray-400">Pas de signature</span>
                                )}
                              </td>
                              <td className="border border-gray-400 text-xs px-3 py-2">
                                {new Date(signature.createdAt).toLocaleDateString('fr-FR', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
