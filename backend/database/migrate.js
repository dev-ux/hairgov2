// database/migrate.js
const { sequelize } = require('../models');
const fs = require('fs');
const path = require('path');
const { 
  User, 
  Hairdresser, 
  Hairstyle, 
  Booking,
  Rating,
  BalanceTransaction 
} = require('../models');
const bcrypt = require('bcryptjs');

// In your migrate.js file, update the runMigrations function
const runMigrations = async () => {
  const transaction = await sequelize.transaction();
  
  try {
    console.log('🔄 Démarrage des migrations...\n');
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données établie\n');
    
    // Désactiver temporairement les contraintes de clé étrangère
    await sequelize.query('SET session_replication_role = "replica";', { transaction });
    console.log('🔓 Contraintes de clé étrangère désactivées\n');
    
    // Lire et exécuter le schéma SQL
    const schemaPath = path.join(__dirname, 'schema.sql');
    let schema = fs.readFileSync(schemaPath, 'utf8');

    // Rendre l'extension PostGIS optionnelle
    schema = schema.replace(
      'CREATE EXTENSION IF NOT EXISTS "postgis";',
      '-- CREATE EXTENSION IF NOT EXISTS "postgis"; -- PostGIS est optionnel'
    );

    // Diviser en commandes individuelles
    const commands = schema
      .split(';')
      .filter(cmd => cmd.trim().length > 0)
      .map(cmd => cmd.trim() + ';');

    console.log(`📝 Exécution de ${commands.length} commandes SQL...\n`);
    
    for (let i = 0; i < commands.length; i++) {
      try {
        // Skip comments and empty lines
        if (commands[i].trim().startsWith('--') || commands[i].trim() === ';') {
          console.log(`⏩ Commande ${i + 1}/${commands.length} ignorée (commentaire)`);
          continue;
        }
        
        await sequelize.query(commands[i], { transaction });
        console.log(`✓ Commande ${i + 1}/${commands.length} exécutée`);
      } catch (error) {
        // Ignorer les erreurs de création si existe déjà
        if (!error.message.includes('already exists')) {
          console.error(`⚠️  Erreur commande ${i + 1}:`, error.message);
          console.log('⏩ Poursuite malgré l\'erreur...');
          // Ne pas arrêter en cas d'erreur pour les extensions optionnelles
        }
      }
    }

    // Réactiver les contraintes de clé étrangère
    await sequelize.query('SET session_replication_role = "origin";', { transaction });
    console.log('\n🔒 Contraintes de clé étrangère réactivées\n');

    // Valider la transaction
    await transaction.commit();
    console.log('\n✅ Migrations terminées avec succès!\n');

    // Synchroniser les modèles Sequelize
    console.log('🔄 Synchronisation des modèles Sequelize...\n');
    await sequelize.sync({ alter: true });
    console.log('✅ Modèles synchronisés!\n');

    return true;
  } catch (error) {
    // En cas d'erreur, annuler la transaction
    if (transaction.finished !== 'commit') {
      await transaction.rollback();
    }
    console.error('❌ Erreur lors des migrations:', error.message);
    return false;
  }
};

const seedData = async () => {
  const transaction = await sequelize.transaction();
  
  try {
    console.log(' Démarrage du peuplement de la base de données...\n');

    // Vérifier si les tables existent avant de les vider
    const tableCheck = await sequelize.query(
      `SELECT table_name 
       FROM information_schema.tables 
       WHERE table_schema = 'public' 
       AND table_name IN ('ratings', 'balance_transactions', 'bookings', 'hairdressers', 'users', 'hairstyles')`,
      { type: sequelize.QueryTypes.SELECT, transaction }
    );

    const existingTables = tableCheck.map(t => t.table_name);
    
    if (existingTables.length > 0) {
      console.log(' Nettoyage des données existantes...');
      
      // Désactiver temporairement les contraintes de clé étrangère
      await sequelize.query('SET session_replication_role = "replica";', { transaction });
      
      // Vider uniquement les tables qui existent
      const truncatePromises = [];
      
      if (existingTables.includes('ratings')) {
        truncatePromises.push(
          Rating.destroy({ where: {}, truncate: true, cascade: true, transaction })
        );
      }
      
      if (existingTables.includes('balance_transactions')) {
        truncatePromises.push(
          BalanceTransaction.destroy({ where: {}, truncate: true, cascade: true, transaction })
        );
      }
      
      if (existingTables.includes('bookings')) {
        truncatePromises.push(
          Booking.destroy({ where: {}, truncate: true, cascade: true, transaction })
        );
      }
      
      if (existingTables.includes('hairdressers')) {
        truncatePromises.push(
          Hairdresser.destroy({ where: {}, truncate: true, cascade: true, transaction })
        );
      }
      
      if (existingTables.includes('users')) {
        truncatePromises.push(
          User.destroy({ where: {}, truncate: true, cascade: true, transaction })
        );
      }
      
      if (existingTables.includes('hairstyles')) {
        truncatePromises.push(
          Hairstyle.destroy({ where: {}, truncate: true, cascade: true, transaction })
        );
      }
      
      await Promise.all(truncatePromises);
      
      // Réactiver les contraintes de clé étrangère
      await sequelize.query('SET session_replication_role = "origin";', { transaction });
      
      console.log(' Tables nettoyées\n');
    } else {
      console.log(' Aucune table existante à nettoyer, poursuite du peuplement...\n');
    }

    // 1. Créer un admin
    console.log(' Création de l\'administrateur...');
    const admin = await User.create({
      email: 'admin@hairgo.com',
      phone: '+225070000000',
      password_hash: await bcrypt.hash('Admin123!', 10),
      user_type: 'admin',
      full_name: 'Administrateur HAIRGO',
      is_verified: true,
      is_active: true
    }, { transaction });
    console.log(' Admin créé:', admin.email, '\n');

    // 2. Créer des coiffures
    console.log(' Création des coiffures...');
    const hairstyles = await Hairstyle.bulkCreate([
      {
        name: 'Tresse Africaine',
        description: 'Tresses traditionnelles africaines',
        estimated_duration: 120,
        category: 'femme',
        photo: 'https://example.com/tresse.jpg'
      },
      {
        name: 'Coupe Homme Classique',
        description: 'Coupe classique avec dégradé',
        estimated_duration: 30,
        category: 'homme',
        photo: 'https://example.com/coupe-homme.jpg'
      },
      {
        name: 'Défrisage',
        description: 'Défrisage et lissage',
        estimated_duration: 90,
        category: 'femme',
        photo: 'https://example.com/defrisage.jpg'
      },
      {
        name: 'Locks',
        description: 'Installation de locks',
        estimated_duration: 180,
        category: 'mixte',
        photo: 'https://example.com/locks.jpg'
      },
      {
        name: 'Coupe Enfant',
        description: 'Coupe adaptée aux enfants',
        estimated_duration: 20,
        category: 'enfant',
        photo: 'https://example.com/coupe-enfant.jpg'
      },
      {
        name: 'Tissage',
        description: 'Pose de tissage',
        estimated_duration: 150,
        category: 'femme',
        photo: 'https://example.com/tissage.jpg'
      },
      {
        name: 'Taille de barbe',
        description: 'Taille et entretien de barbe',
        estimated_duration: 25,
        category: 'homme',
        photo: 'https://example.com/barbe.jpg'
      },
      {
        name: 'Coloration',
        description: 'Coloration complète',
        estimated_duration: 120,
        category: 'mixte',
        photo: 'https://example.com/coloration.jpg'
      }
    ], { transaction });
    console.log(` ${hairstyles.length} coiffures créées\n`);

    // 3. Créer des utilisateurs de test (clients)
    console.log(' Création des utilisateurs de test...');
    const users = await User.bulkCreate([
      {
        email: 'client1@example.com',
        phone: '+225070000001',
        password_hash: await bcrypt.hash('Client123!', 10),
        user_type: 'client',
        full_name: 'Jean Dupont',
        is_verified: true,
        is_active: true
      },
      {
        email: 'client2@example.com',
        phone: '+225070000002',
        password_hash: await bcrypt.hash('Client123!', 10),
        user_type: 'client',
        full_name: 'Marie Kouamé',
        is_verified: true,
        is_active: true
      }
    ], { transaction });
    console.log(` ${users.length} utilisateurs créés\n`);

    // 4. Créer des coiffeurs de test
    console.log(' Création des coiffeurs de test...');
    const hairdressers = await Hairdresser.bulkCreate([
      {
        user_id: users[0].id,
        profession: 'Coiffeur professionnel',
        residential_address: 'Abidjan, Cocody',
        registration_status: 'approved',
        is_available: true,
        latitude: 5.3599517,
        longitude: -4.0082563
      },
      {
        user_id: users[1].id,
        profession: 'Spécialiste en tresses',
        residential_address: 'Abidjan, Yopougon',
        registration_status: 'approved',
        is_available: true,
        latitude: 5.3166667,
        longitude: -4.0666667
      }
    ], { transaction });
    console.log(` ${hairdressers.length} coiffeurs créés\n`);

    // 5. Créer des réservations de test
    console.log(' Création des réservations de test...');
    const bookings = await Booking.bulkCreate([
      {
        client_id: users[0].id,
        client_name: 'Jean Dupont',
        client_phone: '+225070000001',
        hairdresser_id: hairdressers[0].id,
        hairstyle_id: hairstyles[0].id,
        service_type: 'home',
        service_fee: 5000,
        client_price: 8000,
        status: 'completed',
        location_address: 'Abidjan, Cocody',
        latitude: 5.3599517,
        longitude: -4.0082563,
        estimated_duration: 120,
        scheduled_time: new Date(Date.now() - 86400000), // Hier
        started_at: new Date(Date.now() - 86400000 + 3600000),
        completed_at: new Date(Date.now() - 86400000 + 10800000)
      },
      {
        client_id: users[1].id,
        client_name: 'Marie Kouamé',
        client_phone: '+225070000002',
        hairdresser_id: hairdressers[1].id,
        hairstyle_id: hairstyles[1].id,
        service_type: 'salon',
        service_fee: 3000,
        client_price: 6000,
        status: 'in_progress',
        location_address: 'Abidjan, Yopougon',
        latitude: 5.3166667,
        longitude: -4.0666667,
        estimated_duration: 60,
        scheduled_time: new Date(),
        started_at: new Date()
      }
    ], { transaction });
    console.log(` ${bookings.length} réservations créées\n`);

    // 6. Créer des évaluations de test
    console.log(' Création des évaluations de test...');
    const ratings = await Rating.bulkCreate([
      {
        booking_id: bookings[0].id,
        hairdresser_id: hairdressers[0].id,
        client_id: users[0].id,
        rating: 5,
        comment: 'Excellent service, très professionnel!'
      },
      {
        booking_id: bookings[1].id,
        hairdresser_id: hairdressers[1].id,
        client_id: users[1].id,
        rating: 4,
        comment: 'Très bon coiffeur, je recommande!'
      }
    ], { transaction });
    console.log(` ${ratings.length} évaluations créées\n`);

    // 7. Créer des transactions de test
    console.log(' Création des transactions de test...');
    const transactions = await BalanceTransaction.bulkCreate([
      {
        hairdresser_id: hairdressers[0].id,
        transaction_type: 'recharge',
        amount: 10000,
        balance_before: 0,
        balance_after: 10000,
        description: 'Recharge initiale',
        status: 'approved',
        approved_by: admin.id
      },
      {
        hairdresser_id: hairdressers[1].id,
        transaction_type: 'recharge',
        amount: 15000,
        balance_before: 0,
        balance_after: 15000,
        description: 'Recharge initiale',
        status: 'approved',
        approved_by: admin.id
      }
    ], { transaction });
    console.log(` ${transactions.length} transactions créées\n');

    // Valider la transaction
    await transaction.commit();
    
    console.log('\n Peuplement de la base de données terminé avec succès!\n');
    console.log(' Résumé:');
    console.log('Admin: admin@hairgo.com / Admin123!`);
    console.log(`${users.length} utilisateurs`);
    console.log(`${hairdressers.length} coiffeurs`);
    console.log(`${hairstyles.length} coiffures`);
    console.log(`${bookings.length} réservations\n`);
    
    return true;
  } catch (error) {
    // En cas d'erreur, annuler la transaction
    if (transaction.finished !== 'commit') {
      await transaction.rollback();
    }
    console.error(' Erreur lors du peuplement de la base de données:', error);
    throw error; // Propager l'erreur pour une gestion plus haut niveau
  }
};

// Exécuter les migrations puis le peuplement
const runAll = async () => {
  try {
    console.log('🚀 Démarrage du processus de migration et de peuplement...\n');
    
    // 1. Exécuter les migrations
    console.log('🔄 Exécution des migrations...');
    const migrationSuccess = await runMigrations();
    
    if (!migrationSuccess) {
      console.error('❌ Échec des migrations, arrêt du processus');
      process.exit(1);
    }
    
    // 2. Peupler la base de données
    console.log('\n🌱 Démarrage du peuplement des données...');
    await seedData();
    
    console.log('\n✅ Tâches terminées avec succès!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Erreur critique lors de l\'exécution:', error);
    process.exit(1);
  }
};

// Démarrer le processus
runAll();