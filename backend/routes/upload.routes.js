const express = require('express');
const router = express.Router();
const { uploadFile } = require('../controllers/upload.controller');
const path = require('path');
const fs = require('fs');

// Route pour téléverser un fichier (sans authentification pour le débogage)
router.post('/upload', uploadFile);

// Route pour servir les photos de profil depuis le stockage local
router.get('/uploads/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../public/uploads', filename);
    
    // Vérifier si le fichier existe localement
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      // Si le fichier n'existe pas, servir une image par défaut
      const defaultPath = path.join(__dirname, '../public/default-avatar.png');
      if (fs.existsSync(defaultPath)) {
        res.sendFile(defaultPath);
      } else {
        // Si même l'image par défaut n'existe pas, retourner une erreur 404
        res.status(404).json({
          success: false,
          error: {
            code: 'FILE_NOT_FOUND',
            message: 'Photo de profil non trouvée'
          }
        });
      }
    }
  } catch (error) {
    console.error('Error serving profile photo:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Erreur lors du chargement de la photo'
      }
    });
  }
});

module.exports = router;
