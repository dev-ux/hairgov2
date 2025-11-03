// services/upload.service.js
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

// Configuration AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'hairgov2-uploads';

/**
 * Upload un fichier vers S3
 */
const uploadFile = async (file, folder = 'uploads') => {
  try {
    const fileExtension = path.extname(file.originalname);
    const fileName = `${folder}/${uuidv4()}${fileExtension}`;
    
    const params = {
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read'
    };

    const uploadResult = await s3.upload(params).promise();
    
    return {
      url: uploadResult.Location,
      key: uploadResult.Key,
      name: file.originalname,
      size: file.size,
      type: file.mimetype
    };
  } catch (error) {
    console.error('Error uploading file to S3:', error);
    throw error;
  }
};

/**
 * Supprimer un fichier de S3
 */
const deleteFile = async (fileUrl) => {
  try {
    if (!fileUrl) return;
    
    // Extraire la clé du fichier à partir de l'URL
    const key = fileUrl.split('/').slice(3).join('/');
    
    const params = {
      Bucket: BUCKET_NAME,
      Key: key
    };
    
    await s3.deleteObject(params).promise();
    return true;
  } catch (error) {
    console.error('Error deleting file from S3:', error);
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