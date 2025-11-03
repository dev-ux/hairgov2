require('dotenv').config();
const { Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');

// Configuration de la connexion à la base de données
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false
  }
);

// Modèle User
const User = sequelize.define('User', {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true
  },
  email: {
    type: Sequelize.STRING(255),
    unique: true,
    allowNull: true,
    validate: { isEmail: true }
  },
  phone: {
    type: Sequelize.STRING(20),
    allowNull: false,
    unique: true,
    validate: { is: /^\+[1-9]\d{1,14}$/ }
  },
  password_hash: {
    type: Sequelize.STRING(255),
    allowNull: true
  },
  user_type: {
    type: Sequelize.ENUM('client', 'hairdresser', 'admin'),
    allowNull: false
  },
  full_name: {
    type: Sequelize.STRING(255),
    allowNull: false
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
  timestamps: true,
  underscored: true
});

// Fonction pour créer un administrateur
async function createAdmin() {
  try {
    // Vérifier si l'admin existe déjà
    const existingAdmin = await User.findOne({ where: { email: 'admin@hairgo.com' } });
    
    if (existingAdmin) {
      console.log('Un administrateur avec cet email existe déjà.');
      process.exit(0);
    }

    // Hasher le mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Admin123!', salt);

    // Créer l'administrateur
    const admin = await User.create({
      full_name: 'Admin HairGo',
      email: 'admin@hairgo.com',
      phone: '+33600000000', // Numéro factice, nécessaire car le champ est obligatoire
      password_hash: hashedPassword,
      user_type: 'admin',
      is_verified: true,
      is_active: true
    });

    console.log('Administrateur créé avec succès:');
    console.log({
      id: admin.id,
      email: admin.email,
      user_type: admin.user_type,
      is_verified: admin.is_verified,
      is_active: admin.is_active
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Erreur lors de la création de l\'administrateur:', error);
    process.exit(1);
  }
}

// Exécuter la fonction
createAdmin();
