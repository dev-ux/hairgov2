const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

// Configuration directe de PostgreSQL
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: 'localhost', // À adapter selon votre configuration
  port: 5432, // Port par défaut PostgreSQL
  database: 'hairgo_db', // Nom de la base de données
  username: 'postgres', // Utilisateur par défaut
  password: '', // Mot de passe (à adapter)
  logging: console.log,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

// Définition des modèles (simplifiés pour ce script)
const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING(255),
    unique: true,
    allowNull: true,
    validate: { isEmail: true }
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    validate: { is: /^\+[1-9]\d{1,14}$/ }
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  user_type: {
    type: DataTypes.ENUM('client', 'hairdresser', 'admin'),
    allowNull: false
  },
  full_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'users',
  timestamps: true,
  underscored: true
});

const Hairdresser = sequelize.define('Hairdresser', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true
  },
  profession: DataTypes.STRING(100),
  residential_address: DataTypes.TEXT,
  has_salon: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  registration_status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending'
  },
  average_rating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0.00
  },
  total_jobs: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  is_available: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'hairdressers',
  timestamps: true,
  underscored: true
});

const Salon = sequelize.define('Salon', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  hairdresser_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: false
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  photos: {
    type: DataTypes.TEXT,
    defaultValue: '[]',
    get() {
      const value = this.getDataValue('photos');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('photos', JSON.stringify(value || []));
    }
  },
  business_hours: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  is_validated: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'salons',
  timestamps: true,
  underscored: true
});

// Relations
User.hasOne(Hairdresser, { foreignKey: 'user_id', as: 'hairdresser' });
Hairdresser.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Hairdresser.hasOne(Salon, { foreignKey: 'hairdresser_id', as: 'salon' });
Salon.belongsTo(Hairdresser, { foreignKey: 'hairdresser_id', as: 'hairdresser' });

async function createSalonsInPostgreSQL() {
  try {
    console.log('🔍 Connexion à PostgreSQL...');
    await sequelize.authenticate();
    console.log('✅ Connexion à PostgreSQL réussie');
    
    // Synchroniser les tables
    await sequelize.sync({ alter: true });
    console.log('✅ Tables synchronisées');
    
    // Vérifier les salons existants
    const existingSalons = await Salon.findAll({
      attributes: ['id', 'name'],
      order: [['created_at', 'DESC']]
    });
    
    console.log(`📊 Salons existants dans PostgreSQL: ${existingSalons.length}`);
    
    if (existingSalons.length >= 3) {
      console.log('✅ Les salons existent déjà dans PostgreSQL');
      existingSalons.forEach((salon, index) => {
        console.log(`   ${index + 1}. ${salon.name} (ID: ${salon.id})`);
      });
      process.exit(0);
    }
    
    // Vérifier/créer les coiffeurs
    const existingHairdressers = await Hairdresser.findAll({
      where: { registration_status: 'approved' },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'full_name', 'email']
      }]
    });
    
    console.log(`📊 Coiffeurs approuvés dans PostgreSQL: ${existingHairdressers.length}`);
    
    let hairdressersToUse = existingHairdressers;
    
    // Créer les coiffeurs manquants
    if (existingHairdressers.length < 3) {
      console.log('🔄 Création des coiffeurs manquants...');
      
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
      
      const startIndex = existingHairdressers.length;
      const missingHairdressers = hairdressersData.slice(startIndex);
      
      for (const hairdresserData of missingHairdressers) {
        const passwordHash = await bcrypt.hash('password123', 10);
        const user = await User.create({
          ...hairdresserData,
          password_hash: passwordHash
        });
        
        const hairdresser = await Hairdresser.create({
          user_id: user.id,
          profession: 'Coiffeur professionnel',
          residential_address: 'Paris, France',
          has_salon: false,
          registration_status: 'approved',
          average_rating: 4.5,
          total_jobs: 0,
          is_available: true
        });
        
        hairdressersToUse.push({
          ...hairdresser.get({ plain: true }),
          user: user.get({ plain: true })
        });
        
        console.log(`✅ Coiffeur créé: ${user.full_name}`);
      }
    }
    
    // Données des salons
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
    
    // Créer les salons
    console.log('🔄 Création des salons dans PostgreSQL...');
    
    for (let i = 0; i < Math.min(3, hairdressersToUse.length); i++) {
      const hairdresser = hairdressersToUse[i];
      const salonData = salonsData[i];
      
      console.log(`🔄 Création du salon pour ${hairdresser.user.full_name}...`);
      
      const salon = await Salon.create({
        hairdresser_id: hairdresser.id,
        ...salonData,
        is_validated: true
      });

      await Hairdresser.update(
        { has_salon: true },
        { where: { id: hairdresser.id } }
      );

      console.log(`✅ Salon créé: ${salon.name}`);
      console.log(`   ID: ${salon.id}`);
      console.log(`   Adresse: ${salon.address}`);
      console.log(`   Validé: ${salon.is_validated ? 'Oui' : 'Non'}`);
    }
    
    console.log('\n🎉 Succès! Les salons ont été ajoutés à PostgreSQL.');
    
    // Vérification finale
    const finalSalons = await Salon.findAll({
      attributes: ['id', 'name', 'address', 'is_validated', 'created_at'],
      order: [['created_at', 'DESC']]
    });
    
    console.log('\n📊 Salons dans PostgreSQL après création:');
    console.log('==========================================');
    finalSalons.forEach((salon, index) => {
      console.log(`\n${index + 1}. ${salon.name}`);
      console.log(`   ID: ${salon.id}`);
      console.log(`   Adresse: ${salon.address}`);
      console.log(`   Validé: ${salon.is_validated ? 'Oui' : 'Non'}`);
      console.log(`   Créé le: ${salon.created_at}`);
    });
    
    await sequelize.close();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Erreur lors de la création dans PostgreSQL:', error.message);
    if (error.original) {
      console.error('Détails PostgreSQL:', error.original.message);
    }
    await sequelize.close();
    process.exit(1);
  }
}

// Exécuter le script
createSalonsInPostgreSQL();
