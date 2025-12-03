// routes/booking.routes.js
const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');
const { authenticate, isHairdresser, isClient } = require('../middleware/auth.middleware');
const { validateBooking } = require('../validators/booking.validator');

// Middleware pour les en-têtes CORS
router.use(function(req, res, next) {
  res.header(
    "Access-Control-Allow-Headers",
    "x-access-token, Origin, Content-Type, Accept"
  );
  next();
});

// Route publique pour créer une réservation (pour développement)
router.post('/public', bookingController.createBookingPublic);

// Route publique - Récupérer toutes les réservations (pour développement)
// TODO: À remplacer par des routes authentifiées en production
router.get('/', bookingController.findAllPublic);

/**
 * @route   POST /api/v1/bookings
 * @desc    Créer une nouvelle réservation
 * @access  Public (clients connectés ou invités)
 */
router.post('/', validateBooking, bookingController.createBooking);

/**
 * @route   GET /api/v1/bookings/nearby-hairdressers
 * @desc    Obtenir les coiffeurs disponibles à proximité
 * @access  Public
 */
router.get('/nearby-hairdressers', bookingController.getNearbyHairdressers);

/**
 * @route   GET /api/v1/bookings/estimate-price
 * @desc    Estimer le prix d'une prestation
 * @access  Public
 */
router.get('/estimate-price', bookingController.estimatePrice);

/**
 * @route   GET /api/v1/bookings/:id
 * @desc    Obtenir les détails d'une réservation
 * @access  Private (client ou coiffeur concerné)
 */
router.get('/:id', authenticate, bookingController.getBookingDetails);

/**
 * @route   GET /api/v1/bookings/client/history
 * @desc    Historique des réservations du client
 * @access  Private (client)
 */
router.get('/client/history', authenticate, isClient, bookingController.getClientHistory);

/**
 * @route   GET /api/v1/bookings/hairdresser/history
 * @desc    Historique des prestations du coiffeur
 * @access  Private (hairdresser)
 */
router.get('/hairdresser/history', authenticate, isHairdresser, bookingController.getHairdresserHistory);

/**
 * @route   GET /api/v1/bookings/hairdresser/pending
 * @desc    Réservations en attente pour le coiffeur
 * @access  Private (hairdresser)
 */
router.get('/hairdresser/pending', authenticate, isHairdresser, bookingController.getPendingBookings);

/**
 * @route   PUT /api/v1/bookings/:id/accept
 * @desc    Accepter une réservation (coiffeur)
 * @access  Private (hairdresser)
 */
router.put('/:id/accept', authenticate, isHairdresser, bookingController.acceptBooking);

/**
 * @route   PUT /api/v1/bookings/:id/reject
 * @desc    Rejeter une réservation (coiffeur)
 * @access  Private (hairdresser)
 */
router.put('/:id/reject', authenticate, isHairdresser, bookingController.rejectBooking);

/**
 * @route   PUT /api/v1/bookings/:id/start
 * @desc    Démarrer une prestation
 * @access  Private (hairdresser)
 */
router.put('/:id/start', authenticate, isHairdresser, bookingController.startBooking);

/**
 * @route   PUT /api/v1/bookings/:id/complete
 * @desc    Terminer une prestation
 * @access  Private (hairdresser)
 */
router.put('/:id/complete', authenticate, isHairdresser, bookingController.completeBooking);

/**
 * @route   PUT /api/v1/bookings/:id/cancel
 * @desc    Annuler une réservation
 * @access  Private (client ou hairdresser)
 */
router.put('/:id/cancel', authenticate, bookingController.cancelBooking);

/**
 * @route   PUT /api/v1/bookings/:id/request-extension
 * @desc    Demander une extension de temps (coiffeur)
 * @access  Private (hairdresser)
 */
router.put('/:id/request-extension', authenticate, isHairdresser, bookingController.requestExtension);

/**
 * @route   POST /api/v1/bookings/:id/rate
 * @desc    Noter un coiffeur après prestation
 * @access  Private (client)
 */
router.post('/:id/rate', authenticate, isClient, bookingController.rateHairdresser);

/**
 * @route   GET /api/v1/bookings/:id/track
 * @desc    Suivre la localisation du coiffeur en temps réel
 * @access  Private (client concerné)
 */
router.get('/:id/track', authenticate, bookingController.trackHairdresser);

module.exports = router;