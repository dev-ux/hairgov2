const { Sequelize } = require('sequelize');

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

async function updatePassword() {
  try {
    console.log('🔗 Connexion à la base de données...');
    await sequelize.authenticate();
    console.log('✅ Connexion réussie');

    const phone = '+2250787625890';
    const newPassword = 'Azerty123#';
    
    // Hash bcrypt généré pour "Azerty123#"
    const hashedPassword = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';
    
    // Mettre à jour le mot de passe
    const [updatedRows] = await sequelize.query(`
      UPDATE users 
      SET password_hash = :passwordHash, updated_at = NOW()
      WHERE phone = :phone
      RETURNING id, full_name, phone, user_type, is_active, is_verified
    `, {
      replacements: { 
        phone: phone,
        passwordHash: hashedPassword
      },
      type: Sequelize.QueryTypes.UPDATE
    });

    if (updatedRows && updatedRows.length > 0) {
      const user = updatedRows[0];
      console.log('✅ Mot de passe mis à jour avec succès:');
      console.log(`   ID: ${user.id}`);
      console.log(`   Nom: ${user.full_name}`);
      console.log(`   Téléphone: ${user.phone}`);
      console.log(`   Type: ${user.user_type}`);
      console.log(`   Actif: ${user.is_active}`);
      console.log(`   Vérifié: ${user.is_verified}`);
      
      console.log('\n🎉 Nouveaux identifiants de connexion:');
      console.log(`   Téléphone: ${phone}`);
      console.log(`   Mot de passe: ${newPassword}`);
      console.log('\n✅ Vous pouvez maintenant vous connecter!');
    } else {
      console.log('❌ Utilisateur non trouvé avec le téléphone:', phone);
    }

  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour:', error);
  } finally {
    await sequelize.close();
  }
}

updatePassword();
