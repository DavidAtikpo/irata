'use client';

import { useState, useEffect } from 'react';

export default function WeglotDiagnostic() {
  const [weglotStatus, setWeglotStatus] = useState('Vérification...');
  const [weglotInfo, setWeglotInfo] = useState<any>(null);

  useEffect(() => {
    const checkWeglot = () => {
      if (typeof window !== 'undefined') {
        if (window.Weglot) {
          setWeglotStatus('✅ Weglot est chargé');
          
          // Essayer de récupérer des informations sur Weglot
          try {
            const info = {
              isInitialized: true, // Weglot est chargé donc initialisé
              currentLanguage: 'Non disponible',
              availableLanguages: 'Non disponible'
            };
            setWeglotInfo(info);
          } catch (error) {
            setWeglotInfo({ error: 'Impossible de récupérer les infos' });
          }
        } else {
          setWeglotStatus('❌ Weglot n\'est pas chargé');
          setTimeout(checkWeglot, 500);
        }
      }
    };
    
    checkWeglot();
  }, []);

  const forceShowSelector = () => {
    if (typeof window !== 'undefined' && window.Weglot) {
      try {
        // Essayer de forcer l'affichage du sélecteur
        console.log('Tentative d\'affichage du sélecteur Weglot');
        // Note: Les méthodes exactes de Weglot peuvent varier selon la version
      } catch (error) {
        console.error('Erreur lors de l\'affichage du sélecteur:', error);
      }
    }
  };

  return (
    <div className="fixed top-4 left-4 bg-white p-4 rounded-lg shadow-lg border z-50 max-w-sm">
      <h3 className="font-bold text-sm mb-2">🔍 Diagnostic Weglot</h3>
      <p className="text-xs mb-2">{weglotStatus}</p>
      
      {weglotInfo && (
        <div className="text-xs mb-2">
          <p><strong>Initialisé:</strong> {weglotInfo.isInitialized ? 'Oui' : 'Non'}</p>
          <p><strong>Langue actuelle:</strong> {weglotInfo.currentLanguage}</p>
          <p><strong>Langues disponibles:</strong> {JSON.stringify(weglotInfo.availableLanguages)}</p>
        </div>
      )}
      
      <div className="space-y-2">
        <button
          onClick={forceShowSelector}
          className="w-full px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
        >
          Forcer l'affichage du sélecteur
        </button>
        
        <button
          onClick={() => window.location.reload()}
          className="w-full px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
        >
          Recharger la page
        </button>
      </div>
      
      <p className="text-xs mt-2 text-gray-600">
        Cherchez le sélecteur en bas à droite ou utilisez le bouton personnalisé ci-dessus.
      </p>
    </div>
  );
}

// Types Weglot déclarés ailleurs dans le projet

