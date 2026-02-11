const db = require('./models');
const { uploadToCloudinary } = require('./utils/cloudinary');
const fs = require('fs');
const path = require('path');

async function migrateLocalImagesToCloudinary() {
  try {
    console.log('Starting migration of local images to Cloudinary...');
    
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
          const filePath = path.join(__dirname, 'public', photo);
          
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
        
        const logoPath = path.join(__dirname, 'public', salon.logo);
        
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

// Run the migration
if (require.main === module) {
  migrateLocalImagesToCloudinary()
    .then(() => {
      console.log('Migration finished. Exiting...');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateLocalImagesToCloudinary };
