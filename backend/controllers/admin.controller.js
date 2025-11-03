const { User } = require('../models');

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

module.exports = {
  getUsersList
};