// models/index.js - VERSION COMPLETE ET CORRIGEE
require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
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
  }
);

// ==========================================
// MODELE USER
// ==========================================
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
  profile_photo: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  fcm_token: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'users',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeCreate: async (user) => {
      if (user.password_hash) {
        user.password_hash = await bcrypt.hash(user.password_hash, 10);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password_hash')) {
        user.password_hash = await bcrypt.hash(user.password_hash, 10);
      }
    }
  }
});

User.prototype.validatePassword = async function(password) {
  return await bcrypt.compare(password, this.password_hash);
};

User.prototype.toJSON = function() {
  const values = { ...this.get() };
  delete values.password_hash;
  return values;
};

// ==========================================
// MODELE HAIRDRESSER
// ==========================================
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
  date_of_birth: DataTypes.DATEONLY,
  id_card_number: DataTypes.STRING(50),
  id_card_photo: DataTypes.STRING(500),
  has_salon: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  education_level: DataTypes.STRING(50),
  registration_status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending'
  },
  balance: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  total_earnings: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
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
  },
  current_job_id: DataTypes.UUID,
  latitude: DataTypes.DECIMAL(10, 8),
  longitude: DataTypes.DECIMAL(11, 8)
}, {
  tableName: 'hairdressers',
  timestamps: true,
  underscored: true
});

// ==========================================
// MODELE HAIRSTYLE
// ==========================================
const Hairstyle = sequelize.define('Hairstyle', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: DataTypes.TEXT,
  photo: DataTypes.STRING(500),
  estimated_duration: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  category: DataTypes.STRING(50),
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'hairstyles',
  timestamps: true,
  underscored: true
});

// ==========================================
// MODELE BOOKING
// ==========================================
const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  client_id: DataTypes.UUID,
  client_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  client_phone: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  hairdresser_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  hairstyle_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  service_type: {
    type: DataTypes.ENUM('home', 'salon'),
    allowNull: false
  },
  service_fee: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  client_price: DataTypes.DECIMAL(10, 2),
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'rejected', 'in_progress', 'completed', 'cancelled'),
    defaultValue: 'pending'
  },
  location_address: {
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
  estimated_duration: DataTypes.INTEGER,
  scheduled_time: DataTypes.DATE,
  started_at: DataTypes.DATE,
  completed_at: DataTypes.DATE,
  cancelled_at: DataTypes.DATE,
  cancellation_reason: DataTypes.TEXT,
  extension_requested: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  extension_minutes: DataTypes.INTEGER,
  extension_approved: DataTypes.BOOLEAN
}, {
  tableName: 'bookings',
  timestamps: true,
  underscored: true
});

// ==========================================
// MODELE RATING
// ==========================================
const Rating = sequelize.define('Rating', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  booking_id: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true
  },
  hairdresser_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  client_id: DataTypes.UUID,
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1, max: 5 }
  },
  comment: DataTypes.TEXT
}, {
  tableName: 'ratings',
  timestamps: true,
  underscored: true
});

// ==========================================
// MODELE BALANCE TRANSACTION
// ==========================================
const BalanceTransaction = sequelize.define('BalanceTransaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  hairdresser_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  transaction_type: {
    type: DataTypes.ENUM('recharge', 'deduction', 'bonus', 'refund'),
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  balance_before: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  balance_after: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  booking_id: DataTypes.UUID,
  description: DataTypes.TEXT,
  approved_by: DataTypes.UUID,
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending'
  }
}, {
  tableName: 'balance_transactions',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: false
});

// ==========================================
// MODELE NOTIFICATION
// ==========================================
const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  body: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  type: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  data: DataTypes.JSONB,
  is_read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  sent_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'notifications',
  timestamps: false
});

// ==========================================
// MODELE COMPLAINT
// ==========================================
const Complaint = sequelize.define('Complaint', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: DataTypes.UUID,
  booking_id: DataTypes.UUID,
  subject: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('open', 'in_progress', 'resolved', 'closed'),
    defaultValue: 'open'
  },
  resolved_by: DataTypes.UUID,
  resolution_notes: DataTypes.TEXT,
  resolved_at: DataTypes.DATE
}, {
  tableName: 'complaints',
  timestamps: true,
  underscored: true
});

// ==========================================
// MODELE SALON_PHOTO
// ==========================================
const SalonPhoto = sequelize.define('SalonPhoto', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  salon_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'salons',
      key: 'id'
    }
  },
  url: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  is_primary: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'salon_photos',
  timestamps: true,
  underscored: true
});

// ==========================================
// MODELE SALON
// ==========================================
const Salon = sequelize.define('Salon', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  hairdresser_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'hairdressers',
      key: 'id'
    }
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
  photos: {
    type: DataTypes.ARRAY(DataTypes.TEXT),
    defaultValue: []
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

// ==========================================
// RELATIONS
// ==========================================
User.hasOne(Hairdresser, { foreignKey: 'user_id', as: 'hairdresserProfile' });
Hairdresser.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Hairdresser.belongsToMany(Hairstyle, { 
  through: 'hairdresser_hairstyles', 
  foreignKey: 'hairdresser_id',
  as: 'hairstyles' 
});
Hairstyle.belongsToMany(Hairdresser, { 
  through: 'hairdresser_hairstyles', 
  foreignKey: 'hairstyle_id',
  as: 'hairdressers' 
});

Booking.belongsTo(User, { foreignKey: 'client_id', as: 'client' });
Booking.belongsTo(Hairdresser, { foreignKey: 'hairdresser_id', as: 'hairdresser' });
Booking.belongsTo(Hairstyle, { foreignKey: 'hairstyle_id', as: 'hairstyle' });

Hairdresser.hasMany(Booking, { foreignKey: 'hairdresser_id', as: 'bookings' });
User.hasMany(Booking, { foreignKey: 'client_id', as: 'bookings' });

Rating.belongsTo(Booking, { foreignKey: 'booking_id', as: 'booking' });
Rating.belongsTo(Hairdresser, { foreignKey: 'hairdresser_id', as: 'hairdresser' });
Rating.belongsTo(User, { foreignKey: 'client_id', as: 'client' });

Hairdresser.hasMany(Rating, { foreignKey: 'hairdresser_id', as: 'ratings' });
Booking.hasOne(Rating, { foreignKey: 'booking_id', as: 'rating' });

BalanceTransaction.belongsTo(Hairdresser, { foreignKey: 'hairdresser_id', as: 'hairdresser' });
BalanceTransaction.belongsTo(Booking, { foreignKey: 'booking_id', as: 'booking' });

Hairdresser.hasMany(BalanceTransaction, { foreignKey: 'hairdresser_id', as: 'transactions' });

Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });

Complaint.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Complaint.belongsTo(Booking, { foreignKey: 'booking_id', as: 'booking' });
User.hasMany(Complaint, { foreignKey: 'user_id', as: 'complaints' });

// Relations pour Salon
Salon.belongsTo(Hairdresser, { foreignKey: 'hairdresser_id', as: 'hairdresser' });
Hairdresser.hasOne(Salon, { foreignKey: 'hairdresser_id', as: 'salon' });

// ==========================================
// EXPORTS
// ==========================================// Initialiser les associations
const models = {
  User,
  Hairdresser,
  Hairstyle,
  Booking,
  Rating,
  BalanceTransaction,
  Notification,
  Complaint,
  Salon,
  SalonPhoto
};

// Exporter les modèles et l'instance sequelize
module.exports = {
  sequelize,
  Sequelize,
  ...models
};