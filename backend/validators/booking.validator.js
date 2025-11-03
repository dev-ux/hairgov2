const Joi = require('joi');

/**
 * Validation création réservation
 */
exports.validateBooking = (req, res, next) => {
  const schema = Joi.object({
    client_name: Joi.string().min(2).max(255).required()
      .messages({
        'string.empty': 'Le nom du client est requis',
        'string.min': 'Le nom doit contenir au moins 2 caractères'
      }),
    client_phone: Joi.string().pattern(/^\+[1-9]\d{1,14}$/).required()
      .messages({
        'string.pattern.base': 'Format de téléphone invalide',
        'string.empty': 'Le numéro de téléphone est requis'
      }),
    hairstyle_id: Joi.string().uuid().required()
      .messages({
        'string.empty': 'La coiffure est requise',
        'string.guid': 'ID de coiffure invalide'
      }),
    service_type: Joi.string().valid('home', 'salon').required()
      .messages({
        'any.only': 'Type de service invalide (home ou salon)',
        'string.empty': 'Le type de service est requis'
      }),
    location_address: Joi.string().when('service_type', {
      is: 'home',
      then: Joi.string().required(),
      otherwise: Joi.string().optional()
    })
    .messages({
      'string.empty': 'L\'adresse est requise pour les services à domicile'
    }),
    latitude: Joi.number().when('service_type', {
      is: 'home',
      then: Joi.number().min(-90).max(90).required(),
      otherwise: Joi.number().optional()
    })
    .messages({
      'number.base': 'Latitude invalide',
      'number.min': 'Latitude invalide',
      'number.max': 'Latitude invalide',
      'any.required': 'La latitude est requise pour les services à domicile'
    }),
    longitude: Joi.number().when('service_type', {
      is: 'home',
      then: Joi.number().min(-180).max(180).required(),
      otherwise: Joi.number().optional()
    })
    .messages({
      'number.base': 'Longitude invalide',
      'number.min': 'Longitude invalide',
      'number.max': 'Longitude invalide',
      'any.required': 'La longitude est requise pour les services à domicile'
    }),
    scheduled_time: Joi.date().min('now').required()
      .messages({
        'date.base': 'Date et heure invalides',
        'date.min': 'La date doit être dans le futur',
        'any.required': 'La date et l\'heure sont requises'
      })
  });

  const { error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Données de réservation invalides',
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
 * Validation évaluation
 */
exports.validateRating = (req, res, next) => {
  const schema = Joi.object({
    booking_id: Joi.string().uuid().required()
      .messages({
        'string.empty': 'La réservation est requise',
        'string.guid': 'ID de réservation invalide'
      }),
    rating: Joi.number().min(1).max(5).required()
      .messages({
        'number.base': 'La note doit être un nombre',
        'number.min': 'La note doit être comprise entre 1 et 5',
        'number.max': 'La note doit être comprise entre 1 et 5',
        'any.required': 'La note est requise'
      }),
    comment: Joi.string().optional().allow('')
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Données d\'évaluation invalides',
        details: error.details.map(d => ({
          field: d.path[0],
          message: d.message
        }))
      }
    });
  }

  next();
};