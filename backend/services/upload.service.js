// services/upload.service.js
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

/**
 * Upload un fichier localement
 */
const uploadFile = async (file, folder = 'uploads') => {
  try {
    const fileExtension = path.extname(file.originalname);
    const uploadDir = path.join(__dirname, '../public/uploads');
    
    // Créer le dossier s'il n'existe pas
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    // Gérer les différents formats de fichiers
    let fileBuffer;
    if (file.buffer) {
      // Fichier venant de multer avec buffer
      fileBuffer = file.buffer;
    } else if (file.data) {
      // Fichier venant d'Express file upload
      fileBuffer = file.data;
    } else {
      throw new Error('Format de fichier non supporté');
    }
    
    // Générer un nom de fichier unique
    const fileName = `${folder}-${Date.now()}-${uuidv4()}${fileExtension}`;
    const localPath = path.join(uploadDir, fileName);
    
    // Écrire le fichier localement
    fs.writeFileSync(localPath, fileBuffer);
    
    // Construire l'URL du fichier
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://hairgov2.onrender.com' 
      : 'http://localhost:10000';
    const fileUrl = `${baseUrl}/uploads/${fileName}`;
    
    console.log(`💾 Fichier uploadé localement: ${fileName}`);
    
    return {
      url: fileUrl,
      key: fileName,
      name: file.originalname,
      size: file.size || fileBuffer.length,
      type: file.mimetype
    };
  } catch (error) {
    console.error('Error uploading file locally:', error);
    throw error;
  }
};

/**
 * Supprimer un fichier localement
 */
const deleteFile = async (fileUrl) => {
  try {
    if (!fileUrl) return;
    
    // Extraire le nom du fichier de l'URL
    const fileName = fileUrl.split('/').pop();
    if (!fileName) return;
    
    const filePath = path.join(__dirname, '../public/uploads', fileName);
    
    // Supprimer le fichier s'il existe
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`🗑️ Fichier supprimé: ${fileName}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting file locally:', error);
    throw error;
  }
};

/**
 * Upload multiple files
 */
const uploadMultipleFiles = async (files, folder = 'uploads') => {
  const uploadPromises = files.map(file => uploadFile(file, folder));
  return Promise.all(uploadPromises);
};

module.exports = {
  uploadFile,
  deleteFile,
  uploadMultipleFiles
};