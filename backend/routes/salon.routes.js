const express = require('express');
const router = express.Router();
const salonController = require('../controllers/salon.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { upload } = require('../middleware/upload.middleware');

// Middleware pour vérifier si l'utilisateur est un coiffeur
const isHairdresser = (req, res, next) => {
  if (req.user.user_type !== 'hairdresser') {
    return res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Accès réservé aux coiffeurs'
      }
    });
  }
  next();
};

// Middleware pour vérifier si l'utilisateur est un administrateur
const isAdmin = (req, res, next) => {
  if (req.user.user_type !== 'admin') {
    return res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Accès réservé aux administrateurs'
      }
    });
  }
  next();
};

/**
 * @route   POST /api/v1/salons
 * @desc    Créer un nouveau salon (coiffeur)
 * @access  Private (Coiffeur)
 */
router.post('/', 
  authenticate, 
  isHairdresser,
  upload.fields([
    { name: 'photos', maxCount: 10 },
    { name: 'logo', maxCount: 1 }
  ]),
  salonController.createSalon
);

/**
 * @route   GET /api/v1/salons/search
 * @desc    Rechercher des salons à proximité
 * @access  Public
 */
router.get('/search', salonController.searchSalons);

/**
 * @route   GET /api/v1/salons/:id
 * @desc    Obtenir les détails d'un salon
 * @access  Public
 */
router.get('/:id', salonController.getSalon);

/**
 * @route   PUT /api/v1/salons/:id
 * @desc    Mettre à jour un salon (propriétaire ou admin)
 * @access  Private
 */
router.put(
  '/:id',
  authenticate,
  upload.fields([
    { name: 'photos', maxCount: 10 },
    { name: 'logo', maxCount: 1 }
  ]),
  salonController.updateSalon
);

/**
 * @route   DELETE /api/v1/salons/:id
 * @desc    Supprimer un salon (propriétaire ou admin)
 * @access  Private
 */
router.delete('/:id', authenticate, salonController.deleteSalon);

/**
 * @route   POST /api/v1/salons/:id/validate
 * @desc    Valider ou rejeter un salon (admin)
 * @access  Private (Admin)
 */
router.post(
  '/:id/validate',
  authenticate,
  isAdmin,
  salonController.validateSalon
);

module.exports = router;
