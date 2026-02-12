const { TrendHairstyle, Hairstyle, User } = require('../models');

/**
 * @desc    Ajouter une coiffure en tendance
 * @route   POST /api/v1/admin/trending-hairstyles
 * @access  Admin
 */
exports.addTrendingHairstyle = async (req, res) => {
  try {
    const { hairstyle_id, trending_score, category, difficulty, duration_minutes, price_range, start_date, end_date } = req.body;

    // Vérifier si le hairstyle existe
    const hairstyle = await Hairstyle.findByPk(hairstyle_id);
    if (!hairstyle) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'HAIRSTYLE_NOT_FOUND',
          message: 'Coiffure non trouvée'
        }
      });
    }

    // Vérifier si la tendance existe déjà pour ce hairstyle
    const existingTrend = await TrendHairstyle.findOne({
      where: { hairstyle_id }
    });

    if (existingTrend) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'TREND_ALREADY_EXISTS',
          message: 'Cette coiffure est déjà en tendance'
        }
      });
    }

    // Créer la nouvelle tendance
    const newTrend = await TrendHairstyle.create({
      hairstyle_id,
      trending_score: trending_score || 0.0,
      category: category || 'Mixte',
      difficulty: difficulty || 'moyen',
      duration_minutes,
      price_range,
      start_date: start_date ? new Date(start_date) : new Date(),
      end_date: end_date ? new Date(end_date) : null,
      added_by: req.user.id
    });

    // Récupérer la tendance avec les associations
    const trendWithDetails = await TrendHairstyle.findByPk(newTrend.id, {
      include: [
        {
          model: Hairstyle,
          as: 'hairstyle',
          attributes: ['id', 'name', 'description', 'photo', 'category']
        },
        {
          model: User,
          as: 'addedBy',
          attributes: ['id', 'full_name', 'email']
        }
      ]
    });

    res.status(201).json({
      success: true,
      data: trendWithDetails,
      message: 'Coiffure ajoutée aux tendances avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de l\'ajout de la tendance:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Erreur lors de l\'ajout de la tendance'
      }
    });
  }
};

/**
 * @desc    Supprimer une coiffure des tendances
 * @route   DELETE /api/v1/admin/trending-hairstyles/:id
 * @access  Admin
 */
exports.removeTrendingHairstyle = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier si la tendance existe
    const trend = await TrendHairstyle.findByPk(id);
    if (!trend) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TREND_NOT_FOUND',
          message: 'Tendance non trouvée'
        }
      });
    }

    // Supprimer la tendance
    await trend.destroy();

    res.status(200).json({
      success: true,
      message: 'Coiffure retirée des tendances avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression de la tendance:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Erreur lors de la suppression de la tendance'
      }
    });
  }
};

/**
 * @desc    Mettre à jour une tendance
 * @route   PUT /api/v1/admin/trending-hairstyles/:id
 * @access  Admin
 */
exports.updateTrendingHairstyle = async (req, res) => {
  try {
    const { id } = req.params;
    const { trending_score, category, difficulty, duration_minutes, price_range, start_date, end_date, is_active } = req.body;

    // Vérifier si la tendance existe
    const trend = await TrendHairstyle.findByPk(id);
    if (!trend) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TREND_NOT_FOUND',
          message: 'Tendance non trouvée'
        }
      });
    }

    // Mettre à jour la tendance
    await trend.update({
      trending_score: trending_score !== undefined ? trending_score : trend.trending_score,
      category: category || trend.category,
      difficulty: difficulty || trend.difficulty,
      duration_minutes: duration_minutes !== undefined ? duration_minutes : trend.duration_minutes,
      price_range: price_range !== undefined ? price_range : trend.price_range,
      start_date: start_date ? new Date(start_date) : trend.start_date,
      end_date: end_date !== undefined ? (end_date ? new Date(end_date) : null) : trend.end_date,
      is_active: is_active !== undefined ? is_active : trend.is_active
    });

    // Récupérer la tendance mise à jour avec les associations
    const updatedTrend = await TrendHairstyle.findByPk(id, {
      include: [
        {
          model: Hairstyle,
          as: 'hairstyle',
          attributes: ['id', 'name', 'description', 'photo', 'category']
        },
        {
          model: User,
          as: 'addedBy',
          attributes: ['id', 'full_name', 'email']
        }
      ]
    });

    res.status(200).json({
      success: true,
      data: updatedTrend,
      message: 'Tendance mise à jour avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour de la tendance:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Erreur lors de la mise à jour de la tendance'
      }
    });
  }
};

/**
 * @desc    Lister toutes les tendances
 * @route   GET /api/v1/admin/trending-hairstyles
 * @access  Admin
 */
exports.getAllTrendingHairstyles = async (req, res) => {
  try {
    const trends = await TrendHairstyle.findAll({
      include: [
        {
          model: Hairstyle,
          as: 'hairstyle',
          attributes: ['id', 'name', 'description', 'photo', 'category']
        },
        {
          model: User,
          as: 'addedBy',
          attributes: ['id', 'full_name', 'email']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: trends,
      message: 'Tendances récupérées avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des tendances:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Erreur lors de la récupération des tendances'
      }
    });
  }
};
