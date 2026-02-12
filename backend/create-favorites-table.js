// create-favorites-table.js
require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');

// Configuration pour la base de données PostgreSQL (production)
let sequelize;

if (process.env.NODE_ENV === 'production') {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: { 
        require: true, 
        rejectUnauthorized: false 
      }
    },
    logging: false
  });
} else {
  // Configuration locale (si besoin)
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging: console.log
  });
}

async function createFavoritesTable() {
  try {
    console.log('🚀 Création de la table favorites...');
    
    // Définition du modèle Favorite
    const Favorite = sequelize.define('Favorite', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      client_id: {
        type: DataTypes.UUID,
        allowNull: false
      },
      hairdresser_id: {
        type: DataTypes.UUID,
        allowNull: false
      },
      is_favorite: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      }
    }, {
      tableName: 'favorites',
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      indexes: [
        {
          unique: true,
          fields: ['client_id', 'hairdresser_id']
        }
      ]
    });

    // Créer la table
    await Favorite.sync({ force: false });
    
    console.log('✅ Table favorites créée avec succès!');
    
    // Vérifier que la table existe
    if (process.env.NODE_ENV === 'production') {
      const [results] = await sequelize.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'favorites'
      `);
      
      if (results.length > 0) {
        console.log('✅ Vérification: La table favorites existe bien dans PostgreSQL');
      } else {
        console.log('❌ Erreur: La table favorites n\'a pas été créée');
      }
    } else {
      console.log('✅ Vérification: La table favorites existe bien dans SQLite');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la création:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

createFavoritesTable();
