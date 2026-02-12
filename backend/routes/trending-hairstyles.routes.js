const express = require('express');
const router = express.Router();

// Import des modèles
const { Hairstyle } = require('../models');

/**
 * @route   GET /api/v1/trending-hairstyles
 * @desc    Obtenir les coiffures tendances
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    // Simuler des données de coiffures tendances
    // En production, vous pourriez avoir une logique pour déterminer les tendances
    const trendingHairstyles = [
      {
        id: '1',
        name: 'Fade Dégradé',
        description: 'Un fade moderne avec dégradé subtil pour un look élégant',
        image: 'https://images.unsplash.com/photo-1560069492856-cc730e8775d5?w=500',
        category: 'Homme',
        difficulty: 'moyen',
        duration: 45,
        price_range: '30-50€',
        trending_score: 4.8
      },
      {
        id: '2',
        name: 'Couleur Balayage',
        description: 'Technique de coloration balayage pour un effet naturel',
        image: 'https://images.unsplash.com/photo-1562350268-9d7a1b5c5b5?w=500',
        category: 'Femme',
        difficulty: 'difficile',
        duration: 120,
        price_range: '80-150€',
        trending_score: 4.6
      },
      {
        id: '3',
        name: 'Coupe Texturée',
        description: 'Coupe mettant en valeur la texture naturelle des cheveux',
        image: 'https://images.unsplash.com/photo-1487415085402-b99fde6521f1?w=500',
        category: 'Mixte',
        difficulty: 'facile',
        duration: 30,
        price_range: '25-40€',
        trending_score: 4.5
      },
      {
        id: '4',
        name: 'Braids Modernes',
        description: 'Tresses modernes avec des accessoires tendance',
        image: 'https://images.unsplash.com/photo-1570292675165-1a8c7b5b5b5?w=500',
        category: 'Femme',
        difficulty: 'difficile',
        duration: 180,
        price_range: '100-200€',
        trending_score: 4.7
      },
      {
        id: '5',
        name: 'Undercut Court',
        description: 'Coupe undercut courte et moderne pour un look audacieux',
        image: 'https://images.unsplash.com/photo-1534566368-8f7f43d8b5b?w=500',
        category: 'Homme',
        difficulty: 'facile',
        duration: 25,
        price_range: '20-35€',
        trending_score: 4.4
      }
    ];

    res.status(200).json({
      success: true,
      data: trendingHairstyles,
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
