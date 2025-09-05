'use client';

import { useState, useEffect } from 'react';

interface LanguageSelectorProps {
  className?: string;
}

export default function LanguageSelector({ className = '' }: LanguageSelectorProps) {
  const [currentLanguage, setCurrentLanguage] = useState('fr');
  const [isWeglotLoaded, setIsWeglotLoaded] = useState(false);

  useEffect(() => {
    // Vérifier si Weglot est chargé
    const checkWeglot = () => {
      if (typeof window !== 'undefined' && window.Weglot) {
        setIsWeglotLoaded(true);
        // Détecter la langue actuelle via l'URL ou le localStorage
        const currentLang = window.location.pathname.startsWith('/en') ? 'en' : 'fr';
        setCurrentLanguage(currentLang);
      } else {
        setTimeout(checkWeglot, 100);
      }
    };
    
    checkWeglot();
  }, []);

  const switchLanguage = (language: string) => {
    if (typeof window !== 'undefined' && window.Weglot) {
      window.Weglot.switchTo(language);
      setCurrentLanguage(language);
    }
  };

  if (!isWeglotLoaded) {
    return null;
  }

  return (
    <div className={`language-selector ${className}`}>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => switchLanguage('fr')}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
            currentLanguage === 'fr'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          🇫🇷 FR
        </button>
        <button
          onClick={() => switchLanguage('en')}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
            currentLanguage === 'en'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          🇬🇧 EN
        </button>
      </div>
    </div>
  );
}

// Déclaration des types pour TypeScript
declare global {
  interface Window {
    Weglot: {
      initialize: (config: any) => void;
      switchTo: (language: string) => void;
    };
  }
}
