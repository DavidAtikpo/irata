const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testFormulairesAPI() {
  try {
    console.log('🔍 Test de l\'API Formulaires Quotidiens...');
    
    // Vérifier si les tables existent
    console.log('\n📊 Vérification des tables...');
    
    // Compter les formulaires
    const formulairesCount = await prisma.formulairesQuotidiens.count();
    console.log(`✅ Formulaires: ${formulairesCount}`);
    
    // Compter les réponses
    const reponsesCount = await prisma.reponseFormulaire.count();
    console.log(`✅ Réponses: ${reponsesCount}`);
    
    // Vérifier la structure d'un formulaire
    if (formulairesCount > 0) {
      const formulaire = await prisma.formulairesQuotidiens.findFirst({
        include: {
          admin: {
            select: {
              nom: true,
              prenom: true,
              email: true
            }
          }
        }
      });
      
      console.log('\n📋 Exemple de formulaire:');
      console.log(`  - Titre: ${formulaire.titre}`);
      console.log(`  - Session: ${formulaire.session}`);
      console.log(`  - Questions: ${typeof formulaire.questions}`);
      console.log(`  - Admin: ${formulaire.admin.prenom} ${formulaire.admin.nom}`);
    }
    
    // Vérifier la structure d'une réponse
    if (reponsesCount > 0) {
      const reponse = await prisma.reponseFormulaire.findFirst({
        include: {
          stagiaire: {
            select: {
              nom: true,
              prenom: true,
              email: true
            }
          },
          formulaire: {
            select: {
              titre: true
            }
          }
        }
      });
      
      console.log('\n📝 Exemple de réponse:');
      console.log(`  - Stagiaire: ${reponse.stagiaire.prenom} ${reponse.stagiaire.nom}`);
      console.log(`  - Formulaire: ${reponse.formulaire.titre}`);
      console.log(`  - Réponses: ${typeof reponse.reponses}`);
      console.log(`  - Date: ${reponse.dateReponse}`);
    }
    
  } catch (error) {
    console.error('💥 Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testFormulairesAPI();
