const { Sequelize, DataTypes } = require('sequelize');

// Configuration PostgreSQL avec l'URL directe
const sequelize = new Sequelize('postgresql://hairgo_db_user:1DtXFsNyMEUajSdcmXvxSKfgc9OEh8iI@dpg-d5nh6qkoud1c739vgr4g-a.oregon-postgres.render.com/hairgo_db', {
  dialect: 'postgres',
  logging: console.log,
  dialectOptions: {
    ssl: {
      require: false,
      rejectUnauthorized: false
    }
  }
});

// Définition du modèle User avec les hooks pour le hashage
const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  full_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: false
  },
  user_type: {
    type: DataTypes.ENUM('client', 'hairdresser', 'admin'),
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
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  hooks: {
    beforeCreate: async (user) => {
      if (user.password_hash) {
        const bcrypt = require('bcrypt');
        const saltRounds = 10;
        user.password_hash = await bcrypt.hash(user.password_hash, saltRounds);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password_hash')) {
        const bcrypt = require('bcrypt');
        const saltRounds = 10;
        user.password_hash = await bcrypt.hash(user.password_hash, saltRounds);
      }
    }
  }
});

async function fixPassword() {
  try {
    console.log('🔗 Connexion à la base de données...');
    await sequelize.authenticate();
    console.log('✅ Connexion réussie');

    const phone = '+2250787625890';
    const newPassword = '123456';
    
    // Trouver l'utilisateur
    const user = await User.findOne({
      where: { phone }
    });

    if (!user) {
      console.log('❌ Utilisateur non trouvé avec le téléphone:', phone);
      return;
    }

    console.log(`✅ Utilisateur trouvé: ${user.full_name}`);

    // Utiliser le hook pour hasher correctement le mot de passe
    await user.update({
      password_hash: newPassword, // Le hook va hasher automatiquement
      is_verified: true
    });

    console.log('✅ Mot de passe corrigé avec succès:');
    console.log(`   Téléphone: ${phone}`);
    console.log(`   Nouveau mot de passe: ${newPassword}`);
    console.log(`   Hash généré: ${user.password_hash}`);
    console.log(`   Vérifié: ✅`);
    
    console.log('\n🎉 Vous pouvez maintenant vous connecter avec:');
    console.log(`   Téléphone: ${phone}`);
    console.log(`   Mot de passe: ${newPassword}`);

  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error);
  } finally {
    await sequelize.close();
  }
}

fixPassword();
