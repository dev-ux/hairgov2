const express = require('express');
const router = express.Router();

/**
 * @route   GET /api/v1/special-offers
 * @desc    Obtenir les offres spéciales
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    // Simuler des données d'offres spéciales
    const specialOffers = [
      {
        id: '1',
        title: 'Pack Coupe + Coloration -30%',
        description: 'Profitez de notre offre spéciale : une coupe complète avec coloration à -30%',
        discount: 30,
        original_price: 80,
        discounted_price: 56,
        image: 'https://images.unsplash.com/photo-15623252610-3d9a1b2b5b5?w=500',
        salon_name: 'Salon de Luxe',
        salon_address: '123 Avenue des Champs-Élysées, Paris',
        end_date: '2024-12-31'
      },
      {
        id: '2',
        title: 'Forfait 3 Séances -25%',
        description: 'Réservez 3 séances de coiffure et bénéficiez de -25% sur le total',
        discount: 25,
        original_price: 150,
        discounted_price: 112.50,
        image: 'https://images.unsplash.com/photo-1556628773-9e0c4b0b5b5?w=500',
        salon_name: 'Hair Studio Pro',
        salon_address: '456 Rue de la Paix, Lyon',
        end_date: '2024-11-30'
      },
      {
        id: '3',
        title: 'Soins Capillaires Complet -40%',
        description: 'Offre exclusive sur notre gamme complète de soins capillaires professionnels',
        discount: 40,
        original_price: 120,
        discounted_price: 72,
        image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37c?w=500',
        salon_name: 'Beauty Center',
        salon_address: '789 Boulevard Haussmann, Marseille',
        end_date: '2024-12-15'
      }
    ];

    res.status(200).json({
      success: true,
      data: specialOffers,
      message: 'Offres spéciales récupérées avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des offres spéciales:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Erreur lors de la récupération des offres spéciales'
      }
    });
  }
});

module.exports = router;
