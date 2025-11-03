const express = require('express');
const router = express.Router();
const { authenticate, isAdmin } = require('../middleware/auth.middleware');
const { getUsersList, getHairdressers } = require('../controllers/admin.controller');

// Routes protégées par authentification et autorisation admin
router.use(authenticate);
router.use(isAdmin);

/**
 * @route   GET /admin/users
 * @desc    Récupère la liste des utilisateurs (Admin uniquement)
 * @access  Private/Admin
 */
router.get('/users', getUsersList);

/**
 * @route   GET /api/v1/admin/hairdressers
 * @desc    Récupérer tous les coiffeurs (Admin)
 * @access  Privé (Admin)
 */
router.get('/hairdressers', getHairdressers);

module.exports = router;