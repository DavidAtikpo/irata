'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import SignaturePad from '@/components/SignaturePad';

interface InductionDocument {
  id: string;
  sessionId: string;
  sessionName: string;
  courseDate: string;
  courseLocation: string;
  diffusion: string;
  copie: string;
  adminSignature: string;
  status: string;
  userHasSigned: boolean;
  userSignature?: string;
}

export default function TraineeInductionPage() {
  const { data: session } = useSession();
  const [documents, setDocuments] = useState<InductionDocument[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<InductionDocument | null>(null);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);

  useEffect(() => {
    if (session?.user?.email) {
      fetchDocuments();
    }
  }, [session]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/trainee-induction');
      if (response.ok) {
        const data = await response.json();
        setDocuments(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignDocument = (document: InductionDocument) => {
    setSelectedDocument(document);
    setShowSignatureModal(true);
  };

  const handleSignatureSave = async (signature: string) => {
    if (!selectedDocument) return;

    setSigning(true);
    try {
      const response = await fetch('/api/user/trainee-induction/sign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId: selectedDocument.id,
          signature: signature,
        }),
      });

      if (response.ok) {
        alert('Document signé avec succès !');
        setShowSignatureModal(false);
        setSelectedDocument(null);
        fetchDocuments(); // Recharger la liste
      } else {
        throw new Error('Erreur lors de la signature');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la signature du document');
    } finally {
      setSigning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="text-lg">Chargement des documents...</div>
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
            <h1 className="text-2xl font-bold text-gray-900">Documents d'Induction</h1>
            <p className="text-gray-600 mt-1">Consultez et signez vos documents d'induction de formation</p>
          </div>

          <div className="p-6">
            {documents.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500">Aucun document d'induction disponible</div>
              </div>
            ) : (
              <div className="grid gap-6">
                {documents.map((document) => (
                  <div key={document.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Document d'Induction - {document.sessionName}
                        </h3>
                        <div className="text-sm text-gray-600 mt-2">
                          <p><strong>Date du cours:</strong> {document.courseDate}</p>
                          <p><strong>Lieu du cours:</strong> {document.courseLocation}</p>
                          <p><strong>Diffusion:</strong> {document.diffusion}</p>
                          <p><strong>Copie:</strong> {document.copie}</p>
                        </div>
                      </div>
                                             <div className="flex items-center gap-3">
                         {document.userHasSigned ? (
                           <span className="px-3 py-2 bg-green-100 text-green-800 rounded-md text-sm">
                             ✓ Document signé
                           </span>
                         ) : (
                           <span className="px-3 py-2 bg-yellow-100 text-yellow-800 rounded-md text-sm">
                             ⚠ En attente de signature
                           </span>
                         )}
                       </div>
                    </div>

                                         {/* Document complet */}
                     <div className="bg-white border border-gray-300 rounded-lg p-6 max-w-5xl mx-auto text-black">
                       {/* HEADER */}
                       <div className="flex justify-between border p-2 text-sm">
                         <div>
                           <p><strong>Titre:</strong> CLDES INDUCTION DES STAGIAIRES</p>
                           <p><strong>Numéro de Code:</strong> ENR-CIFRA-HSE 029</p>
                         </div>
                         <div>
                           <p><strong>Révision:</strong> 00</p>
                           <p><strong>Date de création:</strong> 09/10/2023</p>
                         </div>
                       </div>

                       <h1 className="text-center font-bold mt-6 border p-2">INDUCTION DES STAGIAIRES</h1>

                       <div className="mt-4">
                         <p><strong>Diffusion:</strong> {document.diffusion}</p>
                         <p><strong>Copie:</strong> {document.copie}</p>
                       </div>

                       {/* VALIDATION */}
                       <h2 className="mt-6 font-bold">VALIDATION</h2>
                       <table className="w-full border text-sm mt-2">
                         <thead>
                           <tr className="border">
                             <th className="border p-2">Préparé par</th>
                             <th className="border p-2">Révisé par</th>
                             <th className="border p-2">Approuvé par</th>
                           </tr>
                         </thead>
                         <tbody>
                           <tr className="border">
                             <td className="border p-2">
                               Laurent ARDOUIN<br/>TA / RAMR<br/>Date: 09/10/2023<br/>
                               <strong>Signature:</strong> {document.adminSignature ? (
                                 <img src={document.adminSignature} alt="Signature Admin" className="h-8 w-auto inline-block" />
                               ) : (
                                 <span className="text-red-600">Non signé</span>
                               )}
                             </td>
                             <td className="border p-2">Dimitar Aleksandrov MATEEB<br/>Formateur<br/>Date: 09/10/2023</td>
                             <td className="border p-2">Laurent ARDOUIN<br/>Manager<br/>Date: 09/10/2023</td>
                           </tr>
                         </tbody>
                       </table>

                       {/* SECTION 1 */}
                       <h2 className="mt-6 font-bold text-blue-700">1. LORSQUE LE COURS SE RASSEMBLE</h2>
                       <ul className="list-disc ml-6 mt-2 space-y-1 text-sm">
                         <li>ACCUEIL – offrir des rafraîchissements</li>
                         <li>DEMANDER ET VÉRIFIER LES CARNETS DE BORD – (N2 et N3 uniquement)</li>
                         <li>DISTRIBUER LE FORMULAIRE D'INSCRIPTION ET LE FORMULAIRE MÉDICAL</li>
                         <li>DISTRIBUER LE MANUEL DU STAGIAIRE, ICOP, TACS ET LES QUESTIONNAIRES PERTINENTS</li>
                       </ul>

                       {/* SECTION 2 */}
                       <h2 className="mt-6 font-bold text-blue-700">2. LORSQUE LE COURS EST RASSEMBLÉ</h2>
                       <ul className="list-disc ml-6 mt-2 space-y-1 text-sm">
                         <li>PRÉSENTER LE(S) FORMATEUR(S) – nom, parcours, niveau, etc.</li>
                         <li>FAIRE PRÉSENTER LES STAGIAIRES – nom, niveau, où ils ont travaillé / travaillent</li>
                         <li>PRÉSENTER L'ENTREPRISE – historique, membre IRATA, etc.</li>
                         <li>ASSURANCE – entièrement assurée</li>
                         <li>EXPOSER LE SCHÉMA IRATA – niveaux, progression, historique, etc.</li>
                         <li>STRUCTURE DU COURS ET HORAIRES – début / fin / déjeuner / pauses café</li>
                         <li>SUPERVISION – pas autorisé sur cordes sans supervision directe du formateur</li>
                         <li>ÉCHEC – politique de facturation de l'entreprise pour les candidats échoués</li>
                         <li>RETRAIT / EXCLUSION DU COURS – politique de facturation de l'entreprise</li>
                         <li>ARRANGEMENTS DE PAIEMENT – politique de l'entreprise</li>
                         <li>CERTIFICATION – ne sera pas délivrée tant que le paiement complet n'est pas reçu</li>
                         <li>INSTALLATIONS DE RAFRAÎCHISSEMENT – garder propre et rangé, signaler si les fournitures sont faibles</li>
                         <li>TOILETTES ET DOUCHES – garder propre et rangé, signaler si les fournitures sont faibles</li>
                         <li>MÉNAGE – aider à garder la zone de formation, le local et les toilettes propres et rangés</li>
                         <li>FUMER</li>
                         <li>STATIONNEMENT</li>
                         <li>ARRANGEMENTS D'INCENDIE ET D'URGENCE – sorties, extincteurs (seulement si sûr)</li>
                       </ul>

                       {/* SECTION 3 */}
                       <h2 className="mt-6 font-bold text-blue-700">3. PASSER EN REVUE L'ÉVALUATION DES RISQUES</h2>
                       <ul className="list-disc ml-6 mt-2 space-y-1 text-sm">
                         <li>GLISSADES, TRÉBUCHER ET CHUTES – garder la zone propre, utiliser les rampes, toujours attaché, etc.</li>
                         <li>VÉRIFICATION PAR PAIR – faire vérifier par quelqu'un avant d'aller sur cordes</li>
                         <li>INSPECTION PRÉ-UTILISATION DE L'ÉQUIPEMENT – chaque fois avant utilisation, signaler les défauts</li>
                         <li>VIGILANCE CONSTANTE DE L'ÉQUIPEMENT – signaler tout défaut suspecté</li>
                         <li>OBJETS TOMBÉS – vider et fermer les poches</li>
                         <li>BLESSURE AU COUDE – techniques d'échauffement</li>
                         <li>MANUTENTION MANUELLE – traîner, ne pas soulever</li>
                         <li>ÉPUISEMENT PAR LA CHALEUR – eau, repos, etc.</li>
                         <li>PRÉCAUTIONS POUR LA FORMATION AVEC DES VICTIMES VIVANTES</li>
                       </ul>

                       {/* DECLARATION */}
                       <div className="mt-8">
                         <p className="bg-yellow-200 font-bold text-center p-2">
                           MONTRER OÙ L'ÉVALUATION COMPLÈTE DES RISQUES EST AFFICHÉE ET ENCOURAGER LES GENS À LA LIRE<br/>
                           TOUS LES STAGIAIRES ET FORMATEURS DOIVENT ENSUITE SIGNER<br/>
                           LA DÉCLARATION D'INDUCTION
                         </p>
                       </div>

                       <h2 className="mt-6 font-bold">DÉCLARATION D'INDUCTION</h2>
                       <div className="mt-2 text-sm">
                         <p>
                           <strong>DATE DU COURS:</strong> {document.courseDate} 
                           &nbsp;&nbsp;&nbsp;&nbsp;
                           <strong>LIEU DU COURS:</strong> {document.courseLocation}
                         </p>
                         <p className="mt-4">
                           J'ai reçu l'induction du cours, compris tous ses aspects et accepte de respecter son contenu.
                           De plus, j'ai lu et compris l'évaluation complète des risques de la zone de formation :
                         </p>
                         
                         {/* Signature du stagiaire */}
                         <div className="mt-6 p-4 border border-gray-300 bg-gray-50">
                           <h3 className="font-bold mb-2">Signature du Stagiaire :</h3>
                           {document.userHasSigned && document.userSignature ? (
                             <div className="flex items-center gap-4">
                               <img 
                                 src={document.userSignature} 
                                 alt="Votre signature" 
                                 className="h-16 w-auto border border-gray-400"
                               />
                               <span className="text-green-600 font-medium">✓ Document signé</span>
                             </div>
                           ) : (
                             <div className="text-center py-4">
                               <p className="text-gray-600 mb-2">Vous devez signer ce document pour confirmer votre compréhension</p>
                               <button
                                 onClick={() => handleSignDocument(document)}
                                 className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
                               >
                                 Signer maintenant
                               </button>
                             </div>
                           )}
                         </div>
                       </div>
                     </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal SignaturePad */}
      {showSignatureModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Signer le document d'induction</h3>
            <p className="text-sm text-gray-600 mb-4">
              En signant ce document, vous confirmez avoir lu et compris toutes les informations d'induction.
            </p>
            <SignaturePad
              onSave={handleSignatureSave}
              width={350}
              height={150}
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => {
                  setShowSignatureModal(false);
                  setSelectedDocument(null);
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                disabled={signing}
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