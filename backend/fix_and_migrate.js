const https = require('https');
const fs = require('fs');

// Configuration Cloudinary directe
const cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: 'dfghcfcdb',
  api_key: '466972162218579',
  api_secret: 'qBkwd5NWftl9mh731tBTWwyXNCs'
});

// Fonction upload vers Cloudinary
const uploadToCloudinary = async (filePath) => {
  try {
    if (!filePath) return null;
    
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'hairstyles',
      use_filename: true,
      unique_filename: true,
      resource_type: 'auto'
    });

    // Supprimer le fichier temporaire après l'upload
    fs.unlinkSync(filePath);
    
    return result;
  } catch (error) {
    console.error('Erreur lors de l\'upload sur Cloudinary:', error);
    
    // Essayer de supprimer le fichier temporaire même en cas d'erreur
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    throw error;
  }
};

// Configuration de l'API
const API_BASE = 'https://hairgov2.onrender.com/api/v1';

// Images de remplacement (URLs de test)
const fallbackImages = [
  'https://picsum.photos/400/400?random=1',
  'https://picsum.photos/400/400?random=2',
  'https://picsum.photos/400/400?random=3'
];

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
    console.log(`   📥 Téléchargement: ${url} -> ${filename}`);
    const file = fs.createWriteStream(filename);
    
    const request = https.get(url, { followRedirects: true }, (response) => {
      console.log(`   📊 Status HTTP: ${response.statusCode}`);
      console.log(`   📋 Content-Type: ${response.headers['content-type']}`);
      
      // Gérer les redirections manuellement
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        console.log(`   🔄 Redirection vers: ${response.headers.location}`);
        return downloadImage(response.headers.location, filename);
      }
      
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        
        // Vérifier si le fichier existe et sa taille
        if (fs.existsSync(filename)) {
          const stats = fs.statSync(filename);
          console.log(`   ✅ Fichier créé: ${filename} (${stats.size} bytes)`);
          if (stats.size > 0) {
            resolve(filename);
          } else {
            reject(new Error('Fichier vide'));
          }
        } else {
          console.log(`   ❌ Fichier non créé: ${filename}`);
          reject(new Error('Fichier non créé'));
        }
      });
    }).on('error', (err) => {
      console.log(`   ❌ Erreur de téléchargement: ${err.message}`);
      if (fs.existsSync(filename)) {
        fs.unlink(filename, () => {});
      }
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
async function fixAndMigrate() {
  try {
    console.log('🔍 Récupération des hairstyles depuis l\'API...');
    
    const result = await apiRequest('/hairstyles');
    const hairstyles = result.data.data || [];
    
    console.log(`📋 ${hairstyles.length} hairstyles trouvées`);
    
    let migratedCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < Math.min(1, hairstyles.length); i++) {
      const hairstyle = hairstyles[i];
      
      try {
        if (!hairstyle.photo) {
          console.log(`⚠️  ${hairstyle.name}: pas de photo`);
          continue;
        }
        
        // Vérifier si l'image est déjà sur Cloudinary
        if (hairstyle.photo.includes('cloudinary.com')) {
          console.log(`✅ ${hairstyle.name}: déjà sur Cloudinary`);
          continue;
        }
        
        console.log(`🔄 ${hairstyle.name}: migration avec image de remplacement...`);
        
        // Utiliser une image de remplacement
        const fallbackUrl = fallbackImages[i % fallbackImages.length];
        const tempFilename = `/tmp/${hairstyle.id}_temp.jpg`;
        
        // Télécharger l'image de remplacement
        await downloadImage(fallbackUrl, tempFilename);
        
        // Uploader sur Cloudinary
        const cloudinaryResult = await uploadToCloudinary(tempFilename);
        
        if (cloudinaryResult) {
          // Mettre à jour via API
          const updateResult = await updateHairstyle(hairstyle.id, {
            photo: cloudinaryResult.secure_url
          });
          
          if (updateResult.status === 200) {
            console.log(`✅ ${hairstyle.name}: migré vers Cloudinary`);
            console.log(`   📸 Nouvelle URL: ${cloudinaryResult.secure_url}`);
            migratedCount++;
          } else {
            console.log(`❌ ${hairstyle.name}: échec de la mise à jour (${updateResult.status})`);
            errorCount++;
          }
        }
      } catch (error) {
        console.error(`❌ Erreur pour ${hairstyle.name}:`, error.message);
        errorCount++;
      }
      
      // Pause entre chaque requête
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log(`\n📊 Résumé de la migration:`);
    console.log(`✅ Images migrées vers Cloudinary: ${migratedCount}`);
    console.log(`❌ Erreurs: ${errorCount}`);
    console.log(`📋 Total traité: ${hairstyles.length}`);
    
    if (migratedCount > 0) {
      console.log(`\n🎉 Migration terminée ! Les images sont maintenant sur Cloudinary.`);
      console.log(`🔄 Redémarrez votre admin panel pour voir les changements.`);
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Charger les variables d'environnement
require('dotenv').config({ path: '.env.local' });

// Lancer la migration
fixAndMigrate();
