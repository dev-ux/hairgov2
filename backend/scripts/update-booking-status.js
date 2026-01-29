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

async function updateBookingStatus() {
  try {
    console.log('🔗 Connexion à la base de données...');
    await sequelize.authenticate();
    console.log('✅ Connexion réussie');

    const bookingId = '48f2de32-d945-4933-a07b-4deea01d9c38';
    
    // Mettre à jour le statut de la réservation
    const [updatedRows] = await sequelize.query(`
      UPDATE bookings 
      SET status = 'accepted', 
          updated_at = NOW()
      WHERE id = :bookingId
      RETURNING *
    `, {
      replacements: { bookingId },
      type: Sequelize.QueryTypes.UPDATE
    });

    if (updatedRows && updatedRows.length > 0) {
      const booking = updatedRows[0];
      console.log('✅ Réservation mise à jour avec succès:');
      console.log(`   ID: ${booking.id}`);
      console.log(`   Client: ${booking.client_name}`);
      console.log(`   Téléphone: ${booking.client_phone}`);
      console.log(`   Statut: ${booking.status}`);
      console.log(`   Heure: ${booking.scheduled_time}`);
      console.log(`   Prix: ${booking.client_price} FCFA`);
      console.log(`   Adresse: ${booking.location_address}`);
      console.log(`   Mis à jour le: ${booking.updated_at}`);
      
      console.log('\n🎉 La réservation est maintenant confirmée !');
      console.log('📱 Vous pouvez vérifier le changement dans l\'application mobile coiffeur');
    } else {
      console.log('❌ Réservation non trouvée avec l\'ID:', bookingId);
    }

  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour de la réservation:', error);
  } finally {
    await sequelize.close();
  }
}

updateBookingStatus();
