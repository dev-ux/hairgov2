const express = require('express');
const router = express.Router();
const { authenticate, isHairdresser, isAdmin } = require('../middleware/auth.middleware');
const hairdresserController = require('../controllers/hairdresser.controller');

// Routes publiques
router.get('/', hairdresserController.getAllHairdressers);
router.get('/:id', hairdresserController.getHairdresserDetails);

// Routes protégées - nécessite une authentification
router.use(authenticate);

// Gestion du profil coiffeur
router.get('/profile', hairdresserController.getProfile);
router.put('/profile', hairdresserController.updateProfile);
router.put('/availability', hairdresserController.updateAvailability);
router.put('/location', hairdresserController.updateLocation);

// Gestion du solde et des transactions
router.post('/recharge', hairdresserController.requestRecharge);
router.get('/balance/history', hairdresserController.getBalanceHistory);

// Statistiques et évaluations
router.get('/statistics', hairdresserController.getStatistics);
router.get('/ratings', hairdresserController.getRatings);
router.get('/current-job', hairdresserController.getCurrentJob);

// Recherche de coiffeurs (pour les clients)
router.get('/search', hairdresserController.searchHairdressers);

// Classement des coiffeurs
router.get('/leaderboard', hairdresserController.getLeaderboard);

module.exports = router;