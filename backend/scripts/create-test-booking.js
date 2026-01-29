const { Sequelize } = require('sequelize');

// Configuration PostgreSQL avec l'URL directe
const sequelize = new Sequelize('postgresql://hairgo_db_user:1DtXFsNyMEUajSdcmXvxSKfgc9OEh8iI@dpg-d5nh6qkoud1c739vgr4g-a.oregon-postgres.render.com/hairgo_db', {
  dialect: 'postgres',
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
  },
  dialectOptions: {
    ssl: {
      require: false,
      rejectUnauthorized: false
    }
  }
});

// Définition des modèles
const Booking = sequelize.define('Booking', {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true
  },
  client_id: {
    type: Sequelize.UUID,
    allowNull: false
  },
  client_name: {
    type: Sequelize.STRING,
    allowNull: true
  },
  client_phone: {
    type: Sequelize.STRING,
    allowNull: true
  },
  hairdresser_id: {
    type: Sequelize.UUID,
    allowNull: false
  },
  hairstyle_id: {
    type: Sequelize.UUID,
    allowNull: true
  },
  service_type: {
    type: Sequelize.ENUM('home', 'salon'),
    allowNull: false,
    defaultValue: 'home'
  },
  status: {
    type: Sequelize.ENUM('pending', 'confirmed', 'in_progress', 'completed', 'cancelled'),
    allowNull: false,
    defaultValue: 'pending'
  },
  scheduled_time: {
    type: Sequelize.DATE,
    allowNull: false
  },
  estimated_duration: {
    type: Sequelize.INTEGER,
    allowNull: true
  },
  client_price: {
    type: Sequelize.DECIMAL(10, 2),
    allowNull: true
  },
  service_fee: {
    type: Sequelize.DECIMAL(10, 2),
    allowNull: true
  },
  location_address: {
    type: Sequelize.TEXT,
    allowNull: true
  },
  latitude: {
    type: Sequelize.DECIMAL(10, 8),
    allowNull: true
  },
  longitude: {
    type: Sequelize.DECIMAL(11, 8),
    allowNull: true
  },
  started_at: {
    type: Sequelize.DATE,
    allowNull: true
  },
  completed_at: {
    type: Sequelize.DATE,
    allowNull: true
  },
  cancelled_at: {
    type: Sequelize.DATE,
    allowNull: true
  },
  cancellation_reason: {
    type: Sequelize.TEXT,
    allowNull: true
  },
  extension_requested: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  },
  extension_minutes: {
    type: Sequelize.INTEGER,
    allowNull: true
  },
  extension_approved: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'bookings',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

const User = sequelize.define('User', {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true
  },
  full_name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  phone: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  },
  email: {
    type: Sequelize.STRING,
    allowNull: true
  },
  user_type: {
    type: Sequelize.ENUM('client', 'hairdresser', 'admin'),
    allowNull: false
  },
  profile_photo: {
    type: Sequelize.STRING,
    allowNull: true
  },
  is_active: {
    type: Sequelize.BOOLEAN,
    defaultValue: true
  },
  is_verified: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'users',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

const Hairstyle = sequelize.define('Hairstyle', {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  description: {
    type: Sequelize.TEXT,
    allowNull: true
  },
  category: {
    type: Sequelize.STRING,
    allowNull: true
  },
  estimated_duration: {
    type: Sequelize.INTEGER,
    allowNull: true
  },
  photo: {
    type: Sequelize.STRING,
    allowNull: true
  },
  is_active: {
    type: Sequelize.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'hairstyles',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

async function createTestBooking() {
  try {
    console.log('🔗 Connexion à la base de données...');
    await sequelize.authenticate();
    console.log('✅ Connexion réussie');

    // Récupérer un coiffeur existant depuis la table hairdressers
    const [hairdresserResult] = await sequelize.query(`
      SELECT h.*, u.full_name, u.phone 
      FROM hairdressers h 
      JOIN users u ON h.user_id = u.id 
      WHERE u.is_active = true 
      LIMIT 1
    `);

    if (!hairdresserResult || hairdresserResult.length === 0) {
      console.log('❌ Aucun coiffeur trouvé dans la base de données');
      return;
    }

    const hairdresser = hairdresserResult[0];
    console.log(`✅ Coiffeur trouvé: ${hairdresser.full_name} (${hairdresser.phone})`);
    console.log(`   Hairdresser ID: ${hairdresser.id}`);

    // Récupérer ou créer un client de test
    let client = await User.findOne({
      where: { phone: '+2250700000001' }
    });

    if (!client) {
      client = await User.create({
        full_name: 'Client Test',
        phone: '+2250700000001',
        email: 'client@test.com',
        user_type: 'client',
        is_active: true,
        is_verified: true
      });
      console.log('✅ Client de test créé');
    } else {
      console.log(`✅ Client existant: ${client.full_name}`);
    }

    // Récupérer une coiffure existante
    const hairstyle = await Hairstyle.findOne({
      where: { is_active: true }
    });

    if (!hairstyle) {
      console.log('❌ Aucune coiffure trouvée dans la base de données');
      return;
    }

    console.log(`✅ Coiffure trouvée: ${hairstyle.name}`);

    // Créer une réservation de test
    const bookingData = {
      client_id: client.id,
      client_name: client.full_name,
      client_phone: client.phone,
      hairdresser_id: hairdresser.id,
      hairstyle_id: hairstyle.id,
      service_type: 'home',
      status: 'pending',
      scheduled_time: new Date(Date.now() + 2 * 60 * 60 * 1000), // Dans 2 heures
      estimated_duration: hairstyle.estimated_duration || 60,
      client_price: 5000, // Prix fixe pour le test
      service_fee: 500,
      location_address: 'Abidjan, Cocody, Zone 4',
      latitude: 5.3600,
      longitude: -4.0083
    };

    const booking = await Booking.create(bookingData);
    console.log('✅ Réservation créée avec succès:');
    console.log(`   ID: ${booking.id}`);
    console.log(`   Client: ${client.full_name}`);
    console.log(`   Coiffeur: ${hairdresser.full_name}`);
    console.log(`   Coiffure: ${hairstyle.name}`);
    console.log(`   Heure: ${booking.scheduled_time}`);
    console.log(`   Prix: ${booking.client_price} FCFA`);
    console.log(`   Adresse: ${booking.location_address}`);

    console.log('\n🎉 Réservation de test créée !');
    console.log('📱 Vous pouvez maintenant vérifier l\'affichage dans l\'application mobile coiffeur');

  } catch (error) {
    console.error('❌ Erreur lors de la création de la réservation:', error);
  } finally {
    await sequelize.close();
  }
}

createTestBooking();
