'use client';

import { useState, useEffect } from 'react';
import SignaturePad from '../../../../components/SignaturePad';

interface Session {
  id: string;
  name: string;
  startDate?: string;
  endDate?: string;
}

export default function TraineeInductionPage() {
  const [form, setForm] = useState({
    courseDate: '',
    courseLocation: 'CIDES. centre de formation de Boresse et Matron FRANCE',
    sessionId: '',
    diffusion: '',
    copie: '',
    adminSignature: '',
  });
  const [sessions, setSessions] = useState<Session[]>([]);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [signed, setSigned] = useState(false);
  const [published, setPublished] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/admin/sessions');
      if (response.ok) {
        const data = await response.json();
        // L'API retourne { sessions: [...], trainingSessions: [...] }
        // On utilise sessions qui contient les noms des sessions
        if (data.sessions && Array.isArray(data.sessions)) {
          // Utiliser directement le nom de la session comme ID
          const sessionsWithIds = data.sessions.map((sessionName: string) => ({
            id: sessionName, // Utiliser le nom de la session comme ID
            name: sessionName
          }));
          setSessions(sessionsWithIds);
        } else {
          setSessions([]);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des sessions:', error);
      setSessions([]);
    }
  };

  const handleSignDocument = async () => {
    if (!form.courseDate || !form.courseLocation || !form.sessionId || !form.diffusion || !form.copie) {
      alert('Veuillez remplir tous les champs avant de signer');
      return;
    }
    setShowSignatureModal(true);
  };

  const handleSignatureSave = async (signature: string) => {
    setLoading(true);
    try {
      // Sauvegarder les données d'induction en base
      const saveResponse = await fetch('/api/admin/trainee-induction/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: form.sessionId,
          courseDate: form.courseDate,
          courseLocation: form.courseLocation,
          diffusion: form.diffusion,
          copie: form.copie,
          adminSignature: signature,
        }),
      });

      if (saveResponse.ok) {
        setForm({ ...form, adminSignature: signature });
        setSigned(true);
        setShowSignatureModal(false);
        alert('Document signé et sauvegardé avec succès !');
      } else {
        throw new Error('Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la signature du document');
    } finally {
      setLoading(false);
    }
  };

  const handlePublishToTrainees = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/trainee-induction/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: form.sessionId,
        }),
      });

      if (response.ok) {
        setPublished(true);
        alert('Document publié aux stagiaires avec succès !');
      } else {
        throw new Error('Erreur lors de la publication');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la publication aux stagiaires');
    } finally {
      setLoading(false);
    }
  };

  const selectedSession = sessions.find(s => s.id === form.sessionId);

  // Fonction pour mettre à jour la date du cours quand une session est sélectionnée
  const handleSessionChange = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      // Extraire les dates du nom de la session (ex: "2025 septembre 01 au 06")
      const sessionName = session.name;
      
      // Pattern pour matcher "2025 septembre 01 au 06" ou "2025 septembre 01 au 05"
      const dateMatch = sessionName.match(/(\d{4})\s+(\w+)\s+(\d{1,2})\s+au\s+(\d{1,2})/);
      
      if (dateMatch) {
        const [, year, monthName, startDay, endDay] = dateMatch;
        
        // Convertir le nom du mois en numéro
        const monthMap: { [key: string]: string } = {
          'janvier': '01', 'février': '02', 'mars': '03', 'avril': '04',
          'mai': '05', 'juin': '06', 'juillet': '07', 'août': '08',
          'septembre': '09', 'octobre': '10', 'novembre': '11', 'décembre': '12'
        };
        
        const monthNumber = monthMap[monthName.toLowerCase()];
        if (monthNumber) {
          // Utiliser le jour de début pour la date du cours au format français DD/MM/YYYY
          const formattedDate = `${startDay.padStart(2, '0')}/${monthNumber}/${year}`;
          setForm({ ...form, sessionId: sessionName, courseDate: formattedDate }); // Utiliser sessionName au lieu de sessionId
        } else {
          setForm({ ...form, sessionId: sessionName }); // Utiliser sessionName au lieu de sessionId
        }
      } else {
        setForm({ ...form, sessionId: sessionName }); // Utiliser sessionName au lieu de sessionId
      }
    } else {
      setForm({ ...form, sessionId });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Document d'Induction des Stagiaires</h1>
            <p className="text-gray-600 mt-1">Remplissez, signez et publiez le document aux stagiaires</p>
          </div>

          {/* Formulaire de contrôle */}
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Session *</label>
                <select
                  value={form.sessionId}
                  onChange={(e) => handleSessionChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={signed}
                >
                  <option value="">Sélectionner une session</option>
                                     {sessions.map((session) => (
                     <option key={session.id} value={session.id}>
                       {session.name}
                     </option>
                   ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date du cours *</label>
                <input
                  type="text"
                  value={form.courseDate}
                  onChange={(e) => setForm({ ...form, courseDate: e.target.value })}
                  placeholder="DD/MM/YYYY"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={signed}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lieu du cours *</label>
                <input
                  type="text"
                  value={form.courseLocation}
                  onChange={(e) => setForm({ ...form, courseLocation: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={signed}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Diffusion *</label>
                <select
                  value={form.diffusion}
                  onChange={(e) => setForm({ ...form, diffusion: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={signed}
                >
                  <option value="">Sélectionner une option</option>
                  <option value="Tous les stagiaires">Tous les stagiaires</option>
                  <option value="Formateurs">Formateurs</option>
                  <option value="Administration">Administration</option>
                  <option value="Direction">Direction</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Copie *</label>
                <select
                  value={form.copie}
                  onChange={(e) => setForm({ ...form, copie: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={signed}
                >
                  <option value="">Sélectionner une option</option>
                  <option value="Archives">Archives</option>
                  <option value="Formation">Formation</option>
                  <option value="RH">RH</option>
                  <option value="Sécurité">Sécurité</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              {!signed && (
                <button
                  onClick={handleSignDocument}
                  disabled={loading || !form.courseDate || !form.courseLocation || !form.sessionId || !form.diffusion || !form.copie}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Signature...' : 'Signer le document'}
                </button>
              )}

              {signed && !published && (
                <button
                  onClick={handlePublishToTrainees}
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Publication...' : 'Publier aux stagiaires'}
                </button>
              )}

              {published && (
                <div className="flex items-center gap-2">
                  <span className="px-3 py-2 bg-green-100 text-green-800 rounded-md text-sm">
                    ✓ Document publié aux stagiaires
                  </span>
                  <button
                    onClick={() => window.location.href = '/admin/trainee-signatures'}
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                  >
                    Voir les signatures
                  </button>
                </div>
              )}


            </div>
          </div>

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
              <p><strong>Diffusion:</strong> {form.diffusion || '....................................................'}</p>
              <p><strong>Copie:</strong> {form.copie || '....................................................'}</p>
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
                    <strong>Signature:</strong> {form.adminSignature ? (
                      <img src={form.adminSignature} alt="Signature Admin" className="h-8 w-auto inline-block" />
                    ) : (
                      <span className="text-red-600">À signer</span>
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
                <strong>DATE DU COURS:</strong> {form.courseDate ? new Date(form.courseDate).toLocaleDateString('fr-FR') : '________________________'} 
                &nbsp;&nbsp;&nbsp;&nbsp;
                <strong>LIEU DU COURS:</strong> {form.courseLocation || '________________________'}
              </p>
              <p className="mt-4">
                J'ai reçu l'induction du cours, compris tous ses aspects et accepte de respecter son contenu.
                De plus, j'ai lu et compris l'évaluation complète des risques de la zone de formation :
              </p>
              
                             <div className="mt-6 p-4 border border-gray-300 bg-gray-50">
                                   <p className="text-sm text-gray-600 font-medium">
                    📋 Note pour l'administrateur : Ce document sera envoyé aux stagiaires de la session "{selectedSession?.name || 'Non sélectionnée'}" 
                    après votre signature. Les stagiaires pourront ensuite signer électroniquement.
                  </p>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal SignaturePad */}
      {showSignatureModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Signature de l'Administrateur</h3>
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
