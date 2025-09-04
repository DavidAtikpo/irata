"use client";

// app/edge-and-rope-management/page.tsx
import React from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";

export default function EdgeAndRopeManagement() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'ADMIN';
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
                
                {/* Section pour afficher les participants existants - VISIBLE UNIQUEMENT AUX ADMINS */}
                {isAdmin && (
                  <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                    <h4 className="font-medium text-blue-800 mb-2">👥 Participants ayant déjà signé ce toolbox talk :</h4>
                    <div className="text-sm text-blue-700 mb-3">
                      <p>Voici la liste des utilisateurs qui ont déjà participé et signé cette session :</p>
                    </div>
                    
                    {/* Liste des participants (exemple) */}
                    <div className="border border-blue-200 rounded-md overflow-hidden">
                      <div className="bg-blue-100 grid grid-cols-3 p-2 font-medium text-xs text-blue-800">
                        <div>Nom</div>
                        <div>Date de signature</div>
                        <div>Statut</div>
                      </div>
                      <div className="bg-white">
                        <div className="grid grid-cols-3 p-2 border-t border-blue-200 text-xs">
                          <div>Jean Dupont</div>
                          <div>15/12/2024</div>
                          <div className="text-blue-600">✅ Signé</div>
                        </div>
                        <div className="grid grid-cols-3 p-2 border-t border-blue-200 text-xs">
                          <div>Marie Martin</div>
                          <div>15/12/2024</div>
                          <div className="text-blue-600">✅ Signé</div>
                        </div>
                        <div className="grid grid-cols-3 p-2 border-t border-blue-200 text-xs">
                          <div>Pierre Durand</div>
                          <div>15/12/2024</div>
                          <div className="text-blue-600">✅ Signé</div>
                        </div>
                        <div className="grid grid-cols-3 p-2 border-t border-blue-200 text-xs">
                          <div>Sophie Bernard</div>
                          <div>15/12/2024</div>
                          <div className="text-blue-600">✅ Signé</div>
                        </div>
                        <div className="grid grid-cols-3 p-2 border-t border-blue-200 text-xs">
                          <div>Lucas Moreau</div>
                          <div>15/12/2024</div>
                          <div className="text-blue-600">✅ Signé</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3 text-xs text-blue-600">
                      <p>Total : 5 participants ont signé</p>
                    </div>
                  </div>
                )}

                {/* Section d'information pour les utilisateurs normaux */}
                {!isAdmin && (
                  <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-md">
                    <h4 className="font-medium text-gray-700 mb-2">ℹ️ Information</h4>
                    <div className="text-sm text-gray-600">
                      <p>Vous pouvez signer ce toolbox talk pour confirmer votre participation.</p>
                    </div>
                  </div>
                )}

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
                      <input type="text" placeholder="Leader name" className="w-full border-none outline-none text-sm" />
                    </div>
                    <div className="p-3 border-r border-gray-300">
                      <div className="w-24 h-8 border border-gray-300 rounded bg-white flex items-center justify-center text-xs text-gray-500">
                        Sign here
                      </div>
                    </div>
                    <div className="p-3">
                      <input type="date" className="w-full border-none outline-none text-sm" />
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
    </main>
  );
}
