// routes/favorite.routes.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const favoriteController = require('../controllers/favorite.controller');

// Route pour obtenir tous les favoris (avec authentification)
router.get('/favorites', authenticate, favoriteController.getFavorites);

// Toutes les routes nécessitent une authentification
router.use(authenticate);

// Routes pour les favoris de coiffeurs
router.post('/hairdressers/:hairdresserId/favorite', favoriteController.addToFavorites);
router.delete('/hairdressers/:hairdresserId/favorite', favoriteController.removeFromFavorites);
router.get('/hairdressers/:hairdresserId/favorite', favoriteController.checkFavorite);

// Routes pour les favoris de salons
router.post('/salons/:salonId/favorite', favoriteController.addSalonToFavorites);
router.delete('/salons/:salonId/favorite', favoriteController.removeSalonFromFavorites);
router.get('/salons/:salonId/favorite', favoriteController.checkSalonFavorite);

module.exports = router;
