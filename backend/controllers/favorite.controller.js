// controllers/favorite.controller.js
const db = require('../models');

const { FavoriteHairdresser, FavoriteSalon, FavoriteHairstyle, User, Hairdresser, Salon, Hairstyle } = db;

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

    let hairdresser = null;

    // Essayer d'abord de trouver par id (hairdresser.id)
    hairdresser = await Hairdresser.findByPk(hairdresserId);
    
    // Si non trouvé, essayer de trouver par user_id
    if (!hairdresser) {
      console.log('Recherche par hairdresser.id échouée, tentative par user_id...');
      hairdresser = await Hairdresser.findOne({
        where: { user_id: hairdresserId }
      });
    }

    if (!hairdresser) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'HAIRDRESSER_NOT_FOUND',
          message: 'Coiffeur introuvable'
        }
      });
    }

    // Utiliser le vrai hairdresser_id pour les favoris
    const actualHairdresserId = hairdresser.id;

    // Vérifier si déjà en favoris
    const existingFavorite = await FavoriteHairdresser.findOne({
      where: {
        client_id: clientId,
        hairdresser_id: actualHairdresserId
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
    const favorite = await FavoriteHairdresser.create({
      client_id: clientId,
      hairdresser_id: actualHairdresserId,
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

    let hairdresser = null;

    // Essayer d'abord de trouver par id (hairdresser.id)
    hairdresser = await Hairdresser.findByPk(hairdresserId);
    
    // Si non trouvé, essayer de trouver par user_id
    if (!hairdresser) {
      console.log('Recherche par hairdresser.id échouée, tentative par user_id...');
      hairdresser = await Hairdresser.findOne({
        where: { user_id: hairdresserId }
      });
    }

    if (!hairdresser) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'HAIRDRESSER_NOT_FOUND',
          message: 'Coiffeur introuvable'
        }
      });
    }

    // Utiliser le vrai hairdresser_id pour les favoris
    const actualHairdresserId = hairdresser.id;

    const favorite = await FavoriteHairdresser.findOne({
      where: {
        client_id: clientId,
        hairdresser_id: actualHairdresserId
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
 * Vérifier si un coiffeur est dans les favoris
 */
exports.checkFavorite = async (req, res) => {
  try {
    const { hairdresserId } = req.params;
    const clientId = req.userId;

    let hairdresser = null;

    // Essayer d'abord de trouver par id (hairdresser.id)
    hairdresser = await Hairdresser.findByPk(hairdresserId);
    
    // Si non trouvé, essayer de trouver par user_id
    if (!hairdresser) {
      hairdresser = await Hairdresser.findOne({
        where: { user_id: hairdresserId }
      });
    }

    if (!hairdresser) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'HAIRDRESSER_NOT_FOUND',
          message: 'Coiffeur introuvable'
        }
      });
    }

    // Utiliser le vrai hairdresser_id pour les favoris
    const actualHairdresserId = hairdresser.id;

    const favorite = await FavoriteHairdresser.findOne({
      where: {
        client_id: clientId,
        hairdresser_id: actualHairdresserId,
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

/**
 * Obtenir tous les favoris de l'utilisateur
 */
exports.getFavorites = async (req, res) => {
  try {
    const clientId = req.userId;

    // Récupérer tous les types de favoris
    const hairdresserFavorites = await FavoriteHairdresser.findAll({
      where: { client_id: clientId, is_favorite: true },
      include: [
        {
          model: Hairdresser,
          as: 'hairdresser',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['full_name', 'profile_photo']
            }
          ]
        }
      ]
    });

    const salonFavorites = await FavoriteSalon.findAll({
      where: { client_id: clientId, is_favorite: true },
      include: [
        {
          model: Salon,
          as: 'salon'
        }
      ]
    });

    const hairstyleFavorites = await FavoriteHairstyle.findAll({
      where: { client_id: clientId, is_favorite: true },
      include: [
        {
          model: Hairstyle,
          as: 'hairstyle'
        }
      ]
    });

    // Combiner tous les favoris
    const allFavorites = [
      ...hairdresserFavorites.map(fav => ({
        ...fav.toJSON(),
        favorite_type: 'hairdresser'
      })),
      ...salonFavorites.map(fav => ({
        ...fav.toJSON(),
        favorite_type: 'salon'
      })),
      ...hairstyleFavorites.map(fav => ({
        ...fav.toJSON(),
        favorite_type: 'hairstyle'
      }))
    ];

    res.status(200).json({
      success: true,
      data: { favorites: allFavorites }
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

// ==========================================
// Gestion des favoris de salons
// ==========================================

/**
 * Ajouter un salon aux favoris
 */
exports.addSalonToFavorites = async (req, res) => {
  try {
    const { salonId } = req.params;
    const clientId = req.userId;

    console.log('🔍 Add salon to favorites - Request params:', req.params);
    console.log('🔍 Add salon to favorites - Client ID from token:', clientId);
    console.log('🔍 Add salon to favorites - Headers:', req.headers.authorization ? 'Present' : 'Missing');

    if (!clientId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'NO_USER_ID',
          message: 'Utilisateur non authentifié'
        }
      });
    }

    // Vérifier si le salon existe
    const salon = await Salon.findByPk(salonId);
    if (!salon) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SALON_NOT_FOUND',
          message: 'Salon introuvable'
        }
      });
    }

    // Vérifier si déjà en favoris
    const existingFavorite = await FavoriteSalon.findOne({
      where: {
        client_id: clientId,
        salon_id: salonId
      }
    });

    if (existingFavorite) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ALREADY_FAVORITE',
          message: 'Ce salon est déjà dans vos favoris'
        }
      });
    }

    // Ajouter aux favoris
    const favorite = await FavoriteSalon.create({
      client_id: clientId,
      salon_id: salonId,
      is_favorite: true
    });

    res.status(201).json({
      success: true,
      data: { favorite },
      message: 'Salon ajouté aux favoris'
    });

  } catch (error) {
    console.error('Add salon to favorites error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Erreur lors de l\'ajout du salon aux favoris'
      }
    });
  }
};

/**
 * Retirer un salon des favoris
 */
exports.removeSalonFromFavorites = async (req, res) => {
  try {
    const { salonId } = req.params;
    const clientId = req.userId;

    console.log('🔍 Remove salon from favorites - Request params:', req.params);
    console.log('🔍 Remove salon from favorites - Client ID from token:', clientId);
    console.log('🔍 Remove salon from favorites - Headers:', req.headers.authorization ? 'Present' : 'Missing');

    if (!clientId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'NO_USER_ID',
          message: 'Utilisateur non authentifié'
        }
      });
    }

    const favorite = await FavoriteSalon.findOne({
      where: {
        client_id: clientId,
        salon_id: salonId
      }
    });

    if (!favorite) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'FAVORITE_NOT_FOUND',
          message: 'Ce salon n\'est pas dans vos favoris'
        }
      });
    }

    await favorite.destroy();

    res.status(200).json({
      success: true,
      message: 'Salon retiré des favoris'
    });

  } catch (error) {
    console.error('Remove salon from favorites error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Erreur lors du retrait du salon des favoris'
      }
    });
  }
};

/**
 * Vérifier si un salon est dans les favoris
 */
exports.checkSalonFavorite = async (req, res) => {
  try {
    const { salonId } = req.params;
    const clientId = req.userId;

    const favorite = await FavoriteSalon.findOne({
      where: {
        client_id: clientId,
        salon_id: salonId,
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
    console.error('Check salon favorite error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Erreur lors de la vérification des favoris du salon'
      }
    });
  }
};
