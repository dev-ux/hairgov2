// config/database.js
require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'hairgo_db',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: console.log,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },
  test: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME_TEST || 'hairgo_test',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 10,
      min: 2,
      acquire: 30000,
      idle: 10000
    },
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
};

// ==========================================
// config/firebase-service-account.json
// Ce fichier doit être créé manuellement avec vos clés Firebase
// Téléchargez-le depuis: Firebase Console > Project Settings > Service Accounts
/*
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "your-private-key-id",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com",
  "client_id": "your-client-id",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
*/

// ==========================================
// utils/jwt.util.js
const jwt = require('jsonwebtoken');

/**
 * Générer un access token
 */
exports.generateAccessToken = (userId, userType) => {
  return jwt.sign(
    { userId, userType },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

/**
 * Générer un refresh token
 */
exports.generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
  );
};

/**
 * Vérifier un token
 */
exports.verifyToken = (token, secret = process.env.JWT_SECRET) => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    throw error;
  }
};

/**
 * Décoder un token sans vérification
 */
exports.decodeToken = (token) => {
  return jwt.decode(token);
};

// ==========================================
// utils/email.util.js
const nodemailer = require('nodemailer');

// Configuration SMTP (adapter selon votre fournisseur)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

/**
 * Envoyer un email
 */
exports.sendEmail = async (to, subject, html, text = '') => {
  try {
    if (process.env.NODE_ENV === 'development') {
      console.log(`📧 Email à ${to}: ${subject}`);
      return true;
    }

    const info = await transporter.sendMail({
      from: `"HAIRGO" <${process.env.SMTP_FROM || 'noreply@hairgo.com'}>`,
      to,
      subject,
      text,
      html
    });

    return info;
  } catch (error) {
    console.error('Send email error:', error);
    return null;
  }
};

/**
 * Email de bienvenue
 */
exports.sendWelcomeEmail = async (email, fullName) => {
  const subject = 'Bienvenue sur HAIRGO !';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #4CAF50;">Bienvenue ${fullName} !</h1>
      <p>Nous sommes ravis de vous compter parmi nous.</p>
      <p>HAIRGO est votre plateforme de coiffure à la demande.</p>
      <p>Trouvez un coiffeur près de chez vous en quelques clics !</p>
      <hr>
      <p style="color: #666; font-size: 12px;">
        Si vous n'avez pas créé de compte, ignorez cet email.
      </p>
    </div>
  `;

  return await exports.sendEmail(email, subject, html);
};

/**
 * Email de réinitialisation de mot de passe
 */
exports.sendPasswordResetEmail = async (email, resetCode) => {
  const subject = 'Réinitialisation de votre mot de passe';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #4CAF50;">Réinitialisation de mot de passe</h1>
      <p>Vous avez demandé à réinitialiser votre mot de passe.</p>
      <p>Votre code de vérification est :</p>
      <h2 style="background: #f5f5f5; padding: 20px; text-align: center; letter-spacing: 5px;">
        ${resetCode}
      </h2>
      <p>Ce code expire dans 10 minutes.</p>
      <hr>
      <p style="color: #666; font-size: 12px;">
        Si vous n'avez pas fait cette demande, ignorez cet email.
      </p>
    </div>
  `;

  return await exports.sendEmail(email, subject, html);
};

// ==========================================
// utils/helpers.js
const crypto = require('crypto');

/**
 * Générer un ID unique
 */
exports.generateUniqueId = () => {
  return crypto.randomBytes(16).toString('hex');
};

/**
 * Générer un code aléatoire
 */
exports.generateRandomCode = (length = 6) => {
  return Math.floor(Math.random() * Math.pow(10, length))
    .toString()
    .padStart(length, '0');
};

/**
 * Formater un numéro de téléphone
 */
exports.formatPhoneNumber = (phone) => {
  // Supprimer les espaces et autres caractères
  phone = phone.replace(/\s+/g, '');
  
  // Ajouter le code pays si manquant
  if (!phone.startsWith('+')) {
    if (phone.startsWith('0')) {
      phone = '+225' + phone.substring(1);
    } else {
      phone = '+225' + phone;
    }
  }
  
  return phone;
};

/**
 * Valider un numéro de téléphone
 */
exports.isValidPhoneNumber = (phone) => {
  const regex = /^\+[1-9]\d{1,14}$/;
  return regex.test(phone);
};

/**
 * Formatter une adresse
 */
exports.formatAddress = (address) => {
  return address.trim().replace(/\s+/g, ' ');
};

/**
 * Calculer la distance entre deux points
 */
exports.calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Rayon de la Terre en mètres
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c); // Distance en mètres
};

/**
 * Formatter un montant en XOF
 */
exports.formatAmount = (amount) => {
  return new Intl.NumberFormat('fr-CI', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0
  }).format(amount);
};

/**
 * Formatter une date
 */
exports.formatDate = (date, locale = 'fr-FR') => {
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Slugifier un texte
 */
exports.slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

/**
 * Pagination helper
 */
exports.getPagination = (page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  return { limit: parseInt(limit), offset: parseInt(offset) };
};

/**
 * Format pagination response
 */
exports.getPaginationData = (count, page, limit) => {
  return {
    current_page: parseInt(page),
    total_pages: Math.ceil(count / limit),
    total_items: count,
    items_per_page: parseInt(limit)
  };
};

/**
 * Masquer des informations sensibles
 */
exports.maskPhone = (phone) => {
  if (!phone || phone.length < 4) return phone;
  return phone.substring(0, 4) + '*'.repeat(phone.length - 8) + phone.substring(phone.length - 4);
};

exports.maskEmail = (email) => {
  if (!email) return email;
  const [name, domain] = email.split('@');
  if (name.length <= 2) return email;
  return name[0] + '*'.repeat(name.length - 2) + name[name.length - 1] + '@' + domain;
};

/**
 * Vérifier si une date est passée
 */
exports.isDatePast = (date) => {
  return new Date(date) < new Date();
};

/**
 * Calculer le temps écoulé
 */
exports.timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + ' ans';

  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + ' mois';

  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + ' jours';

  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + ' heures';

  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + ' minutes';

  return Math.floor(seconds) + ' secondes';
};

/**
 * Générer un nom de fichier unique
 */
exports.generateFileName = (originalName) => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const ext = originalName.split('.').pop();
  return `${timestamp}-${random}.${ext}`;
};

/**
 * Vérifier le type MIME d'un fichier
 */
exports.isValidFileType = (mimetype, allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']) => {
  return allowedTypes.includes(mimetype);
};

/**
 * Convertir bytes en format lisible
 */
exports.formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Échapper les caractères HTML
 */
exports.escapeHtml = (text) => {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
};

/**
 * Générer un mot de passe aléatoire
 */
exports.generatePassword = (length = 12) => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
};

/**
 * Vérifier la force d'un mot de passe
 */
exports.checkPasswordStrength = (password) => {
  let strength = 0;
  
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^a-zA-Z0-9]/.test(password)) strength++;

  if (strength <= 2) return 'weak';
  if (strength <= 4) return 'medium';
  return 'strong';
};

/**
 * Nettoyer un objet des valeurs null/undefined
 */
exports.cleanObject = (obj) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v != null)
  );
};

/**
 * Deep clone d'un objet
 */
exports.deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Grouper un tableau par clé
 */
exports.groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const group = item[key];
    if (!result[group]) {
      result[group] = [];
    }
    result[group].push(item);
    return result;
  }, {});
};

/**
 * Retarder l'exécution (promesse)
 */
exports.delay = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Retry une fonction avec backoff exponentiel
 */
exports.retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await exports.delay(baseDelay * Math.pow(2, i));
    }
  }
};