const { sequelize } = require('../models');

/**
 * @desc    Créer la table trend_hairstyles manquante
 * @route   POST /api/v1/migrate/trend-hairstyles
 * @access  Admin (temporairement ouvert pour la migration)
 */
exports.createTrendHairstylesTable = async (req, res) => {
  try {
    // Vérifier si la table existe déjà
    const tableCheck = await sequelize.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'trend_hairstyles'
      );
    `);

    const tableExists = tableCheck[0][0].exists;

    if (tableExists) {
      return res.status(200).json({
        success: true,
        message: 'La table trend_hairstyles existe déjà'
      });
    }

    // Créer la table
    await sequelize.query(`
      CREATE TABLE trend_hairstyles (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        hairstyle_id UUID NOT NULL REFERENCES hairstyles(id) ON DELETE CASCADE,
        trending_score DECIMAL(3, 2) NOT NULL DEFAULT 0.00,
        category VARCHAR(20) NOT NULL DEFAULT 'Mixte' CHECK (category IN ('Homme', 'Femme', 'Mixte', 'Enfant')),
        difficulty VARCHAR(20) NOT NULL DEFAULT 'moyen' CHECK (difficulty IN ('facile', 'moyen', 'difficile')),
        duration_minutes INTEGER,
        price_range VARCHAR(50),
        is_active BOOLEAN DEFAULT true,
        start_date TIMESTAMP,
        end_date TIMESTAMP,
        added_by UUID REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(hairstyle_id)
      );
    `);

    // Créer les index
    await sequelize.query(`
      CREATE INDEX idx_trend_hairstyles_hairstyle ON trend_hairstyles(hairstyle_id);
      CREATE INDEX idx_trend_hairstyles_active ON trend_hairstyles(is_active);
      CREATE INDEX idx_trend_hairstyles_score ON trend_hairstyles(trending_score);
    `);

    // Créer le trigger pour updated_at
    await sequelize.query(`
      CREATE TRIGGER update_trend_hairstyles_updated_at 
        BEFORE UPDATE ON trend_hairstyles 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

    res.status(201).json({
      success: true,
      message: 'Table trend_hairstyles créée avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la création de la table:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'MIGRATION_ERROR',
        message: 'Erreur lors de la création de la table trend_hairstyles',
        details: error.message
      }
    });
  }
};
