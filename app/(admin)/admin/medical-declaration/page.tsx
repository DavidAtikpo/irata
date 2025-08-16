'use client';

import { useState, useEffect } from 'react';

interface MedicalDeclaration {
  id: string;
  userId: string;
  userEmail: string;
  name: string;
  sessionName: string;
  irataNo: string;
  date: string;
  signature: string;
  luEtApprouve: string;
  hasOtherSubjects: boolean;
  otherSubjectsText: string;
  status: string;
  submittedAt: string;
}

export default function MedicalDeclarationPage() {
  const [declarations, setDeclarations] = useState<MedicalDeclaration[]>([]);
  const [selectedDeclaration, setSelectedDeclaration] = useState<MedicalDeclaration | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<string>('');

  useEffect(() => {
    fetchDeclarations();
  }, []);

  const fetchDeclarations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/medical-declarations');
      if (response.ok) {
        const data = await response.json();
        setDeclarations(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des déclarations:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async (declarationId: string) => {
    try {
      const response = await fetch(`/api/admin/medical-declaration/pdf/${declarationId}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `declaration_medicale_${declarationId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      alert('Erreur lors du téléchargement du PDF');
    }
  };

  const deleteDeclaration = async (declarationId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette déclaration ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/medical-declarations/${declarationId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Déclaration supprimée avec succès');
        fetchDeclarations();
        if (selectedDeclaration?.id === declarationId) {
          setSelectedDeclaration(null);
        }
      } else {
        throw new Error('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression de la déclaration');
    }
  };

  const uniqueSessions = Array.from(new Set(declarations.map(d => d.sessionName)));
  const filteredDeclarations = selectedSession 
    ? declarations.filter(d => d.sessionName === selectedSession)
    : declarations;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="text-lg">Chargement des déclarations médicales...</div>
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
            <h1 className="text-2xl font-bold text-gray-900">Déclarations Médicales des Stagiaires</h1>
            <p className="text-gray-600 mt-1">Consultez et gérez les déclarations médicales soumises par les stagiaires</p>
          </div>

          {selectedDeclaration ? (
            /* Vue détaillée */
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Déclaration Médicale</h2>
                  <p className="text-gray-600">
                    {selectedDeclaration.name} • {selectedDeclaration.sessionName} • 
                    Soumise le {new Date(selectedDeclaration.submittedAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => downloadPDF(selectedDeclaration.id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Télécharger PDF
                  </button>
                  <button
                    onClick={() => deleteDeclaration(selectedDeclaration.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    Supprimer
                  </button>
                  <button
                    onClick={() => setSelectedDeclaration(null)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                  >
                    Retour
                  </button>
                </div>
              </div>

              {/* Document médical complet */}
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
                    Il faut comprendre que les cours d'accès par cordes industriels, à tous les niveaux, impliquent un certain effort physique et mental. 
                    Certaines conditions médicales constituent une contre-indication et en raison de la nature de vos activités et selon la sécurité des cours d'accès par 
                    cordes industrielles.
                  </p>
                  <p>
                    Idéalement, les candidats devraient être en possession d'un certificat médical du travail complet et applicable.
                  </p>
                  <p>
                    Au minimum, nous vous demandons de compléter ce formulaire médical/déclaration signé informant des conditions 
                    énumérées ci-dessous et, par conséquent, il n'y a aucune raison que vous exclurat de la participation à un cours d'évaluation d'accès 
                    par cordes.
                  </p>
                  <p>
                    Le fait de ne pas produire une forme quelconque de certificat médical/déclaration signée entraînera le retard de votre certification 
                    et l'exclusion du cours et de l'évaluation.
                  </p>
                </div>

                {/* Section Auto-certification */}
                <div className="border-2 border-black p-4 mb-6">
                  <h3 className="text-base font-bold mb-3">AUTO-CERTIFICATION MÉDICALE</h3>
                  
                  <div className="mb-4">
                    <strong>Déclaration:</strong>
                  </div>
                  
                  <p className="text-sm mb-4">
                    Je déclare que je suis en bonne santé, en bonne forme physique et que je n'estime capable d'entreprendre des tâches 
                    opérationnelles d'accès sur corde. Je ne présente aucune des conditions médicales ou contre-indications suivantes qui pourraient 
                    m'empêcher de travailler en toute sécurité :
                  </p>

                  <div className="mb-4">
                    <strong>Principales contre-indications au travail en hauteur (d'après IRATA) :</strong>
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
                    <li>• À ma connaissance, je ne souffre d'aucune condition mentale ou physique, y compris celles mentionnées ci-dessus, qui 
                    interfère avec ma capacité de travailler en hauteur de manière sécuritaire et sécuritaire, ou metttre moi-même ou autrui en 
                    danger en participant à des activités d'accès sur corde.</li>
                  </ul>

                  <div className="mb-4">
                    <div className="flex items-start space-x-2">
                      <span className="text-sm font-medium">Y a-t-il d'autres sujets dont vous aimeriez nous parler ? </span>
                      <span className="text-sm">{selectedDeclaration.hasOtherSubjects ? 'OUI' : 'NON'}</span>
                    </div>
                  </div>

                  {selectedDeclaration.hasOtherSubjects && selectedDeclaration.otherSubjectsText && (
                    <div className="border border-gray-300 rounded p-2 text-sm bg-gray-50">
                      <strong>Précisions :</strong> {selectedDeclaration.otherSubjectsText}
                    </div>
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
                            {selectedDeclaration.name}
                          </div>
                        </td>
                        <td className="border-r border-black p-2 w-1/3">
                          <div className="text-sm mb-2"><strong>IRATA No.</strong></div>
                          <div className="w-full border-b border-gray-400 pb-1 text-sm bg-gray-100 px-2 py-1">
                            {selectedDeclaration.irataNo}
                          </div>
                        </td>
                        <td className="p-2 w-1/3">
                          <div className="text-sm mb-2"><strong>Session</strong></div>
                          <div className="w-full border-b border-gray-400 pb-1 text-sm bg-gray-100 px-2 py-1">
                            {selectedDeclaration.sessionName}
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className="border-r border-black border-t border-black p-2">
                          <div className="text-sm mb-2"><strong>Date</strong></div>
                          <div className="w-full border-b border-gray-400 pb-1 text-sm bg-gray-100 px-2 py-1">
                            {selectedDeclaration.date}
                          </div>
                        </td>
                        <td className="border-r border-black border-t border-black p-2">
                          <div className="text-sm mb-2"><strong>Signature</strong></div>
                          <div className="border-b border-gray-400 pb-1 h-12 flex items-center">
                            {selectedDeclaration.signature ? (
                              <img src={selectedDeclaration.signature} alt="Signature" className="h-8 w-auto" />
                            ) : (
                              <span className="text-gray-400 text-sm">Pas de signature</span>
                            )}
                          </div>
                        </td>
                        <td className="border-t border-black p-2">
                          <div className="text-sm mb-2"><strong>Précédé de la mention lu et approuvé</strong></div>
                          <div className="w-full border-b border-gray-400 pb-1 text-sm bg-gray-100 px-2 py-1 h-12 flex items-center">
                            {selectedDeclaration.luEtApprouve || 'Non renseigné'}
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Note finale */}
                <div className="mt-4 text-center text-sm border border-black p-2">
                  <strong>Ce document sera conservé en toute sécurité dans le dossier du personnel.</strong>
                </div>
              </div>
            </div>
          ) : (
            /* Liste des déclarations */
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-gray-600">
                  {filteredDeclarations.length} déclaration{filteredDeclarations.length > 1 ? 's' : ''} trouvée{filteredDeclarations.length > 1 ? 's' : ''}
                </p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Filtrer par session :</label>
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
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr>
                      <th className="border border-gray-400 bg-gray-100 text-xs font-semibold px-3 py-2 text-left">Stagiaire</th>
                      <th className="border border-gray-400 bg-gray-100 text-xs font-semibold px-3 py-2 text-left">Email</th>
                      <th className="border border-gray-400 bg-gray-100 text-xs font-semibold px-3 py-2 text-left">Session</th>
                      <th className="border border-gray-400 bg-gray-100 text-xs font-semibold px-3 py-2 text-left">IRATA No.</th>
                      <th className="border border-gray-400 bg-gray-100 text-xs font-semibold px-3 py-2 text-left">Date</th>
                      <th className="border border-gray-400 bg-gray-100 text-xs font-semibold px-3 py-2 text-left">Statut</th>
                      <th className="border border-gray-400 bg-gray-100 text-xs font-semibold px-3 py-2 text-left">Soumise le</th>
                      <th className="border border-gray-400 bg-gray-100 text-xs font-semibold px-3 py-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDeclarations.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="border border-gray-400 text-xs px-3 py-2 text-center py-8 text-gray-500">
                          Aucune déclaration trouvée
                        </td>
                      </tr>
                    ) : (
                      filteredDeclarations.map((declaration) => (
                        <tr key={declaration.id} className="hover:bg-gray-50">
                          <td className="border border-gray-400 text-xs px-3 py-2 font-medium">{declaration.name}</td>
                          <td className="border border-gray-400 text-xs px-3 py-2">{declaration.userEmail}</td>
                          <td className="border border-gray-400 text-xs px-3 py-2">{declaration.sessionName}</td>
                          <td className="border border-gray-400 text-xs px-3 py-2">{declaration.irataNo}</td>
                          <td className="border border-gray-400 text-xs px-3 py-2">{declaration.date}</td>
                          <td className="border border-gray-400 text-xs px-3 py-2">
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                              {declaration.status === 'submitted' ? 'Soumise' : declaration.status}
                            </span>
                          </td>
                          <td className="border border-gray-400 text-xs px-3 py-2">
                            {new Date(declaration.submittedAt).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="border border-gray-400 text-xs px-3 py-2">
                            <div className="flex gap-2">
                              <button
                                onClick={() => setSelectedDeclaration(declaration)}
                                className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                              >
                                Voir
                              </button>
                              <button
                                onClick={() => downloadPDF(declaration.id)}
                                className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                              >
                                PDF
                              </button>
                              <button
                                onClick={() => deleteDeclaration(declaration.id)}
                                className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                              >
                                Suppr.
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
