const https = require('https');
const { uploadToCloudinary } = require('./utils/cloudinary');
const fs = require('fs');
const path = require('path');

// Configuration de l'API
const API_BASE = 'https://hairgov2.onrender.com/api/v1';

// Fonction pour faire des requêtes API
function apiRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = `${API_BASE}${path}`;
    const requestOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      ...options
    };

    const req = https.request(url, requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

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

// Fonction pour mettre à jour un hairstyle via API
function updateHairstyle(id, data) {
  return new Promise((resolve, reject) => {
    const url = `${API_BASE}/hairstyles/${id}`;
    const postData = JSON.stringify(data);
    
    const options = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(url, options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsedData });
        } catch (error) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// Fonction principale de migration
async function migrateToCloudinary() {
  try {
    console.log('🔍 Récupération des hairstyles depuis l\'API...');
    
    const result = await apiRequest('/hairstyles');
    const hairstyles = result.data.data || [];
    
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
            // Mettre à jour via API
            const updateResult = await updateHairstyle(hairstyle.id, {
              photo: cloudinaryResult.secure_url
            });
            
            if (updateResult.status === 200) {
              console.log(`✅ ${hairstyle.name}: migré vers Cloudinary`);
              migratedCount++;
            } else {
              console.log(`❌ ${hairstyle.name}: échec de la mise à jour (${updateResult.status})`);
              errorCount++;
            }
          }
        } else {
          console.log(`⚠️  ${hairstyle.name}: format non géré (${hairstyle.photo})`);
          skippedCount++;
        }
      } catch (error) {
        console.error(`❌ Erreur pour ${hairstyle.name}:`, error.message);
        errorCount++;
      }
      
      // Pause entre chaque requête
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log(`\n📊 Résumé de la migration:`);
    console.log(`✅ Images migrées vers Cloudinary: ${migratedCount}`);
    console.log(`⚠️  Images ignorées (déjà sur Cloudinary): ${skippedCount}`);
    console.log(`❌ Erreurs: ${errorCount}`);
    console.log(`📋 Total traité: ${hairstyles.length}`);
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Charger les variables d'environnement
require('dotenv').config();

// Lancer la migration
migrateToCloudinary();
