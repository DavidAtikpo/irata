'use client';

import { useState } from 'react';

export default function WeglotTestButton() {
  const [testResult, setTestResult] = useState('');

  const testWeglot = () => {
    if (typeof window !== 'undefined' && window.Weglot) {
      try {
        // Tester la traduction en anglais
        window.Weglot.switchTo('en');
        setTestResult('✅ Traduction en anglais activée');
        
        // Revenir en français après 3 secondes
        setTimeout(() => {
          window.Weglot.switchTo('fr');
          setTestResult('✅ Retour en français');
        }, 3000);
      } catch (error) {
        setTestResult('❌ Erreur: ' + (error instanceof Error ? error.message : 'Erreur inconnue'));
      }
    } else {
      setTestResult('❌ Weglot n\'est pas disponible');
    }
  };

  const testPortuguese = () => {
    if (typeof window !== 'undefined' && window.Weglot) {
      try {
        window.Weglot.switchTo('pt');
        setTestResult('✅ Traduction en portugais activée');
      } catch (error) {
        setTestResult('❌ Erreur: ' + (error instanceof Error ? error.message : 'Erreur inconnue'));
      }
    } else {
      setTestResult('❌ Weglot n\'est pas disponible');
    }
  };

  const testGerman = () => {
    if (typeof window !== 'undefined' && window.Weglot) {
      try {
        window.Weglot.switchTo('de');
        setTestResult('✅ Traduction en allemand activée');
      } catch (error) {
        setTestResult('❌ Erreur: ' + (error instanceof Error ? error.message : 'Erreur inconnue'));
      }
    } else {
      setTestResult('❌ Weglot n\'est pas disponible');
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg border">
      <h3 className="font-bold text-lg mb-4">🧪 Test de traduction Weglot</h3>
      
      <div className="space-y-2 mb-4">
        <button
          onClick={testWeglot}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          🇬🇧 Tester traduction EN
        </button>
        
        <button
          onClick={testPortuguese}
          className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          🇵🇹 Tester traduction PT
        </button>
        
        <button
          onClick={testGerman}
          className="w-full px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          🇩🇪 Tester traduction DE
        </button>
      </div>
      
      {testResult && (
        <div className="p-2 bg-gray-100 rounded text-sm">
          {testResult}
        </div>
      )}
      
      <div className="mt-4 text-xs text-gray-600">
        <p><strong>Instructions :</strong></p>
        <p>1. Cliquez sur un bouton de test</p>
        <p>2. Vérifiez que le contenu de la page se traduit</p>
        <p>3. Le texte devrait changer de langue</p>
      </div>
    </div>
  );
}

// Types Weglot déclarés ailleurs dans le projet

