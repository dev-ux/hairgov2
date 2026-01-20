const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Configuration de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Fonction pour uploader un fichier sur Cloudinary
exports.uploadToCloudinary = async (filePath) => {
  try {
    if (!filePath) return null;
    
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'hairstyles', // Dossier où seront stockées les images sur Cloudinary
      use_filename: true,
      unique_filename: true,
      resource_type: 'auto'
    });

    // Supprimer le fichier temporaire après l'upload
    fs.unlinkSync(filePath);
    
    return result;
  } catch (error) {
    console.error('Erreur lors de l\'upload sur Cloudinary:', error);
    
    // Essayer de supprimer le fichier temporaire même en cas d'erreur
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    throw error;
  }
};

// Fonction pour supprimer un fichier de Cloudinary
exports.deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) return;
    
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Erreur lors de la suppression du fichier de Cloudinary:', error);
    throw error;
  }
};
