const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Créer le dossier d'uploads s'il n'existe pas
const uploadDir = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuration du stockage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const type = 'hairstyles';
    const dir = path.join(uploadDir, type);
    
    // Créer le dossier s'il n'existe pas
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = `${Date.now()}-${uuidv4()}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `hairstyle-${uniqueSuffix}${ext}`);
  }
});

// Filtre des fichiers
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Type de fichier non autorisé. Seuls les fichiers JPEG, JPG et PNG sont acceptés.'), false);
  }
};

// Configuration de Multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
    files: 10 // Maximum de 10 fichiers
  }
});

// Middleware pour gérer les erreurs d'upload
const handleUploadErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Une erreur Multer s'est produite lors du téléchargement
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'FILE_TOO_LARGE',
          message: 'La taille du fichier dépasse la limite autorisée (5MB)'
        }
      });
    }
    
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'TOO_MANY_FILES',
          message: 'Trop de fichiers téléchargés. Maximum 10 fichiers autorisés.'
        }
      });
    }
    
    // Autres erreurs Multer
    return res.status(400).json({
      success: false,
      error: {
        code: 'UPLOAD_ERROR',
        message: 'Erreur lors du téléchargement du fichier',
        details: err.message
      }
    });
  } else if (err) {
    // Une erreur inattendue s'est produite
    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Erreur serveur lors du traitement du fichier',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      }
    });
  }
  
  // Si tout va bien, passer au middleware suivant
  next();
};

module.exports = {
  upload,
  handleUploadErrors
};
