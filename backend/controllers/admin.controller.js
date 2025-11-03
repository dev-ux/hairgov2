const { User, Hairdresser, sequelize } = require('../models');

/**
 * Récupère la liste de tous les utilisateurs
 * @route GET /admin/users
 * @access Privé (Admin)
 */
const getUsersList = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: [
        'id',
        'email',
        'phone',
        'full_name',
        'user_type',
        'is_active',
        'created_at',
        'updated_at'
      ],
      raw: true,
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des utilisateurs',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Récupère la liste de tous les coiffeurs
 * @route GET /admin/hairdressers
 * @access Privé (Admin)
 */
const getHairdressers = async (req, res) => {
  try {
    const hairdressers = await User.findAll({
      where: {
        user_type: 'hairdresser'
      },
      include: [{
        model: Hairdresser,
        as: 'hairdresserProfile',
        attributes: [
          'profession',
          'residential_address',
          'average_rating',
          'registration_status',
          'is_available',
          'total_jobs',
          'latitude',
          'longitude'
        ],
        required: false // Utilisez LEFT JOIN pour inclure même sans profil détaillé
      }],
      attributes: [
        'id',
        'email',
        'phone',
        'full_name',
        'user_type',
        'is_active',
        'profile_photo',
        'created_at',
        'updated_at'
      ],
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: hairdressers.length,
      data: hairdressers
    });
  } catch (error) {
    console.error('Error fetching hairdressers:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des coiffeurs',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getUsersList,
  getHairdressers
};