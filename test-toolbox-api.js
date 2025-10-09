// Script de test pour les APIs Toolbox Talk
const testToolboxAPI = async () => {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🧪 Test des APIs Toolbox Talk...\n');

  // Test 1: Créer un Toolbox Talk (nécessite une session admin)
  console.log('1️⃣ Test de création d\'un Toolbox Talk...');
  
  const toolboxData = {
    site: 'Site de test',
    date: '2025-01-10',
    reason: 'Formation Edge Management',
    startTime: '09:00',
    finishTime: '17:00',
    mattersRaised: [
      { matter: 'Question sur la sécurité', action: 'Formation supplémentaire prévue' },
      { matter: 'Équipement manquant', action: 'Commande passée' },
      { matter: '', action: '' }
    ],
    comments: 'Session de formation réussie',
    adminName: 'Admin Test',
    adminSignature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
  };

  try {
    const response = await fetch(`${baseUrl}/api/admin/toolbox-talk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(toolboxData)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Toolbox Talk créé avec succès:', result.id);
      
      // Test 2: Publier le Toolbox Talk
      console.log('\n2️⃣ Test de publication du Toolbox Talk...');
      
      const publishResponse = await fetch(`${baseUrl}/api/admin/toolbox-talk/${result.id}/publish`, {
        method: 'POST'
      });

      if (publishResponse.ok) {
        console.log('✅ Toolbox Talk publié avec succès');
        
        // Test 3: Récupérer les Toolbox Talks publiés
        console.log('\n3️⃣ Test de récupération des Toolbox Talks...');
        
        const getResponse = await fetch(`${baseUrl}/api/user/toolbox-talk`);
        
        if (getResponse.ok) {
          const records = await getResponse.json();
          console.log('✅ Toolbox Talks récupérés:', records.length, 'enregistrement(s)');
          
          if (records.length > 0) {
            console.log('📋 Premier enregistrement:', {
              id: records[0].id,
              site: records[0].site,
              date: records[0].date,
              isPublished: records[0].isPublished
            });
          }
        } else {
          console.log('❌ Erreur lors de la récupération:', await getResponse.text());
        }
        
      } else {
        console.log('❌ Erreur lors de la publication:', await publishResponse.text());
      }
      
    } else {
      console.log('❌ Erreur lors de la création:', await response.text());
    }
    
  } catch (error) {
    console.log('❌ Erreur de connexion:', error.message);
    console.log('💡 Assurez-vous que le serveur Next.js est démarré (npm run dev)');
  }

  console.log('\n🏁 Test terminé');
};

// Exécuter le test
testToolboxAPI();
