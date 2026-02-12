// routes/favorite.routes.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const favoriteController = require('../controllers/favorite.controller');

// Toutes les routes nécessitent une authentification
router.use(authenticate);

// Routes pour les favoris
router.post('/hairdressers/:hairdresserId/favorite', favoriteController.addToFavorites);
router.delete('/hairdressers/:hairdresserId/favorite', favoriteController.removeFromFavorites);
router.get('/favorites', favoriteController.getFavorites);
router.get('/hairdressers/:hairdresserId/favorite', favoriteController.checkFavorite);

module.exports = router;
