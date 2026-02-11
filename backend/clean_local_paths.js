const db = require('./models');

async function cleanAllLocalPaths() {
  try {
    console.log('🧹 Nettoyage de tous les chemins locaux...');
    
    // Nettoyer les salons
    const salons = await db.Salon.findAll();
    let salonCount = 0;
    
    for (const salon of salons) {
      const photos = Array.isArray(salon.photos) ? salon.photos : [];
      const newPhotos = photos.filter(photo => !photo.startsWith('/uploads/'));
      
      if (newPhotos.length !== photos.length) {
        await salon.update({ photos: newPhotos });
        salonCount++;
        console.log(`✅ Salon nettoyé: ${salon.name}`);
      }
    }
    
    // Nettoyer les hairstyles
    const hairstyles = await db.Hairstyle.findAll();
    let hairstyleCount = 0;
    
    for (const hairstyle of hairstyles) {
      if (hairstyle.photo && hairstyle.photo.startsWith('/uploads/')) {
        await hairstyle.update({ photo: null });
        hairstyleCount++;
        console.log(`✅ Hairstyle nettoyé: ${hairstyle.name}`);
      }
    }
    
    console.log(`\n✅ Nettoyage terminé!`);
    console.log(`📊 Salons nettoyés: ${salonCount}`);
    console.log(`💇 Hairstyles nettoyés: ${hairstyleCount}`);
    
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
  } finally {
    process.exit(0);
  }
}

cleanAllLocalPaths();
