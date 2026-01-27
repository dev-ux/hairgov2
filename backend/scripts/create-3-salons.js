const db = require('../models');
const bcrypt = require('bcryptjs');

async function createHairdressersAndSalons() {
  try {
    console.log('🔍 Vérification des coiffeurs existants...');
    
    // Vérifier s'il y a déjà des coiffeurs approuvés
    const existingHairdressers = await db.Hairdresser.findAll({
      where: { registration_status: 'approved' },
      include: [{
        model: db.User,
        as: 'user',
        attributes: ['id', 'full_name', 'email']
      }]
    });

    if (existingHairdressers.length >= 3) {
      console.log(`✅ Il y a déjà ${existingHairdressers.length} coiffeurs approuvés`);
      
      // Créer des salons pour les coiffeurs existants s'ils n'en ont pas
      for (const hairdresser of existingHairdressers.slice(0, 3)) {
        const existingSalon = await db.Salon.findOne({
          where: { hairdresser_id: hairdresser.id }
        });
        
        if (!existingSalon) {
          console.log(`🔄 Création d'un salon pour ${hairdresser.user.full_name}...`);
          await createSalonForHairdresser(hairdresser);
        } else {
          console.log(`✅ ${hairdresser.user.full_name} a déjà un salon`);
        }
      }
      
      process.exit(0);
    }

    console.log('🔄 Création de 3 coiffeurs et leurs salons...');

    // Données des 3 coiffeurs
    const hairdressersData = [
      {
        full_name: 'Marie Dubois',
        email: 'marie.dubois@hairgo.com',
        phone: '+33612345678',
        user_type: 'hairdresser',
        is_active: true
      },
      {
        full_name: 'Jean Martin',
        email: 'jean.martin@hairgo.com', 
        phone: '+33623456789',
        user_type: 'hairdresser',
        is_active: true
      },
      {
        full_name: 'Sophie Bernard',
        email: 'sophie.bernard@hairgo.com',
        phone: '+33634567890',
        user_type: 'hairdresser',
        is_active: true
      }
    ];

    // Créer les utilisateurs coiffeurs
    const createdUsers = [];
    for (const hairdresserData of hairdressersData) {
      const passwordHash = await bcrypt.hash('password123', 10);
      const user = await db.User.create({
        ...hairdresserData,
        password_hash: passwordHash
      });
      createdUsers.push(user);
      console.log(`✅ Utilisateur créé: ${user.full_name}`);
    }

    // Créer les profils hairdresser
    const hairdressersProfiles = createdUsers.map(user => ({
      user_id: user.id,
      profession: 'Coiffeur professionnel',
      residential_address: 'Paris, France',
      date_of_birth: '1990-01-01',
      id_card_number: '123456789012345',
      id_card_photo: 'https://example.com/id-card.jpg',
      has_salon: false,
      education_level: 'Bac+2 Coiffure',
      registration_status: 'approved',
      balance: 0,
      total_earnings: 0,
      average_rating: 4.5,
      total_jobs: 0,
      is_available: true,
      latitude: 48.8566,
      longitude: 2.3522
    }));

    const createdHairdressers = await db.Hairdresser.bulkCreate(hairdressersProfiles);
    console.log('✅ Profils coiffeurs créés!');

    // Données des 3 salons
    const salonsData = [
      {
        name: "Salon de Coiffure Élégance",
        address: "123 Avenue des Champs-Élysées, 75008 Paris, France",
        latitude: 48.8698,
        longitude: 2.3070,
        description: "Un salon de coiffure haut de gamme au cœur de Paris, spécialisé dans les coupes tendances et les soins capillaires de qualité.",
        phone: "+33123456789",
        email: "contact@salon-elegance.fr",
        photos: [
          "https://images.unsplash.com/photo-1560066984-a9f62d1a37b9?w=800",
          "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800"
        ],
        business_hours: {
          monday: { open: "09:00", close: "19:00" },
          tuesday: { open: "09:00", close: "19:00" },
          wednesday: { open: "09:00", close: "19:00" },
          thursday: { open: "09:00", close: "20:00" },
          friday: { open: "09:00", close: "20:00" },
          saturday: { open: "10:00", close: "18:00" },
          sunday: { open: "10:00", close: "16:00" }
        }
      },
      {
        name: "Barbier Moderne Le Marais",
        address: "45 Rue Sainte-Croix de la Bretonnerie, 75004 Paris, France",
        latitude: 48.8570,
        longitude: 2.3580,
        description: "Barbier spécialisé dans les coupes masculines modernes et les barbes soignées. Ambiance chic et décontractée dans le quartier du Marais.",
        phone: "+33134567890",
        email: "info@barbier-marais.fr",
        photos: [
          "https://images.unsplash.com/photo-1503951914875-402378dfb30e?w=800",
          "https://images.unsplash.com/photo-1517891906240-472f88b5e0f1?w=800"
        ],
        business_hours: {
          monday: { open: "10:00", close: "20:00" },
          tuesday: { open: "10:00", close: "20:00" },
          wednesday: { open: "10:00", close: "20:00" },
          thursday: { open: "10:00", close: "21:00" },
          friday: { open: "10:00", close: "21:00" },
          saturday: { open: "09:00", close: "19:00" },
          sunday: { open: "11:00", close: "17:00" }
        }
      },
      {
        name: "Institut de Beauté & Coiffure Montmartre",
        address: "78 Rue Lepic, 75018 Paris, France",
        latitude: 48.8867,
        longitude: 2.3431,
        description: "Institut complet proposant coiffure, soins du visage et bien-être. Vue imprenable sur Paris depuis notre local historique de Montmartre.",
        phone: "+33145678901",
        email: "reservation@institut-montmartre.fr",
        photos: [
          "https://images.unsplash.com/photo-1562322145-cc7b27f5cde7?w=800",
          "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800"
        ],
        business_hours: {
          monday: { open: "09:30", close: "18:30" },
          tuesday: { open: "09:30", close: "18:30" },
          wednesday: { open: "09:30", close: "18:30" },
          thursday: { open: "09:30", close: "19:30" },
          friday: { open: "09:30", close: "19:30" },
          saturday: { open: "10:00", close: "17:00" },
          sunday: { open: "fermé" }
        }
      }
    ];

    // Créer un salon pour chaque coiffeur
    for (let i = 0; i < createdHairdressers.length; i++) {
      const hairdresser = createdHairdressers[i];
      const salonData = salonsData[i];
      
      console.log(`🔄 Création du salon pour ${createdUsers[i].full_name}...`);
      
      const salon = await db.Salon.create({
        hairdresser_id: hairdresser.id,
        ...salonData,
        is_validated: true
      });

      // Mettre à jour le statut du coiffeur
      await hairdresser.update({ has_salon: true });

      console.log(`✅ Salon créé: ${salon.name}`);
      console.log(`   Adresse: ${salon.address}`);
      console.log(`   Validé: ${salon.is_validated ? 'Oui' : 'Non'}`);
    }

    console.log('\n🎉 Succès! 3 coiffeurs et 3 salons ont été créés.');
    console.log('\nDétails des créations:');
    console.log('========================');
    
    for (let i = 0; i < createdUsers.length; i++) {
      console.log(`\n${i + 1}. Coiffeur: ${createdUsers[i].full_name}`);
      console.log(`   Email: ${createdUsers[i].email}`);
      console.log(`   Mot de passe: password123`);
      console.log(`   Statut: Approuvé avec salon`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la création:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

async function createSalonForHairdresser(hairdresser) {
  const salonsData = [
    {
      name: "Salon Prestige Opéra",
      address: "15 Place de l'Opéra, 75009 Paris, France",
      latitude: 48.8708,
      longitude: 2.3316,
      description: "Salon de luxe près de l'Opéra de Paris, spécialisé dans les coiffures de célébrités et les événements spéciaux.",
      phone: "+33123456789",
      email: "opera@salon-prestige.fr",
      photos: [
        "https://images.unsplash.com/photo-1560066984-a9f62d1a37b9?w=800"
      ],
      business_hours: {
        monday: { open: "09:00", close: "19:00" },
        tuesday: { open: "09:00", close: "19:00" },
        wednesday: { open: "09:00", close: "19:00" },
        thursday: { open: "09:00", close: "20:00" },
        friday: { open: "09:00", close: "20:00" },
        saturday: { open: "10:00", close: "18:00" },
        sunday: { open: "fermé" }
      }
    },
    {
      name: "Coiffure Artistique Bastille",
      address: "34 Rue de la Roquette, 75011 Paris, France",
      latitude: 48.8530,
      longitude: 2.3699,
      description: "Salon créatif et branché dans le quartier de Bastille, connu pour ses couleurs audacieuses et ses coupes avant-gardistes.",
      phone: "+33134567890",
      email: "bastille@coiffure-artistique.fr",
      photos: [
        "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800"
      ],
      business_hours: {
        monday: { open: "10:00", close: "20:00" },
        tuesday: { open: "10:00", close: "20:00" },
        wednesday: { open: "10:00", close: "20:00" },
        thursday: { open: "10:00", close: "21:00" },
        friday: { open: "10:00", close: "21:00" },
        saturday: { open: "09:00", close: "19:00" },
        sunday: { open: "11:00", close: "17:00" }
      }
    },
    {
      name: "Salon Nature Saint-Germain",
      address: "56 Boulevard Saint-Germain, 75006 Paris, France",
      latitude: 48.8530,
      longitude: 2.3296,
      description: "Salon bio et éthique spécialisé dans les produits naturels et les techniques de coiffure respectueuses de l'environnement.",
      phone: "+33145678901",
      email: "nature@salon-saintgermain.fr",
      photos: [
        "https://images.unsplash.com/photo-1562322145-cc7b27f5cde7?w=800"
      ],
      business_hours: {
        monday: { open: "09:30", close: "18:30" },
        tuesday: { open: "09:30", close: "18:30" },
        wednesday: { open: "09:30", close: "18:30" },
        thursday: { open: "09:30", close: "19:30" },
        friday: { open: "09:30", close: "19:30" },
        saturday: { open: "10:00", close: "17:00" },
        sunday: { open: "fermé" }
      }
    }
  ];

  const salonData = salonsData[Math.floor(Math.random() * salonsData.length)];
  
  const salon = await db.Salon.create({
    hairdresser_id: hairdresser.id,
    ...salonData,
    is_validated: true
  });

  await hairdresser.update({ has_salon: true });

  console.log(`✅ Salon créé: ${salon.name}`);
  console.log(`   Adresse: ${salon.address}`);
}

// Exécuter le script
createHairdressersAndSalons();
