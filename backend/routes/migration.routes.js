const express = require('express');
const db = require('../models');
const { uploadToCloudinary } = require('../utils/cloudinary');
const fs = require('fs');
const path = require('path');
const router = express.Router();

async function migrateLocalImagesToCloudinary() {
  try {
    console.log('🚀 Starting migration of local images to Cloudinary...');
    
    // Get all salons
    const salons = await db.Salon.findAll();
    
    for (const salon of salons) {
      console.log(`\nProcessing salon: ${salon.name}`);
      
      // Process photos
      const photos = Array.isArray(salon.photos) ? salon.photos : [];
      const newPhotos = [];
      let hasChanges = false;
      
      for (const photo of photos) {
        if (photo && photo.startsWith('/uploads/')) {
          console.log(`  Found local photo: ${photo}`);
          
          // Try to find the local file
          const filePath = path.join(__dirname, '..', 'public', photo);
          
          if (fs.existsSync(filePath)) {
            console.log(`  Uploading to Cloudinary: ${filePath}`);
            
            try {
              const cloudinaryResult = await uploadToCloudinary(filePath);
              if (cloudinaryResult && cloudinaryResult.secure_url) {
                newPhotos.push(cloudinaryResult.secure_url);
                hasChanges = true;
                console.log(`  ✓ Uploaded to: ${cloudinaryResult.secure_url}`);
              } else {
                console.log(`  ✗ Upload failed, keeping original`);
                newPhotos.push(photo);
              }
            } catch (uploadError) {
              console.error(`  ✗ Upload error: ${uploadError.message}`);
              newPhotos.push(photo);
            }
          } else {
            console.log(`  ✗ Local file not found: ${filePath}`);
            newPhotos.push(photo);
          }
        } else {
          // Already a Cloudinary URL or external URL
          newPhotos.push(photo);
        }
      }
      
      // Process logo if exists
      let newLogo = salon.logo;
      if (salon.logo && salon.logo.startsWith('/uploads/')) {
        console.log(`  Found local logo: ${salon.logo}`);
        
        const logoPath = path.join(__dirname, '..', 'public', salon.logo);
        
        if (fs.existsSync(logoPath)) {
          console.log(`  Uploading logo to Cloudinary: ${logoPath}`);
          
          try {
            const cloudinaryResult = await uploadToCloudinary(logoPath);
            if (cloudinaryResult && cloudinaryResult.secure_url) {
              newLogo = cloudinaryResult.secure_url;
              hasChanges = true;
              console.log(`  ✓ Logo uploaded to: ${cloudinaryResult.secure_url}`);
            } else {
              console.log(`  ✗ Logo upload failed`);
            }
          } catch (uploadError) {
            console.error(`  ✗ Logo upload error: ${uploadError.message}`);
          }
        } else {
          console.log(`  ✗ Logo file not found: ${logoPath}`);
        }
      }
      
      // Update salon if changes were made
      if (hasChanges || newLogo !== salon.logo) {
        await salon.update({
          photos: newPhotos,
          logo: newLogo
        });
        console.log(`  ✓ Updated salon in database`);
      } else {
        console.log(`  No changes needed`);
      }
    }
    
    console.log('\n✅ Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

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

/**
 * @route   POST /api/v1/migration/clean-local-paths
 * @desc    Remove local image paths from database (files don't exist)
 * @access  Admin only
 */
router.post('/clean-local-paths', async (req, res) => {
  try {
    console.log('🧹 Nettoyage des chemins locaux de la base de données...');
    
    // Get all salons
    const salons = await db.Salon.findAll();
    let cleanedCount = 0;
    
    for (const salon of salons) {
      console.log(`\nProcessing salon: ${salon.name}`);
      
      // Process photos
      const photos = Array.isArray(salon.photos) ? salon.photos : [];
      const newPhotos = [];
      let hasChanges = false;
      
      for (const photo of photos) {
        if (photo && photo.startsWith('/uploads/')) {
          console.log(`  Removing local path: ${photo}`);
          hasChanges = true;
          // Ne pas ajouter à newPhotos (suppression)
        } else {
          // Garder les URLs externes
          newPhotos.push(photo);
        }
      }
      
      // Process logo
      let newLogo = salon.logo;
      if (salon.logo && salon.logo.startsWith('/uploads/')) {
        console.log(`  Removing local logo: ${salon.logo}`);
        newLogo = null;
        hasChanges = true;
      }
      
      // Update salon if changes were made
      if (hasChanges) {
        await salon.update({
          photos: newPhotos,
          logo: newLogo
        });
        console.log(`  ✓ Updated salon in database`);
        cleanedCount++;
      } else {
        console.log(`  No local paths found`);
      }
    }
    
    console.log(`\n✅ Nettoyage terminé! ${cleanedCount} salons nettoyés.`);
    
    res.json({
      success: true,
      message: `Nettoyage terminé. ${cleanedCount} salons modifiés.`,
      cleanedCount
    });
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du nettoyage',
      error: error.message
    });
  }
});

module.exports = router;
