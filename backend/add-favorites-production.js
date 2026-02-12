// add-favorites-production.js
require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');

// Configuration PostgreSQL production avec variables individuelles
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || process.env.PGHOST,
  port: parseInt(process.env.DB_PORT || process.env.PGPORT || '5432'),
  database: process.env.DB_NAME || process.env.PGDATABASE,
  username: process.env.DB_USER || process.env.PGUSER,
  password: process.env.DB_PASSWORD || process.env.PGPASSWORD,
  dialectOptions: {
    ssl: process.env.DB_HOST ? { 
      require: true, 
      rejectUnauthorized: false 
    } : false
  },
  logging: console.log
});

async function addFavoritesToProduction() {
  try {
    console.log('🚀 Connexion à la base de données PostgreSQL...');
    await sequelize.authenticate();
    console.log('✅ Connexion réussie à PostgreSQL');
    
    // Créer la table favorites directement
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS favorites (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        hairdresser_id UUID NOT NULL REFERENCES hairdressers(id) ON DELETE CASCADE,
        is_favorite BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(client_id, hairdresser_id)
      );
    `);
    
    console.log('✅ Table favorites créée avec succès en production!');
    
    // Créer les index
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_favorites_client_id ON favorites(client_id);
    `);
    
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_favorites_hairdresser_id ON favorites(hairdresser_id);
    `);
    
    console.log('✅ Index créés avec succès!');
    
    // Vérifier que la table existe
    const [results] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'favorites'
    `);
    
    if (results.length > 0) {
      console.log('✅ Vérification: La table favorites existe bien dans la base de données production');
      
      // Afficher la structure de la table
      const [tableInfo] = await sequelize.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'favorites'
        ORDER BY ordinal_position
      `);
      
      console.log('📊 Structure de la table favorites:');
      tableInfo.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable}) ${col.column_default || ''}`);
      });
      
    } else {
      console.log('❌ Erreur: La table favorites n\'a pas été créée');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la création en production:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

addFavoritesToProduction();
