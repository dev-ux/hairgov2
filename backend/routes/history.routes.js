// routes/history.routes.js
const express = require('express');
const router = express.Router();
const historyController = require('../controllers/history.controller');
const { authenticate, isClient, isHairdresser, isAdmin } = require('../middleware/auth.middleware');

// Middleware pour les en-têtes CORS
router.use(function(req, res, next) {
  res.header(
    "Access-Control-Allow-Headers",
    "x-access-token, Origin, Content-Type, Accept"
  );
  next();
});

/**
 * @route   GET /api/v1/history/client
 * @desc    Obtenir l'historique du client connecté
 * @access  Private (client)
 */
router.get('/client', authenticate, isClient, historyController.getClientHistory);

/**
 * @route   GET /api/v1/history/user
 * @desc    Alias pour l'historique du client (compatibilité)
 * @access  Private (client)
 */
router.get('/user', authenticate, isClient, historyController.getClientHistory);

/**
 * @route   GET /api/v1/history/hairdresser
 * @desc    Obtenir l'historique du coiffeur connecté
 * @access  Private (hairdresser)
 */
router.get('/hairdresser', authenticate, isHairdresser, historyController.getHairdresserHistory);

/**
 * @route   POST /api/v1/history/archive
 * @desc    Archiver manuellement les réservations anciennes
 * @access  Private (admin)
 */
router.post('/archive', authenticate, isAdmin, historyController.archiveOldBookings);

/**
 * @route   POST /api/v1/history/cleanup
 * @desc    Nettoyer les anciens enregistrements d'historique
 * @access  Private (admin)
 */
router.post('/cleanup', authenticate, isAdmin, historyController.cleanupOldHistories);

module.exports = router;
