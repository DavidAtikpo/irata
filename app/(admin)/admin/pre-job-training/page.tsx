'use client';

import React, { useState, useEffect } from 'react';

interface PreJobTrainingForm {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  session: string;
  permitNumber: string;
  permitType: {
    cold: boolean;
    hot: boolean;
    notFlame: boolean;
    flame: boolean;
  };
  taskDescription: string;
  incidentIdentification: string;
  consequences: string;
  securityMeasures: string;
  attendees: Array<{
    position: string;
    name: string;
    signatures: Record<string, string>;
  }>;
  createdAt: string;
  updatedAt: string;
}

const Th: React.FC<React.PropsWithChildren<React.ThHTMLAttributes<HTMLTableCellElement>>> = ({ children, className, ...rest }) => (
  <th {...rest} className={`border border-gray-400 bg-gray-100 text-xs font-semibold px-3 py-2 text-left ${className || ''}`}>{children}</th>
);

const Td: React.FC<React.PropsWithChildren<React.TdHTMLAttributes<HTMLTableCellElement>>> = ({ children, className, ...rest }) => (
  <td {...rest} className={`border border-gray-400 text-xs px-3 py-2 align-top ${className || ''}`}>{children}</td>
);

export default function AdminPreJobTrainingPage() {
  const [forms, setForms] = useState<PreJobTrainingForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedForm, setSelectedForm] = useState<PreJobTrainingForm | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const daysOfWeek = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  const categories = [
    "Ancrage",
    "Évaluation des risques",
    "Facteur de chute / EPI",
    "Protection de la corde",
    "Communication vocale / Objet tombant",
    "Esprit d'équipe",
    "Montage partenaire",
    "Évaluation des risques",
    "Facteur de chute / EPI",
    "Protection de la corde",
    "Communication / Objet tombant",
    "Gestion du matériel",
    "Esprit d'équipe",
    ""
  ];

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      setLoading(true);
      // Remplacer par l'appel API réel
      const response = await fetch('/api/admin/pre-job-training');
      if (response.ok) {
        const data = await response.json();
        setForms(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des formulaires:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredForms = forms.filter(form => {
    const matchesSearch = form.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         form.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         form.session.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDate = !filterDate || form.createdAt.startsWith(filterDate);
    
    return matchesSearch && matchesDate;
  });

  const exportToPDF = (form: PreJobTrainingForm) => {
    // Fonction pour exporter le formulaire en PDF
    window.print();
  };

  const deleteForm = async (formId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce formulaire ?')) {
      try {
        const response = await fetch(`/api/admin/pre-job-training?id=${formId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          alert('Formulaire supprimé avec succès');
          fetchForms(); // Recharger la liste
        } else {
          const error = await response.json();
          alert(`Erreur: ${error.error}`);
        }
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression du formulaire');
      }
    }
  };

  const getPermitTypes = (permitType: any) => {
    const types = [];
    if (permitType.cold) types.push('Cold');
    if (permitType.hot) types.push('Hot');
    if (permitType.notFlame) types.push('Not Flame');
    if (permitType.flame) types.push('Flame');
    return types.join(', ') || 'Aucun';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="text-lg">Chargement des formulaires...</div>
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
            <h1 className="text-2xl font-bold text-gray-900">Gestion des Formulaires de Formation Pré-Travail</h1>
            <p className="text-gray-600 mt-1">Visualisez et gérez tous les formulaires soumis par les utilisateurs</p>
          </div>

          {/* Filtres */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-64">
                <label className="block text-sm font-medium text-gray-700 mb-1">Rechercher</label>
                <input
                  type="text"
                  placeholder="Nom, email, session..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="min-w-48">
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => { setSearchTerm(''); setFilterDate(''); }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Réinitialiser
                </button>
              </div>
            </div>
          </div>

          {selectedForm ? (
            /* Vue détaillée du formulaire */
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Détails du Formulaire</h2>
                  <p className="text-gray-600">Utilisateur: {selectedForm.userName} • {new Date(selectedForm.createdAt).toLocaleDateString('fr-FR')}</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => exportToPDF(selectedForm)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Exporter PDF
                  </button>
                  <button
                    onClick={() => deleteForm(selectedForm.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    Supprimer
                  </button>
                  <button
                    onClick={() => setSelectedForm(null)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                  >
                    Retour
                  </button>
                </div>
              </div>

              {/* Informations générales */}
              {/* <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Informations Générales</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium text-gray-700">Session:</span> {selectedForm.session}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">N° Permis:</span> {selectedForm.permitNumber}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Type de permis:</span> {getPermitTypes(selectedForm.permitType)}
                  </div>
                </div>
              </div> */}

              {/* Descriptions et risques */}
              {/* <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Descriptions et Risques</h3>
                <div className="space-y-4">
                  <div>
                    <span className="font-medium text-gray-700">Description de la tâche:</span>
                    <p className="mt-1 text-gray-600">{selectedForm.taskDescription || 'Non spécifié'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Identification d'incidents/dangers:</span>
                    <p className="mt-1 text-gray-600">{selectedForm.incidentIdentification || 'Non spécifié'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Conséquences:</span>
                    <p className="mt-1 text-gray-600">{selectedForm.consequences || 'Non spécifié'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Mesures de sécurité:</span>
                    <p className="mt-1 text-gray-600">{selectedForm.securityMeasures || 'Non spécifié'}</p>
                  </div>
                </div>
              </div> */}

              {/* Document complet du formulaire */}
              <div className="bg-white border border-gray-300 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-4">Document Complet</h3>
                
                {/* A4 landscape canvas */}
                <div className="mx-auto bg-white shadow" style={{ width: '1123px', minHeight: '794px' }}>
                  {/* Outer padding matching the form margins */}
                  <div className="p-4">
                    {/* Top icon strip */}
                    <div className="grid grid-cols-8 gap-4 mb-2">
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-12 h-12 border border-gray-300 rounded bg-white" />
                        <span className="text-[10px] font-medium text-gray-800 text-center leading-tight">Ancrages</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-12 h-12 border border-gray-300 rounded bg-white" />
                        <span className="text-[10px] font-medium text-gray-800 text-center leading-tight">Facteur de chute</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-12 h-12 border border-gray-300 rounded bg-white" />
                        <span className="text-[10px] font-medium text-gray-800 text-center leading-tight">Port des EPI</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-12 h-12 border border-gray-300 rounded bg-white" />
                        <span className="text-[10px] font-medium text-gray-800 text-center leading-tight">Gestion du matériel</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-16 h-16 border border-gray-300 bg-white" />
                        <span className="text-[10px] font-medium text-gray-800 leading-tight">QR</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-12 h-12 border border-gray-300 rounded bg-white" />
                        <span className="text-[10px] font-medium text-gray-800 text-center leading-tight">Objet tombant</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-12 h-12 border border-gray-300 rounded bg-white" />
                        <span className="text-[10px] font-medium text-gray-800 text-center leading-tight">Montage/étriers</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-12 h-12 border border-gray-300 rounded bg-white" />
                        <span className="text-[10px] font-medium text-gray-800 text-center leading-tight">Esprit d'équipe</span>
                      </div>
                    </div>

                    {/* Title block */}
                    <table className="w-full border-collapse mb-2">
                      <tbody>
                        <tr>
                          <Th>Title</Th>
                          <Td>CI.DES PRE JOB TRAINING FORM</Td>
                          <Th className="w-28">REVISION</Th>
                          <Td className="w-20">00</Td>
                        </tr>
                        <tr>
                          <Th>Numéro :</Th>
                          <Td>ENR-CIFRA-HSE 021</Td>
                          <Th>CREATION DATE</Th>
                          <Td>09/10/2023</Td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Instruction box */}
                    <div className="border border-gray-400 p-2 mb-3">
                      <p className="text-[11px] font-semibold underline mb-1">
                        En tant que Superviseur d'accès sur corde et Responsable HSE, avant de démarrer les interventions, procédons à la réunion pré-intervention avec l'équipe :
                      </p>
                      <ol className="text-[11px] space-y-0.5 list-decimal list-inside">
                        <li>Je m'assure que nous sommes en possession du permis de travail validé par toutes les personnes compétentes, si applicable pour ce lieu d'intervention.</li>
                        <li>Je m'assure d'être en possession de tous les documents complémentaires (ARO, procédure générale pour le travail en hauteur sur corde, technique de secours, fiche de tâche et mode opératoire), si applicable.</li>
                        <li>L'ensemble de l'équipe a lu le permis et est informé de l'intervention.</li>
                        <li>Les mesures préventives requises par mon permis sont en place et appliquées sur le site.</li>
                        <li>Vérifier : l'état des harnais de suspension / que les harnais sont correctement équipés et que le matériel nécessaire est connecté et prêt à l'emploi / veillez à ce que les outils soient attachés pour éviter les chutes.</li>
                        <li>Vérifier que les harnais sont correctement portés et ajustés pour chaque membre de l'équipe.</li>
                      </ol>
                    </div>

                    {/* Permit / description / risks row */}
                    <table className="w-full border-collapse mb-3">
                      <tbody>
                        <tr>
                          <Th className="w-24">Session :</Th>
                          <Td className="w-48">{selectedForm.session}</Td>
                          <Th className="w-28">N° Permis :</Th>
                          <Td className="w-48">{selectedForm.permitNumber}</Td>
                          <Th className="w-28">Type de permis :</Th>
                          <Td className="w-[360px]">
                            <div className="grid grid-cols-5 gap-3 text-[11px] items-center">
                              <div className="grid grid-cols-[1fr_auto] gap-2">
                                <div className="text-[11px] font-semibold text-gray-800">cold</div>
                                <div className={`border border-gray-400 h-5 w-5 ${selectedForm.permitType.cold ? 'bg-black' : 'bg-white'}`}></div>
                              </div>
                              <div className="grid grid-cols-[1fr_auto] gap-2">
                                <div className="text-[11px] font-semibold text-gray-800">Hot</div>
                                <div className={`border border-gray-400 h-5 w-5 ${selectedForm.permitType.hot ? 'bg-black' : 'bg-white'}`}></div>
                              </div>
                              <div className="grid grid-cols-[1fr_auto] gap-2">
                                <div className="text-[11px] font-semibold text-gray-800">Not Flame</div>
                                <div className={`border border-gray-400 h-5 w-5 ${selectedForm.permitType.notFlame ? 'bg-black' : 'bg-white'}`}></div>
                              </div>
                              <div className="grid grid-cols-[1fr_auto] gap-2">
                                <div className="text-[11px] font-semibold text-gray-800">Flame</div>
                                <div className={`border border-gray-400 h-5 w-5 ${selectedForm.permitType.flame ? 'bg-black' : 'bg-white'}`}></div>
                              </div>
                              <div />
                            </div>
                          </Td>
                        </tr>
                        <tr>
                          <Th>Description de la tâche du jour :</Th>
                          <Td colSpan={5}>
                            <div className="text-xs px-1 py-1 min-h-[2rem]">
                              {selectedForm.taskDescription || 'Non spécifié'}
                            </div>
                          </Td>
                        </tr>
                        <tr>
                          <Th>Identification d'incidents / dangers :</Th>
                          <Td colSpan={2}>
                            <div className="text-xs px-1 py-1 min-h-[2rem]">
                              {selectedForm.incidentIdentification || 'Non spécifié'}
                            </div>
                          </Td>
                          <Th>Conséquences : Accident / Risque :</Th>
                          <Td>
                            <div className="text-xs px-1 py-1 min-h-[2rem]">
                              {selectedForm.consequences || 'Non spécifié'}
                            </div>
                          </Td>
                          <Th>Mesures de sécurité :</Th>
                          <Td>
                            <div className="text-xs px-1 py-1 min-h-[2rem]">
                              {selectedForm.securityMeasures || 'Non spécifié'}
                            </div>
                          </Td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Big matrix table */}
                    <table className="w-full border-collapse">
                      <thead>
                        <tr>
                          <Th className="w-24 text-center">Position</Th>
                          <Th className="w-40 text-center">Nom</Th>
                          {daysOfWeek.map((day) => (
                            <Th key={day} className="text-center w-20">{day}<div className="text-[10px] font-normal">date :</div></Th>
                          ))}
                        </tr>
                        {/* Row with vertical labels */}
                        <tr>
                          <Td className="text-center font-semibold">&nbsp;</Td>
                          <Td className="text-center font-semibold">&nbsp;</Td>
                          {daysOfWeek.map((day, dayIndex) => (
                            <Td key={day} className="h-24 p-0">
                              <div className="h-24 w-full flex items-center justify-center">
                                <span className="vertical-label">{categories[dayIndex] || ''}</span>
                              </div>
                            </Td>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {/* Rows for each position level */}
                        {selectedForm.attendees.map((attendee, attendeeIndex) => (
                          <tr key={attendeeIndex}>
                            <Td className="h-8 text-center font-semibold">{attendee.position}</Td>
                            <Td className="text-xs px-1">
                              {attendee.name || 'Non spécifié'}
                            </Td>
                            {daysOfWeek.map((day) => (
                              <Td key={day} className="text-center p-1">
                                <div className="h-16 w-full border border-gray-300 bg-gray-50">
                                  {attendee.signatures[day] ? (
                                    <div className="h-full w-full flex items-center justify-center">
                                      <img 
                                        src={attendee.signatures[day]} 
                                        alt="Signature" 
                                        className="h-12 w-auto max-w-full object-contain"
                                      />
                                    </div>
                                  ) : (
                                    <div className="h-full w-full flex items-center justify-center text-gray-400 text-xs">
                                      Non signé
                                    </div>
                                  )}
                                </div>
                              </Td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Footer */}
                    <div className="flex items-end justify-between text-[10px] text-gray-700 mt-2">
                      <span>Page 1 sur 1</span>
                      <div className="text-center">
                        <div>CI.DES sasu &nbsp;&nbsp; Capital 2 500 Euros</div>
                        <div>SIRET: 87840789900011 &nbsp;&nbsp; VAT: FR71878407899</div>
                        <div className="italic">Uncontrolled copy printed</div>
                      </div>
                      <span>EF294b234964f4222b6cb6a2c60c02c985744ce573cd8aa58afee76de8b202ce0</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Liste des formulaires */
            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  {filteredForms.length} formulaire{filteredForms.length > 1 ? 's' : ''} trouvé{filteredForms.length > 1 ? 's' : ''}
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr>
                      <Th>Utilisateur</Th>
                      <Th>Email</Th>
                      <Th>Session</Th>
                      <Th>N° Permis</Th>
                      <Th>Type Permis</Th>
                      <Th>Date de création</Th>
                      <Th>Actions</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredForms.length === 0 ? (
                      <tr>
                        <Td colSpan={7} className="text-center py-8 text-gray-500">
                          Aucun formulaire trouvé
                        </Td>
                      </tr>
                    ) : (
                      filteredForms.map((form) => (
                        <tr key={form.id} className="hover:bg-gray-50">
                          <Td className="font-medium">{form.userName}</Td>
                          <Td>{form.userEmail}</Td>
                          <Td>{form.session}</Td>
                          <Td>{form.permitNumber}</Td>
                          <Td>{getPermitTypes(form.permitType)}</Td>
                          <Td>{new Date(form.createdAt).toLocaleDateString('fr-FR')}</Td>
                          <Td>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setSelectedForm(form)}
                                className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                              >
                                Voir
                              </button>
                              <button
                                onClick={() => exportToPDF(form)}
                                className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                              >
                                PDF
                              </button>
                              <button
                                onClick={() => deleteForm(form.id)}
                                className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                              >
                                Supprimer
                              </button>
                            </div>
                          </Td>
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

      <style jsx>{`
        .font-handwriting {
          font-family: 'Brush Script MT', cursive, sans-serif;
        }
        .vertical-label {
          writing-mode: vertical-rl;
          transform: rotate(180deg);
          font-size: 10px;
          font-weight: 600;
          color: #374151; /* gray-700 */
          text-align: center;
        }
      `}</style>
    </div>
  );
}
