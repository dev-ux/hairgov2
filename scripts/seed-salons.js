const db = require('../models');
const { Op } = require('sequelize');
require('dotenv').config();

async function seedSalons() {
  try {
    console.log('🔍 Recherche d\'un coiffeur existant...');
    
    // Trouver un coiffeur existant
    const hairdresser = await db.Hairdresser.findOne({
      where: { 
        registration_status: 'approved',
        has_salon: false
      },
      include: [{
        model: db.User,
        as: 'user',
        attributes: ['id', 'full_name', 'email', 'phone']
      }]
    });

    if (!hairdresser) {
      console.error('❌ Aucun coiffeur éligible trouvé. Veuillez d\'abord créer un coiffeur.');
      process.exit(1);
    }

    console.log(`✅ Coiffeur trouvé: ${hairdresser.user.full_name} (${hairdresser.user.email})`);

    // Données du salon de test
    const salonData = {
      hairdresser_id: hairdresser.id,
      name: 'Salon de Coiffure Élégance',
      address: '123 Avenue des Champs-Élysées, 75008 Paris, France',
      latitude: 48.8698,
      longitude: 2.3070,
      description: 'Un salon de coiffure haut de gamme au cœur de Paris, spécialisé dans les coupes tendances et les soins capillaires de qualité.',
      phone: '+33123456789',
      email: 'contact@salon-elegance.fr',
      photos: [
        'https://example.com/salon1.jpg',
        'https://example.com/salon2.jpg'
      ],
      business_hours: {
        monday: { open: '09:00', close: '19:00' },
        tuesday: { open: '09:00', close: '19:00' },
        wednesday: { open: '09:00', close: '19:00' },
        thursday: { open: '09:00', close: '20:00' },
        friday: { open: '09:00', close: '20:00' },
        saturday: { open: '10:00', close: '18:00' },
        sunday: { open: '10:00', close: '16:00' }
      },
      is_validated: true
    };

    console.log('🔄 Création du salon...');
    
    // Créer le salon
    const salon = await db.Salon.create(salonData);
    
    // Mettre à jour le statut du coiffeur
    await hairdresser.update({ has_salon: true });

    console.log('✅ Salon créé avec succès!');
    console.log('\nDétails du salon créé:');
    console.log('------------------------');
    console.log(`ID: ${salon.id}`);
    console.log(`Nom: ${salon.name}`);
    console.log(`Adresse: ${salon.address}`);
    console.log(`Coordonnées: ${salon.latitude}, ${salon.longitude}`);
    console.log(`Description: ${salon.description}`);
    console.log(`Téléphone: ${salon.phone}`);
    console.log(`Email: ${salon.email}`);
    console.log(`Validé: ${salon.is_validated ? 'Oui' : 'Non'}`);
    console.log('\nLe coiffeur a été mis à jour avec succès.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la création du salon:', error);
    process.exit(1);
  }
}

// Exécuter le script
seedSalons();
