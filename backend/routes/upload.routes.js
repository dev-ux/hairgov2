const express = require('express');
const router = express.Router();
const { uploadFile } = require('../controllers/upload.controller');

// Route pour téléverser un fichier (sans authentification pour le débogage)
router.post('/upload', uploadFile);

module.exports = router;
