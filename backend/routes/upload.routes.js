const express = require('express');
const router = express.Router();
const { uploadFile } = require('../controllers/upload.controller');
const AWS = require('aws-sdk');

// Configuration AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'hairgov2-uploads';

// Route pour téléverser un fichier (sans authentification pour le débogage)
router.post('/upload', uploadFile);

// Route pour servir les photos de profil depuis S3
router.get('/profiles/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const params = {
      Bucket: BUCKET_NAME,
      Key: `profiles/${filename}`
    };

    const file = await s3.getObject(params).promise();
    
    res.setHeader('Content-Type', file.ContentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache 1 an
    res.send(file.Body);
  } catch (error) {
    console.error('Error serving profile photo from S3:', error);
    res.status(404).json({
      success: false,
      error: {
        code: 'FILE_NOT_FOUND',
        message: 'Photo de profil non trouvée'
      }
    });
  }
});

module.exports = router;
