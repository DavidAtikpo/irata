// Script pour tester que Weglot peut accéder à toutes les pages
const pages = [
  '/',
  '/financement-participatif',
  '/formations',
  '/demande',
  '/contact',
  '/login',
  '/register',
  '/weglot-test',
  '/user/dashboard',
  '/user/profile',
  '/admin/dashboard',
];

async function testWeglotPages() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  
  console.log('🧪 Test des pages pour Weglot...\n');
  
  for (const page of pages) {
    try {
      const url = `${baseUrl}${page}`;
      console.log(`📄 Test: ${url}`);
      
      // Simuler une requête pour vérifier que la page est accessible
      const response = await fetch(url, {
        method: 'HEAD',
        headers: {
          'User-Agent': 'Weglot-Bot/1.0'
        }
      });
      
      if (response.ok) {
        console.log(`✅ ${page} - Accessible (${response.status})`);
      } else {
        console.log(`❌ ${page} - Erreur (${response.status})`);
      }
    } catch (error) {
      console.log(`❌ ${page} - Erreur: ${error.message}`);
    }
  }
  
  console.log('\n🎯 Pages à ajouter manuellement dans Weglot:');
  console.log('- /user/* (pages protégées par authentification)');
  console.log('- /admin/* (pages d\'administration)');
  console.log('- /gestionnaire/* (pages gestionnaire)');
  console.log('\n💡 Conseil: Utilisez le sitemap.xml pour aider Weglot à découvrir vos pages');
}

// Exécuter le test si le script est appelé directement
if (require.main === module) {
  testWeglotPages().catch(console.error);
}

module.exports = { testWeglotPages };






















