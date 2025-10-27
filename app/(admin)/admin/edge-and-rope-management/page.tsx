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
  
  // États pour le formulaire Toolbox Talk
  const [toolboxData, setToolboxData] = useState({
    site: '',
    date: '',
    reason: '',
    startTime: '',
    finishTime: '',
    session: '', // Session sélectionnée
    mattersRaised: [
      { matter: '', action: '' },
      { matter: '', action: '' },
      { matter: '', action: '' }
    ],
    comments: ''
  });
  const [isSavingToolbox, setIsSavingToolbox] = useState(false);
  const [toolboxRecordId, setToolboxRecordId] = useState<string | null>(null);
  const [existingToolboxData, setExistingToolboxData] = useState<any>(null);
  
  // États pour la gestion des signatures utilisateurs
  const [userSignatures, setUserSignatures] = useState<any[]>([]);
  const [loadingSignatures, setLoadingSignatures] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState<string | null>(null);
  const [sessionFilter, setSessionFilter] = useState<string>('');
  const [availableSessions, setAvailableSessions] = useState<string[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [showImages, setShowImages] = useState(false); // Pour afficher/cacher les images

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
      // Charger les données existantes du Toolbox Talk
      fetchExistingToolboxData();
      // Charger les sessions disponibles
      fetchAvailableSessions();
      // Charger les signatures des utilisateurs
      fetchUserSignatures();
    }
  }, [session]);

  // Recharger les signatures quand le filtre de session change
  useEffect(() => {
    if (session?.user?.role === 'ADMIN') {
      fetchUserSignatures();
    }
  }, [sessionFilter]);

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

  const handleToolboxDataChange = (field: string, value: any) => {
    setToolboxData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Fonction spéciale pour gérer le changement de session
  const handleSessionChange = async (sessionValue: string) => {
    // Réinitialiser la signature admin et les données liées si on change de session
    setAdminSignature('');
    setExistingToolboxData(null);
    setToolboxRecordId(null);
    setIsValidated(false);
    
    // Mettre à jour la session dans toolboxData
    handleToolboxDataChange('session', sessionValue);
    
    // Si une session est sélectionnée, charger les données existantes pour cette session
    if (sessionValue) {
      try {
        const response = await fetch('/api/admin/toolbox-talk');
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            // Chercher un Toolbox Talk pour cette session spécifique
            const sessionRecord = data.find((record: any) => record.session === sessionValue);
            if (sessionRecord) {
              setExistingToolboxData(sessionRecord);
              setToolboxRecordId(sessionRecord.id);
              
              // Pré-remplir les champs avec les données existantes
              setToolboxData({
                site: sessionRecord.site || toolboxData.site,
                date: sessionRecord.date ? new Date(sessionRecord.date).toISOString().split('T')[0] : toolboxData.date,
                reason: sessionRecord.reason || toolboxData.reason,
                startTime: sessionRecord.startTime || toolboxData.startTime,
                finishTime: sessionRecord.finishTime || toolboxData.finishTime,
                session: sessionValue,
                mattersRaised: sessionRecord.mattersRaised && Array.isArray(sessionRecord.mattersRaised) 
                  ? sessionRecord.mattersRaised.map((matter: any) => ({
                      matter: matter.matter || '',
                      action: matter.action || ''
                    }))
                  : toolboxData.mattersRaised,
                comments: sessionRecord.comments || toolboxData.comments
              });
              
              // Pré-remplir la signature admin si elle existe
              if (sessionRecord.adminSignature) {
                setAdminSignature(sessionRecord.adminSignature);
              }
            }
          }
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des données pour la session:', error);
      }
    }
  };

  const handleMatterChange = (index: number, field: 'matter' | 'action', value: string) => {
    setToolboxData(prev => ({
      ...prev,
      mattersRaised: prev.mattersRaised.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const saveToolboxTalk = async () => {
    if (!toolboxData.site || !toolboxData.date || !toolboxData.reason || !toolboxData.startTime || !toolboxData.finishTime) {
      alert('Veuillez remplir tous les champs requis du formulaire Toolbox Talk.');
      return;
    }

    if (!toolboxData.session) {
      alert('Veuillez sélectionner une session avant de sauvegarder le Toolbox Talk.');
      return;
    }

    if (!adminSignature) {
      alert('Veuillez signer avant de sauvegarder le Toolbox Talk.');
      return;
    }

    setIsSavingToolbox(true);
    try {
      const response = await fetch('/api/admin/toolbox-talk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...toolboxData,
          adminName,
          adminSignature,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setToolboxRecordId(result.id);
        // Mettre à jour le filtre de session et recharger les signatures
        setSessionFilter(toolboxData.session);
        // Recharger les signatures après la sauvegarde
        await fetchUserSignatures();
        alert('Toolbox Talk enregistré avec succès !');
      } else {
        throw new Error('Erreur lors de l\'enregistrement');
      }
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement:', error);
      alert('Erreur lors de l\'enregistrement du Toolbox Talk');
    } finally {
      setIsSavingToolbox(false);
    }
  };

  const publishToolboxTalk = async () => {
    if (!toolboxRecordId) {
      alert('Aucun Toolbox Talk à publier.');
      return;
    }

    try {
      const response = await fetch(`/api/admin/toolbox-talk/${toolboxRecordId}/publish`, {
        method: 'POST',
      });

      if (response.ok) {
        alert('Toolbox Talk publié avec succès ! Les utilisateurs peuvent maintenant le signer.');
        // Recharger les signatures après publication
        fetchUserSignatures();
      } else {
        throw new Error('Erreur lors de la publication');
      }
    } catch (error) {
      console.error('Erreur lors de la publication:', error);
      alert('Erreur lors de la publication du Toolbox Talk');
    }
  };

  // Fonction pour récupérer les données existantes du Toolbox Talk
  const fetchExistingToolboxData = async () => {
    try {
      const response = await fetch('/api/admin/toolbox-talk');
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          const latestRecord = data[0]; // Prendre le plus récent
          setExistingToolboxData(latestRecord);
          setToolboxRecordId(latestRecord.id);
          
          // Pré-remplir les champs avec les données existantes
          setToolboxData({
            site: latestRecord.site || '',
            date: latestRecord.date ? new Date(latestRecord.date).toISOString().split('T')[0] : '',
            reason: latestRecord.reason || '',
            startTime: latestRecord.startTime || '',
            finishTime: latestRecord.finishTime || '',
            session: latestRecord.session || '',
            mattersRaised: latestRecord.mattersRaised && Array.isArray(latestRecord.mattersRaised) 
              ? latestRecord.mattersRaised.map((matter: any) => ({
                  matter: matter.matter || '',
                  action: matter.action || ''
                }))
              : [
                  { matter: '', action: '' },
                  { matter: '', action: '' },
                  { matter: '', action: '' }
                ],
            comments: latestRecord.comments || ''
          });
          
          // Mettre à jour le filtre de session si une session existe
          if (latestRecord.session) {
            setSessionFilter(latestRecord.session);
          }
          
          // Pré-remplir la signature admin si elle existe
          if (latestRecord.adminSignature) {
            setAdminSignature(latestRecord.adminSignature);
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des données Toolbox Talk:', error);
    }
  };

  // Fonction pour récupérer les sessions disponibles
  const fetchAvailableSessions = async () => {
    setLoadingSessions(true);
    try {
      // Récupérer les sessions depuis l'API admin (même source que liste-presence)
      const response = await fetch('/api/admin/sessions');
      if (response.ok) {
        const data = await response.json();
        console.log('Sessions data:', data); // Debug
        
        // Combiner les sessions de TrainingSession et les sessions générales
        const trainingSessionsNames = data.trainingSessions?.map((s: any) => s.name) || [];
        const generalSessions = data.sessions || [];
        
        // Combiner et supprimer les doublons
        const allSessions = [...trainingSessionsNames, ...generalSessions];
        const uniqueSessions = Array.from(new Set(allSessions)).filter(Boolean);
        
        console.log('Available sessions:', uniqueSessions); // Debug
        setAvailableSessions(uniqueSessions);
      } else {
        console.error('Erreur API sessions:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des sessions:', error);
      // Fallback: récupérer les sessions depuis toolbox-talk
      try {
        const fallbackResponse = await fetch('/api/admin/toolbox-talk/signatures?sessions=true');
        if (fallbackResponse.ok) {
          const sessions = await fallbackResponse.json();
          setAvailableSessions(sessions);
        }
      } catch (fallbackError) {
        console.error('Erreur lors du fallback:', fallbackError);
      }
    } finally {
      setLoadingSessions(false);
    }
  };

  // Fonction pour récupérer les signatures des utilisateurs
  const fetchUserSignatures = async () => {
    setLoadingSignatures(true);
    try {
      const url = sessionFilter 
        ? `/api/admin/toolbox-talk/signatures?session=${encodeURIComponent(sessionFilter)}`
        : '/api/admin/toolbox-talk/signatures';
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setUserSignatures(data);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Erreur lors de la récupération des signatures:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        alert(`Erreur ${response.status}: ${errorData.message || 'Erreur lors de la récupération des signatures'}`);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des signatures:', error);
      alert('Erreur de connexion lors de la récupération des signatures');
    } finally {
      setLoadingSignatures(false);
    }
  };

  // Fonction pour télécharger le PDF d'un utilisateur
  const downloadUserPdf = async (recordId: string, userId: string, userName: string) => {
    setDownloadingPdf(`${recordId}-${userId}`);
    try {
      const response = await fetch('/api/admin/toolbox-talk/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recordId,
          userId
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `toolbox-talk-${userName.replace(/\s+/g, '-').toLowerCase()}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        throw new Error('Erreur lors du téléchargement');
      }
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      alert('Erreur lors du téléchargement du PDF');
    } finally {
      setDownloadingPdf(null);
    }
  };

  // Fonction pour télécharger le document complet (15 pages + Toolbox Talk)
  const downloadCompleteDocument = async (recordId: string, userId: string, userName: string) => {
    setDownloadingPdf(`complete-${recordId}-${userId}`);
    try {
      const response = await fetch('/api/admin/edge-and-rope-management/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recordId,
          userId
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `edge-and-rope-management-complet-${userName.replace(/\s+/g, '-').toLowerCase()}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        throw new Error('Erreur lors du téléchargement');
      }
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      alert('Erreur lors du téléchargement du document complet');
    } finally {
      setDownloadingPdf(null);
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Edge and Rope Management - Document Complet
        </h1>
        <button
          onClick={() => setShowImages(!showImages)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          {showImages ? 'Masquer les images' : 'Afficher les images'}
        </button>
      </div>

      {/* Section des signatures utilisateurs */}
      <div className="mb-8 bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-blue-800">
            📋 Signatures des Utilisateurs
          </h2>
          <div className="flex gap-3 items-center">
            <select
              value={sessionFilter}
              onChange={(e) => setSessionFilter(e.target.value)}
              disabled={loadingSessions}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm disabled:opacity-50"
            >
              <option value="">
                {loadingSessions ? 'Chargement des sessions...' : 'Toutes les sessions'}
              </option>
              {availableSessions.map((session) => (
                <option key={session} value={session}>
                  {session}
                </option>
              ))}
            </select>
            <button
              onClick={fetchUserSignatures}
              disabled={loadingSignatures}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {loadingSignatures ? 'Chargement...' : 'Actualiser'}
            </button>
          </div>
        </div>

        {loadingSignatures ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Chargement des signatures...</p>
          </div>
        ) : userSignatures.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Aucun Toolbox Talk publié ou aucune signature trouvée.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {userSignatures.map((record) => (
              <div key={record.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {record.topic} - {record.site}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Session: <span className="font-semibold text-blue-700">{record.session || 'N/A'}</span> | 
                      Date: {new Date(record.date).toLocaleDateString('fr-FR')} | 
                      Publié le: {new Date(record.publishedAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {record.signatures.length} signature{record.signatures.length > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {record.signatures.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="text-left p-3 border">Utilisateur</th>
                          <th className="text-left p-3 border">Email</th>
                          <th className="text-left p-3 border">Date de signature</th>
                          <th className="text-left p-3 border">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {record.signatures.map((signature: any) => (
                          <tr key={signature.id} className="border-b">
                            <td className="p-3 border">
                              <div className="font-medium">{signature.userName}</div>
                            </td>
                            <td className="p-3 border text-gray-600">
                              {signature.userEmail}
                            </td>
                            <td className="p-3 border text-gray-600">
                              {new Date(signature.signedAt).toLocaleDateString('fr-FR')} à {new Date(signature.signedAt).toLocaleTimeString('fr-FR')}
                            </td>
                            <td className="p-3 border">
                              <div className="flex gap-2">
                                {/* <button
                                  onClick={() => downloadUserPdf(record.id, signature.userId, signature.userName)}
                                  disabled={downloadingPdf === `${record.id}-${signature.userId}`}
                                  className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                >
                                  {downloadingPdf === `${record.id}-${signature.userId}` ? 'Génération...' : ''}
                                </button> */}
                                <button
                                  onClick={() => downloadUserPdf(record.id, signature.userId, signature.userName)}
                                  disabled={downloadingPdf === `${record.id}-${signature.userId}`}
                                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                  title="Télécharger le Toolbox Talk"
                                >
                                  {downloadingPdf === `${record.id}-${signature.userId}` ? 'Génération...' : '📄 Toolbox Talk'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    Aucune signature pour ce Toolbox Talk
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {showImages && (
        <div className="space-y-8 mb-8">
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
      </div>
      )}

      {/* Page 15: Formulaire interactif TOOLBOX TALK */}
      <div className="space-y-8">
        <div className="space-y-0">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-center mb-6 text-blue-800">
                TOOLBOX TALK - RECORD FORM
              </h2>
              
              {existingToolboxData && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600">ℹ️</span>
                    <span className="text-sm text-blue-800">
                      Données existantes chargées. Vous pouvez modifier les champs ci-dessous.
                    </span>
                  </div>
                </div>
              )}
              
              {/* Section Administrative */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Site:</label>
                  <input 
                    type="text" 
                    value={toolboxData.site}
                    onChange={(e) => handleToolboxDataChange('site', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date:</label>
                  <input 
                    type="date" 
                    value={toolboxData.date}
                    onChange={(e) => handleToolboxDataChange('date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Topic(s) for discussion:</label>
                  <input type="text" value="Toolbox Talk: Edge Management" readOnly className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Session *:</label>
                  <select
                    value={toolboxData.session}
                    onChange={(e) => handleSessionChange(e.target.value)}
                    disabled={loadingSessions}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    required
                  >
                    <option value="">
                      {loadingSessions ? 'Chargement des sessions...' : 'Sélectionnez une session'}
                    </option>
                    {availableSessions.map((session) => (
                      <option key={session} value={session}>
                        {session}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason for talk:</label>
                  <input 
                    type="text" 
                    value={toolboxData.reason}
                    onChange={(e) => handleToolboxDataChange('reason', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start time:</label>
                    <input 
                      type="time" 
                      value={toolboxData.startTime}
                      onChange={(e) => handleToolboxDataChange('startTime', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Finish time:</label>
                    <input 
                      type="time" 
                      value={toolboxData.finishTime}
                      onChange={(e) => handleToolboxDataChange('finishTime', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    />
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
                  {toolboxData.mattersRaised.map((item, index) => (
                    <div key={index} className="grid grid-cols-2 border-t border-gray-300">
                      <div className="p-3 border-r border-gray-300">
                        <textarea 
                          placeholder="Enter matter raised" 
                          value={item.matter}
                          onChange={(e) => handleMatterChange(index, 'matter', e.target.value)}
                          className="w-full border-none outline-none text-sm resize-none" 
                          rows={2}
                        ></textarea>
                      </div>
                      <div className="p-3">
                        <textarea 
                          placeholder="Enter action taken" 
                          value={item.action}
                          onChange={(e) => handleMatterChange(index, 'action', e.target.value)}
                          className="w-full border-none outline-none text-sm resize-none" 
                          rows={2}
                        ></textarea>
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
                
                {isValidated || (existingToolboxData && existingToolboxData.session === toolboxData.session) ? (
                  <div className="border border-green-300 rounded-md overflow-hidden bg-green-50">
                    <div className="bg-green-100 grid grid-cols-3 p-3 font-medium text-sm">
                      <div>Nom de l'administrateur</div>
                      <div>Signature</div>
                      <div>Date de validation</div>
                    </div>
                    <div className="grid grid-cols-3 border-t border-green-300">
                      <div className="p-3 border-r border-green-300">
                        <div className="text-sm font-medium text-green-800">{adminName || existingToolboxData?.adminName}</div>
                      </div>
                      <div className="p-3 border-r border-green-300">
                        {adminSignature || existingToolboxData?.adminSignature ? (
                          <img src={adminSignature || existingToolboxData?.adminSignature} alt="Signature Admin" className="w-24 h-8 object-contain" />
                        ) : (
                          <div className="w-24 h-8 border border-green-300 rounded bg-green-100 flex items-center justify-center text-xs text-green-600">
                            Signé
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <div className="text-sm text-green-800">
                          {existingToolboxData?.createdAt ? new Date(existingToolboxData.createdAt).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    </div>
                    <div className="p-3 bg-green-100 border-t border-green-300">
                      <div className="text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          {existingToolboxData?.isPublished ? '✓ Document publié' : '✓ Document enregistré'}
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
                      value={toolboxData.comments}
                      onChange={(e) => handleToolboxDataChange('comments', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      rows={4}
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Boutons d'action pour le Toolbox Talk */}
              <div className="mb-6 flex gap-4 justify-center">
                <button
                  onClick={saveToolboxTalk}
                  disabled={isSavingToolbox || !adminSignature}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSavingToolbox ? 'Enregistrement...' : 'Enregistrer Toolbox Talk'}
                </button>
                {toolboxRecordId && (
                  <button
                    onClick={publishToolboxTalk}
                    className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
                  >
                    Publier pour les utilisateurs
                  </button>
                )}
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
