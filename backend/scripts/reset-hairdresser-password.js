const { Sequelize } = require('sequelize');
const bcrypt = require('bcrypt');

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

// Définition du modèle User
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
  password_hash: {
    type: Sequelize.STRING,
    allowNull: false
  },
  user_type: {
    type: Sequelize.ENUM('client', 'hairdresser', 'admin'),
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
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

async function resetHairdresserPassword() {
  try {
    console.log('🔗 Connexion à la base de données...');
    await sequelize.authenticate();
    console.log('✅ Connexion réussie');

    const phone = '+2250787625890';
    const newPassword = 'Coiffeur123!';
    
    // Trouver le coiffeur
    const user = await User.findOne({
      where: { phone }
    });

    if (!user) {
      console.log('❌ Coiffeur non trouvé avec le téléphone:', phone);
      return;
    }

    console.log(`✅ Coiffeur trouvé: ${user.full_name}`);
    console.log(`   Type: ${user.user_type}`);
    console.log(`   Actif: ${user.is_active}`);
    console.log(`   Vérifié: ${user.is_verified}`);

    // Hasher le nouveau mot de passe
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    // Mettre à jour le mot de passe
    await user.update({
      password_hash: hashedPassword,
      is_verified: true // Activer la vérification aussi
    });

    console.log('✅ Mot de passe réinitialisé avec succès:');
    console.log(`   Téléphone: ${phone}`);
    console.log(`   Nouveau mot de passe: ${newPassword}`);
    console.log(`   Vérifié: ✅`);
    
    console.log('\n🎉 Vous pouvez maintenant vous connecter avec:');
    console.log(`   Téléphone: ${phone}`);
    console.log(`   Mot de passe: ${newPassword}`);

  } catch (error) {
    console.error('❌ Erreur lors de la réinitialisation:', error);
  } finally {
    await sequelize.close();
  }
}

resetHairdresserPassword();
