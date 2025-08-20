const cloudinary = require('cloudinary').v2;

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function testCloudinary() {
  try {
    console.log('🔍 Test de la configuration Cloudinary...');
    console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
    console.log('API Key:', process.env.CLOUDINARY_API_KEY ? '✅ Configuré' : '❌ Manquant');
    console.log('API Secret:', process.env.CLOUDINARY_API_SECRET ? '✅ Configuré' : '❌ Manquant');

    // Test de connexion
    const result = await cloudinary.api.ping();
    console.log('✅ Connexion Cloudinary réussie:', result);

    // Test d'upload simple
    console.log('📤 Test d\'upload...');
    const uploadResult = await cloudinary.uploader.upload(
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      {
        public_id: 'test_upload',
        folder: 'irata-test',
        resource_type: 'image'
      }
    );
    console.log('✅ Upload test réussi:', uploadResult.public_id);

    // Nettoyer le fichier de test
    await cloudinary.uploader.destroy(uploadResult.public_id);
    console.log('🧹 Fichier de test supprimé');

  } catch (error) {
    console.error('❌ Erreur Cloudinary:', error.message);
    console.error('Détails:', error);
  }
}

testCloudinary();
