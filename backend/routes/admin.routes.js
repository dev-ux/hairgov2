const express = require('express');
const router = express.Router();
const { authenticate, isAdmin } = require('../middleware/auth.middleware');
const adminController = require('../controllers/admin.controller');

// Routes protégées par authentification et autorisation admin
router.use(authenticate);
router.use(isAdmin);

/**
 * @route   GET /admin/users
 * @desc    Récupère la liste des utilisateurs (Admin uniquement)
 * @access  Private/Admin
 */
router.get('/users', adminController.getUsersList);

module.exports = router;