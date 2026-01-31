const express = require('express');
const router = express.Router();
const hairstyleController = require('../controllers/hairstyle.controller');
const { uploadSingle, handleUploadErrors } = require('../middleware/upload.middleware');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

// Routes pour les coiffures
router.post(
  '/',
  verifyToken,
  isAdmin,
  uploadSingle,
  handleUploadErrors,
  hairstyleController.addHairstyle
);

// Route pour ajouter les hairstyles de base (seed) - temporairement publique
router.post(
  '/seed',
  hairstyleController.seedHairstyles
);

router.get(
  '/',
  hairstyleController.getHairstyles
);

// Servir les fichiers statiques du dossier uploads
router.use('/uploads', express.static('public/uploads'));

module.exports = router;
