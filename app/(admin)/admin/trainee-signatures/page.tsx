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
  const [downloadingIndividual, setDownloadingIndividual] = useState<Set<string>>(new Set());
  const [viewingIndividual, setViewingIndividual] = useState<string | null>(null);

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


  const downloadIndividualPDF = async (signatureId: string, inductionId: string, userName: string) => {
    try {
      // Ajouter à l'ensemble des téléchargements en cours
      setDownloadingIndividual(prev => new Set(prev).add(signatureId));
      
      const response = await fetch(`/api/admin/trainee-induction-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inductionId, signatureId }),
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `induction_${userName.replace(/\s+/g, '_')}_${signatureId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        throw new Error('Erreur lors du téléchargement');
      }
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      alert('Erreur lors du téléchargement du PDF individuel');
    } finally {
      // Retirer de l'ensemble des téléchargements en cours
      setDownloadingIndividual(prev => {
        const newSet = new Set(prev);
        newSet.delete(signatureId);
        return newSet;
      });
    }
  };


  const viewPDF = async (signatureId: string, inductionId: string) => {
    try {
      setViewingIndividual(signatureId);
      const response = await fetch(`/api/admin/trainee-induction-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inductionId, signatureId }),
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        // Nettoyer l'URL après un délai
        setTimeout(() => window.URL.revokeObjectURL(url), 1000);
      } else {
        throw new Error('Erreur lors de l\'ouverture du PDF');
      }
    } catch (error) {
      console.error('Erreur lors de l\'ouverture du PDF:', error);
      alert('Erreur lors de l\'ouverture du PDF');
    } finally {
      setViewingIndividual(null);
    }
  };




  const uniqueSessions = Array.from(new Set(signatures.map(s => s.sessionName).filter(Boolean)));
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
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Signatures des Stagiaires - Documents d'Induction</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">Consultez et téléchargez les documents signés par les stagiaires</p>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {/* Filtres */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtrer par session :
              </label>
              <select
                value={selectedSession}
                onChange={(e) => setSelectedSession(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option key="all-sessions" value="">Toutes les sessions</option>
                {uniqueSessions.map((sessionName, index) => (
                  <option key={`session-${index}-${sessionName}`} value={sessionName}>
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
                {Object.entries(groupedByDocument).map(([documentId, data], index) => (
                  <div key={`document-${documentId}-${index}`} className="border border-gray-200 rounded-lg p-4">
                                         <div className="mb-4">
                       <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                         Session: {data.sessionName}
                       </h3>
                       <p className="text-sm text-gray-600">
                         {data.signatures.length} signature(s) collectée(s)
                       </p>
                     </div>

                    {/* Version desktop - Tableau */}
                    <div className="hidden sm:block overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-300">
                        <thead>
                          <tr>
                            <th className="border border-gray-400 bg-gray-100 text-xs font-semibold px-3 py-2 text-left">Stagiaire</th>
                            <th className="border border-gray-400 bg-gray-100 text-xs font-semibold px-3 py-2 text-left">Email</th>
                            <th className="border border-gray-400 bg-gray-100 text-xs font-semibold px-3 py-2 text-left">Signature</th>
                            <th className="border border-gray-400 bg-gray-100 text-xs font-semibold px-3 py-2 text-left">Date de signature</th>
                            <th className="border border-gray-400 bg-gray-100 text-xs font-semibold px-3 py-2 text-left">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.signatures.map((signature, index) => (
                            <tr key={`signature-${signature.id}-${index}`} className="hover:bg-gray-50">
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
                              <td className="border border-gray-400 text-xs px-3 py-2">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => downloadIndividualPDF(signature.id, signature.inductionId, signature.userName)}
                                    disabled={downloadingIndividual.has(signature.id)}
                                    className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Télécharger le document individuel"
                                  >
                                    {downloadingIndividual.has(signature.id) ? (
                                      <>
                                        <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        ...
                                      </>
                                    ) : (
                                      <>
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        PDF
                                      </>
                                    )}
                                  </button>
                                  <button
                                    onClick={() => viewPDF(signature.id, signature.inductionId)}
                                    disabled={viewingIndividual === signature.id}
                                    className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Voir le document individuel"
                                  >
                                    {viewingIndividual === signature.id ? (
                                      <>
                                        <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        ...
                                      </>
                                    ) : (
                                      <>
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                        Voir
                                      </>
                                    )}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Version mobile - Cartes */}
                    <div className="sm:hidden space-y-3">
                      {data.signatures.map((signature, index) => (
                        <div key={`signature-mobile-${signature.id}-${index}`} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-medium text-gray-900 text-sm">{signature.userName}</h4>
                              <p className="text-xs text-gray-600">{signature.userEmail}</p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => downloadIndividualPDF(signature.id, signature.inductionId, signature.userName)}
                                disabled={downloadingIndividual.has(signature.id)}
                                className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Télécharger le document individuel"
                              >
                                {downloadingIndividual.has(signature.id) ? (
                                  <>
                                    <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    ...
                                  </>
                                ) : (
                                  <>
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    PDF
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => viewPDF(signature.id, signature.inductionId)}
                                disabled={viewingIndividual === signature.id}
                                className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Voir le document individuel"
                              >
                                {viewingIndividual === signature.id ? (
                                  <>
                                    <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    ...
                                  </>
                                ) : (
                                  <>
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    Voir
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div>
                              <span className="text-xs font-medium text-gray-500">Signature :</span>
                              <div className="mt-1">
                                {signature.userSignature ? (
                                  <img 
                                    src={signature.userSignature} 
                                    alt="Signature" 
                                    className="h-8 w-auto" 
                                  />
                                ) : (
                                  <span className="text-gray-400 text-xs">Pas de signature</span>
                                )}
                              </div>
                            </div>
                            
                            <div>
                              <span className="text-xs font-medium text-gray-500">Date de signature :</span>
                              <p className="text-xs text-gray-700">
                                {new Date(signature.createdAt).toLocaleDateString('fr-FR', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
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
        </div>
      </div>
    </div>
  );
}
