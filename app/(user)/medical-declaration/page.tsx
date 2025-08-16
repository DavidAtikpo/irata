'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import SignaturePad from '@/components/SignaturePad';

export default function MedicalDeclarationPage() {
  const { data: session } = useSession();
  const [form, setForm] = useState({
    name: '',
    irataNo: 'ENR-CIFRA-RH 034',
    date: new Date().toISOString().split('T')[0], // Date actuelle
    signature: '',
    luEtApprouve: '',
    hasOtherSubjects: false,
    otherSubjectsText: ''
  });
  const [sessionName, setSessionName] = useState('');
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchUserProfile();
    fetchUserSession();
  }, [session]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        const fullName = [data?.prenom, data?.nom].filter(Boolean).join(' ').trim();
        if (fullName) {
          setForm(prev => ({ ...prev, name: fullName }));
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
    }
  };
  
  const fetchUserSession = async () => {
    try {
      const response = await fetch('/api/user/training-session');
      if (response.ok) {
        const data = await response.json();
        if (data?.name) {
          setSessionName(data.name);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la session:', error);
    }
  };

  const handleSignatureClick = () => {
    setShowSignatureModal(true);
  };

  const handleSignatureSave = (signature: string) => {
    setForm({ ...form, signature });
    setShowSignatureModal(false);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.signature || !form.date || !form.luEtApprouve) {
      alert('Veuillez remplir tous les champs obligatoires, écrire "lu et approuvé" et signer le document');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/user/medical-declaration/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formData: {
            ...form,
            sessionName,
          },
        }),
      });

      if (response.ok) {
        setSubmitted(true);
        alert('Déclaration médicale soumise avec succès !');
      } else {
        throw new Error('Erreur lors de la soumission');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la soumission de la déclaration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Déclaration d&apos;État Médical</h1>
            <p className="text-gray-600 mt-1">Remplissez et signez votre déclaration médicale</p>
          </div>

          {/* Informations utilisateur */}
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Votre nom</label>
                <input
                  type="text"
                  value={form.name}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Session de formation</label>
                <input
                  type="text"
                  value={sessionName}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                />
              </div>
            </div>

            {submitted && (
              <div className="flex items-center gap-2">
                <span className="px-3 py-2 bg-green-100 text-green-800 rounded-md text-sm">
                  ✓ Déclaration soumise avec succès
                </span>
              </div>
            )}
          </div>

          {/* Document médical */}
          <div className="p-6">
            <div className="bg-white border-2 border-gray-300 p-6 max-w-4xl mx-auto">
              
              {/* En-tête avec logo */}
              <div className="flex items-start justify-between border-b-2 border-black pb-2 mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-200 border border-black mr-4 flex items-center justify-center">
                    <span className="text-xs">LOGO</span>
                  </div>
                  <div className="text-sm">
                    <div><strong>Title :</strong> CLDES STATEMENT OF MEDICAL CONDITION / SELF CERTIFICATION</div>
                    <div><strong>Code Number :</strong> ENR-CIFRA-RH 034</div>
                  </div>
                </div>
                <div className="text-sm text-right">
                  <div><strong>Revision :</strong> 00</div>
                  <div><strong>Creation Date :</strong> 03/10/2023</div>
                </div>
              </div>

              {/* Titre principal */}
              <div className="text-center border-2 border-black p-3 mb-6">
                <h1 className="text-lg font-bold">DÉCLARATION D'ÉTAT MÉDICAL</h1>
                <h2 className="text-base font-semibold mt-2">Exigences de pré-évaluation</h2>
              </div>

              {/* Texte explicatif */}
              <div className="text-sm mb-6 space-y-3">
                <p>
                  Il faut comprendre que les cours d&apos;accès par cordes industriels, à tous les niveaux, impliquent un certain effort physique et mental. 
                  Certaines conditions médicales constituent une contre-indication et en raison de la nature de vos activités et selon la sécurité des cours d&apos;accès par 
                  cordes industrielles.
                </p>
                <p>
                  Idéalement, les candidats devraient être en possession d&apos;un certificat médical du travail complet et applicable.
                </p>
                <p>
                  Au minimum, nous vous demandons de compléter ce formulaire médical/déclaration signé informant des conditions 
                  énumérées ci-dessous et, par conséquent, il n&apos;y a aucune raison que vous exclurat de la participation à un cours d&apos;évaluation d&apos;accès 
                  par cordes.
                </p>
                <p>
                  Le fait de ne pas produire une forme quelconque de certificat médical/déclaration signée entraînera le retard de votre certification 
                  et l&apos;exclusion du cours et de l&apos;évaluation.
                </p>
              </div>

              {/* Section Auto-certification */}
              <div className="border-2 border-black p-4 mb-6">
                <h3 className="text-base font-bold mb-3">AUTO-CERTIFICATION MÉDICALE</h3>
                
                <div className="mb-4">
                  <strong>Déclaration:</strong>
                </div>
                
                <p className="text-sm mb-4">
                  Je déclare que je suis en bonne santé, en bonne forme physique et que je n&apos;estime capable d&apos;entreprendre des tâches 
                  opérationnelles d&apos;accès sur corde. Je ne présente aucune des conditions médicales ou contre-indications suivantes qui pourraient 
                  m&apos;empêcher de travailler en toute sécurité :
                </p>

                <div className="mb-4">
                  <strong>Principales contre-indications au travail en hauteur (d&apos;après IRATA) :</strong>
                </div>

                <ul className="text-sm space-y-1 mb-4 ml-4">
                  <li>• Médicaments prescrits pouvant altérer les fonctions physiques et/ou mentales.</li>
                  <li>• Dépendance à l'alcool ou aux drogues.</li>
                  <li>• Diabète, glycémie élevée ou basse.</li>
                  <li>• Tension artérielle élevée ou basse.</li>
                  <li>• Maladie cardiaque ou cardiovasculaire, par exemple évanouissements.</li>
                  <li>• Vertiges, étourdissements ou difficultés d'équilibre.</li>
                  <li>• Maladie cardiaque ou douleur thoracique.</li>
                  <li>• Fonction altérée des membres.</li>
                  <li>• Problèmes musculo-squelettiques, par exemple maux de dos.</li>
                  <li>• Maladie psychiatrique.</li>
                  <li>• Vertige.</li>
                  <li>• Déficience sensorielle, par exemple aveugle, sourd.</li>
                  <li>• À ma connaissance, je ne souffre d&apos;aucune condition mentale ou physique, y compris celles mentionnées ci-dessus, qui 
                  interfère avec ma capacité de travailler en hauteur de manière sécuritaire et sécuritaire, ou metttre moi-même ou autrui en 
                  danger en participant à des activités d&apos;accès sur corde.</li>
                </ul>

                <div className="mb-4">
                  <label className="flex items-start space-x-2">
                    <input
                      type="checkbox"
                      checked={form.hasOtherSubjects}
                      onChange={(e) => setForm({ ...form, hasOtherSubjects: e.target.checked })}
                      className="mt-1"
                    />
                    <span className="text-sm">Y a-t-il d'autres sujets dont vous aimeriez nous parler ? OUI/NON</span>
                  </label>
                </div>

                {form.hasOtherSubjects && (
                  <textarea
                    value={form.otherSubjectsText}
                    onChange={(e) => setForm({ ...form, otherSubjectsText: e.target.value })}
                    className="w-full border border-gray-300 rounded p-2 text-sm"
                    rows={3}
                    placeholder="Veuillez préciser..."
                  />
                )}
              </div>

              {/* Section signature */}
              <div className="border-2 border-black">
                <table className="w-full">
                  <tbody>
                    <tr>
                      <td className="border-r border-black p-2 w-1/3">
                        <div className="text-sm mb-2"><strong>Nom</strong></div>
                        <div className="w-full border-b border-gray-400 pb-1 text-sm bg-gray-100 px-2 py-1">
                          {form.name}
                        </div>
                      </td>
                      <td className="border-r border-black p-2 w-1/3">
                        <div className="text-sm mb-2"><strong>IRATA No.</strong></div>
                        <div className="w-full border-b border-gray-400 pb-1 text-sm bg-gray-100 px-2 py-1">
                          {form.irataNo}
                        </div>
                      </td>
                      <td className="p-2 w-1/3">
                        <div className="text-sm mb-2"><strong>Session</strong></div>
                        <div className="w-full border-b border-gray-400 pb-1 text-sm bg-gray-100 px-2 py-1">
                          {sessionName}
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="border-r border-black border-t border-black p-2">
                        <div className="text-sm mb-2"><strong>Date</strong></div>
                        <div className="w-full border-b border-gray-400 pb-1 text-sm bg-gray-100 px-2 py-1">
                          {form.date}
                        </div>
                      </td>
                      <td className="border-r border-black border-t border-black p-2">
                        <div className="text-sm mb-2"><strong>Signature</strong></div>
                        <div 
                          onClick={handleSignatureClick}
                          className="border-b border-gray-400 pb-1 h-12 cursor-pointer hover:bg-gray-50 flex items-center"
                        >
                          {form.signature ? (
                            <img src={form.signature} alt="Signature" className="h-8 w-auto" />
                          ) : (
                            <span className="text-gray-400 text-sm">Cliquez pour signer</span>
                          )}
                        </div>
                      </td>
                      <td className="border-t border-black p-2">
                        <div className="text-sm mb-2"><strong>Précédé de la mention lu et approuvé</strong></div>
                        <input
                          type="text"
                          value={form.luEtApprouve}
                          onChange={(e) => setForm({ ...form, luEtApprouve: e.target.value })}
                          placeholder="Écrivez &apos;lu et approuvé&apos;"
                          className="w-full border-b border-gray-400 pb-1 text-sm h-12 px-2"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Note finale */}
              <div className="mt-4 text-center text-sm border border-black p-2">
                <strong>Ce document sera conservé en toute sécurité dans le dossier du personnel.</strong>
              </div>

              {/* Note pour l'utilisateur */}
              <div className="mt-6 p-4 border border-blue-300 bg-blue-50">
                <p className="text-sm text-blue-700 font-medium">
                  📋 Information : Veuillez remplir tous les champs, lire attentivement la déclaration, écrire &quot;lu et approuvé&quot; et signer le document. 
                  Votre déclaration sera transmise à l&apos;administration pour validation.
                </p>
              </div>

              {/* Bouton de soumission en bas */}
              {!submitted && (
                <div className="mt-6 text-center">
                  <button
                    onClick={handleSubmit}
                    disabled={loading || !form.name || !form.signature || !form.date || !form.luEtApprouve}
                    className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium"
                  >
                    {loading ? 'Soumission en cours...' : 'Soumettre la déclaration médicale'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal SignaturePad */}
      {showSignatureModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Signature de la déclaration médicale</h3>
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
