"use client";

// app/edge-and-rope-management/page.tsx
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import SignaturePad from '../../../components/SignaturePad';

export default function EdgeAndRopeManagement() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'ADMIN';
  
  // États pour les Toolbox Talks
  const [toolboxTalks, setToolboxTalks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [userName, setUserName] = useState('');
  const [userSignature, setUserSignature] = useState('');
  const [isSigning, setIsSigning] = useState(false);
  
  // Récupérer le nom complet de l'utilisateur depuis la session
  const fullUserName = `${session?.user?.prenom || ''} ${session?.user?.nom || ''}`.trim() || '';
  
  // Récupérer les informations de session depuis les données API
  const userSession = toolboxTalks.length > 0 ? toolboxTalks[0]?.userSession : null;

  // Récupérer les Toolbox Talks publiés
  useEffect(() => {
    const fetchToolboxTalks = async () => {
      try {
        const response = await fetch('/api/user/toolbox-talk');
        if (response.ok) {
          const responseData = await response.json();
          // Gérer le nouveau format de réponse
          const data = responseData.data || responseData;
          setToolboxTalks(data);
          
          // Afficher un message d'information si l'utilisateur n'a pas de session
          if (responseData.message) {
            console.log(responseData.message);
          }
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des Toolbox Talks:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.id) {
      fetchToolboxTalks();
    }
  }, [session]);

  // Fonction pour ouvrir le modal de signature
  const handleSignClick = (record: any) => {
    if (record.userHasSigned) {
      alert('Vous avez déjà signé ce Toolbox Talk.');
      return;
    }
    setSelectedRecord(record);
    // Utiliser le nom de l'utilisateur depuis la session API ou la session locale
    const userNameToUse = record.userSession?.userName || fullUserName;
    setUserName(userNameToUse);
    setUserSignature('');
    setShowSignatureModal(true);
  };

  // Fonction pour soumettre la signature
  const handleSubmitSignature = async () => {
    if (!userName.trim() || !userSignature) {
      alert('Veuillez remplir votre nom et signer.');
      return;
    }

    setIsSigning(true);
    try {
      const response = await fetch('/api/user/toolbox-talk/sign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recordId: selectedRecord?.id,
          userName: userName.trim(),
          signature: userSignature
        }),
      });

      if (response.ok) {
        alert('Signature enregistrée avec succès !');
        setShowSignatureModal(false);
        // Recharger les Toolbox Talks
        const updatedResponse = await fetch('/api/user/toolbox-talk');
        if (updatedResponse.ok) {
          const data = await updatedResponse.json();
          setToolboxTalks(data);
        }
      } else {
        const error = await response.json();
        alert(error.message || 'Erreur lors de l\'enregistrement de la signature');
      }
    } catch (error) {
      console.error('Erreur lors de la signature:', error);
      alert('Erreur lors de l\'enregistrement de la signature');
    } finally {
      setIsSigning(false);
    }
  };

  const images = [
    {
      id: 1,
      src: "/EdgeAndRope/Edge and Rope Management 1.png",
      alt: "Edge and Rope Management - Page 1"
    },
    {
      id: 2,
      src: "/EdgeAndRope/Edge and Rope Management 2.png",
      alt: "Edge and Rope Management - Page 2"
    },
    {
      id: 3,
      src: "/EdgeAndRope/Edge and Rope Management 3.png",
      alt: "Edge and Rope Management - Page 3"
    },
    {
      id: 4,
      src: "/EdgeAndRope/Edge and Rope Management 4.png",
      alt: "Edge and Rope Management - Page 4"
    },
    {
      id: 5,
      src: "/EdgeAndRope/Edge and Rope Management 5.png",
      alt: "Edge and Rope Management - Page 5"
    },
    {
      id: 6,
      src: "/EdgeAndRope/Edge and Rope Management 6.png",
      alt: "Edge and Rope Management - Page 6"
    },
    {
      id: 7,
      src: "/EdgeAndRope/Edge and Rope Management 7.png",
      alt: "Edge and Rope Management - Page 7"
    },
    {
      id: 8,
      src: "/EdgeAndRope/Edge and Rope Management 8.png",
      alt: "Edge and Rope Management - Page 8"
    },
    {
      id: 9,
      src: "/EdgeAndRope/Edge and Rope Management 9.png",
      alt: "Edge and Rope Management - Page 9"
    },
    {
      id: 10,
      src: "/EdgeAndRope/Edge and Rope Management 10.png",
      alt: "Edge and Rope Management - Page 10"
    },
    {
      id: 11,
      src: "/EdgeAndRope/Edge and Rope Management 11.png",
      alt: "Edge and Rope Management - Page 11"
    },
    {
      id: 12,
      src: "/EdgeAndRope/Edge and Rope Management 12.png",
      alt: "Edge and Rope Management - Page 12"
    },
    {
      id: 13,
      src: "/EdgeAndRope/Edge and Rope Management 13.png",
      alt: "Edge and Rope Management - Page 13"
    },
    {
      id: 14,
      src: "/EdgeAndRope/Edge and Rope Management 14.png",
      alt: "Edge and Rope Management - Page 14"
    },
    {
      id: 15,
      src: "/EdgeAndRope/Edge and Rope Management 15.png",
      alt: "Edge and Rope Management - Page 15"
    }
  ];

  return (
    <main className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
        Edge and Rope Management - Document Complet
      </h1>
      
      <div className="space-y-8">
        {/* Paire 1: Page 1 + Page 2 */}
        <div className="space-y-0">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-4">
              <div className="flex justify-center">
                <Image
                  src={images[0].src}
                  alt={images[0].alt}
                  width={1000}
                  height={700}
                  className="max-w-full h-auto "
                  priority={true}
                />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-4">
              <div className="flex justify-center">
                <Image
                  src={images[1].src}
                  alt={images[1].alt}
                  width={1000}
                  height={700}
                  className="max-w-full h-auto "
                  priority={true}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Paire 2: Page 3 + Page 4 */}
        <div className="space-y-0">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-4">
              <div className="flex justify-center">
                <Image
                  src={images[2].src}
                  alt={images[2].alt}
                  width={1000}
                  height={700}
                  className="max-w-full h-auto "
                  priority={true}
                />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-4">
              <div className="flex justify-center">
                <Image
                  src={images[3].src}
                  alt={images[3].alt}
                  width={1000}
                  height={700}
                  className="max-w-full h-auto "
                />
              </div>
            </div>
          </div>
        </div>

        {/* Paire 3: Page 5 + Page 6 */}
        <div className="space-y-0">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-4">
              <div className="flex justify-center">
                <Image
                  src={images[4].src}
                  alt={images[4].alt}
                  width={1000}
                  height={700}
                  className="max-w-full h-auto "
                />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-4">
              <div className="flex justify-center">
                <Image
                  src={images[5].src}
                  alt={images[5].alt}
                  width={1000}
                  height={700}
                  className="max-w-full h-auto "
                />
              </div>
            </div>
          </div>
        </div>

        {/* Paire 4: Page 7 + Page 8 */}
        <div className="space-y-0">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-4">
              <div className="flex justify-center">
                <Image
                  src={images[6].src}
                  alt={images[6].alt}
                  width={1000}
                  height={700}
                  className="max-w-full h-auto "
                />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-4">
              <div className="flex justify-center">
                <Image
                  src={images[7].src}
                  alt={images[7].alt}
                  width={1000}
                  height={700}
                  className="max-w-full h-auto "
                />
              </div>
            </div>
          </div>
        </div>

        {/* Paire 5: Page 9 + Page 10 */}
        <div className="space-y-0">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-4">
              <div className="flex justify-center">
                <Image
                  src={images[8].src}
                  alt={images[8].alt}
                  width={1000}
                  height={700}
                  className="max-w-full h-auto "
                />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-4">
              <div className="flex justify-center">
                <Image
                  src={images[9].src}
                  alt={images[9].alt}
                  width={1000}
                  height={700}
                  className="max-w-full h-auto "
                />
              </div>
            </div>
          </div>
        </div>

        {/* Paire 6: Page 11 + Page 12 */}
        <div className="space-y-0">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">

            <div className="p-4">
              <div className="flex justify-center">
                <Image
                  src={images[10].src}
                  alt={images[10].alt}
                  width={1000}
                  height={700}
                  className="max-w-full h-auto "
                />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">

            <div className="p-4">
              <div className="flex justify-center">
                <Image
                  src={images[11].src}
                  alt={images[11].alt}
                  width={1000}
                  height={700}
                  className="max-w-full h-auto "
                />
              </div>
            </div>
          </div>
        </div>

        {/* Paire 7: Page 13 + Page 14 */}
        <div className="space-y-0">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">

            <div className="p-4">
              <div className="flex justify-center">
                <Image
                  src={images[12].src}
                  alt={images[12].alt}
                  width={1000}
                  height={700}
                  className="max-w-full h-auto "
                />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">

            <div className="p-4">
              <div className="flex justify-center">
                <Image
                  src={images[13].src}
                  alt={images[13].alt}
                  width={1000}
                  height={700}
                  className="max-w-full h-auto "
                />
              </div>
            </div>
          </div>
        </div>

        {/* Page 15: Formulaire interactif TOOLBOX TALK */}
        <div className="space-y-0">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-center mb-6 text-blue-800">
                TOOLBOX TALK - RECORD FORM
              </h2>
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Chargement des Toolbox Talks...</p>
                </div>
              ) : toolboxTalks.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">Aucun Toolbox Talk publié pour le moment.</p>
                </div>
              ) : (
                toolboxTalks.map((record, index) => (
                  <div key={record.id} className={`mb-8 ${index > 0 ? 'border-t pt-8' : ''}`}>
                    {/* Section Administrative */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Site:</label>
                        <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900">
                          {record.site}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date:</label>
                        <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900">
                          {new Date(record.date).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Topic(s) for discussion:</label>
                        <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900">
                          {record.topic}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Reason for talk:</label>
                        <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900">
                          {record.reason}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Start time:</label>
                          <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900">
                            {record.startTime}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Finish time:</label>
                          <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900">
                            {record.finishTime}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section Attendees */}
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-center mb-2">Attended by</h3>
                      <p className="text-sm text-center text-gray-600 mb-4">Please sign to verify understanding of talk</p>
                      
                      {/* Section d'information */}
                      <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-md">
                        <h4 className="font-medium text-gray-700 mb-2">ℹ️ Information</h4>
                        <div className="text-sm text-gray-600">
                          <p>Vous pouvez signer ce toolbox talk pour confirmer votre participation.</p>
                          <div className="mt-2 grid grid-cols-2 gap-4">
                            <div>
                              <strong>Session:</strong> <span className="font-semibold text-blue-700">{record.toolboxSessionName || record.session || 'N/A'}</span>
                            </div>
                            <div>
                              <strong>Utilisateur:</strong> {record.userSession?.userName || fullUserName}
                            </div>
                            <div>
                              <strong>Email:</strong> {record.userSession?.userEmail || session?.user?.email}
                            </div>
                          </div>
                          <p className="mt-2">
                            <strong>Statut:</strong> {record.userHasSigned ? 
                              <span className="text-green-600">✅ Vous avez déjà signé ce document</span> : 
                              <span className="text-orange-600">⏳ En attente de votre signature</span>
                            }
                          </p>
                        </div>
                      </div>

                      {/* Section pour la signature de l'utilisateur actuel */}
                      <div className="border border-gray-300 rounded-md overflow-hidden">
                        <div className="bg-gray-100 grid grid-cols-2 p-3 font-medium text-sm">
                          <div>Votre nom</div>
                          <div>Votre signature</div>
                        </div>
                        <div className="grid grid-cols-2 border-t border-gray-300">
                          <div className="p-3 border-r border-gray-300">
                            <input 
                              type="text" 
                              value={record.userSession?.userName || fullUserName}
                              className="w-full border-none outline-none text-sm" 
                              readOnly
                            />
                          </div>
                          <div className="p-3">
                            {record.userHasSigned ? (
                              <div className="w-24 h-8 border border-green-300 rounded bg-green-50 flex items-center justify-center text-xs text-green-600">
                                ✅ Signé
                              </div>
                            ) : (
                              <button
                                onClick={() => handleSignClick(record)}
                                className="w-24 h-8 border border-gray-300 rounded bg-white flex items-center justify-center text-xs text-gray-500 cursor-pointer hover:bg-gray-50 transition-colors"
                              >
                                Cliquez pour signer
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {!record.userHasSigned && (
                        <div className="mt-3 text-center">
                          <button 
                            onClick={() => handleSignClick(record)}
                            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                          >
                            Signer ce Toolbox Talk
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Section Matters Raised */}
                    <div className="mb-6">
                      <p className="text-sm text-center text-gray-600 mb-3">Continue overleaf (where necessary)</p>
                      <div className="border border-gray-300 rounded-md overflow-hidden">
                        <div className="bg-gray-100 grid grid-cols-2 p-3 font-medium text-sm">
                          <div>Matters raised by employees</div>
                          <div>Action taken as a result</div>
                        </div>
                        {record.mattersRaised && record.mattersRaised.length > 0 ? (
                          record.mattersRaised.map((matter: any, index: number) => (
                            <div key={index} className="grid grid-cols-2 border-t border-gray-300">
                              <div className="p-3 border-r border-gray-300">
                                <div className="w-full text-sm text-gray-900 min-h-[2rem]">
                                  {matter.matter || '-'}
                                </div>
                              </div>
                              <div className="p-3">
                                <div className="w-full text-sm text-gray-900 min-h-[2rem]">
                                  {matter.action || '-'}
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="grid grid-cols-2 border-t border-gray-300">
                            <div className="p-3 border-r border-gray-300">
                              <div className="w-full text-sm text-gray-500 min-h-[2rem]">Aucune matière soulevée</div>
                            </div>
                            <div className="p-3">
                              <div className="w-full text-sm text-gray-500 min-h-[2rem]">Aucune action prise</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Section Talk Leader */}
                    <div className="mb-6">
                      <p className="text-sm text-center text-gray-600 mb-3">Continue overleaf (where necessary)</p>
                      <h3 className="text-lg font-semibold text-center mb-2">Talk leader</h3>
                      <p className="text-sm text-center text-gray-600 mb-4">I confirm I have delivered this session and have questioned those attending on the topic discussed</p>
                      
                      <div className="border border-gray-300 rounded-md overflow-hidden">
                        <div className="bg-gray-100 grid grid-cols-3 p-3 font-medium text-sm">
                          <div>Print name</div>
                          <div>Signature</div>
                          <div>Date</div>
                        </div>
                        <div className="grid grid-cols-3 border-t border-gray-300">
                          <div className="p-3 border-r border-gray-300">
                            <div className="w-full text-sm text-gray-900">
                              {record.adminName}
                            </div>
                          </div>
                          <div className="p-3 border-r border-gray-300">
                            {record.adminSignature ? (
                              <img 
                                src={record.adminSignature} 
                                alt="Signature Admin" 
                                className="w-24 h-8 object-contain border border-gray-300 rounded"
                              />
                            ) : (
                              <div className="w-24 h-8 border border-gray-300 rounded bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                                Non signé
                              </div>
                            )}
                          </div>
                          <div className="p-3">
                            <div className="w-full text-sm text-gray-900">
                              {new Date(record.publishedAt || record.createdAt).toLocaleDateString('fr-FR')}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section Comments */}
                    <div className="mb-6">
                      <div className="grid grid-cols-4 gap-4">
                        <div className="col-span-1">
                          <label className="block text-sm font-medium text-gray-700">Comments:</label>
                        </div>
                        <div className="col-span-3">
                          <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 min-h-[4rem]">
                            {record.comments || 'Aucun commentaire'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="text-center text-sm text-gray-500 mt-8">
                      UNCONTROLLED WHEN PRINTED
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-12 text-center text-gray-600">
        <p className="text-sm">
          Document complet : Edge and Rope Management - IRATA International
        </p>
      </div>

      {/* Modal de signature */}
      {showSignatureModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Signature du Toolbox Talk</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Votre nom complet:
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Entrez votre nom complet"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Signature:
              </label>
              <div className="border border-gray-300 rounded-md">
                <SignaturePad
                  onSave={setUserSignature}
                  width={400}
                  height={200}
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowSignatureModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                disabled={isSigning}
              >
                Annuler
              </button>
              <button
                onClick={handleSubmitSignature}
                disabled={isSigning || !userName.trim() || !userSignature}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSigning ? 'Enregistrement...' : 'Enregistrer la signature'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
