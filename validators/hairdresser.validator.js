const Joi = require('joi');

/**
 * Validation mise à jour disponibilité
 */
exports.validateAvailability = (req, res, next) => {
  const schema = Joi.object({
    is_available: Joi.boolean().required()
      .messages({
        'boolean.base': 'La disponibilité doit être un booléen',
        'any.required': 'Le statut de disponibilité est requis'
      }),
    current_location: Joi.object({
      latitude: Joi.number().min(-90).max(90).required(),
      longitude: Joi.number().min(-180).max(180).required()
    }).optional()
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Données de disponibilité invalides',
        details: error.details.map(d => ({
          field: d.path[0],
          message: d.message
        }))
      }
    });
  }

  next();
};

/**
 * Validation demande de recharge
 */
exports.validateRecharge = (req, res, next) => {
  const schema = Joi.object({
    amount: Joi.number().min(1000).required()
      .messages({
        'number.base': 'Le montant doit être un nombre',
        'number.min': 'Le montant minimum est de 1000 FCFA',
        'any.required': 'Le montant est requis'
      }),
    payment_method: Joi.string().valid('mobile_money', 'credit_card').required()
      .messages({
        'any.only': 'Méthode de paiement invalide',
        'string.empty': 'La méthode de paiement est requise'
      }),
    phone: Joi.when('payment_method', {
      is: 'mobile_money',
      then: Joi.string().pattern(/^\+[1-9]\d{1,14}$/).required()
        .messages({
          'string.pattern.base': 'Format de téléphone invalide',
          'string.empty': 'Le numéro de téléphone est requis pour le paiement mobile'
        }),
      otherwise: Joi.string().optional()
    })
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Données de recharge invalides',
        details: error.details.map(d => ({
          field: d.path[0],
          message: d.message
        }))
      }
    });
  }

  next();
};

/**
 * Middleware global de gestion des erreurs
 */
exports.errorHandler = (err, req, res, next) => {
  console.error('Erreur:', err);

  // Erreurs de validation Joi
  if (err.isJoi) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Erreur de validation des données',
        details: err.details.map(d => ({
          field: d.path[0],
          message: d.message
        }))
      }
    });
  }

  // Erreurs de la base de données
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'DATABASE_VALIDATION_ERROR',
        message: 'Erreur de validation des données',
        details: err.errors.map(e => ({
          field: e.path,
          message: e.message
        }))
      }
    });
  }

  // Erreur 404
  if (err.status === 404) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Ressource non trouvée'
      }
    });
  }

  // Erreur d'authentification
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: {
        code: 'AUTHENTICATION_ERROR',
        message: 'Authentification requise ou session expirée'
      }
    });
  }

  // Erreur par défaut (500)
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Une erreur est survenue sur le serveur'
    }
  });
};
