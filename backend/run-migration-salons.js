// run-migration-salons.js
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

async function updateFavoritesTable() {
  try {
    console.log('🚀 Mise à jour de la table favorites pour supporter les salons...');
    
    // Ajouter les nouvelles colonnes
    await sequelize.query(`
      ALTER TABLE favorites 
      ADD COLUMN IF NOT EXISTS salon_id UUID,
      ADD COLUMN IF NOT EXISTS hairstyle_id UUID,
      ADD COLUMN IF NOT EXISTS favorite_type VARCHAR(20) NOT NULL DEFAULT 'hairdresser'
    `);
    
    console.log('✅ Colonnes ajoutées avec succès');
    
    // Mettre à jour les enregistrements existants
    await sequelize.query(`
      UPDATE favorites 
      SET favorite_type = 'hairdresser' 
      WHERE favorite_type IS NULL OR favorite_type = ''
    `);
    
    console.log('✅ Enregistrements existants mis à jour');
    
    // Rendre hairdresser_id nullable
    await sequelize.query(`
      ALTER TABLE favorites 
      ALTER COLUMN hairdresser_id DROP NOT NULL
    `);
    
    console.log('✅ hairdresser_id rendu nullable');
    
    // Ajouter les contraintes de clé étrangère
    await sequelize.query(`
      ALTER TABLE favorites 
      ADD CONSTRAINT IF NOT EXISTS favorites_salon_id_fkey 
      FOREIGN KEY (salon_id) REFERENCES salons(id) ON DELETE CASCADE
    `);
    
    await sequelize.query(`
      ALTER TABLE favorites 
      ADD CONSTRAINT IF NOT EXISTS favorites_hairstyle_id_fkey 
      FOREIGN KEY (hairstyle_id) REFERENCES hairstyles(id) ON DELETE CASCADE
    `);
    
    console.log('✅ Contraintes de clé étrangère ajoutées');
    
    // Vérifier la structure de la table
    const [results] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'favorites'
      ORDER BY ordinal_position
    `);
    
    console.log('📊 Structure mise à jour de la table favorites:');
    results.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable}) ${col.column_default || ''}`);
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

updateFavoritesTable();
