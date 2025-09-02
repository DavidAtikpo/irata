/*
  File suggestion: app/cides-pre-job/page.tsx (App Router)
  Requires Tailwind CSS. This page renders an A4-landscape, print-ready replica of the provided form.
*/

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import SignaturePad from '@/components/SignaturePad';

// Reusable cell components that accept standard HTML table cell attributes (e.g., colSpan)
const Th: React.FC<React.PropsWithChildren<React.ThHTMLAttributes<HTMLTableCellElement>>> = ({ children, className, ...rest }) => (
  <th {...rest} className={`border border-gray-400 bg-gray-50 text-xs font-semibold px-2 py-1 text-left ${className || ''}`}>{children}</th>
);

const Td: React.FC<React.PropsWithChildren<React.TdHTMLAttributes<HTMLTableCellElement>>> = ({ children, className, ...rest }) => (
  <td {...rest} className={`border border-gray-400 text-xs px-2 py-1 align-top ${className || ''}`}>{children}</td>
);

const IconSlot: React.FC<{ label: string }> = ({ label }) => (
  <div className="flex flex-col items-center gap-1">
    <div className="w-12 h-12 border border-gray-300 rounded bg-white" />
    <span className="text-[10px] font-medium text-gray-800 text-center leading-tight">{label}</span>
  </div>
);

const SmallBox: React.FC<React.PropsWithChildren<{ label?: string }>> = ({ children, label }) => (
  <div className="grid grid-cols-[1fr_auto] gap-2">
    <div className="text-[11px] font-semibold text-gray-800">{label}</div>
    <div className="border border-gray-400 h-5 w-5" aria-hidden />
  </div>
);

export default function CidesPreJobPage() {
  const { data: session } = useSession();
  const [formData, setFormData] = useState({
    session: '',
    permitNumber: '',
    permitType: { cold: false, hot: false, notFlame: false, flame: false },
    taskDescription: '',
    incidentIdentification: '',
    consequences: '',
    securityMeasures: '',
    attendees: [
      { position: 'Niveau 1', name: '', signatures: {} as Record<string, string> }
    ]
  });

  const [userName, setUserName] = useState('');
  const [sessionName, setSessionName] = useState('');
  const [userLevel, setUserLevel] = useState('1');
  const [modifiedSignatures, setModifiedSignatures] = useState<Set<string>>(new Set());
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [currentSignatureKey, setCurrentSignatureKey] = useState('');

  // Récupérer le nom et la session de l'utilisateur
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Récupérer le profil utilisateur
        const profileResponse = await fetch('/api/user/profile');
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          console.log('Profile data pre-job:', profileData); // Debug
          
          // Essayer plusieurs façons de récupérer le nom
          let fullName = '';
          if (profileData?.user?.prenom && profileData?.user?.nom) {
            fullName = `${profileData.user.prenom} ${profileData.user.nom}`;
          } else if (profileData?.user?.name) {
            fullName = profileData.user.name;
          } else if (profileData?.user?.nom) {
            fullName = profileData.user.nom;
          } else if (profileData?.user?.prenom) {
            fullName = profileData.user.prenom;
          }
          
          if (fullName) {
            setUserName(fullName);
          } else {
            console.error('Aucun nom trouvé dans les données:', profileData);
            setUserName(profileData?.user?.email || 'Utilisateur');
          }

          // Récupérer le niveau directement depuis le profil
          const userLevel = profileData?.user?.niveau || '1';
          setUserLevel(userLevel);
          
          // Créer la ligne correspondant au niveau de l'utilisateur
          setFormData(prev => ({
            ...prev,
            attendees: [
              { 
                position: `Niveau ${userLevel}`, 
                name: fullName || profileData?.user?.email || 'Utilisateur', 
                signatures: {} as Record<string, string> 
              }
            ]
          }));
        } else {
          console.error('Erreur API profile:', profileResponse.status);
        }

        // Récupérer la session de formation
        const sessionResponse = await fetch('/api/user/training-session');
        if (sessionResponse.ok) {
          const sessionData = await sessionResponse.json();
          if (sessionData && sessionData.name) {
            setSessionName(sessionData.name);
            setFormData(prev => ({ ...prev, session: sessionData.name }));
          } else {
            console.error('Aucune session trouvée dans les données:', sessionData);
          }
        } else {
          console.error('Erreur API training-session:', sessionResponse.status);
        }

        // Récupérer les signatures du Pre-Job Training
        const preJobSignaturesResponse = await fetch('/api/user/pre-job-training-signature');
        if (preJobSignaturesResponse.ok) {
          const preJobData = await preJobSignaturesResponse.json();
          if (preJobData.signatures && preJobData.signatures.length > 0) {
            // Mettre à jour les signatures dans le formulaire
            setFormData(prev => ({
              ...prev,
              attendees: prev.attendees.map((attendee) => {
                const updatedSignatures = { ...attendee.signatures };
                preJobData.signatures.forEach((sig: any) => {
                  updatedSignatures[sig.day] = sig.signatureData;
                  // Si c'est une signature automatique, on ne la marque pas comme modifiée
                  if (sig.autoSigned) {
                    const signatureKey = `0-${sig.day}`; // Toujours index 0 car une seule ligne
                    setModifiedSignatures(prev => {
                      const newSet = new Set(prev);
                      newSet.delete(signatureKey);
                      return newSet;
                    });
                  }
                });
                return { ...attendee, signatures: updatedSignatures };
              })
            }));
          } else {
            console.log('Aucune signature Pre-Job Training trouvée');
          }
        } else {
          console.error('Erreur API pre-job-training-signature:', preJobSignaturesResponse.status);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des données utilisateur:', error);
      }
    };

    fetchUserData();
  }, []);

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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePermitTypeChange = (type: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      permitType: { ...prev.permitType, [type]: checked }
    }));
  };

  const handleAttendeeChange = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      attendees: prev.attendees.map((attendee, i) => 
        i === index ? { ...attendee, [field]: value } : attendee
      )
    }));
  };

  const handleSignatureChange = (attendeeIndex: number, day: string, signature: string) => {
    setFormData(prev => ({
      ...prev,
      attendees: prev.attendees.map((attendee, i) => 
        i === attendeeIndex ? {
          ...attendee,
          signatures: {
            ...attendee.signatures,
            [day]: signature
          }
        } : attendee
      )
    }));

    // Marquer la signature comme modifiée
    const signatureKey = `${attendeeIndex}-${day}`;
    setModifiedSignatures(prev => {
      const newSet = new Set(prev);
      if (signature) {
        newSet.add(signatureKey);
      } else {
        newSet.delete(signatureKey);
      }
      return newSet;
    });
  };

  const handleSignatureClick = (attendeeIndex: number, day: string) => {
    const key = `${attendeeIndex}-${day}`;
    setCurrentSignatureKey(key);
    setShowSignatureModal(true);
  };

  const handleSignatureSave = (signatureData: string) => {
    if (!currentSignatureKey) return;
    
    const [attendeeIndex, day] = currentSignatureKey.split('-');
    const attendeeIndexNum = parseInt(attendeeIndex);
    
    handleSignatureChange(attendeeIndexNum, day, signatureData);
    setShowSignatureModal(false);
  };

  const clearSignature = (attendeeIndex: number, day: string) => {
    if (confirm('Êtes-vous sûr de vouloir effacer cette signature ?')) {
      handleSignatureChange(attendeeIndex, day, '');
    }
  };

  const saveForm = async () => {
    try {
      // Sauvegarder les signatures manuelles modifiées
      const savePromises = Array.from(modifiedSignatures).map(async (signatureKey) => {
        const [attendeeIndex, day] = signatureKey.split('-');
        const attendeeIndexNum = parseInt(attendeeIndex);
        const signatureData = formData.attendees[attendeeIndexNum]?.signatures[day];
        
        if (signatureData) {
          const response = await fetch('/api/user/pre-job-training-signature', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              day: day,
              signatureData: signatureData,
              userId: session?.user?.id,
              userName: userName,
              autoSigned: false // Signature manuelle
            }),
          });
          
          if (!response.ok) {
            throw new Error(`Erreur lors de la sauvegarde de la signature pour ${day}`);
          }
        }
      });

      await Promise.all(savePromises);
      alert('Signatures sauvegardées avec succès !');
      
      // Vider la liste des signatures modifiées
      setModifiedSignatures(new Set());
      
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la sauvegarde des signatures');
    }
  };

  return (
    <main className="min-h-screen w-full bg-neutral-100 p-2 sm:p-4 print:bg-white">
      {/* A4 landscape canvas - responsive */}
      <div className="mx-auto bg-white shadow print:shadow-none w-full max-w-full sm:max-w-4xl lg:max-w-6xl xl:max-w-7xl" style={{ minHeight: '794px', maxWidth: '1123px' }}>
        {/* Outer padding matching the form margins */}
        <div className="p-2 sm:p-4">
          {/* Top icon strip - responsive */}
          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2 sm:gap-4 mb-2">
            <IconSlot label="Ancrages" />
            <IconSlot label="Facteur de chute" />
            <IconSlot label="Port des EPI" />
            <IconSlot label="Gestion du matériel" />
            <div className="flex flex-col items-center gap-1">
              <div className="w-12 h-12 sm:w-16 sm:h-16 border border-gray-300 bg-white" />
              <span className="text-[8px] sm:text-[10px] font-medium text-gray-800 leading-tight">QR</span>
            </div>
            <IconSlot label="Objet tombant" />
            <IconSlot label="Montage/étriers" />
            <IconSlot label="Esprit d'équipe" />
          </div>

          {/* Title block - responsive */}
          <table className="w-full border-collapse mb-2 text-xs sm:text-sm">
            <tbody>
              <tr>
                <Th className="w-16 sm:w-20">Title</Th>
                <Td className="text-xs sm:text-sm">CI.DES PRE JOB TRAINING FORM</Td>
                <Th className="w-16 sm:w-28">REVISION</Th>
                <Td className="w-12 sm:w-20">00</Td>
              </tr>
              <tr>
                <Th className="w-16 sm:w-20">Numéro :</Th>
                <Td className="text-xs sm:text-sm">ENR-CIFRA-HSE 021</Td>
                <Th className="w-16 sm:w-20">CREATION DATE</Th>
                <Td className="text-xs sm:text-sm">09/10/2023</Td>
              </tr>
            </tbody>
          </table>

          {/* Instruction box - responsive */}
          <div className="border border-gray-400 p-2 mb-3">
            <p className="text-[10px] sm:text-[11px] font-semibold underline mb-1">
              En tant que Superviseur d'accès sur corde et Responsable HSE, avant de démarrer les interventions, procédons à la réunion pré-intervention avec l'équipe :
            </p>
            <ol className="text-[9px] sm:text-[11px] space-y-0.5 list-decimal list-inside">
              <li>Je m'assure que nous sommes en possession du permis de travail validé par toutes les personnes compétentes, si applicable pour ce lieu d'intervention.</li>
              <li>Je m'assure d'être en possession de tous les documents complémentaires (ARO, procédure générale pour le travail en hauteur sur corde, technique de secours, fiche de tâche et mode opératoire), si applicable.</li>
              <li>L'ensemble de l'équipe a lu le permis et est informé de l'intervention.</li>
              <li>Les mesures préventives requises par mon permis sont en place et appliquées sur le site.</li>
              <li>Vérifier : l'état des harnais de suspension / que les harnais sont correctement équipés et que le matériel nécessaire est connecté et prêt à l'emploi / veillez à ce que les outils soient attachés pour éviter les chutes.</li>
              <li>Vérifier que les harnais sont correctement portés et ajustés pour chaque membre de l'équipe.</li>
            </ol>
          </div>

          {/* Permit / description / risks row - responsive */}
          <table className="w-full border-collapse mb-3">
            <tbody>
              <tr className="flex flex-col sm:table-row">
                <Th className="w-full sm:w-24">Session :</Th>
                <Td className="w-full sm:w-48">
                  <input 
                    type="text" 
                    value={formData.session}
                    onChange={(e) => handleInputChange('session', e.target.value)}
                    className="w-full h-full border-none outline-none text-xs px-1"
                  />
                </Td>
                <Th className="w-full sm:w-28">N° Permis :</Th>
                <Td className="w-full sm:w-48">
                  <input 
                    type="text" 
                    value={formData.permitNumber}
                    onChange={(e) => handleInputChange('permitNumber', e.target.value)}
                    className="w-full h-full border-none outline-none text-xs px-1"
                  />
                </Td>
                <Th className="w-full sm:w-28">Type de permis :</Th>
                <Td className="w-full sm:w-auto">
                  <div className="flex flex-wrap gap-2 sm:gap-3 text-[10px] sm:text-[11px] items-center">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <div className="text-[10px] sm:text-[11px] font-semibold text-gray-800">cold</div>
                      <input 
                        type="checkbox" 
                        checked={formData.permitType.cold}
                        onChange={(e) => handlePermitTypeChange('cold', e.target.checked)}
                        className="border border-gray-400 h-4 w-4 sm:h-5 sm:w-5"
                      />
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <div className="text-[10px] sm:text-[11px] font-semibold text-gray-800">Hot</div>
                      <input 
                        type="checkbox" 
                        checked={formData.permitType.hot}
                        onChange={(e) => handlePermitTypeChange('hot', e.target.checked)}
                        className="border border-gray-400 h-4 w-4 sm:h-5 sm:w-5"
                      />
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <div className="text-[10px] sm:text-[11px] font-semibold text-gray-800">Not Flame</div>
                      <input 
                        type="checkbox" 
                        checked={formData.permitType.notFlame}
                        onChange={(e) => handlePermitTypeChange('notFlame', e.target.checked)}
                        className="border border-gray-400 h-4 w-4 sm:h-5 sm:w-5"
                      />
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <div className="text-[10px] sm:text-[11px] font-semibold text-gray-800">Flame</div>
                      <input 
                        type="checkbox" 
                        checked={formData.permitType.flame}
                        onChange={(e) => handlePermitTypeChange('flame', e.target.checked)}
                        className="border border-gray-400 h-4 w-4 sm:h-5 sm:w-5"
                      />
                    </div>
                  </div>
                </Td>
              </tr>
              <tr className="flex flex-col sm:table-row">
                <Th className="w-full sm:w-auto">Description de la tâche du jour :</Th>
                <Td className="w-full sm:col-span-5">
                  <textarea 
                    value={formData.taskDescription}
                    onChange={(e) => handleInputChange('taskDescription', e.target.value)}
                    className="w-full h-full border-none outline-none text-xs px-1 resize-none"
                    rows={2}
                  />
                </Td>
              </tr>
              <tr className="flex flex-col sm:table-row">
                <Th className="w-full sm:w-auto">Identification d'incidents / dangers :</Th>
                <Td className="w-full sm:col-span-2">
                  <textarea 
                    value={formData.incidentIdentification}
                    onChange={(e) => handleInputChange('incidentIdentification', e.target.value)}
                    className="w-full h-full border-none outline-none text-xs px-1 resize-none"
                    rows={2}
                  />
                </Td>
                <Th className="w-full sm:w-auto">Conséquences : Accident / Risque :</Th>
                <Td className="w-full sm:w-auto">
                  <textarea 
                    value={formData.consequences}
                    onChange={(e) => handleInputChange('consequences', e.target.value)}
                    className="w-full h-full border-none outline-none text-xs px-1 resize-none"
                    rows={2}
                  />
                </Td>
                <Th className="w-full sm:w-auto">Mesures de sécurité :</Th>
                <Td className="w-full sm:w-auto">
                  <textarea 
                    value={formData.securityMeasures}
                    onChange={(e) => handleInputChange('securityMeasures', e.target.value)}
                    className="w-full h-full border-none outline-none text-xs px-1 resize-none"
                    rows={2}
                  />
                </Td>
              </tr>
            </tbody>
          </table>

          {/* Big matrix table - responsive */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[800px] sm:min-w-full">
              <thead>
                <tr>
                  <Th className="w-20 sm:w-24 text-center">Position</Th>
                  <Th className="w-32 sm:w-40 text-center">Nom</Th>
                  {daysOfWeek.map((day) => (
                    <Th key={day} className="text-center w-16 sm:w-20">
                      <div className="text-[8px] sm:text-[10px]">{day}</div>
                      <div className="text-[6px] sm:text-[8px] font-normal">date :</div>
                    </Th>
                  ))}
                </tr>
                {/* Row with vertical labels */}
                <tr>
                  <Td className="text-center font-semibold">&nbsp;</Td>
                  <Td className="text-center font-semibold">&nbsp;</Td>
                  {daysOfWeek.map((day, dayIndex) => (
                    <Td key={day} className="h-20 sm:h-24 p-0">
                      <div className="h-20 sm:h-24 w-full flex items-center justify-center">
                        <span className="vertical-label text-[8px] sm:text-[10px]">{categories[dayIndex] || ''}</span>
                      </div>
                    </Td>
                  ))}
                </tr>
                            </thead>
              <tbody>
                {/* Rows for each position level */}
                {formData.attendees.map((attendee, attendeeIndex) => (
                  <tr key={attendeeIndex}>
                    <Td className="h-8 text-center font-semibold text-[10px] sm:text-xs">{attendee.position}</Td>
                    <Td>
                      <input 
                        type="text" 
                        value={attendee.name}
                        onChange={(e) => handleAttendeeChange(attendeeIndex, 'name', e.target.value)}
                        className="w-full h-full border-none outline-none text-[10px] sm:text-xs px-1"
                        placeholder="Nom"
                      />
                    </Td>
                                     {daysOfWeek.map((day) => {
                     const signatureKey = `${attendeeIndex}-${day}`;
                     const isModified = modifiedSignatures.has(signatureKey);
                     const hasSignature = attendee.signatures[day];
                     const isAutoSigned = hasSignature && !isModified; // Signature automatique si pas modifiée manuellement
                     
                     return (
                       <Td key={day} className="text-center p-1">
                         <div className={`h-12 sm:h-16 w-full border relative group cursor-pointer ${
                           isModified 
                             ? 'border-green-400 bg-green-50' 
                             : isAutoSigned
                             ? 'border-blue-400 bg-blue-50'
                             : 'border-gray-300 bg-gray-50'
                         }`}
                         onClick={() => handleSignatureClick(attendeeIndex, day)}
                         title={isAutoSigned ? "Signature automatique (attendance matin)" : isModified ? "Signature manuelle" : "Cliquer pour signer"}>
                           {hasSignature ? (
                             <div className="h-full w-full flex items-center justify-center relative">
                               <img 
                                 src={attendee.signatures[day]} 
                                 alt="Signature" 
                                 className="h-8 sm:h-12 w-auto max-w-full object-contain"
                               />
                               <button
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   clearSignature(attendeeIndex, day);
                                 }}
                                 className="absolute top-0 right-0 text-red-500 text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 rounded px-1"
                                 title="Effacer la signature"
                               >
                                 ×
                               </button>
                               {isModified && (
                                 <div className="absolute bottom-0 left-0 w-2 h-2 bg-green-500 rounded-full"></div>
                               )}
                               {isAutoSigned && (
                                 <div className="absolute bottom-0 right-0 w-2 h-2 bg-blue-500 rounded-full" title="Signature automatique"></div>
                               )}
                             </div>
                           ) : (
                             <div className="h-full w-full flex items-center justify-center text-gray-400 text-[8px] sm:text-xs">
                               Cliquer pour signer
                             </div>
                           )}
                         </div>
                       </Td>
                     );
                   })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

          {/* Informations automatiques - responsive */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md print:hidden">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">Informations automatiquement remplies :</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-sm">
              <div>
                <span className="font-medium text-blue-700">Utilisateur :</span>
                <span className="ml-2 text-blue-600">{userName || 'Chargement...'}</span>
              </div>
              <div>
                <span className="font-medium text-blue-700">Niveau :</span>
                <span className="ml-2 text-blue-600">Niveau {userLevel}</span>
              </div>
              <div>
                <span className="font-medium text-blue-700">Session :</span>
                <span className="ml-2 text-blue-600">{sessionName || 'Chargement...'}</span>
              </div>
            </div>
            <p className="text-xs text-blue-600 mt-2">
              Ces informations sont automatiquement récupérées depuis votre profil et votre session de formation.
            </p>
          </div>

          {/* Instructions pour les signatures - responsive */}
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md print:hidden">
            <h3 className="text-sm font-semibold text-green-800 mb-2">Instructions pour les signatures :</h3>
            <div className="text-sm text-green-700 space-y-1">
              <p>• <strong>Niveau utilisateur :</strong> Vous êtes affiché dans la ligne correspondant à votre niveau (Niveau {userLevel})</p>
              <p>• <strong>Signature automatique :</strong> Quand vous signez l'attendance du matin, le Pre-Job Training est automatiquement signé (bordure bleue, point bleu)</p>
              <p>• <strong>Ajouter une signature :</strong> Cliquez dans une case vide pour ouvrir le pad de signature</p>
              <p>• <strong>Modifier une signature :</strong> Cliquez sur une signature existante pour la modifier</p>
              <p>• <strong>Effacer une signature :</strong> Survolez une signature et cliquez sur le "×" rouge</p>
              <p>• <strong>Signature manuelle :</strong> Dessinez votre signature avec la souris ou le doigt</p>
              <p>• <strong>Sauvegarder :</strong> Cliquez sur "Sauvegarder le formulaire" pour enregistrer vos signatures manuelles</p>
              <p>• <strong>Indicateurs visuels :</strong> 
                <br/>- Bordure verte + point vert = signature modifiée manuellement (à sauvegarder)
                <br/>- Bordure bleue + point bleu = signature automatique (attendance matin)
                <br/>- Bordure grise = case vide
              </p>
            </div>
          </div>

          {/* Boutons d'action - responsive */}
          <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4 mt-6 print:hidden">
            <button
              onClick={saveForm}
              className="px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base"
            >
              Sauvegarder le formulaire
            </button>
            <button
              onClick={() => window.print()}
              className="px-4 sm:px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium text-sm sm:text-base"
            >
              Imprimer
            </button>
          </div>

          {/* Footer - responsive */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between text-[8px] sm:text-[10px] text-gray-700 mt-2 space-y-1 sm:space-y-0">
            <span>Page 1 sur 1</span>
            <div className="text-center">
              <div>CI.DES sasu &nbsp;&nbsp; Capital 2 500 Euros</div>
              <div>SIRET: 87840789900011 &nbsp;&nbsp; VAT: FR71878407899</div>
              <div className="italic">Uncontrolled copy printed</div>
            </div>
            <span className="text-[6px] sm:text-[8px] break-all">EF294b234964f4222b6cb6a2c60c02c985744ce573cd8aa58afee76de8b202ce0</span>
          </div>
        </div>
      </div>

       {/* Modal SignaturePad - responsive */}
       {showSignatureModal && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
           <div className="bg-white rounded-lg p-4 sm:p-6 max-w-sm sm:max-w-md w-full">
             <h3 className="text-base sm:text-lg font-semibold mb-4">Signature</h3>
             <SignaturePad
               onSave={handleSignatureSave}
               initialValue={currentSignatureKey ? formData.attendees[parseInt(currentSignatureKey.split('-')[0])]?.signatures[currentSignatureKey.split('-')[1]] : ''}
               width={300}
               height={120}
             />
             <div className="flex justify-end mt-4">
               <button
                 onClick={() => setShowSignatureModal(false)}
                 className="px-3 sm:px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors text-sm sm:text-base"
               >
                 Annuler
               </button>
             </div>
           </div>
         </div>
       )}

      {/* Print helpers */}
      <style jsx>{`
        @media print {
          @page { size: A4 landscape; margin: 10mm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
        .vertical-label {
          writing-mode: vertical-rl;
          transform: rotate(180deg);
          font-size: 8px;
          font-weight: 600;
          color: #374151; /* gray-700 */
          text-align: center;
        }
        .font-handwriting {
          font-family: 'Brush Script MT', cursive, sans-serif;
        }
        
        /* Mobile optimizations */
        @media (max-width: 640px) {
          .vertical-label {
            font-size: 6px;
          }
        }
      `}</style>
    </main>
  );
}
