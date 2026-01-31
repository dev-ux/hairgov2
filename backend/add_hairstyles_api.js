const https = require('https');

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

function addHairstyle(hairstyle) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(hairstyle);
    
    const options = {
      hostname: 'hairgov2.onrender.com',
      port: 443,
      path: '/api/v1/hairstyles/seed',
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

async function addAllHairstyles() {
  console.log('🚀 Ajout des hairstyles dans la base de données...\n');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const hairstyle of hairstyles) {
    try {
      console.log(`📝 Ajout de: ${hairstyle.name}`);
      const result = await addHairstyle(hairstyle);
      
      if (result.status === 201 || result.status === 200) {
        console.log(`✅ Succès: ${hairstyle.name}`);
        successCount++;
      } else {
        console.log(`❌ Erreur (${result.status}): ${hairstyle.name}`);
        console.log(`   Détail: ${JSON.stringify(result.data)}`);
        errorCount++;
      }
    } catch (error) {
      console.log(`❌ Erreur: ${hairstyle.name} - ${error.message}`);
      errorCount++;
    }
    
    // Pause entre chaque requête
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`\n📊 Résumé:`);
  console.log(`✅ Succès: ${successCount}`);
  console.log(`❌ Erreurs: ${errorCount}`);
  console.log(`📝 Total: ${successCount + errorCount}`);
  
  // Vérification finale
  console.log('\n🔍 Vérification des hairstyles dans la base...');
  try {
    const checkResult = await fetch('https://hairgov2.onrender.com/api/v1/hairstyles');
    const data = await checkResult.json();
    console.log(`📋 Total hairstyles dans la base: ${data.count}`);
    
    if (data.data && data.data.length > 0) {
      console.log('\n📋 Liste des hairstyles:');
      data.data.forEach((h, index) => {
        console.log(`${index + 1}. ${h.name} (${h.category}) - ${h.estimated_duration}min`);
      });
    }
  } catch (error) {
    console.log('Erreur lors de la vérification:', error.message);
  }
}

addAllHairstyles();
