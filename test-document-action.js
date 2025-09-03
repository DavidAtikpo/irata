// Script de test pour l'API des actions de documents
const testDocumentAction = async () => {
  try {
    console.log('🧪 Test de l\'API Document Action...');
    
    // Simuler une requête vers l'API
    const response = await fetch('/api/documents/test-doc-id/action', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: 'OPENED' }),
    });
    
    console.log('📡 Réponse de l\'API:', response.status, response.statusText);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Succès:', data);
    } else {
      const error = await response.text();
      console.log('❌ Erreur:', error);
    }
    
  } catch (error) {
    console.error('💥 Erreur lors du test:', error);
  }
};

// Exécuter le test
testDocumentAction();
