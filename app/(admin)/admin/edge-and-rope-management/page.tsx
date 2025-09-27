// app/edge-and-rope-management/page.tsx
'use client';

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useSession } from 'next-auth/react';
import SignaturePad from '../../../../components/SignaturePad';

export default function EdgeAndRopeManagement() {
  const { data: session } = useSession();
  const [adminName, setAdminName] = useState('');
  const [adminSignature, setAdminSignature] = useState('');
  const [isValidated, setIsValidated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Récupérer le nom de l'admin et le statut de validation
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        // Récupérer le profil admin
        const profileRes = await fetch('/api/admin/profile');
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          const fullName = [profileData?.prenom, profileData?.nom].filter(Boolean).join(' ').trim();
          if (fullName) {
            setAdminName(fullName);
          }
        }

        // Vérifier si le document est déjà validé
        const validationRes = await fetch('/api/admin/edge-and-rope-management/status');
        if (validationRes.ok) {
          const validationData = await validationRes.json();
          setIsValidated(validationData.isValidated || false);
          if (validationData.adminSignature) {
            setAdminSignature(validationData.adminSignature);
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données admin:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.role === 'ADMIN') {
      fetchAdminData();
    }
  }, [session]);

  const handleAdminValidation = async () => {
    if (!adminSignature) {
      alert('Veuillez signer avant de valider le document.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/admin/edge-and-rope-management/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adminName,
          adminSignature,
        }),
      });

      if (response.ok) {
        setIsValidated(true);
        setShowSignatureModal(false);
        alert('Document validé et mis à disposition des utilisateurs avec succès !');
      } else {
        throw new Error('Erreur lors de la validation');
      }
    } catch (error) {
      console.error('Erreur lors de la validation:', error);
      alert('Erreur lors de la validation du document');
    } finally {
      setIsSubmitting(false);
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
              
              {/* Section Administrative */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Site:</label>
                  <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date:</label>
                  <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Topic(s) for discussion:</label>
                  <input type="text" value="Toolbox Talk: Edge Management" readOnly className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason for talk:</label>
                  <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start time:</label>
                    <input type="time" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Finish time:</label>
                    <input type="time" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
              </div>

              {/* Section Attendees */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-center mb-2">Attended by</h3>
                <p className="text-sm text-center text-gray-600 mb-4">Please sign to verify understanding of talk</p>
                

                {/* Section pour la signature de l'utilisateur actuel */}
                <div className="border border-gray-300 rounded-md overflow-hidden">
                  <div className="bg-gray-100 grid grid-cols-2 p-3 font-medium text-sm">
                    <div>Votre nom</div>
                    <div>Votre signature</div>
                  </div>
                  <div className="grid grid-cols-2 border-t border-gray-300">
                    <div className="p-3 border-r border-gray-300">
                      <input type="text" placeholder="Entrez votre nom complet" className="w-full border-none outline-none text-sm" />
                    </div>
                    <div className="p-3">
                      <div className="w-24 h-8 border border-gray-300 rounded bg-white flex items-center justify-center text-xs text-gray-500 cursor-pointer hover:bg-gray-50 transition-colors">
                        Cliquez pour signer
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-3 text-center">
                  <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors">
                    Valider ma signature
                  </button>
                </div>
              </div>

              {/* Section Matters Raised */}
              <div className="mb-6">
                <p className="text-sm text-center text-gray-600 mb-3">Continue overleaf (where necessary)</p>
                <div className="border border-gray-300 rounded-md overflow-hidden">
                  <div className="bg-gray-100 grid grid-cols-2 p-3 font-medium text-sm">
                    <div>Matters raised by employees</div>
                    <div>Action taken as a result</div>
                  </div>
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="grid grid-cols-2 border-t border-gray-300">
                      <div className="p-3 border-r border-gray-300">
                        <textarea placeholder="Enter matter raised" className="w-full border-none outline-none text-sm resize-none" rows={2}></textarea>
                      </div>
                      <div className="p-3">
                        <textarea placeholder="Enter action taken" className="w-full border-none outline-none text-sm resize-none" rows={2}></textarea>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section Talk Leader - Admin Validation */}
              <div className="mb-6">
                <p className="text-sm text-center text-gray-600 mb-3">Continue overleaf (where necessary)</p>
                <h3 className="text-lg font-semibold text-center mb-2">Validation Administrateur</h3>
                <p className="text-sm text-center text-gray-600 mb-4">Je confirme avoir validé ce document et l'avoir mis à disposition des utilisateurs</p>
                
                {isValidated ? (
                  <div className="border border-green-300 rounded-md overflow-hidden bg-green-50">
                    <div className="bg-green-100 grid grid-cols-3 p-3 font-medium text-sm">
                      <div>Nom de l'administrateur</div>
                      <div>Signature</div>
                      <div>Date de validation</div>
                    </div>
                    <div className="grid grid-cols-3 border-t border-green-300">
                      <div className="p-3 border-r border-green-300">
                        <div className="text-sm font-medium text-green-800">{adminName}</div>
                      </div>
                      <div className="p-3 border-r border-green-300">
                        {adminSignature ? (
                          <img src={adminSignature} alt="Signature Admin" className="w-24 h-8 object-contain" />
                        ) : (
                          <div className="w-24 h-8 border border-green-300 rounded bg-green-100 flex items-center justify-center text-xs text-green-600">
                            Signé
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <div className="text-sm text-green-800">{new Date().toLocaleDateString('fr-FR')}</div>
                      </div>
                    </div>
                    <div className="p-3 bg-green-100 border-t border-green-300">
                      <div className="text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          ✓ Document validé et publié
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="border border-gray-300 rounded-md overflow-hidden">
                    <div className="bg-gray-100 grid grid-cols-3 p-3 font-medium text-sm">
                      <div>Nom de l'administrateur</div>
                      <div>Signature</div>
                      <div>Date</div>
                    </div>
                    <div className="grid grid-cols-3 border-t border-gray-300">
                      <div className="p-3 border-r border-gray-300">
                        <input 
                          type="text" 
                          value={adminName}
                          onChange={(e) => setAdminName(e.target.value)}
                          placeholder="Nom de l'admin" 
                          className="w-full border-none outline-none text-sm" 
                        />
                      </div>
                      <div className="p-3 border-r border-gray-300">
                        {adminSignature ? (
                          <div className="flex items-center gap-2">
                            <img src={adminSignature} alt="Signature Admin" className="w-16 h-6 object-contain" />
                            <button
                              onClick={() => setShowSignatureModal(true)}
                              className="text-xs text-blue-600 hover:underline"
                            >
                              Modifier
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setShowSignatureModal(true)}
                            className="w-24 h-8 border border-gray-300 rounded bg-white flex items-center justify-center text-xs text-gray-500 hover:bg-gray-50 transition-colors"
                          >
                            Signer ici
                          </button>
                        )}
                      </div>
                      <div className="p-3">
                        <input 
                          type="date" 
                          value={new Date().toISOString().split('T')[0]}
                          readOnly
                          className="w-full border-none outline-none text-sm bg-gray-50" 
                        />
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 border-t border-gray-300">
                      <div className="text-center">
                        <button
                          onClick={handleAdminValidation}
                          disabled={!adminSignature || isSubmitting}
                          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {isSubmitting ? 'Validation...' : 'Valider et publier le document'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Section Comments */}
              <div className="mb-6">
                <div className="grid grid-cols-4 gap-4">
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700">Comments:</label>
                  </div>
                  <div className="col-span-3">
                    <textarea 
                      placeholder="Enter any additional comments here..." 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      rows={4}
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center text-sm text-gray-500 mt-8">
                UNCONTROLLED WHEN PRINTED
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-12 text-center text-gray-600">
        <p className="text-sm">
          Document complet : Edge and Rope Management - IRATA International
        </p>
      </div>

      {/* Modal de signature admin */}
      {showSignatureModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Signature de l'administrateur</h3>
            <p className="text-sm text-gray-600 mb-4">
              Signez pour valider et publier ce document aux utilisateurs
            </p>
            <SignaturePad
              onSave={(signature) => {
                setAdminSignature(signature);
                setShowSignatureModal(false);
              }}
              width={350}
              height={150}
            />
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowSignatureModal(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
