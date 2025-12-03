// controllers/booking.controller.js
const db = require('../models');
const { Op, Sequelize } = require('sequelize');

// Récupération des modèles
const User = db.User;
const Hairdresser = db.Hairdresser;
const Hairstyle = db.Hairstyle;
const Rating = db.Rating;
const Booking = db.Booking;
const BalanceTransaction = db.BalanceTransaction;
const sequelize = db.sequelize;
const geolocationService = require('../services/geolocation.service');
const notificationService = require('../services/notification.service');

// Récupérer toutes les réservations publiquement (pour développement)
exports.findAllPublic = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
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
          attributes: ['id', 'name', 'description', 'estimated_duration', 'category']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: 50
    });

    // Formater les données pour correspondre à ce que le frontend attend
    const formattedBookings = bookings.map(booking => ({
      id: booking.id,
      client_name: booking.client_name,
      client_phone: booking.client_phone,
      hairdresser: booking.hairdresser ? {
        id: booking.hairdresser.id,
        full_name: booking.hairdresser.user?.full_name || 'Coiffeur inconnu',
        profile_photo: booking.hairdresser.user?.profile_photo
      } : null,
      hairstyle: booking.hairstyle,
      service_type: booking.service_type,
      service_fee: booking.service_fee,
      client_price: booking.client_price,
      status: booking.status,
      location_address: booking.location_address,
      latitude: booking.latitude,
      longitude: booking.longitude,
      estimated_duration: booking.estimated_duration,
      scheduled_time: booking.scheduled_time,
      started_at: booking.started_at,
      completed_at: booking.completed_at,
      cancelled_at: booking.cancelled_at,
      cancellation_reason: booking.cancellation_reason,
      created_at: booking.created_at,
      updated_at: booking.updated_at
    }));

    res.send({
      success: true,
      data: formattedBookings,
      total: bookings.length
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: err.message || "Une erreur s'est produite lors de la récupération des réservations."
    });
  }
};

// Créer une réservation publiquement (pour développement)
exports.createBookingPublic = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const {
      client_name,
      client_phone,
      hairstyle_id,
      service_type,
      location_address,
      latitude,
      longitude,
      scheduled_time,
      client_id,
      salon_id, // Ajouté pour récupérer le hairdresser du salon
      service_fee = 25,
      client_price,
      estimated_duration
    } = req.body;

    // Vérifier que la coiffure existe
    const hairstyle = await Hairstyle.findByPk(hairstyle_id);
    if (!hairstyle) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        error: {
          code: 'HAIRSTYLE_NOT_FOUND',
          message: 'Coiffure introuvable'
        }
      });
    }

    let hairdresser_id = null;
    
    // Si salon_id est fourni, récupérer le hairdresser_id du salon
    if (salon_id) {
      const { Salon } = require('../models');
      const salon = await Salon.findByPk(salon_id);
      if (salon && salon.hairdresser_id) {
        hairdresser_id = salon.hairdresser_id;
      }
    }

    // Créer la réservation
    const booking = await Booking.create({
      client_name,
      client_phone,
      hairdresser_id, // Utiliser le coiffeur du salon ou null
      hairstyle_id,
      service_type,
      service_fee,
      client_price: client_price || (estimated_duration * 0.5),
      estimated_duration: estimated_duration || hairstyle.estimated_duration,
      scheduled_time,
      location_address,
      latitude,
      longitude,
      status: 'pending',
      client_id
    }, { transaction });

    await transaction.commit();

    // Récupérer la réservation créée avec les associations
    const createdBooking = await Booking.findByPk(booking.id, {
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
          attributes: ['id', 'name', 'description', 'estimated_duration', 'category']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Réservation créée avec succès',
      data: createdBooking
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Erreur lors de la création de la réservation:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'BOOKING_CREATION_ERROR',
        message: 'Erreur lors de la création de la réservation'
      }
    });
  }
};

/**
 * Créer une nouvelle réservation
 */
exports.createBooking = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const {
      client_name,
      client_phone,
      hairstyle_id,
      service_type, // 'home' ou 'salon'
      location_address,
      latitude,
      longitude,
      scheduled_time,
      client_id
    } = req.body;

    // Vérifier que la coiffure existe
    const hairstyle = await Hairstyle.findByPk(hairstyle_id);
    if (!hairstyle) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        error: {
          code: 'HAIRSTYLE_NOT_FOUND',
          message: 'Coiffure introuvable'
        }
      });
    }

    // Trouver un coiffeur disponible à proximité
    const nearbyHairdressers = await geolocationService.findNearbyHairdressers(
      latitude,
      longitude,
      5000, // 5km radius
      hairstyle_id
    );

    if (nearbyHairdressers.length === 0) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        error: {
          code: 'NO_HAIRDRESSER_AVAILABLE',
          message: 'Aucun coiffeur disponible dans votre zone'
        }
      });
    }

    // Sélectionner le coiffeur le plus proche avec le meilleur rating
    const selectedHairdresser = nearbyHairdressers.sort((a, b) => {
      if (b.average_rating !== a.average_rating) {
        return b.average_rating - a.average_rating;
      }
      return a.distance - b.distance;
    })[0];

    // Vérifier le solde du coiffeur
    const serviceFee = service_type === 'home' ? 
      parseFloat(process.env.HOME_SERVICE_FEE) : 
      parseFloat(process.env.RESERVATION_FEE);

    if (selectedHairdresser.balance < serviceFee) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_BALANCE',
          message: 'Solde du coiffeur insuffisant'
        }
      });
    }

    // Créer la réservation
    const booking = await Booking.create({
      client_id: client_id || null,
      client_name,
      client_phone,
      hairdresser_id: selectedHairdresser.id,
      hairstyle_id,
      service_type,
      service_fee: serviceFee,
      location_address,
      latitude,
      longitude,
      estimated_duration: hairstyle.estimated_duration,
      scheduled_time: scheduled_time || new Date(),
      status: 'pending'
    }, { transaction });

    // Marquer le coiffeur comme indisponible
    await Hairdresser.update(
      { 
        is_available: false,
        current_job_id: booking.id 
      },
      { 
        where: { id: selectedHairdresser.id },
        transaction 
      }
    );

    await transaction.commit();

    // Envoyer notification au coiffeur
    await notificationService.sendToHairdresser(
      selectedHairdresser.user_id,
      'Nouvelle demande de prestation',
      `${client_name} souhaite un service ${service_type === 'home' ? 'à domicile' : 'en salon'}`,
      {
        type: 'new_booking',
        booking_id: booking.id
      }
    );

    // Récupérer les détails complets
    const bookingDetails = await Booking.findByPk(booking.id, {
      include: [
        {
          model: Hairdresser,
          as: 'hairdresser',
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'full_name', 'phone', 'profile_photo']
          }]
        },
        {
          model: Hairstyle,
          as: 'hairstyle'
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Réservation créée avec succès',
      data: {
        booking: bookingDetails,
        hairdresser: {
          id: selectedHairdresser.id,
          full_name: selectedHairdresser.user.full_name,
          phone: selectedHairdresser.user.phone,
          profile_photo: selectedHairdresser.user.profile_photo,
          average_rating: selectedHairdresser.average_rating,
          distance: selectedHairdresser.distance
        }
      }
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'BOOKING_ERROR',
        message: 'Erreur lors de la création de la réservation',
        details: error.message
      }
    });
  }
};

/**
 * Obtenir les coiffeurs disponibles à proximité
 */
exports.getNearbyHairdressers = async (req, res) => {
  try {
    const { latitude, longitude, radius, hairstyle_id } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_LOCATION',
          message: 'Coordonnées GPS requises'
        }
      });
    }

    const searchRadius = radius ? parseInt(radius) : 5000; // 5km par défaut

    const hairdressers = await geolocationService.findNearbyHairdressers(
      parseFloat(latitude),
      parseFloat(longitude),
      searchRadius,
      hairstyle_id
    );

    res.status(200).json({
      success: true,
      data: {
        hairdressers,
        total_count: hairdressers.length
      }
    });

  } catch (error) {
    console.error('Get nearby hairdressers error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SEARCH_ERROR',
        message: 'Erreur lors de la recherche de coiffeurs'
      }
    });
  }
};

/**
 * Accepter une réservation (coiffeur)
 */
exports.acceptBooking = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;

    const booking = await Booking.findByPk(id, {
      include: [{
        model: Hairdresser,
        as: 'hairdresser'
      }]
    });

    if (!booking) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        error: {
          code: 'BOOKING_NOT_FOUND',
          message: 'Réservation introuvable'
        }
      });
    }

    // Vérifier que c'est le bon coiffeur
    if (booking.hairdresser.user_id !== req.userId) {
      await transaction.rollback();
      return res.status(403).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Non autorisé'
        }
      });
    }

    if (booking.status !== 'pending') {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: 'Cette réservation ne peut plus être acceptée'
        }
      });
    }

    // Déduire les frais de service
    const newBalance = parseFloat(booking.hairdresser.balance) - parseFloat(booking.service_fee);

    await Hairdresser.update(
      { balance: newBalance },
      { 
        where: { id: booking.hairdresser_id },
        transaction 
      }
    );

    // Créer la transaction de déduction
    await BalanceTransaction.create({
      hairdresser_id: booking.hairdresser_id,
      transaction_type: 'deduction',
      amount: -booking.service_fee,
      balance_before: booking.hairdresser.balance,
      balance_after: newBalance,
      booking_id: booking.id,
      description: `Frais de service - ${booking.service_type}`,
      status: 'approved'
    }, { transaction });

    // Mettre à jour la réservation
    await booking.update(
      { status: 'accepted' },
      { transaction }
    );

    await transaction.commit();

    // Notifier le client
    if (booking.client_id) {
      await notificationService.sendToClient(
        booking.client_id,
        'Réservation acceptée',
        'Votre coiffeur arrive bientôt !',
        {
          type: 'booking_accepted',
          booking_id: booking.id
        }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Réservation acceptée',
      data: {
        booking_id: booking.id,
        status: 'accepted',
        service_fee_deducted: booking.service_fee,
        new_balance: newBalance
      }
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Accept booking error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'ACCEPT_ERROR',
        message: 'Erreur lors de l\'acceptation'
      }
    });
  }
};

/**
 * Rejeter une réservation (coiffeur)
 */
exports.rejectBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const booking = await Booking.findByPk(id, {
      include: [{
        model: Hairdresser,
        as: 'hairdresser'
      }]
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'BOOKING_NOT_FOUND',
          message: 'Réservation introuvable'
        }
      });
    }

    if (booking.hairdresser.user_id !== req.userId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Non autorisé'
        }
      });
    }

    await booking.update({
      status: 'rejected',
      cancellation_reason: reason
    });

    // Libérer le coiffeur
    await Hairdresser.update(
      { 
        is_available: true,
        current_job_id: null 
      },
      { where: { id: booking.hairdresser_id } }
    );

    // Notifier le client
    if (booking.client_id) {
      await notificationService.sendToClient(
        booking.client_id,
        'Réservation rejetée',
        'Le coiffeur n\'est pas disponible. Recherche d\'une alternative...',
        {
          type: 'booking_rejected',
          booking_id: booking.id
        }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Réservation rejetée'
    });

  } catch (error) {
    console.error('Reject booking error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'REJECT_ERROR',
        message: 'Erreur lors du rejet'
      }
    });
  }
};

/**
 * Démarrer une prestation
 */
exports.startBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findByPk(id, {
      include: [{
        model: Hairdresser,
        as: 'hairdresser'
      }]
    });

    if (!booking || booking.hairdresser.user_id !== req.userId) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'BOOKING_NOT_FOUND',
          message: 'Réservation introuvable'
        }
      });
    }

    if (booking.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: 'Cette réservation n\'a pas été acceptée'
        }
      });
    }

    const startedAt = new Date();
    const estimatedEndTime = new Date(startedAt.getTime() + booking.estimated_duration * 60000);

    await booking.update({
      status: 'in_progress',
      started_at: startedAt
    });

    // Notifier le client
    if (booking.client_id) {
      await notificationService.sendToClient(
        booking.client_id,
        'Prestation démarrée',
        'Votre coiffeur a commencé la prestation',
        {
          type: 'booking_started',
          booking_id: booking.id
        }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Prestation démarrée',
      data: {
        booking_id: booking.id,
        status: 'in_progress',
        started_at: startedAt,
        estimated_end_time: estimatedEndTime
      }
    });

  } catch (error) {
    console.error('Start booking error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'START_ERROR',
        message: 'Erreur lors du démarrage'
      }
    });
  }
};

/**
 * Terminer une prestation
 */
exports.completeBooking = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;

    const booking = await Booking.findByPk(id, {
      include: [{
        model: Hairdresser,
        as: 'hairdresser'
      }]
    });

    if (!booking || booking.hairdresser.user_id !== req.userId) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        error: {
          code: 'BOOKING_NOT_FOUND',
          message: 'Réservation introuvable'
        }
      });
    }

    if (booking.status !== 'in_progress') {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: 'Cette prestation n\'est pas en cours'
        }
      });
    }

    const completedAt = new Date();
    const durationMinutes = Math.round((completedAt - booking.started_at) / 60000);

    // Calculer les gains (exemple: 20000 XOF pour une prestation)
    const earnings = 20000; // À calculer selon votre logique métier

    await booking.update({
      status: 'completed',
      completed_at: completedAt
    }, { transaction });

    // Mettre à jour les stats du coiffeur
    await Hairdresser.update({
      total_jobs: booking.hairdresser.total_jobs + 1,
      total_earnings: parseFloat(booking.hairdresser.total_earnings) + earnings,
      is_available: true,
      current_job_id: null
    }, { 
      where: { id: booking.hairdresser_id },
      transaction 
    });

    await transaction.commit();

    // Notifier le client pour évaluation
    if (booking.client_id) {
      await notificationService.sendToClient(
        booking.client_id,
        'Prestation terminée',
        'N\'oubliez pas d\'évaluer votre coiffeur !',
        {
          type: 'rating_request',
          booking_id: booking.id
        }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Prestation terminée',
      data: {
        booking_id: booking.id,
        status: 'completed',
        completed_at: completedAt,
        duration_minutes: durationMinutes,
        earnings
      }
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Complete booking error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'COMPLETE_ERROR',
        message: 'Erreur lors de la finalisation'
      }
    });
  }
};

/**
 * Noter un coiffeur
 */
exports.rateHairdresser = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    const booking = await Booking.findByPk(id);

    if (!booking) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        error: {
          code: 'BOOKING_NOT_FOUND',
          message: 'Réservation introuvable'
        }
      });
    }

    if (booking.status !== 'completed') {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        error: {
          code: 'BOOKING_NOT_COMPLETED',
          message: 'La prestation doit être terminée pour évaluer'
        }
      });
    }

    // Vérifier si déjà noté
    const existingRating = await Rating.findOne({
      where: { booking_id: id }
    });

    if (existingRating) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        error: {
          code: 'ALREADY_RATED',
          message: 'Vous avez déjà noté cette prestation'
        }
      });
    }

    // Créer l'évaluation
    await Rating.create({
      booking_id: id,
      hairdresser_id: booking.hairdresser_id,
      client_id: booking.client_id,
      rating,
      comment
    }, { transaction });

    // Recalculer la moyenne du coiffeur
    const avgRating = await Rating.findOne({
      where: { hairdresser_id: booking.hairdresser_id },
      attributes: [
        [sequelize.fn('AVG', sequelize.col('rating')), 'average']
      ],
      raw: true
    });

    await Hairdresser.update(
      { average_rating: parseFloat(avgRating.average).toFixed(2) },
      { 
        where: { id: booking.hairdresser_id },
        transaction 
      }
    );

    await transaction.commit();

    res.status(201).json({
      success: true,
      message: 'Évaluation enregistrée',
      data: {
        rating,
        new_average: parseFloat(avgRating.average).toFixed(2)
      }
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Rate hairdresser error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'RATING_ERROR',
        message: 'Erreur lors de l\'évaluation'
      }
    });
  }
};

/**
 * Demander une extension de temps
 */
exports.requestExtension = async (req, res) => {
  try {
    const { id } = req.params;
    const { extension_minutes, reason } = req.body;

    const booking = await Booking.findByPk(id, {
      include: [{
        model: Hairdresser,
        as: 'hairdresser'
      }]
    });

    if (!booking || booking.hairdresser.user_id !== req.userId) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'BOOKING_NOT_FOUND',
          message: 'Réservation introuvable'
        }
      });
    }

    await booking.update({
      extension_requested: true,
      extension_minutes,
      cancellation_reason: reason // Utiliser ce champ pour la raison
    });

    res.status(200).json({
      success: true,
      message: 'Demande d\'extension envoyée à l\'administrateur',
      data: {
        booking_id: booking.id,
        extension_minutes
      }
    });

  } catch (error) {
    console.error('Request extension error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'EXTENSION_ERROR',
        message: 'Erreur lors de la demande d\'extension'
      }
    });
  }
};

/**
 * Historique client
 */
exports.getClientHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows } = await Booking.findAndCountAll({
      where: { client_id: req.userId },
      include: [
        {
          model: Hairdresser,
          as: 'hairdresser',
          include: [{
            model: User,
            as: 'user',
            attributes: ['full_name', 'phone', 'profile_photo']
          }]
        },
        {
          model: Hairstyle,
          as: 'hairstyle'
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    res.status(200).json({
      success: true,
      data: {
        bookings: rows,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(count / limit),
          total_items: count
        }
      }
    });

  } catch (error) {
    console.error('Get client history error:', error);
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
 * Historique coiffeur
 */
exports.getHairdresserHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const hairdresser = await Hairdresser.findOne({
      where: { user_id: req.userId }
    });

    const { count, rows } = await Booking.findAndCountAll({
      where: { hairdresser_id: hairdresser.id },
      include: [{
        model: Hairstyle,
        as: 'hairstyle'
      }],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    res.status(200).json({
      success: true,
      data: {
        bookings: rows,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(count / limit),
          total_items: count
        }
      }
    });

  } catch (error) {
    console.error('Get hairdresser history error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'HISTORY_ERROR',
        message: 'Erreur lors de la récupération de l\'historique'
      }
    });
  }
};

exports.getBookingDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    const booking = await Booking.findByPk(id, {
      include: [
        {
          model: Hairdresser,
          as: 'hairdresser',
          include: [{
            model: User,
            as: 'user'
          }]
        },
        {
          model: Hairstyle,
          as: 'hairstyle'
        },
        {
          model: User,
          as: 'client'
        }
      ]
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'BOOKING_NOT_FOUND',
          message: 'Réservation introuvable'
        }
      });
    }

    res.status(200).json({
      success: true,
      data: { booking }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Erreur lors de la récupération'
      }
    });
  }
};

exports.getPendingBookings = async (req, res) => {
  try {
    const hairdresser = await Hairdresser.findOne({
      where: { user_id: req.userId }
    });

    const bookings = await Booking.findAll({
      where: {
        hairdresser_id: hairdresser.id,
        status: 'pending'
      },
      include: [{
        model: Hairstyle,
        as: 'hairstyle'
      }],
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: { bookings }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Erreur lors de la récupération'
      }
    });
  }
};

exports.estimatePrice = async (req, res) => {
  try {
    const { hairstyle_id, service_type } = req.query;

    const hairstyle = await Hairstyle.findByPk(hairstyle_id);
    if (!hairstyle) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'HAIRSTYLE_NOT_FOUND',
          message: 'Coiffure introuvable'
        }
      });
    }

    const serviceFee = service_type === 'home' ? 
      parseFloat(process.env.HOME_SERVICE_FEE) : 
      parseFloat(process.env.RESERVATION_FEE);

    const estimatedPrice = 20000; // Prix de base à définir

    res.status(200).json({
      success: true,
      data: {
        service_fee: serviceFee,
        base_price: estimatedPrice,
        total: estimatedPrice + serviceFee,
        estimated_duration: hairstyle.estimated_duration
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'ESTIMATE_ERROR',
        message: 'Erreur lors de l\'estimation'
      }
    });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const booking = await Booking.findByPk(id, {
      include: [{
        model: Hairdresser,
        as: 'hairdresser'
      }]
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'BOOKING_NOT_FOUND',
          message: 'Réservation introuvable'
        }
      });
    }

    await booking.update({
      status: 'cancelled',
      cancelled_at: new Date(),
      cancellation_reason: reason
    });

    // Libérer le coiffeur
    await Hairdresser.update(
      { 
        is_available: true,
        current_job_id: null 
      },
      { where: { id: booking.hairdresser_id } }
    );

    res.status(200).json({
      success: true,
      message: 'Réservation annulée'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'CANCEL_ERROR',
        message: 'Erreur lors de l\'annulation'
      }
    });
  }
};

exports.trackHairdresser = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findByPk(id, {
      include: [{
        model: Hairdresser,
        as: 'hairdresser',
        attributes: ['latitude', 'longitude', 'is_available']
      }]
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'BOOKING_NOT_FOUND',
          message: 'Réservation introuvable'
        }
      });
    }

    res.status(200).json({
      success: true,
      data: {
        hairdresser_location: {
          latitude: booking.hairdresser.latitude,
          longitude: booking.hairdresser.longitude
        },
        booking_status: booking.status
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'TRACK_ERROR',
        message: 'Erreur lors du suivi'
      }
    });
  }
};