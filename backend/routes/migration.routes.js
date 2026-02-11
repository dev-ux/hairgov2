const express = require('express');
const { migrateLocalImagesToCloudinary } = require('./fix_local_image_paths');
const router = express.Router();

/**
 * @route   POST /api/v1/migration/images-to-cloudinary
 * @desc    Migrate local image paths to Cloudinary URLs
 * @access  Admin only
 */
router.post('/images-to-cloudinary', async (req, res) => {
  try {
    console.log('🚀 Démarrage de la migration des images locales vers Cloudinary...');
    
    await migrateLocalImagesToCloudinary();
    
    res.json({
      success: true,
      message: 'Migration des images terminée avec succès'
    });
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la migration',
      error: error.message
    });
  }
});

module.exports = router;
