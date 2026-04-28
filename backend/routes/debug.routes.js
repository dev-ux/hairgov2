const express = require('express');
const router = express.Router();

// Route pour vérifier les variables d'environnement Cloudinary
router.get('/cloudinary', (req, res) => {
  try {
    const cloudinaryConfig = {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? '✅ Configuré' : '❌ Manquant',
      api_key: process.env.CLOUDINARY_API_KEY ? '✅ Configuré' : '❌ Manquant',
      api_secret: process.env.CLOUDINARY_API_SECRET ? '✅ Configuré' : '❌ Manquant',
    };

    // Vérifier si Cloudinary est bien initialisé
    let cloudinaryStatus = '❌ Non initialisé';
    try {
      const cloudinary = require('cloudinary').v2;
      if (cloudinary.config().cloud_name) {
        cloudinaryStatus = '✅ Initialisé';
      }
    } catch (error) {
      cloudinaryStatus = `❌ Erreur: ${error.message}`;
    }

    res.json({
      success: true,
      environment_variables: cloudinaryConfig,
      cloudinary_status: cloudinaryStatus,
      all_env_keys: Object.keys(process.env).filter(key => key.includes('CLOUDINARY'))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Route pour tester un upload Cloudinary simple
router.post('/test-upload', async (req, res) => {
  try {
    const cloudinary = require('cloudinary').v2;
    
    // Créer une image de test simple (1x1 pixel PNG en base64)
    const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    const testImageBuffer = Buffer.from(testImageBase64, 'base64');

    // Upload sur Cloudinary
    const result = await cloudinary.uploader.upload_stream(
      { 
        folder: 'test',
        public_id: `debug-${Date.now()}`
      },
      (error, result) => {
        if (error) {
          return res.status(500).json({
            success: false,
            error: error.message,
            details: error
          });
        }

        res.json({
          success: true,
          message: 'Upload test réussi',
          result: {
            url: result.secure_url,
            public_id: result.public_id,
            format: result.format
          }
        });
      }
    );

    result.end(testImageBuffer);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      details: error
    });
  }
});

module.exports = router;
