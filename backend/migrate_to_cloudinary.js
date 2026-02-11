const https = require('https');
const { Pool } = require('pg');
const { uploadToCloudinary } = require('./utils/cloudinary');
const fs = require('fs');
const path = require('path');

// Configuration de la base de données
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'hairgo_db',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 5435,
});

// Fonction pour télécharger une image
function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filename);
    
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(filename);
      });
    }).on('error', (err) => {
      fs.unlink(filename, () => {});
      reject(err);
    });
  });
}

// Fonction principale de migration
async function migrateToCloudinary() {
  try {
    console.log('🔍 Récupération des hairstyles...');
    
    const result = await pool.query('SELECT id, name, photo FROM hairstyles WHERE photo IS NOT NULL ORDER BY created_at');
    const hairstyles = result.rows;
    
    console.log(`📋 ${hairstyles.length} hairstyles trouvées`);
    
    let migratedCount = 0;
    let errorCount = 0;
    let skippedCount = 0;
    
    for (const hairstyle of hairstyles) {
      try {
        if (!hairstyle.photo) {
          console.log(`⚠️  ${hairstyle.name}: pas de photo`);
          continue;
        }
        
        // Vérifier si l'image est déjà sur Cloudinary
        if (hairstyle.photo.includes('cloudinary.com')) {
          console.log(`✅ ${hairstyle.name}: déjà sur Cloudinary`);
          skippedCount++;
          continue;
        }
        
        // Vérifier si c'est une URL externe (Unsplash)
        if (hairstyle.photo.startsWith('http')) {
          console.log(`🔄 ${hairstyle.name}: migration depuis URL externe...`);
          
          // Télécharger l'image
          const tempFilename = `/tmp/${hairstyle.id}_temp.jpg`;
          await downloadImage(hairstyle.photo, tempFilename);
          
          // Uploader sur Cloudinary
          const cloudinaryResult = await uploadToCloudinary(tempFilename);
          
          if (cloudinaryResult) {
            // Mettre à jour la base de données
            await pool.query(
              'UPDATE hairstyles SET photo = $1 WHERE id = $2',
              [cloudinaryResult.secure_url, hairstyle.id]
            );
            
            console.log(`✅ ${hairstyle.name}: migré vers Cloudinary`);
            migratedCount++;
          }
        } else {
          console.log(`⚠️  ${hairstyle.name}: format non géré (${hairstyle.photo})`);
          skippedCount++;
        }
      } catch (error) {
        console.error(`❌ Erreur pour ${hairstyle.name}:`, error.message);
        errorCount++;
      }
    }
    
    console.log(`\n📊 Résumé de la migration:`);
    console.log(`✅ Images migrées vers Cloudinary: ${migratedCount}`);
    console.log(`⚠️  Images ignorées (déjà sur Cloudinary): ${skippedCount}`);
    console.log(`❌ Erreurs: ${errorCount}`);
    console.log(`📋 Total traité: ${hairstyles.length}`);
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  } finally {
    await pool.end();
  }
}

// Charger les variables d'environnement
require('dotenv').config();

// Lancer la migration
migrateToCloudinary();
