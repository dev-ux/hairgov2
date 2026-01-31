// Script pour ajouter des hairstyles via l'API existante
const https = require('https');
const http = require('http');

const hairstyles = [
  {
    name: 'Coupe Dégradé Homme',
    description: 'Coupe moderne avec dégradé progressif sur les côtés et dos',
    photo: 'https://images.unsplash.com/photo-1582073213061-1b3d9a5b7b6b?w=400&h=400&fit=crop',
    estimated_duration: 30,
    category: 'homme',
    is_active: true
  },
  {
    name: 'Brushing Lissant',
    description: 'Brushing professionnel pour cheveux lisses et brillants',
    photo: 'https://images.unsplash.com/photo-1562322140-8ddde5a8b4d5?w=400&h=400&fit=crop',
    estimated_duration: 45,
    category: 'femme',
    is_active: true
  },
  {
    name: 'Coloration Ombré',
    description: 'Coloration ombré avec dégradé naturel du foncé au clair',
    photo: 'https://images.unsplash.com/photo-1560066988-1a4b1b6b8b6b?w=400&h=400&fit=crop',
    estimated_duration: 120,
    category: 'femme',
    is_active: true
  },
  {
    name: 'Barbe Traditionnelle',
    description: 'Taille de barbe traditionnelle au rasoir et ciseaux',
    photo: 'https://images.unsplash.com/photo-1582073213061-1b3d9a5b7b6b?w=400&h=400&fit=crop',
    estimated_duration: 25,
    category: 'homme',
    is_active: true
  },
  {
    name: 'Chignon Classique',
    description: 'Chignon élégant pour occasions spéciales',
    photo: 'https://images.unsplash.com/photo-1562322140-8ddde5a8b4d5?w=400&h=400&fit=crop',
    estimated_duration: 60,
    category: 'femme',
    is_active: true
  },
  {
    name: 'Coupe Enfant Mixte',
    description: 'Coupe simple et rapide pour enfants',
    photo: 'https://images.unsplash.com/photo-1582073213061-1b3d9a5b7b6b?w=400&h=400&fit=crop',
    estimated_duration: 20,
    category: 'enfant',
    is_active: true
  },
  {
    name: 'Mèches Balayage',
    description: 'Mèches balayage pour effet naturel et ensoleillé',
    photo: 'https://images.unsplash.com/photo-1560066988-1a4b1b6b8b6b?w=400&h=400&fit=crop',
    estimated_duration: 90,
    category: 'femme',
    is_active: true
  },
  {
    name: 'Coupe Court Homme',
    description: 'Coupe courte et stylée pour homme moderne',
    photo: 'https://images.unsplash.com/photo-1582073213061-1b3d9a5b7b6b?w=400&h=400&fit=crop',
    estimated_duration: 25,
    category: 'homme',
    is_active: true
  },
  {
    name: 'Soin Capillaire Profond',
    description: 'Soin nourrissant et réparateur en profondeur',
    photo: 'https://images.unsplash.com/photo-1562322140-8ddde5a8b4d5?w=400&h=400&fit=crop',
    estimated_duration: 40,
    category: 'femme',
    is_active: true
  },
  {
    name: 'Tresse Africaine',
    description: 'Tresse africaine traditionnelle et moderne',
    photo: 'https://images.unsplash.com/photo-1560066988-1a4b1b6b8b6b?w=400&h=400&fit=crop',
    estimated_duration: 180,
    category: 'femme',
    is_active: true
  }
];

function makeRequest(data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: 'hairgov2.onrender.com',
      port: 443,
      path: '/api/v1/hairstyles',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
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

async function addHairstyles() {
  console.log('Ajout des hairstyles...');
  
  for (const hairstyle of hairstyles) {
    try {
      const result = await makeRequest(hairstyle);
      console.log(`✅ ${hairstyle.name}: ${result.status}`);
      if (result.status === 201) {
        console.log(`   ID: ${result.data.data?.id}`);
      } else {
        console.log(`   Erreur: ${JSON.stringify(result.data)}`);
      }
    } catch (error) {
      console.log(`❌ ${hairstyle.name}: ${error.message}`);
    }
    
    // Attendre un peu entre chaque requête
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\nVérification des hairstyles ajoutés...');
  try {
    const checkResult = await makeRequest({});
    console.log(`Total hairstyles: ${checkResult.data?.count || 0}`);
  } catch (error) {
    console.log('Erreur lors de la vérification:', error.message);
  }
}

addHairstyles();
