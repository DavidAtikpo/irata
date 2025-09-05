// Configuration Weglot pour l'application
export const WEGLOT_CONFIG = {
  apiKey: 'wg_e97ec5714272b275569ce52f31c49ce26',
  originalLanguage: 'fr',
  destinationLanguages: ['en'],
  // Configuration pour Next.js
  strategy: 'afterInteractive' as const,
  // Options avancées Weglot
  options: {
    // Activer la détection automatique de la langue
    autoSwitch: true,
    // Afficher le sélecteur de langue
    showLanguageSelector: true,
    // Position du sélecteur de langue
    languageSelectorPosition: 'bottom-right',
    // Exclure certains éléments de la traduction
    excludedElements: ['.no-translate'],
    // Inclure les attributs alt des images
    translateImages: true,
    // Mode de traduction
    translationMode: 'auto',
  }
};

// Fonction utilitaire pour initialiser Weglot
export const initializeWeglot = () => {
  if (typeof window !== 'undefined' && window.Weglot) {
    window.Weglot.initialize({
      api_key: WEGLOT_CONFIG.apiKey,
      ...WEGLOT_CONFIG.options
    });
  }
};

// Fonction pour changer de langue manuellement
export const switchLanguage = (language: string) => {
  if (typeof window !== 'undefined' && window.Weglot) {
    window.Weglot.switchTo(language);
  }
};

// Déclaration des types pour TypeScript
declare global {
  interface Window {
    Weglot: {
      initialize: (config: any) => void;
      switchTo: (language: string) => void;
    };
  }
}
