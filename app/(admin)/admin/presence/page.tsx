"use client";
import React, { useState, useEffect } from "react";
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import SignaturePad from '../../../../components/SignaturePad';

export default function AttendanceForm() {
  const { data: session } = useSession();
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [userLevel, setUserLevel] = useState('');
  const [sessionName, setSessionName] = useState('');
  const [signatures, setSignatures] = useState<Record<string, string>>({});
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [currentSignatureKey, setCurrentSignatureKey] = useState('');
  const [availableSessions, setAvailableSessions] = useState<string[]>([]);
  const [selectedSession, setSelectedSession] = useState('');
  
  const daysOfWeek = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  
  const trainees = Array(12).fill({
    qrCode: "NA",
    level: "",
    name: "",
  });

  const fetchExistingSignatures = async (sessionToFetch?: string) => {
    try {
      const sessionToUse = sessionToFetch || selectedSession || sessionName;
      if (!sessionToUse) {
        return;
      }
      
      const response = await fetch('/api/user/attendance-signatures', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionName: sessionToUse
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setSignatures({});
        setSignatures(data.signatures || {});
      } else {
        setSignatures({});
      }
    } catch (error) {
      setSignatures({});
    }
  };

  useEffect(() => {
    // Rediriger l'admin vers la page de gestion des présences
    if (session?.user?.role === 'ADMIN') {
      router.push('/admin/liste-presence');
      return;
    }

    const fetchUserProfile = async () => {
      try {
        const r = await fetch('/api/user/profile');
        if (r.ok) {
          const data = await r.json();
          console.log('Profile data attendance:', data); // Debug
          
          // Essayer plusieurs façons de récupérer le nom
          let fullName = '';
          if (data?.user?.prenom && data?.user?.nom) {
            fullName = `${data.user.prenom} ${data.user.nom}`;
          } else if (data?.user?.name) {
            fullName = data.user.name;
          } else if (data?.user?.nom) {
            fullName = data.user.nom;
          } else if (data?.user?.prenom) {
            fullName = data.user.prenom;
          }
          
          if (fullName) {
            setUserName(fullName);
          } else {
            console.error('Aucun nom trouvé dans les données:', data);
          }

          // Récupérer le niveau directement depuis le profil
          if (data?.user?.niveau) {
            setUserLevel(data.user.niveau);
          }
        } else {
          console.error('Erreur API profile:', r.status);
        }
      } catch (error) {
        console.error('Erreur lors du chargement du profil:', error);
      }
    };
    
    const fetchSession = async () => {
      try {
        const r = await fetch('/api/user/training-session');
        if (r.ok) {
          const data = await r.json();
          if (data?.name) {
            setSessionName(data.name);
            setSelectedSession(data.name);
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement de la session:', error);
      }
    };

    const fetchAvailableSessions = async () => {
      try {
        const r = await fetch('/api/admin/training-sessions');
        if (r.ok) {
          const data = await r.json();
          const sessions = data.map((s: any) => s.name);
          setAvailableSessions(sessions);
          
          // Si c'est un admin et qu'il n'a pas de session, sélectionner automatiquement la session du mois actuel
          if (session?.user?.role === 'ADMIN' && !sessionName && sessions.length > 0) {
            const currentMonth = new Date().toLocaleDateString('fr-FR', { month: 'long' });
            const currentYear = new Date().getFullYear();
            
            // Chercher une session du mois actuel avec le format "2025 octobre du 20 au 24 (Examen 25)"
            const currentMonthSession = sessions.find((sessionName: string) => 
              sessionName.includes(currentYear.toString()) && 
              sessionName.toLowerCase().includes(currentMonth.toLowerCase())
            );
            
            if (currentMonthSession) {
              setSelectedSession(currentMonthSession);
              setSessionName(currentMonthSession);
              // Récupérer les signatures pour la session sélectionnée
              fetchExistingSignatures(currentMonthSession);
            } else {
              // Si aucune session du mois actuel, prendre la première disponible
              setSelectedSession(sessions[0]);
              setSessionName(sessions[0]);
              // Récupérer les signatures pour la première session
              fetchExistingSignatures(sessions[0]);
            }
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des sessions disponibles:', error);
      }
    };

    fetchUserProfile();
    fetchSession();
    fetchAvailableSessions();
    // fetchExistingSignatures(); // Sera appelé après la sélection de session
  }, [session, router]);

  const handleSignatureClick = (day: string, period: string) => {
    const key = `${day}-${period}`;
    setCurrentSignatureKey(key);
    setShowSignatureModal(true);
  };

  const handleSignatureSave = async (signatureData: string) => {
    if (!currentSignatureKey) return;
    
    setSignatures(prev => ({
      ...prev,
      [currentSignatureKey]: signatureData
    }));
    
    setShowSignatureModal(false);
    
    // Sauvegarder la signature d'attendance
    try {
      const response = await fetch('/api/user/attendance-signatures', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          signatureKey: currentSignatureKey,
          signatureData: signatureData,
          userId: session?.user?.id,
          sessionName: selectedSession // Ajouter la session sélectionnée pour l'admin
        }),
      });
      
      if (response.ok) {
        console.log('Signature d\'attendance sauvegardée');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la signature d\'attendance:', error);
    }
    
    // Mettre à jour automatiquement le système de suivi des stagiaires
    await updateTraineeProgress(currentSignatureKey);
    
    // Si c'est une signature du matin, signer automatiquement le Pre-Job Training
    const [day, period] = currentSignatureKey.split('-');
    if (period === 'matin') {
      await signPreJobTraining(day, signatureData);
    }
  };

  const updateTraineeProgress = async (signatureKey: string) => {
    try {
      const [day, period] = signatureKey.split('-');
      const dayMapping: Record<string, string> = {
        'Lundi': 'J1',
        'Mardi': 'J2', 
        'Mercredi': 'J3',
        'Jeudi': 'J4',
        'Vendredi': 'J5'
      };
      
      const mappedDay = dayMapping[day];
      if (!mappedDay) return; // Seulement J1-J5 pour le suivi
      
      const response = await fetch('/api/user/trainee-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          traineeId: session?.user?.id,
          day: mappedDay,
          period: period, // 'matin' ou 'soir'
          signed: true,
          signatureData: signatures[signatureKey]
        }),
      });
      
      if (response.ok) {
        console.log(`Progression mise à jour pour ${day} ${period}`);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la progression:', error);
    }
  };

  const signPreJobTraining = async (day: string, signatureData: string) => {
    try {
      const response = await fetch('/api/user/pre-job-training-signature', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          day: day,
          signatureData: signatureData,
          userId: session?.user?.id,
          userName: userName
        }),
      });
      
      if (response.ok) {
        console.log(`Pre-Job Training signé automatiquement pour ${day}`);
      } else {
        console.error('Erreur lors de la signature automatique du Pre-Job Training');
      }
    } catch (error) {
      console.error('Erreur lors de la signature automatique du Pre-Job Training:', error);
    }
  };

  // Fonction pour gérer le changement de session
  const handleSessionChange = async (newSession: string) => {
    setSelectedSession(newSession);
    setSessionName(newSession);
    
    // Récupérer les signatures pour la nouvelle session
    await fetchExistingSignatures(newSession);
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <style jsx>{`
        table {
          border-collapse: collapse;
          border: 1px solid #000;
        }
        td, th {
          border: 1px solid #000;
          padding: 5px;
          text-align: center;
        }
        .text-left {
          text-align: left;
        }
        .bg-gray {
          background-color: #f0f0f0;
        }
        .font-bold {
          font-weight: bold;
        }
        
        /* Styles pour mobile */
        @media (max-width: 768px) {
          .desktop-only {
            display: none;
          }
          .mobile-only {
            display: block;
          }
        }
        
        @media (min-width: 769px) {
          .desktop-only {
            display: block;
          }
          .mobile-only {
            display: none;
          }
        }
        
        .mobile-card {
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          margin-bottom: 16px;
          padding: 16px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .mobile-header {
          background: #f8f9fa;
          border-radius: 6px;
          padding: 12px;
          margin-bottom: 16px;
        }
        
        .mobile-day-title {
          font-size: 18px;
          font-weight: bold;
          text-align: center;
          margin-bottom: 16px;
          color: #333;
        }
        
        .mobile-period {
          background: #f0f0f0;
          border-radius: 6px;
          padding: 12px;
          margin-bottom: 12px;
        }
        
        .mobile-period-title {
          font-weight: bold;
          margin-bottom: 8px;
          color: #555;
        }
        
        .mobile-signature-btn {
          width: 100%;
          padding: 12px;
          border: 2px dashed #3b82f6;
          background: transparent;
          color: #3b82f6;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .mobile-signature-btn:hover {
          background: #eff6ff;
          border-color: #2563eb;
        }
        
        .mobile-signature-img {
          height: 60px;
          width: auto;
          border: 1px solid #ddd;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .mobile-info-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
          margin-bottom: 16px;
        }
        
        .mobile-info-item {
          background: #f8f9fa;
          padding: 8px 12px;
          border-radius: 4px;
          border: 1px solid #e9ecef;
        }
        
        .mobile-info-label {
          font-weight: bold;
          color: #495057;
          font-size: 12px;
        }
        
        .mobile-info-value {
          color: #212529;
          font-size: 14px;
          margin-top: 4px;
        }
      `}</style>

      {/* Version mobile responsive */}
      <div className="mobile-only">
        <div style={{ padding: "16px" }}>
          {/* Header mobile */}
          <div className="mobile-header">
            <div style={{ textAlign: "center", marginBottom: "16px" }}>
              <h2 style={{ margin: "0", fontSize: "20px", fontWeight: "bold" }}>
                FORMULAIRE DE PRÉSENCE CI.DES
              </h2>
              <p style={{ margin: "8px 0 0 0", fontSize: "14px", color: "#666" }}>
                Révision: 01 | Code: ENR-CIFRA-LOG 002
              </p>
            </div>
            
            {/* Informations de formation mobile */}
            <div className="mobile-info-grid">
              <div className="mobile-info-item">
                <div className="mobile-info-label">Formation</div>
                {session?.user?.role === 'ADMIN' ? (
                  <select 
                    value={selectedSession} 
                    onChange={(e) => handleSessionChange(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px',
                      marginTop: '4px'
                    }}
                  >
                    <option value="">Sélectionner une session</option>
                    {availableSessions.map((sessionName) => (
                      <option key={sessionName} value={sessionName}>
                        {sessionName}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="mobile-info-value">{sessionName || 'Chargement...'}</div>
                )}
              </div>
              <div className="mobile-info-item">
                <div className="mobile-info-label">Site</div>
                <div className="mobile-info-value">Centre CI.DES</div>
              </div>
              <div className="mobile-info-item">
                <div className="mobile-info-label">Période</div>
                <div className="mobile-info-value">
                  {new Date().toLocaleDateString('fr-FR', { month: 'long' })} {new Date().getFullYear()}
                </div>
              </div>
            </div>
            
            {/* Informations stagiaire mobile */}
            <div style={{ 
              background: "#e3f2fd", 
              padding: "12px", 
              borderRadius: "6px",
              border: "1px solid #90caf9"
            }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                <div>
                  <div style={{ fontSize: "12px", color: "#1976d2", fontWeight: "bold" }}>QR Code</div>
                  <div style={{ fontSize: "14px", color: "#1565c0" }}>QR</div>
                </div>
                <div>
                  <div style={{ fontSize: "12px", color: "#1976d2", fontWeight: "bold" }}>Niveau</div>
                  <div style={{ fontSize: "14px", color: "#1565c0" }}>{userLevel || 'Formation'}</div>
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <div style={{ fontSize: "12px", color: "#1976d2", fontWeight: "bold" }}>Nom du Stagiaire</div>
                  <div style={{ fontSize: "14px", color: "#1565c0" }}>{userName || 'Utilisateur'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Jours de la semaine mobile */}
          {daysOfWeek.map((day) => (
            <div key={day} className="mobile-card">
              <div className="mobile-day-title">{day}</div>
              
              {/* Matin */}
              <div className="mobile-period">
                <div className="mobile-period-title">Matin: 4h</div>
                <div style={{ textAlign: "center" }}>
                  {signatures[`${day}-matin`] ? (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <img 
                        src={signatures[`${day}-matin`]} 
                        alt="Signature matin" 
                        className="mobile-signature-img"
                        onClick={() => handleSignatureClick(day, 'matin')}
                      />
                      <div style={{ 
                        fontSize: "12px", 
                        color: "#10b981", 
                        marginTop: "4px",
                        fontWeight: "bold"
                      }}>
                        ✓ Présent
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleSignatureClick(day, 'matin')}
                      className="mobile-signature-btn"
                    >
                      ✍️ Signer la présence
                    </button>
                  )}
                </div>
              </div>
              
              {/* Après-midi */}
              <div className="mobile-period">
                <div className="mobile-period-title">Après-midi: 4h</div>
                <div style={{ textAlign: "center" }}>
                  {signatures[`${day}-soir`] ? (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <img 
                        src={signatures[`${day}-soir`]} 
                        alt="Signature après-midi" 
                        className="mobile-signature-img"
                        onClick={() => handleSignatureClick(day, 'soir')}
                      />
                      <div style={{ 
                        fontSize: "12px", 
                        color: "#10b981", 
                        marginTop: "4px",
                        fontWeight: "bold"
                      }}>
                        ✓ Présent
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleSignatureClick(day, 'soir')}
                      className="mobile-signature-btn"
                    >
                      ✍️ Signer la présence
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Footer mobile */}
          <div style={{ 
            textAlign: "center", 
            fontSize: "12px", 
            color: "#666",
            marginTop: "20px",
            padding: "16px",
            background: "#f8f9fa",
            borderRadius: "6px"
          }}>
            <div style={{ fontWeight: "bold" }}>CI.DES sasu – Capital 2 500 Euros</div>
            <div>SIRET: 87840789900011 – VAT: FR71878407899</div>
          </div>

          {/* Bouton d'actualisation mobile */}
          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <button
              onClick={() => {
                window.location.reload();
              }}
              style={{
                width: "100%",
                padding: "14px 20px",
                backgroundColor: "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                cursor: "pointer",
                fontWeight: "500"
              }}
            >
              🔄 Actualiser les signatures
            </button>
          </div>

          {/* Instructions mobile */}
          <div style={{ 
            marginTop: "20px", 
            padding: "16px", 
            backgroundColor: "#eff6ff", 
            border: "1px solid #bfdbfe", 
            borderRadius: "8px" 
          }}>
            <h3 style={{ margin: "0 0 12px 0", color: "#1e40af", fontSize: "16px" }}>Instructions :</h3>
            <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "13px", lineHeight: "1.5" }}>
              <li style={{ marginBottom: "8px" }}><strong>Signatures automatiques :</strong> Quand vous cochez un jour dans "Suivi Stagiaire", les signatures d'attendance sont créées automatiquement</li>
              <li style={{ marginBottom: "8px" }}><strong>Signatures manuelles :</strong> Vous pouvez aussi signer directement dans chaque case (matin et après-midi)</li>
              <li style={{ marginBottom: "8px" }}><strong>Pre-Job Training automatique :</strong> Quand vous signez l'attendance du matin, le Pre-Job Training est automatiquement signé pour le même jour</li>
              <li style={{ marginBottom: "8px" }}><strong>Modification :</strong> Cliquez sur une signature existante pour la modifier</li>
              <li style={{ marginBottom: "8px" }}><strong>Indicateurs :</strong> Les cases vertes (✓) indiquent une présence confirmée</li>
              <li><strong>Synchronisation :</strong> Utilisez le bouton "Actualiser" pour voir les signatures générées depuis le suivi stagiaire</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Version desktop originale */}
      <div className="desktop-only">
        {/* Header */}
        <table style={{ width: "100%" }}>
          <tbody>
            <tr>
                             <td colSpan={2} className="text-left">
                 <div className="font-bold">Titre</div> <br /> FORMULAIRE DE PRÉSENCE CI.DES
               </td>
               <td colSpan={3} className="text-left">
                 <div className="font-bold">Révision</div> <br /> 01
               </td>
            </tr>
            <tr>
                             <td colSpan={2} className="text-left">
                 <div className="font-bold">Numéro de Code</div> <br /> ENR-CIFRA-LOG 002
               </td>
               <td colSpan={3} className="text-left">
                 <div className="font-bold">Date de Création</div> <br /> 09/10/2023
               </td>
            </tr>
          </tbody>
        </table>

        {/* Training info */}
        <table style={{ width: "100%", marginTop: "10px" }}>
          <thead>
            <tr>
              <th>Formation:</th>
              <th colSpan={2}>
                {session?.user?.role === 'ADMIN' ? (
                  <select 
                    value={selectedSession} 
                    onChange={(e) => handleSessionChange(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '4px',
                      border: '1px solid #ddd',
                      borderRadius: '2px',
                      fontSize: '12px'
                    }}
                  >
                    <option value="">Sélectionner une session</option>
                    {availableSessions.map((sessionName) => (
                      <option key={sessionName} value={sessionName}>
                        {sessionName}
                      </option>
                    ))}
                  </select>
                ) : (
                  sessionName
                )}
              </th>
              <th>Site:</th>
              <th colSpan={2}>Centre CI.DES</th>
              <th>Mois:</th>
              <th>{new Date().toLocaleDateString('fr-FR', { month: 'long' })}</th>
              <th>Année:</th>
              <th>{new Date().getFullYear()}</th>
            </tr>
            <tr>
              <th>QR Code</th>
              <th>Niveau</th>
              <th>Nom du Stagiaire</th>
              <th>Libellé</th>
              <th colSpan={7}>Jours de Formation</th>
              <th>Total Jour</th>
              <th>Visa Stagiaire</th>
              <th>Visa Formateur</th>
              <th>Visa Formateur</th>
            </tr>
            <tr>
              <th></th>
              <th></th>
              <th></th>
              <th></th>
              {daysOfWeek.map((day) => (
                <th key={day}>{day}</th>
              ))}
              <th></th>
              <th></th>
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <React.Fragment>
              <tr>
                <td rowSpan={2}>QR</td>
                <td rowSpan={2}>{userLevel || 'Formation'}</td>
                <td rowSpan={2}>{userName || 'Utilisateur'}</td>
                                 <td className="bg-gray">
                   <div className="font-bold">Matin: 4 h</div>
                 </td>
                {daysOfWeek.map((day) => (
                  <td key={`${day}-matin`} className="text-center">
                    {signatures[`${day}-matin`] ? (
                      <div className="flex flex-col items-center">
                        <img 
                          src={signatures[`${day}-matin`]} 
                          alt="Signature" 
                          className="h-6 w-auto cursor-pointer"
                          onClick={() => handleSignatureClick(day, 'matin')}
                        />
                        <span className="text-xs text-green-600">✓</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleSignatureClick(day, 'matin')}
                        className="w-full h-8 border border-dashed border-gray-400 text-xs text-gray-500 hover:bg-gray-100"
                      >
                        Signer
                      </button>
                    )}
                  </td>
                ))}
                <td rowSpan={2}></td>
                <td rowSpan={2}></td>
                <td rowSpan={2}></td>
                <td rowSpan={2}></td>
              </tr>
              <tr>
                <td className="bg-gray">
                  <span className="font-bold">Après-midi: 4 h</span>
                </td>
                {daysOfWeek.map((day) => (
                  <td key={`${day}-soir`} className="text-center">
                    {signatures[`${day}-soir`] ? (
                      <div className="flex flex-col items-center">
                        <img 
                          src={signatures[`${day}-soir`]} 
                          alt="Signature" 
                          className="h-6 w-auto cursor-pointer"
                          onClick={() => handleSignatureClick(day, 'soir')}
                        />
                        <span className="text-xs text-green-600">✓</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleSignatureClick(day, 'soir')}
                        className="w-full h-8 border border-dashed border-gray-400 text-xs text-gray-500 hover:bg-gray-100"
                      >
                        Signer
                      </button>
                    )}
                  </td>
                ))}
              </tr>
            </React.Fragment>
          </tbody>
        </table>

        {/* Footer */}
        <div style={{ marginTop: "10px", fontSize: "12px" }}>
          CI.DES sasu – Capital 2 500 Euros <br />
          SIRET: 87840789900011 – VAT: FR71878407899
        </div>

        {/* Bouton de rafraîchissement */}
        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <button
            onClick={() => {
              window.location.reload();
            }}
            style={{
              padding: "10px 20px",
              backgroundColor: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontSize: "14px",
              cursor: "pointer",
              fontWeight: "500"
            }}
          >
            🔄 Actualiser les signatures
          </button>
        </div>

        {/* Informations */}
        <div style={{ marginTop: "20px", padding: "15px", backgroundColor: "#f0f8ff", border: "1px solid #b0d4f1", borderRadius: "8px" }}>
          <h3 style={{ margin: "0 0 10px 0", color: "#1e40af" }}>Instructions :</h3>
          <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "14px" }}>
            <li><strong>Signatures automatiques :</strong> Quand vous cochez un jour dans "Suivi Stagiaire", les signatures d'attendance sont créées automatiquement</li>
            <li><strong>Signatures manuelles :</strong> Vous pouvez aussi signer directement dans chaque case (matin et après-midi)</li>
            <li><strong>Pre-Job Training automatique :</strong> Quand vous signez l'attendance du matin, le Pre-Job Training est automatiquement signé pour le même jour</li>
            <li><strong>Modification :</strong> Cliquez sur une signature existante pour la modifier</li>
            <li><strong>Indicateurs :</strong> Les cases vertes (✓) indiquent une présence confirmée</li>
            <li><strong>Synchronisation :</strong> Utilisez le bouton "Actualiser" pour voir les signatures générées depuis le suivi stagiaire</li>
          </ul>
        </div>
      </div>

      {/* Modal de signature */}
      {showSignatureModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "8px",
            maxWidth: "500px",
            width: "90%",
            maxHeight: "90%",
            overflow: "auto"
          }}>
            <h3 style={{ margin: "0 0 15px 0" }}>
              Signature - {currentSignatureKey.replace('-', ' ')}
            </h3>
            <SignaturePad
              onSave={handleSignatureSave}
              initialValue={signatures[currentSignatureKey] || ''}
              disabled={false}
            />
            <div style={{ marginTop: "15px", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                onClick={() => setShowSignatureModal(false)}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#6b7280",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
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
