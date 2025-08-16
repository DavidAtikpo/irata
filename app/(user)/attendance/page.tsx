"use client";
import React, { useState, useEffect } from "react";
import { useSession } from 'next-auth/react';
import SignaturePad from '@/components/SignaturePad';

export default function AttendanceForm() {
  const { data: session } = useSession();
  const [userName, setUserName] = useState('');
  const [sessionName, setSessionName] = useState('');
  const [signatures, setSignatures] = useState<Record<string, string>>({});
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [currentSignatureKey, setCurrentSignatureKey] = useState('');
  
  const daysOfWeek = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  
  const trainees = Array(12).fill({
    qrCode: "NA",
    level: "",
    name: "",
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const r = await fetch('/api/user/profile');
        if (r.ok) {
          const data = await r.json();
          const fullName = [data?.prenom, data?.nom].filter(Boolean).join(' ').trim();
          if (fullName) setUserName(fullName);
        }
      } catch {}
    };
    
    const fetchSession = async () => {
      try {
        const r = await fetch('/api/user/training-session');
        if (r.ok) {
          const data = await r.json();
          if (data?.name) setSessionName(data.name);
        }
      } catch {}
    };
    
    const fetchExistingSignatures = async () => {
      try {
        const response = await fetch('/api/user/attendance-signatures');
        if (response.ok) {
          const data = await response.json();
          setSignatures(data.signatures || {});
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des signatures:', error);
      }
    };
    
    fetchUserProfile();
    fetchSession();
    fetchExistingSignatures();
  }, []);

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
          userId: session?.user?.id
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
      `}</style>
      {/* Header */}
      <table style={{ width: "100%" }}>
        <tbody>
          <tr>
            <td colSpan={2} className="text-left">
              <span className="font-bold">Titre</span> <br /> FORMULAIRE DE PRÉSENCE CI.DES
            </td>
            <td colSpan={3} className="text-left">
              <span className="font-bold">Révision</span> <br /> 01
            </td>
          </tr>
          <tr>
            <td colSpan={2} className="text-left">
              <span className="font-bold">Numéro de Code</span> <br /> ENR-CIFRA-LOG 002
            </td>
            <td colSpan={3} className="text-left">
              <span className="font-bold">Date de Création</span> <br /> 09/10/2023
            </td>
          </tr>
        </tbody>
      </table>

      {/* Training info */}
      <table style={{ width: "100%", marginTop: "10px" }}>
        <thead>
          <tr>
            <th>Formation:</th>
            <th colSpan={2}>{sessionName}</th>
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
              <td rowSpan={2}>Formation</td>
              <td rowSpan={2}>{userName || 'Utilisateur'}</td>
              <td className="bg-gray">
                <span className="font-bold">Matin: 4 h</span>
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
          <li><strong>Modification :</strong> Cliquez sur une signature existante pour la modifier</li>
          <li><strong>Indicateurs :</strong> Les cases vertes (✓) indiquent une présence confirmée</li>
          <li><strong>Synchronisation :</strong> Utilisez le bouton "Actualiser" pour voir les signatures générées depuis le suivi stagiaire</li>
        </ul>
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
