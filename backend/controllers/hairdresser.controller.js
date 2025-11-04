// controllers/hairdresser.controller.js
const db = require('../models');
const { Op } = require('sequelize');
const notificationService = require('../services/notification.service');

// Accès aux modèles via l'objet db
const Hairdresser = db.Hairdresser;
const User = db.User;
const Hairstyle = db.Hairstyle;
const BalanceTransaction = db.BalanceTransaction;
const Rating = db.Rating;
const Booking = db.Booking;
const sequelize = db.sequelize;

/**
 * Obtenir le profil du coiffeur connecté
 */
exports.getProfile = async (req, res) => {
  try {
    const hairdresser = await Hairdresser.findOne({
      where: { user_id: req.userId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: { exclude: ['password_hash'] }
        },
        {
          model: Hairstyle,
          as: 'hairstyles',
          through: { attributes: [] }
        }
      ]
    });

    if (!hairdresser) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'HAIRDRESSER_NOT_FOUND',
          message: 'Profil coiffeur introuvable'
        }
      });
    }

    res.status(200).json({
      success: true,
      data: { hairdresser }
    });

  } catch (error) {
    console.error('Get hairdresser profile error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_PROFILE_ERROR',
        message: 'Erreur lors de la récupération du profil'
      }
    });
  }
};

/**
 * Mettre à jour le profil
 */
exports.updateProfile = async (req, res) => {
  try {
    const {
      profession,
      residential_address,
      education_level,
      hairstyle_ids
    } = req.body;

    const hairdresser = await Hairdresser.findOne({
      where: { user_id: req.userId }
    });

    if (!hairdresser) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'HAIRDRESSER_NOT_FOUND',
          message: 'Profil introuvable'
        }
      });
    }

    // Mettre à jour les informations
    await hairdresser.update({
      profession,
      residential_address,
      education_level
    });

    // Mettre à jour les coiffures si fourni
    if (hairstyle_ids && Array.isArray(hairstyle_ids)) {
      const hairstyles = await Hairstyle.findAll({
        where: { id: { [Op.in]: hairstyle_ids } }
      });
      await hairdresser.setHairstyles(hairstyles);
    }

    // Mettre à jour les infos utilisateur
    if (req.body.full_name || req.body.email) {
      await User.update(
        {
          full_name: req.body.full_name,
          email: req.body.email
        },
        { where: { id: req.userId } }
      );
    }

    const updatedHairdresser = await Hairdresser.findOne({
      where: { user_id: req.userId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: { exclude: ['password_hash'] }
        },
        {
          model: Hairstyle,
          as: 'hairstyles',
          through: { attributes: [] }
        }
      ]
    });

    res.status(200).json({
      success: true,
      message: 'Profil mis à jour avec succès',
      data: { hairdresser: updatedHairdresser }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_ERROR',
        message: 'Erreur lors de la mise à jour'
      }
    });
  }
};

/**
 * Mettre à jour la disponibilité
 */
exports.updateAvailability = async (req, res) => {
  try {
    const { is_available, latitude, longitude } = req.body;

    const hairdresser = await Hairdresser.findOne({
      where: { user_id: req.userId }
    });

    if (!hairdresser) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'HAIRDRESSER_NOT_FOUND',
          message: 'Profil introuvable'
        }
      });
    }

    // Vérifier le solde si activation
    if (is_available && hairdresser.balance < parseFloat(process.env.RESERVATION_FEE)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_BALANCE',
          message: 'Solde insuffisant. Veuillez recharger votre compte.'
        }
      });
    }

    // Vérifier qu'il n'y a pas de job en cours
    if (is_available && hairdresser.current_job_id) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'JOB_IN_PROGRESS',
          message: 'Vous avez une prestation en cours'
        }
      });
    }

    await hairdresser.update({
      is_available,
      latitude: latitude || hairdresser.latitude,
      longitude: longitude || hairdresser.longitude
    });

    res.status(200).json({
      success: true,
      message: `Statut: ${is_available ? 'disponible' : 'indisponible'}`,
      data: {
        is_available,
        location_updated: !!(latitude && longitude)
      }
    });

  } catch (error) {
    console.error('Update availability error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_ERROR',
        message: 'Erreur lors de la mise à jour'
      }
    });
  }
};

/**
 * Mettre à jour la position GPS
 */
exports.updateLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    const hairdresser = await Hairdresser.findOne({
      where: { user_id: req.userId }
    });

    if (!hairdresser) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'HAIRDRESSER_NOT_FOUND',
          message: 'Profil introuvable'
        }
      });
    }

    await hairdresser.update({
      latitude,
      longitude
    });

    res.status(200).json({
      success: true,
      message: 'Localisation mise à jour'
    });

  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'LOCATION_ERROR',
        message: 'Erreur lors de la mise à jour de la localisation'
      }
    });
  }
};

/**
 * Demander une recharge de solde
 */
exports.requestRecharge = async (req, res) => {
  try {
    const { amount, payment_method, reference_number } = req.body;

    if (amount < 5000) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_AMOUNT',
          message: 'Le montant minimum est de 5000 XOF'
        }
      });
    }

    const hairdresser = await Hairdresser.findOne({
      where: { user_id: req.userId }
    });

    if (!hairdresser) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'HAIRDRESSER_NOT_FOUND',
          message: 'Profil introuvable'
        }
      });
    }

    // Créer la demande de recharge
    const transaction = await BalanceTransaction.create({
      hairdresser_id: hairdresser.id,
      transaction_type: 'recharge',
      amount,
      balance_before: hairdresser.balance,
      balance_after: hairdresser.balance, // Sera mis à jour après approbation
      description: `Recharge ${payment_method} - Ref: ${reference_number || 'N/A'}`,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      message: 'Demande de recharge envoyée. En attente d\'approbation.',
      data: {
        transaction_id: transaction.id,
        amount,
        status: 'pending'
      }
    });

  } catch (error) {
    console.error('Request recharge error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'RECHARGE_ERROR',
        message: 'Erreur lors de la demande de recharge'
      }
    });
  }
};

/**
 * Obtenir l'historique des transactions
 */
exports.getBalanceHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    const offset = (page - 1) * limit;

    const hairdresser = await Hairdresser.findOne({
      where: { user_id: req.userId }
    });

    if (!hairdresser) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'HAIRDRESSER_NOT_FOUND',
          message: 'Profil introuvable'
        }
      });
    }

    const whereClause = { hairdresser_id: hairdresser.id };
    if (type) {
      whereClause.transaction_type = type;
    }

    const { count, rows } = await BalanceTransaction.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Booking,
          as: 'booking',
          required: false,
          attributes: ['id', 'service_type', 'client_name']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    res.status(200).json({
      success: true,
      data: {
        transactions: rows,
        current_balance: hairdresser.balance,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(count / limit),
          total_items: count
        }
      }
    });

  } catch (error) {
    console.error('Get balance history error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'HISTORY_ERROR',
        message: 'Erreur lors de la récupération de l\'historique'
      }
    });
  }
};

/**
 * Obtenir les statistiques du coiffeur
 */
exports.getStatistics = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    const hairdresser = await Hairdresser.findOne({
      where: { user_id: req.userId }
    });

    if (!hairdresser) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'HAIRDRESSER_NOT_FOUND',
          message: 'Profil introuvable'
        }
      });
    }

    const whereClause = { hairdresser_id: hairdresser.id };

    // Filtrer par date si fourni
    if (start_date && end_date) {
      whereClause.created_at = {
        [Op.between]: [new Date(start_date), new Date(end_date)]
      };
    }

    // Statistiques des prestations
    const totalBookings = await Booking.count({
      where: whereClause
    });

    const completedBookings = await Booking.count({
      where: { ...whereClause, status: 'completed' }
    });

    const cancelledBookings = await Booking.count({
      where: { ...whereClause, status: 'cancelled' }
    });

    const pendingBookings = await Booking.count({
      where: { ...whereClause, status: 'pending' }
    });

    // Revenus
    const totalEarnings = await BalanceTransaction.sum('amount', {
      where: {
        hairdresser_id: hairdresser.id,
        transaction_type: 'deduction',
        status: 'approved'
      }
    });

    // Évaluations
    const ratingsStats = await Rating.findAll({
      where: { hairdresser_id: hairdresser.id },
      attributes: [
        [sequelize.fn('AVG', sequelize.col('rating')), 'average'],
        [sequelize.fn('COUNT', sequelize.col('rating')), 'total']
      ],
      raw: true
    });

    // Répartition par type de service
    const serviceBreakdown = await Booking.findAll({
      where: { ...whereClause, status: 'completed' },
      attributes: [
        'service_type',
        [sequelize.fn('COUNT', sequelize.col('service_type')), 'count']
      ],
      group: ['service_type'],
      raw: true
    });

    // Prestations par jour (7 derniers jours)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyBookings = await Booking.findAll({
      where: {
        hairdresser_id: hairdresser.id,
        status: 'completed',
        created_at: { [Op.gte]: sevenDaysAgo }
      },
      attributes: [
        [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: [sequelize.fn('DATE', sequelize.col('created_at'))],
      order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']],
      raw: true
    });

    res.status(200).json({
      success: true,
      data: {
        overview: {
          total_bookings: totalBookings,
          completed_bookings: completedBookings,
          cancelled_bookings: cancelledBookings,
          pending_bookings: pendingBookings,
          completion_rate: totalBookings > 0 ? 
            ((completedBookings / totalBookings) * 100).toFixed(2) : 0
        },
        financial: {
          current_balance: hairdresser.balance,
          total_earnings: Math.abs(totalEarnings || 0),
          average_per_booking: completedBookings > 0 ? 
            (Math.abs(totalEarnings || 0) / completedBookings).toFixed(2) : 0
        },
        ratings: {
          average_rating: hairdresser.average_rating,
          total_ratings: ratingsStats[0]?.total || 0
        },
        service_breakdown: serviceBreakdown,
        daily_bookings: dailyBookings
      }
    });

  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'STATS_ERROR',
        message: 'Erreur lors de la récupération des statistiques'
      }
    });
  }
};

/**
 * Obtenir les évaluations reçues
 */
exports.getRatings = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const hairdresser = await Hairdresser.findOne({
      where: { user_id: req.userId }
    });

    if (!hairdresser) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'HAIRDRESSER_NOT_FOUND',
          message: 'Profil introuvable'
        }
      });
    }

    const { count, rows } = await Rating.findAndCountAll({
      where: { hairdresser_id: hairdresser.id },
      include: [
        {
          model: User,
          as: 'client',
          attributes: ['full_name', 'profile_photo']
        },
        {
          model: Booking,
          as: 'booking',
          include: [{
            model: Hairstyle,
            as: 'hairstyle',
            attributes: ['name']
          }]
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    res.status(200).json({
      success: true,
      data: {
        ratings: rows,
        average_rating: hairdresser.average_rating,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(count / limit),
          total_items: count
        }
      }
    });

  } catch (error) {
    console.error('Get ratings error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'RATINGS_ERROR',
        message: 'Erreur lors de la récupération des évaluations'
      }
    });
  }
};

/**
 * Obtenir le job actuel
 */
exports.getCurrentJob = async (req, res) => {
  try {
    const hairdresser = await Hairdresser.findOne({
      where: { user_id: req.userId }
    });

    if (!hairdresser) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'HAIRDRESSER_NOT_FOUND',
          message: 'Profil introuvable'
        }
      });
    }

    if (!hairdresser.current_job_id) {
      return res.status(200).json({
        success: true,
        data: {
          current_job: null,
          message: 'Aucune prestation en cours'
        }
      });
    }

    const booking = await Booking.findByPk(hairdresser.current_job_id, {
      include: [
        {
          model: Hairstyle,
          as: 'hairstyle'
        },
        {
          model: User,
          as: 'client',
          attributes: ['full_name', 'phone', 'profile_photo']
        }
      ]
    });

    res.status(200).json({
      success: true,
      data: {
        current_job: booking
      }
    });

  } catch (error) {
    console.error('Get current job error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Erreur lors de la récupération'
      }
    });
  }
};

/**
 * Obtenir le classement des meilleurs coiffeurs
 */
exports.getLeaderboard = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const leaderboard = await Hairdresser.findAll({
      where: {
        registration_status: 'approved',
        total_jobs: { [Op.gt]: 0 }
      },
      include: [{
        model: User,
        as: 'user',
        attributes: ['full_name', 'profile_photo']
      }],
      order: [
        ['average_rating', 'DESC'],
        ['total_jobs', 'DESC']
      ],
      limit: parseInt(limit),
      attributes: [
        'id',
        'average_rating',
        'total_jobs',
        'total_earnings'
      ]
    });

    res.status(200).json({
      success: true,
      data: {
        leaderboard
      }
    });

  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'LEADERBOARD_ERROR',
        message: 'Erreur lors de la récupération du classement'
      }
    });
  }
};

/**
 * Obtenir la liste des coiffeurs validés (pour les clients)
 * Ne retourne que les coiffeurs avec registration_status = 'approved', is_active = true et is_verified = true
 */
exports.getAllHairdressers = async (req, res) => {
  try {
    // Récupération et validation des paramètres de pagination
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const offset = (page - 1) * limit;

    // Options de base pour les requêtes
    const where = {
      is_available: true,
      registration_status: 'approved'
    };

    // Compter le nombre total de coiffeurs correspondants
    const totalHairdressers = await db.Hairdresser.count({
      where,
      include: [
        {
          model: db.User,
          as: 'user',
          where: {
            is_active: true,
            is_verified: true
          },
          attributes: [],
          required: true
        }
      ]
    });

    const totalPages = Math.ceil(totalHairdressers / limit);

    // Si la page demandée est supérieure au nombre total de pages, on renvoie une liste vide
    if (page > totalPages && totalPages > 0) {
      return res.status(200).json({
        success: true,
        data: {
          total: 0,
          page,
          total_pages: totalPages,
          hairdressers: []
        }
      });
    }

    // Récupérer les coiffeurs avec pagination
    const hairdressers = await db.Hairdresser.findAll({
      where,
      include: [
        {
          model: db.User,
          as: 'user',
          attributes: ['id', 'full_name', 'email', 'phone', 'profile_photo'],
          required: true
        },
        {
          model: db.Hairstyle,
          as: 'hairstyles',
          through: { attributes: [] },
          attributes: ['id', 'name', 'photo']
        }
      ],
      attributes: [
        'id',
        'profession',
        'total_jobs',
        'is_available',
        'has_salon',
        'created_at',
        [
          db.sequelize.literal('(SELECT COALESCE(AVG(rating), 0) FROM ratings WHERE hairdresser_id = "Hairdresser"."id")'),
          'average_rating'
        ],
        [
          db.sequelize.literal('(SELECT COUNT(*) FROM ratings WHERE hairdresser_id = "Hairdresser"."id")'),
          'rating_count'
        ]
      ],
      order: [
        [db.sequelize.literal('average_rating'), 'DESC NULLS LAST'],
        ['total_jobs', 'DESC']
      ],
      limit: limit,
      offset: offset,
      subQuery: false
    });

    // Formater la réponse
    return res.status(200).json({
      success: true,
      data: {
        total: totalHairdressers,
        page: page,
        total_pages: totalPages,
        items_per_page: limit,
        hairdressers: hairdressers.map(h => ({
          id: h.id,
          user: h.user,
          profession: h.profession,
          average_rating: parseFloat(h.get('average_rating')) || 0,
          rating_count: parseInt(h.get('rating_count')) || 0,
          total_jobs: h.total_jobs,
          is_available: h.is_available,
          created_at: h.created_at,
          hairstyles: h.hairstyles
        }))
      }
    });

  } catch (error) {
    console.error('Get all hairdressers error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_HAIRDRESSERS_ERROR',
        message: 'Erreur lors de la récupération des coiffeurs',
        ...(process.env.NODE_ENV === 'development' && { details: error.message })
      }
    });
  }
};

/**
 * Rechercher des coiffeurs (pour les clients)
 */
exports.searchHairdressers = async (req, res) => {
  try {
    const { 
      search, 
      min_rating, 
      has_salon, 
      hairstyle_id,
      page = 1,
      limit = 20
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {
      registration_status: 'approved',
      is_available: true
    };

    // Créer la condition de recherche pour le nom du coiffeur
    const userWhereClause = {
      is_active: true,
      is_verified: true
    };

    if (search && search.trim() !== '') {
      userWhereClause.full_name = { [Op.iLike]: `%${search.trim()}%` };
    }

    // Filtrer par note minimale
    if (min_rating) {
      const rating = parseFloat(min_rating);
      if (!isNaN(rating)) {
        whereClause.average_rating = { [Op.gte]: rating };
      }
    }

    // Filtrer par type (avec ou sans salon)
    if (has_salon === 'true' || has_salon === 'false') {
      whereClause.has_salon = has_salon === 'true';
    }

    // Configuration de l'inclusion des modèles associés
    const includeClause = [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'full_name', 'email', 'phone', 'profile_photo'],
        where: userWhereClause,
        required: true
      },
      {
        model: Hairstyle,
        as: 'hairstyles',
        through: { attributes: [] },
        attributes: ['id', 'name', 'photo'],
        required: !!hairstyle_id,
        ...(hairstyle_id && { where: { id: hairstyle_id } })
      }
    ];

    // Ajouter le calcul de la note moyenne et du nombre d'avis
    const attributes = [
      'id',
      'profession',
      'total_jobs',
      'is_available',
      'has_salon',
      'created_at',
      [
        db.sequelize.literal(`(
          SELECT COALESCE(AVG(r.rating), 0) 
          FROM ratings r 
          WHERE r.hairdresser_id = "Hairdresser"."id"
        )`),
        'average_rating'
      ],
      [
        db.sequelize.literal(`(
          SELECT COUNT(*) 
          FROM ratings r 
          WHERE r.hairdresser_id = "Hairdresser"."id"
        )`),
        'rating_count'
      ]
    ];

    // Exécuter la requête
    const { count, rows } = await Hairdresser.findAndCountAll({
      where: whereClause,
      include: includeClause,
      attributes,
      order: [
        [db.sequelize.literal('average_rating'), 'DESC NULLS LAST'],
        ['total_jobs', 'DESC']
      ],
      limit: Math.min(parseInt(limit), 50), // Limiter à 50 résultats maximum
      offset: offset,
      subQuery: false,
      distinct: true
    });

    // Formater la réponse
    const formattedHairdressers = rows.map(hairdresser => ({
      id: hairdresser.id,
      user: hairdresser.user,
      profession: hairdresser.profession,
      average_rating: parseFloat(hairdresser.get('average_rating')) || 0,
      rating_count: parseInt(hairdresser.get('rating_count')) || 0,
      total_jobs: hairdresser.total_jobs,
      is_available: hairdresser.is_available,
      has_salon: hairdresser.has_salon,
      hairstyles: hairdresser.hairstyles,
      created_at: hairdresser.created_at
    }));

    return res.status(200).json({
      success: true,
      data: {
        hairdressers: formattedHairdressers,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(count / limit) || 1,
          total_items: count,
          items_per_page: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Search hairdressers error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'SEARCH_ERROR',
        message: 'Erreur lors de la recherche de coiffeurs',
        ...(process.env.NODE_ENV === 'development' && { 
          details: error.message,
          stack: error.stack 
        })
      }
    });
    res.status(500).json({
      success: false,
      error: {
        code: 'SEARCH_ERROR',
        message: 'Erreur lors de la recherche'
      }
    });
  }
};

/**
 * Obtenir le détail d'un coiffeur (public)
 */
exports.getHairdresserDetails = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Recherche du coiffeur avec ID:', id);

    // Vérifier si l'ID est valide
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: 'ID du coiffeur invalide'
        }
      });
    }

    // Rechercher d'abord l'utilisateur pour obtenir son ID
    const user = await User.findOne({
      where: { id },
      include: [{
        model: Hairdresser,
        as: 'hairdresserProfile',
        where: {
          registration_status: 'approved',
          is_available: true
        },
        required: true
      }]
    });

    if (!user || !user.hairdresserProfile) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'HAIRDRESSER_NOT_FOUND',
          message: 'Coiffeur introuvable ou non approuvé',
          details: 'Aucun coiffeur trouvé avec cet ID utilisateur ou le profil n\'est pas approuvé'
        }
      });
    }

    console.log('Profil coiffeur trouvé:', {
      id: user.hairdresserProfile.id,
      user_id: user.id,
      registration_status: user.hairdresserProfile.registration_status,
      is_available: user.hairdresserProfile.is_available
    });

    // D'abord, récupérons les détails de base du coiffeur
    console.log('Tentative de récupération des détails du coiffeur avec l\'ID:', user.hairdresserProfile.id);
    
    // 1. Récupération du coiffeur sans relations
    const hairdresserBasic = await Hairdresser.findByPk(user.hairdresserProfile.id);
    console.log('Coiffeur de base trouvé:', hairdresserBasic ? 'Oui' : 'Non');
    
    if (!hairdresserBasic) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'HAIRDRESSER_NOT_FOUND',
          message: 'Coiffeur introuvable',
          details: 'Aucun coiffeur trouvé avec cet ID dans la table hairdressers'
        }
      });
    }
    
    // 2. Récupération des détails avec les relations une par une
    // D'abord, récupérons l'utilisateur associé
    const userDetails = await User.findByPk(user.id, {
      attributes: ['id', 'full_name', 'email', 'phone', 'profile_photo']
    });
    
    if (!userDetails) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'Utilisateur associé non trouvé'
        }
      });
    }
    
    // Ensuite, récupérons les coiffures associées
    const hairstyles = await Hairstyle.findAll({
      include: [{
        model: Hairdresser,
        as: 'hairdressers', // Utilisation de l'alias défini dans l'association
        where: { id: user.hairdresserProfile.id },
        through: { attributes: [] },
        required: true
      }],
      attributes: ['id', 'name', 'description', 'estimated_duration', 'category', 'photo', 'is_active']
    });
    
    // Calculons la note moyenne et le nombre d'évaluations
    const ratingData = await Rating.findOne({
      where: { hairdresser_id: user.hairdresserProfile.id },
      attributes: [
        [sequelize.fn('AVG', sequelize.col('rating')), 'average_rating'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'rating_count']
      ],
      raw: true
    });
    
    // Construisons la réponse manuellement
    const hairdresserDetails = {
      ...hairdresserBasic.get({ plain: true }),
      user: userDetails,
      hairstyles: hairstyles,
      average_rating: parseFloat(ratingData?.average_rating) || 0,
      rating_count: parseInt(ratingData?.rating_count) || 0,
      total_jobs: hairdresserBasic.total_jobs || 0,
      is_available: hairdresserBasic.is_available || false
    };


    // Obtenir quelques évaluations récentes
    const recentRatings = await Rating.findAll({
      where: { 
        hairdresser_id: user.hairdresserProfile.id
      },
      include: [{
        model: User,
        as: 'client',
        attributes: ['full_name', 'profile_photo']
      }],
      order: [[sequelize.col('Rating.created_at'), 'DESC']],
      limit: 5,
      attributes: [
        'id',
        'rating',
        'comment',
        ['created_at', 'created_at'], // Alias explicite pour éviter l'ambiguïté
        [
          sequelize.fn('to_char', 
            sequelize.col('Rating.created_at'), // Spécification de la table
            'DD/MM/YYYY'
          ),
          'formatted_date'
        ]
      ]
    });

    // Préparer la réponse
    const response = {
      success: true,
      data: {
        ...hairdresserDetails,
        recent_ratings: recentRatings || []
      }
    };

    return res.status(200).json(response);

  } catch (error) {
    console.error('Get hairdresser details error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Erreur lors de la récupération des détails du coiffeur',
        ...(process.env.NODE_ENV === 'development' && { details: error.message })
      }
    });
  }
};