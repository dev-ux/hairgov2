// routes/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { validateRegister, validateLogin, validateAdminRegister, validateHairdresserRegister } = require('../validators/auth.validator');
const { authenticate } = require('../middleware/auth.middleware');

/**
 * @route   POST /api/v1/auth/register/client
 * @desc    Inscription d'un nouveau client
 * @access  Public
 */
router.post('/register/client', validateRegister, authController.registerClient);

/**
 * @route   POST /api/v1/auth/register/hairdresser
 * @desc    Demande d'inscription coiffeur (nécessite validation admin)
 * @access  Public
 */
router.post('/register/hairdresser', validateHairdresserRegister, authController.registerHairdresser);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Connexion utilisateur
 * @access  Public
 */
router.post('/login', validateLogin, authController.login);

/**
 * @route   POST /api/v1/auth/login/guest
 * @desc    Création session invité (client sans compte)
 * @access  Public
 */
router.post('/login/guest', authController.guestLogin);

/**
 * @route   POST /api/v1/auth/refresh-token
 * @desc    Rafraîchir le JWT token
 * @access  Public
 */
router.post('/refresh-token', authController.refreshToken);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Récupérer le profil de l'utilisateur connecté
 * @access  Private
 */
router.get('/me', authenticate, authController.getMe);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Déconnexion utilisateur
 * @access  Private
 */
router.post('/logout', authenticate, authController.logout);

/**
 * @route   POST /api/v1/auth/register/admin
 * @desc    Créer un compte administrateur
 * @access  Private (à sécuriser avec un middleware d'authentification admin)
 */
router.post('/register/admin', validateAdminRegister, authController.registerAdmin);

/**
 * @route   POST /api/v1/auth/verify-phone
 * @desc    Vérifier le numéro de téléphone (OTP)
 * @access  Public
 */
router.post('/verify-phone', authController.verifyPhone);

/**
 * @route   POST /api/v1/auth/resend-otp
 * @desc    Renvoyer le code OTP
 * @access  Public
 */
router.post('/resend-otp', authController.resendOTP);

/**
 * @route   POST /api/v1/auth/forgot-password
 * @desc    Demande de réinitialisation mot de passe
 * @access  Public
 */
router.post('/forgot-password', authController.forgotPassword);

/**
 * @route   POST /api/v1/auth/reset-password
 * @desc    Réinitialiser le mot de passe
 * @access  Public
 */
router.post('/reset-password', authController.resetPassword);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Obtenir profil utilisateur connecté
 * @access  Private
 */
router.get('/me', authenticate, authController.getMe);

/**
 * @route   PUT /api/v1/auth/update-fcm-token
 * @desc    Mettre à jour le token FCM pour notifications
 * @access  Private
 */
router.put('/update-fcm-token', authenticate, authController.updateFCMToken);

module.exports = router;