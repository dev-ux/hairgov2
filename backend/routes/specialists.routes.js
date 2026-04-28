const express = require('express');
const router = express.Router();

/**
 * @route   GET /api/v1/specialists
 * @desc    Obtenir les spécialistes
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    // Simuler des données de spécialistes
    const specialists = [
      {
        id: '1',
        name: 'Marie Dubois',
        specialty: 'Coloriste Expert',
        experience_years: 8,
        rating: 4.8,
        total_clients: 250,
        profile_photo: 'https://images.unsplash.com/photo-1433085799-e819b0f5e5a?w=500',
        salon_name: 'Salon Élégance',
        salon_address: '123 Avenue des Champs-Élysées, Paris',
        availability: true,
        price_range: '60-120€'
      },
      {
        id: '2',
        name: 'Jean Martin',
        specialty: 'Spécialiste Coupe Homme',
        experience_years: 12,
        rating: 4.9,
        total_clients: 400,
        profile_photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2?w=500',
        salon_name: 'Barber Shop Premium',
        salon_address: '456 Rue de la Paix, Lyon',
        availability: false,
        price_range: '30-60€'
      },
      {
        id: '3',
        name: 'Sophie Laurent',
        specialty: 'Spécialiste Bridal',
        experience_years: 15,
        rating: 5.0,
        total_clients: 180,
        profile_photo: 'https://images.unsplash.com/photo-1494790108757-9d398625d3f0?w=500',
        salon_name: 'Luxury Hair Studio',
        salon_address: '789 Boulevard Haussmann, Marseille',
        availability: true,
        price_range: '150-300€'
      },
      {
        id: '4',
        name: 'Pierre Bernard',
        specialty: 'Spécialiste Afro',
        experience_years: 6,
        rating: 4.7,
        total_clients: 120,
        profile_photo: 'https://images.unsplash.com/photo-1560250097-0b343fd7381a?w=500',
        salon_name: 'Afro Beauty Center',
        salon_address: '321 Rue Nationale, Bordeaux',
        availability: true,
        price_range: '40-80€'
      }
    ];

    res.status(200).json({
      success: true,
      data: specialists,
      message: 'Spécialistes récupérés avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des spécialistes:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Erreur lors de la récupération des spécialistes'
      }
    });
  }
});

module.exports = router;
