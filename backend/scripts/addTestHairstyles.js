require('dotenv').config();
const db = require('../models');

async function addTestHairstyles() {
  try {
    console.log('🔍 Vérification des hairstyles existants...');
    
    const existingCount = await db.Hairstyle.count();
    console.log(`✅ Il y a déjà ${existingCount} hairstyles`);
    
    if (existingCount > 0) {
      console.log('ℹ️ Des hairstyles existent déjà. Suppression et recréation...');
      await db.Hairstyle.destroy({ where: {} });
    }

    const hairstyles = [
      {
        name: 'Coupe Femme',
        description: 'Coupe et coiffage pour femmes avec brushing',
        estimated_duration: 60,
        category: 'Femme',
        is_active: true
      },
      {
        name: 'Coupe Homme',
        description: 'Coupe classique pour hommes avec finition',
        estimated_duration: 30,
        category: 'Homme',
        is_active: true
      },
      {
        name: 'Coloration',
        description: 'Coloration complète avec soin protecteur',
        estimated_duration: 90,
        category: 'Femme',
        is_active: true
      },
      {
        name: 'Mèches',
        description: 'Mèches balayage pour un effet naturel',
        estimated_duration: 120,
        category: 'Femme',
        is_active: true
      },
      {
        name: 'Brushing',
        description: 'Brushing professionnel pour cheveux longs',
        estimated_duration: 45,
        category: 'Femme',
        is_active: true
      },
      {
        name: 'Coupe Enfant',
        description: 'Coupe adaptée aux enfants avec patience',
        estimated_duration: 25,
        category: 'Enfant',
        is_active: true
      },
      {
        name: 'Barbe',
        description: 'Taille et entretien de la barbe',
        estimated_duration: 30,
        category: 'Homme',
        is_active: true
      },
      {
        name: 'Soin',
        description: 'Soin profond pour cheveux abîmés',
        estimated_duration: 40,
        category: 'Mixte',
        is_active: true
      }
    ];

    console.log('🔄 Création des hairstyles...');
    const created = await db.Hairstyle.bulkCreate(hairstyles);
    console.log(`✅ ${created.length} hairstyles créés avec succès`);
    
    console.log('\n📋 Liste des hairstyles créés:');
    created.forEach(h => {
      console.log(`  - ${h.name} (${h.category}) - ${h.estimated_duration} min`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la création des hairstyles:', error);
    process.exit(1);
  }
}

addTestHairstyles();
