'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import SignaturePad from '@/components/SignaturePad';

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

export default function TraineeInductionPage() {
  const { data: session } = useSession();
  const [inductionData, setInductionData] = useState<InductionData | null>(null);
  const [sessionName, setSessionName] = useState('');
  const [loading, setLoading] = useState(true);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [userSignature, setUserSignature] = useState('');
  const [signing, setSigning] = useState(false);
  const [signed, setSigned] = useState(false);

  useEffect(() => {
    fetchInductionData();
  }, [session]);

  const fetchInductionData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/trainee-induction');
      
      if (response.ok) {
        const data = await response.json();
        setInductionData(data.induction);
        setSessionName(data.sessionName);
      } else {
        const errorData = await response.json();
        console.error('Erreur:', errorData);
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignatureClick = () => {
    setShowSignatureModal(true);
  };

  const handleSignatureSave = async (signature: string) => {
    setSigning(true);
    try {
      const response = await fetch('/api/user/trainee-induction/sign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inductionId: inductionData?.id,
          userSignature: signature,
        }),
      });

      if (response.ok) {
        setUserSignature(signature);
        setSigned(true);
        setShowSignatureModal(false);
        alert('Induction signée avec succès !');
      } else {
        throw new Error('Erreur lors de la signature');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la signature');
    } finally {
      setSigning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement de l'induction...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!inductionData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Aucune induction disponible</h2>
              <p className="text-gray-600">
                Aucun document d'induction n'a été publié pour votre session de formation.
              </p>
              {sessionName && (
                <p className="text-sm text-gray-500 mt-2">
                  Session : {sessionName}
                </p>
              )}
            </div>
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
            <h1 className="text-2xl font-bold text-gray-900">Document d'Induction des Stagiaires</h1>
            <p className="text-gray-600 mt-1">
              Session : {sessionName} • Date du cours : {new Date(inductionData.courseDate).toLocaleDateString('fr-FR')}
            </p>
          </div>

          {/* Statut de signature */}
          {signed && (
            <div className="p-4 bg-green-50 border-b border-green-200">
              <div className="flex items-center gap-2">
                <span className="px-3 py-2 bg-green-100 text-green-800 rounded-md text-sm">
                  ✓ Induction signée avec succès
                </span>
                        </div>
                      </div>
          )}

          {/* Document */}
          <div className="p-6 max-w-5xl mx-auto bg-white text-black">
            {/* En-tête spécifique aux inductions */}
            <div className="flex flex-col sm:flex-row items-start mb-4">
              <div className="mr-4 flex-shrink-0 mb-4 sm:mb-0">
                <img src="/logo.png" alt="CI.DES Logo" className="w-16 h-20 object-contain" />
                         </div>
              <div className="flex-1">
                <table className="w-full border-collapse text-xs mt-3">
                  <tbody>
                    <tr>
                      <td className="border p-1 font-bold">Titre</td>
                      <td className="border p-1 font-bold">Numéro de code</td>
                      <td className="border p-1 font-bold">Révision</td>
                      <td className="border p-1 font-bold">Création date</td>
                    </tr>
                    <tr>
                      <td className="border p-1">CLDES INDUCTION DES STAGIAIRES</td>
                      <td className="border p-1">ENR-CIFRA-HSE 029</td>
                      <td className="border p-1">00</td>
                      <td className="border p-1">09/10/2023</td>
                    </tr>
                  </tbody>
                </table>
                         </div>
                       </div>

                       <h1 className="text-center font-bold mt-6 border p-2">INDUCTION DES STAGIAIRES</h1>

                       <div className="mt-4">
              <p><strong>Diffusion:</strong> {inductionData.diffusion}</p>
              <p><strong>Copie:</strong> {inductionData.copie}</p>
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
                    <strong>Signature:</strong> 
                    {inductionData.adminSignature ? (
                      <img src={inductionData.adminSignature} alt="Signature Admin" className="h-8 w-auto inline-block" />
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
                <strong>DATE DU COURS:</strong> {new Date(inductionData.courseDate).toLocaleDateString('fr-FR')} 
                           &nbsp;&nbsp;&nbsp;&nbsp;
                <strong>LIEU DU COURS:</strong> {inductionData.courseLocation}
                         </p>
                         <p className="mt-4">
                           J'ai reçu l'induction du cours, compris tous ses aspects et accepte de respecter son contenu.
                           De plus, j'ai lu et compris l'évaluation complète des risques de la zone de formation :
                         </p>
                         
              {/* Section signature utilisateur */}
                         <div className="mt-6 p-4 border border-gray-300 bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Signature du stagiaire</h3>
                  {!signed && (
                               <button
                      onClick={handleSignatureClick}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                               >
                      Signer l'induction
                               </button>
                  )}
                             </div>
                
                <div className="border-b border-gray-400 pb-2 h-16 flex items-center">
                  {userSignature ? (
                    <img src={userSignature} alt="Signature utilisateur" className="h-12 w-auto" />
                  ) : signed ? (
                    <span className="text-green-600 font-medium">✓ Induction signée</span>
                  ) : (
                    <span className="text-gray-400">Cliquez sur "Signer l'induction" pour signer ce document</span>
                           )}
                         </div>
                       </div>
                     </div>
          </div>
        </div>
      </div>

      {/* Modal SignaturePad */}
      {showSignatureModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Signature de l'induction</h3>
            <SignaturePad
              onSave={handleSignatureSave}
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
    </div>
  );
}