"use client";

import React, { useState, useEffect } from 'react';
import SignaturePad from '../../../components/SignaturePad';

export default function Page() {
  const [userName, setUserName] = useState('');
  const [userAddress, setUserAddress] = useState('');
  const [signature, setSignature] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);
  const [existingSubmission, setExistingSubmission] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userSession, setUserSession] = useState<string>('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Vérifier le statut de signature IRATA Disclaimer depuis la base de données
        const statusRes = await fetch('/api/user/irata-disclaimer-status');
        let statusData = null;
        
        if (statusRes.ok) {
          statusData = await statusRes.json();
          console.log('Status data:', statusData); // Debug
          
          if (statusData.hasSigned && statusData.submission) {
            setHasSigned(true);
            setExistingSubmission(statusData.submission);
            
            // Pré-remplir toutes les données avec la soumission existante
            setUserName(statusData.submission.name || '');
            setUserAddress(statusData.submission.address || '');
            setSignature(statusData.submission.signature || '');
            
            console.log('User already signed, data filled from submission');
          } else {
            setHasSigned(false);
            setExistingSubmission(null);
            console.log('User has not signed yet');
          }
        } else {
          console.error('Erreur status:', statusRes.status, statusRes.statusText);
        }

        // Récupérer les données utilisateur seulement si pas encore signé
        if (!statusData?.hasSigned) {
          // Récupérer le nom de l'utilisateur
          const profileRes = await fetch('/api/user/profile');
          if (profileRes.ok) {
            const profileData = await profileRes.json();
            console.log('Profile data:', profileData); // Debug
            console.log('Profile data keys:', Object.keys(profileData)); // Debug des clés
            
            // Essayer différentes structures possibles pour le nom
            let fullName = '';
            if (profileData.user?.prenom && profileData.user?.nom) {
              // Structure actuelle de l'API avec prénom + nom
              fullName = `${profileData.user.prenom} ${profileData.user.nom}`.trim();
            } else if (profileData.user?.prenom) {
              // Seulement le prénom si pas de nom
              fullName = profileData.user.prenom;
            } else if (profileData.user?.nom) {
              // Seulement le nom si pas de prénom
              fullName = profileData.user.nom;
            } else if (profileData.user?.name) {
              // Fallback sur name si disponible
              fullName = profileData.user.name;
            }
            
            console.log('Full name extracted:', fullName); // Debug du nom extrait
            
            if (fullName && !userName) { // Seulement si pas déjà défini
              setUserName(fullName);
            }
          } else {
            console.error('Erreur profile:', profileRes.status, profileRes.statusText);
          }

          // Récupérer l'adresse depuis la table contrat
          const addressRes = await fetch('/api/user/address');
          if (addressRes.ok) {
            const addressData = await addressRes.json();
            console.log('Address data:', addressData); // Debug
            if (addressData.address && !userAddress) { // Seulement si pas déjà défini
              setUserAddress(addressData.address);
            }
          } else {
            console.error('Erreur address:', addressRes.status, addressRes.statusText);
          }
        } else {
          console.log('User already signed, skipping profile and address fetch');
        }

        // Récupérer la session de l'utilisateur depuis le modèle Demande
        const sessionRes = await fetch('/api/user/session');
        if (sessionRes.ok) {
          const sessionData = await sessionRes.json();
          console.log('Session data:', sessionData); // Debug
          if (sessionData.session) {
            setUserSession(sessionData.session);
          }
        } else {
          console.error('Erreur session:', sessionRes.status, sessionRes.statusText);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hasSigned) {
      setMessage('Vous avez déjà signé ce document.');
      return;
    }
    if (!signature) {
      setMessage('Veuillez fournir une signature.');
      return;
    }
    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch('/api/documents/irata-disclaimer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: userName,
          address: userAddress,
          signature,
          session: userSession,
          date: new Date().toLocaleDateString('en-GB'),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Erreur');
      
      setMessage('Document soumis avec succès.');
      setHasSigned(true);
      setExistingSubmission(data);
    } catch (err) {
      console.error(err);
      setMessage(err instanceof Error ? err.message : 'Erreur lors de la soumission');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignatureSave = (data: string) => {
    setSignature(data);
    setShowSignaturePad(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 text-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
      </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-black">
      <div className="no-print">
        {hasSigned && (
          <div className="px-3 mt-4 mb-4">
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    Document déjà signé
                  </h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>Vous avez signé ce document le {existingSubmission?.date || existingSubmission?.createdAt?.split('T')[0] || 'N/A'}.</p>
                    <p>Statut: {existingSubmission?.status || 'En attente de validation'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <main className='p-4 sm:p-8 lg:p-15'>
        <div className="bg-white border border-gray-300 p-4 sm:p-6 lg:p-10 shadow-md mb-6 print-document">
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
        <div className="w-full mt-5">
          <img src="/corps1.png" alt="IRATA Disclaimer Body Content Part 1" className="w-full h-auto" />
          <img src="/corps2.png" alt="IRATA Disclaimer Body Content Part 2" className="w-full h-auto" />
        </div>

        {/* Signature block - Responsive */}
        <form onSubmit={handleSubmit} className="px-2 sm:px-3 mt-4">
          {/* Desktop version */}
          <div className="hidden sm:block">
            <table className="w-full border-collapse" style={{ border: '1px solid black' }}>
              <tbody>
                <tr>
                  <td className="p-1 border border-black" style={{ width: '15%' }}>
                    <strong>Name:</strong>
                  </td>
                  <td className="p-1 border border-black" style={{ width: '50%' }}>
                    <input 
                      value={userName} 
                      onChange={(e) => setUserName(e.target.value)}
                      className="w-full border-none outline-none bg-transparent" 
                      required
                    />
                  </td>
                  <td className="p-1 border border-black" style={{ width: '15%' }}>
                    <strong>IRATA No :</strong>
                  </td>
                  <td className="p-1 border border-black" style={{ width: '20%' }}>
                    <input 
                      value="" 
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
                      value={userAddress} 
                      onChange={(e) => setUserAddress(e.target.value)} 
                      required 
                      className="w-full border-none outline-none bg-transparent" 
                    />
                  </td>
                </tr>
                <tr>
                  <td className="p-1 border border-black" style={{ width: '15%' }}>
                    <strong>Signature:</strong>
                  </td>
                  <td className="p-1 border border-black" style={{ width: '50%' }}>
                    <div 
                      className={`h-4 flex items-center justify-center ${!hasSigned ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                      onClick={() => !hasSigned && setShowSignaturePad(true)}
                    >
                      {signature ? (
                        <div className="flex items-center gap-2">
                          <img src={signature} alt="Signature" className="max-h-12 max-w-full" />
                          <span className="text-green-600 text-xs">✓ Signé</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">
                          {hasSigned ? 'Déjà signé' : 'Cliquez pour signer'}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-1 border border-black" style={{ width: '15%' }}>
                    <strong>Date:</strong>
                  </td>
                  <td className="p-1 border border-black" style={{ width: '20%' }}>
                    <input 
                      value={new Date().toLocaleDateString('en-GB')} 
                      readOnly 
                      className="w-full border-none outline-none bg-transparent" 
                      placeholder="DD/MM/YYYY"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Mobile version */}
          <div className="sm:hidden space-y-4">
            <div className="border border-black p-3">
              <div className="mb-3">
                <label className="block text-sm font-bold mb-1">Name:</label>
                <input 
                  value={userName} 
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded" 
                  required
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-bold mb-1">IRATA No:</label>
                <input 
                  value="" 
                  readOnly 
                  className="w-full p-2 border border-gray-300 rounded bg-gray-100" 
                />
              </div>
            </div>

            <div className="border border-black p-3">
              <div className="mb-3">
                <label className="block text-sm font-bold mb-1">Address:</label>
                <input 
                  value={userAddress} 
                  onChange={(e) => setUserAddress(e.target.value)} 
                  required 
                  className="w-full p-2 border border-gray-300 rounded" 
                />
              </div>
            </div>

            <div className="border border-black p-3">
              <div className="mb-3">
                <label className="block text-sm font-bold mb-1">Signature:</label>
                <div 
                  className={`min-h-[60px] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center ${!hasSigned ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                  onClick={() => !hasSigned && setShowSignaturePad(true)}
                >
                  {signature ? (
                    <div className="flex flex-col items-center gap-2">
                      <img src={signature} alt="Signature" className="max-h-12 max-w-full" />
                      <span className="text-green-600 text-xs">✓ Signé</span>
                    </div>
                  ) : (
                    <span className="text-gray-400 text-sm text-center">
                      {hasSigned ? 'Déjà signé' : 'Appuyez pour signer'}
                    </span>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Date:</label>
                <input 
                  value={new Date().toLocaleDateString('en-GB')} 
                  readOnly 
                  className="w-full p-2 border border-gray-300 rounded bg-gray-100" 
                  placeholder="DD/MM/YYYY"
                />
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6 no-print">
            <button 
              type="submit" 
              disabled={submitting || hasSigned} 
              className={`px-6 py-3 rounded-md disabled:opacity-50 text-sm sm:text-base ${
                hasSigned 
                  ? 'bg-gray-400 text-white cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {submitting ? 'Soumission...' : hasSigned ? 'Document déjà soumis' : 'Soumettre le document'}
            </button>
            
            {hasSigned && (
              <button
                onClick={() => window.print()}
                className="px-6 py-3 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors text-sm sm:text-base"
              >
                Imprimer
              </button>
            )}
          </div>
          {message && <p className="text-center text-sm mt-3">{message}</p>}
        </form>

        <div className="mt-8 ml-2 sm:ml-5 mr-2 sm:mr-5 border-b-3" style={{ borderBottomColor: '#3365BE' }}></div>
        
        {/* Footer */}
        <div className="text-center text-xs tracking-wide text-neutral-800 py-3">
          UNCONTROLLED WHEN PRINTED
        </div>
        </div>
       </main>

        {/* Signature Pad Popup - Mobile optimized */}
        {showSignaturePad && !hasSigned && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-md mx-auto">
              <h3 className="text-lg font-semibold mb-4">Signature</h3>
              <p className="text-sm text-gray-600 mb-4">Attention : Vous ne pourrez plus modifier votre signature après l'avoir sauvegardée.</p>
              <div className="mb-4">
                <SignaturePad onSave={handleSignatureSave} />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowSignaturePad(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm sm:text-base"
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
