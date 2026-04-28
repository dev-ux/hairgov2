// middleware/auth.middleware.js
const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * Middleware d'authentification JWT
 */
const authenticate = async (req, res, next) => {
  try {
    console.log('🔍 Auth middleware - Request URL:', req.url);
    console.log('🔍 Auth middleware - Auth header:', req.headers.authorization ? 'Present' : 'Missing');
    
    // Récupérer le token du header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('🔍 Auth middleware - No Bearer token found');
      return res.status(401).json({
        success: false,
        error: {
          code: 'NO_TOKEN',
          message: 'Token d\'authentification manquant'
        }
      });
    }

    const token = authHeader.substring(7);
    console.log('🔍 Auth middleware - Token extracted:', token.substring(0, 20) + '...');

    // Vérifier et décoder le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('🔍 Auth middleware - Token decoded, userId:', decoded.userId);

    // Récupérer l'utilisateur
    const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ['password_hash'] }
    });

    console.log('🔍 Auth middleware - User found:', user ? 'Yes' : 'No');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'Utilisateur introuvable'
        }
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCOUNT_DEACTIVATED',
          message: 'Compte désactivé'
        }
      });
    }

    // Ajouter l'utilisateur à la requête
    req.user = user;
    req.userId = user.id;
    req.userType = user.user_type;

    console.log('🔍 Auth middleware - Success, userId:', req.userId, 'userType:', req.userType);
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Token invalide'
        }
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'TOKEN_EXPIRED',
          message: 'Token expiré'
        }
      });
    }

    return res.status(500).json({
      success: false,
      error: {
        code: 'AUTH_ERROR',
        message: 'Erreur d\'authentification'
      }
    });
  }
};

/**
 * Middleware pour vérifier que l'utilisateur est un client
 */
const isClient = (req, res, next) => {
  if (req.userType !== 'client') {
    return res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Accès réservé aux clients'
      }
    });
  }
  next();
};

/**
 * Middleware pour vérifier que l'utilisateur est un administrateur
 */
const isAdmin = (req, res, next) => {
  if (req.userType !== 'admin') {
    return res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Accès réservé aux administrateurs'
      }
    });
  }
  next();
};

/**
 * Middleware pour vérifier que l'utilisateur est un coiffeur
 */
const isHairdresser = (req, res, next) => {
  if (req.userType !== 'hairdresser') {
    return res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Accès réservé aux coiffeurs'
      }
    });
  }
  next();
};

/**
 * Middleware optionnel d'authentification
 * Continue même si pas de token
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ['password_hash'] }
    });

    if (user && user.is_active) {
      req.user = user;
      req.userId = user.id;
      req.userType = user.user_type;
    }

    next();
  } catch (error) {
    // En cas d'erreur, on continue sans utilisateur authentifié
    next();
  }
};

// Alias pour la compatibilité avec le code existant
const verifyToken = (req, res, next) => authenticate(req, res, next);

module.exports = {
  authenticate,
  verifyToken,
  isClient,
  isHairdresser,
  isAdmin,
  optionalAuth
};