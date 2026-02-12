// controllers/favorite.controller.js
const db = require('../models');

const { Favorite, User, Hairdresser } = db;

/**
 * Ajouter un coiffeur aux favoris
 */
exports.addToFavorites = async (req, res) => {
  try {
    const { hairdresserId } = req.params;
    const clientId = req.userId; // ID du client connecté

    console.log('🔍 Add to favorites - Request params:', req.params);
    console.log('🔍 Add to favorites - Client ID from token:', clientId);
    console.log('🔍 Add to favorites - Headers:', req.headers.authorization ? 'Present' : 'Missing');

    if (!clientId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'NO_USER_ID',
          message: 'Utilisateur non authentifié'
        }
      });
    }

    // Vérifier si le coiffeur existe
    const hairdresser = await Hairdresser.findByPk(hairdresserId);
    if (!hairdresser) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'HAIRDRESSER_NOT_FOUND',
          message: 'Coiffeur introuvable'
        }
      });
    }

    // Vérifier si déjà en favoris
    const existingFavorite = await Favorite.findOne({
      where: {
        client_id: clientId,
        hairdresser_id: hairdresserId
      }
    });

    if (existingFavorite) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ALREADY_FAVORITE',
          message: 'Ce coiffeur est déjà dans vos favoris'
        }
      });
    }

    // Ajouter aux favoris
    const favorite = await Favorite.create({
      client_id: clientId,
      hairdresser_id: hairdresserId,
      is_favorite: true
    });

    res.status(201).json({
      success: true,
      data: { favorite },
      message: 'Coiffeur ajouté aux favoris'
    });

  } catch (error) {
    console.error('Add to favorites error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Erreur lors de l\'ajout aux favoris'
      }
    });
  }
};

/**
 * Retirer un coiffeur des favoris
 */
exports.removeFromFavorites = async (req, res) => {
  try {
    const { hairdresserId } = req.params;
    const clientId = req.userId;

    console.log('🔍 Remove from favorites - Request params:', req.params);
    console.log('🔍 Remove from favorites - Client ID from token:', clientId);
    console.log('🔍 Remove from favorites - Headers:', req.headers.authorization ? 'Present' : 'Missing');

    if (!clientId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'NO_USER_ID',
          message: 'Utilisateur non authentifié'
        }
      });
    }

    const favorite = await Favorite.findOne({
      where: {
        client_id: clientId,
        hairdresser_id: hairdresserId
      }
    });

    if (!favorite) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'FAVORITE_NOT_FOUND',
          message: 'Ce coiffeur n\'est pas dans vos favoris'
        }
      });
    }

    await favorite.destroy();

    res.status(200).json({
      success: true,
      message: 'Coiffeur retiré des favoris'
    });

  } catch (error) {
    console.error('Remove from favorites error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Erreur lors du retrait des favoris'
      }
    });
  }
};

/**
 * Obtenir tous les favoris d'un client
 */
exports.getFavorites = async (req, res) => {
  try {
    const clientId = req.userId;

    const favorites = await Favorite.findAll({
      where: {
        client_id: clientId,
        is_favorite: true
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
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: { favorites }
    });

  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Erreur lors de la récupération des favoris'
      }
    });
  }
};

/**
 * Vérifier si un coiffeur est dans les favoris
 */
exports.checkFavorite = async (req, res) => {
  try {
    const { hairdresserId } = req.params;
    const clientId = req.userId;

    const favorite = await Favorite.findOne({
      where: {
        client_id: clientId,
        hairdresser_id: hairdresserId,
        is_favorite: true
      }
    });

    res.status(200).json({
      success: true,
      data: {
        isFavorite: !!favorite
      }
    });

  } catch (error) {
    console.error('Check favorite error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Erreur lors de la vérification des favoris'
      }
    });
  }
};
