// run-migration-favorites.js
require('dotenv').config();
const { sequelize } = require('./models');

async function runMigration() {
  try {
    console.log('🚀 Démarrage de la migration pour la table favorites...');
    
    // Synchroniser la base de données avec le nouveau modèle
    await sequelize.sync({ alter: true });
    
    console.log('✅ Table favorites créée avec succès!');
    
    // Vérifier que la table existe
    const [results] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'favorites'
    `);
    
    if (results.length > 0) {
      console.log('✅ Vérification: La table favorites existe bien dans la base de données');
    } else {
      console.log('❌ Erreur: La table favorites n\'a pas été créée');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

runMigration();
