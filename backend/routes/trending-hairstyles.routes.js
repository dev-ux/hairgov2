const express = require('express');
const router = express.Router();

// Import des modèles
const { TrendHairstyle, Hairstyle } = require('../models');

/**
 * @route   GET /api/v1/trending-hairstyles
 * @desc    Obtenir les coiffures tendances
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    // Récupérer les tendances actives avec les détails des hairstyles
    const trendingHairstyles = await TrendHairstyle.findAll({
      where: {
        is_active: true
      },
      include: [
        {
          model: Hairstyle,
          as: 'hairstyle',
          attributes: ['id', 'name', 'description', 'photo', 'category']
        }
      ],
      order: [
        ['trending_score', 'DESC'],
        ['created_at', 'DESC']
      ],
      limit: 20
    });

    // Transformer les données pour correspondre au format attendu par le frontend
    const formattedTrends = trendingHairstyles.map(trend => ({
      id: trend.id,
      hairstyle_id: trend.hairstyle_id,
      name: trend.hairstyle?.name || 'Coiffure inconnue',
      description: trend.hairstyle?.description || 'Description non disponible',
      image: trend.hairstyle?.photo || 'https://images.unsplash.com/photo-1560069492856-cc730e8775d5?w=500',
      category: trend.category,
      difficulty: trend.difficulty,
      duration: trend.duration_minutes,
      price_range: trend.price_range,
      trending_score: parseFloat(trend.trending_score)
    }));

    res.status(200).json({
      success: true,
      data: formattedTrends,
      message: 'Coiffures tendances récupérées avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des coiffures tendances:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Erreur lors de la récupération des coiffures tendances'
      }
    });
  }
});

module.exports = router;
