const express = require('express');
const router = express.Router();
const hairstyleController = require('../controllers/hairstyle.controller');
const { upload, handleUploadErrors } = require('../middleware/upload.middleware');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

// Routes pour les coiffures
router.post(
  '/',
  verifyToken,
  isAdmin,
  upload.single('photo'),
  handleUploadErrors,
  hairstyleController.addHairstyle
);

router.get(
  '/',
  hairstyleController.getHairstyles
);

// Servir les fichiers statiques du dossier uploads
router.use('/uploads', express.static('public/uploads'));

module.exports = router;
