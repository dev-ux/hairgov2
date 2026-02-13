// controllers/history.controller.js
const db = require('../models');
const { Booking, Hairdresser, Hairstyle, User } = db;
const { Op } = require('sequelize');

/**
 * Obtenir l'historique du client connecté (réservations passées)
 */
exports.getClientHistory = async (req, res) => {
  try {
    const clientId = req.userId;
    const { limit = 50, offset = 0 } = req.query;

    console.log('🔍 getClientHistory - Client ID:', clientId);

    // Récupérer les réservations terminées ou annulées
    const bookings = await Booking.findAll({
      where: {
        client_id: clientId,
        status: {
          [Op.in]: ['completed', 'cancelled']
        }
      },
      include: [
        {
          model: Hairdresser,
          as: 'hairdresser',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'full_name', 'profile_photo']
            }
          ]
        },
        {
          model: Hairstyle,
          as: 'hairstyle',
          attributes: ['id', 'name', 'description', 'photo', 'category', 'estimated_duration']
        }
      ],
      order: [['updated_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    console.log('📊 getClientHistory - Réservations trouvées:', bookings.length);

    res.status(200).json({
      success: true,
      data: { bookings }
    });

  } catch (error) {
    console.error('❌ Get client history error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Erreur lors de la récupération de l\'historique',
        details: error.message
      }
    });
  }
};

/**
 * Obtenir l'historique du coiffeur connecté (prestations passées)
 */
exports.getHairdresserHistory = async (req, res) => {
  try {
    const hairdresserId = req.userId;
    const { limit = 50, offset = 0 } = req.query;

    console.log('🔍 getHairdresserHistory - Hairdresser ID:', hairdresserId);

    // Récupérer les réservations terminées ou annulées
    const bookings = await Booking.findAll({
      where: {
        hairdresser_id: hairdresserId,
        status: {
          [Op.in]: ['completed', 'cancelled']
        }
      },
      include: [
        {
          model: User,
          as: 'client',
          attributes: ['id', 'full_name', 'phone', 'profile_photo']
        },
        {
          model: Hairstyle,
          as: 'hairstyle',
          attributes: ['id', 'name', 'description', 'photo', 'category', 'estimated_duration']
        }
      ],
      order: [['updated_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    console.log('📊 getHairdresserHistory - Réservations trouvées:', bookings.length);

    res.status(200).json({
      success: true,
      data: { bookings }
    });

  } catch (error) {
    console.error('❌ Get hairdresser history error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Erreur lors de la récupération de l\'historique',
        details: error.message
      }
    });
  }
};
