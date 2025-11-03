const Joi = require('joi');

/**
 * Validation inscription client
 */
const validateRegister = (req, res, next) => {
  const schema = Joi.object({
    full_name: Joi.string().min(2).max(255).required()
      .messages({
        'string.empty': 'Le nom complet est requis',
        'string.min': 'Le nom doit contenir au moins 2 caractères'
      }),
    phone: Joi.string().pattern(/^\+[1-9]\d{1,14}$/).required()
      .messages({
        'string.pattern.base': 'Format de téléphone invalide (format: +225XXXXXXXXX)',
        'string.empty': 'Le numéro de téléphone est requis'
      }),
    email: Joi.string().email().optional().allow(null, '')
      .messages({
        'string.email': 'Format d\'email invalide'
      }),
    password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required()
      .messages({
        'string.empty': 'Le mot de passe est requis',
        'string.min': 'Le mot de passe doit contenir au moins 8 caractères',
        'string.pattern.base': 'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'
      })
  });

  const { error } = schema.validate(req.body, { abortEarly: false });
  
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path[0],
      message: detail.message
    }));
    
    return res.status(400).json({
      success: false,
      errors
    });
  }

  next();
};

/**
 * Validation connexion
 */
const validateLogin = (req, res, next) => {
  const schema = Joi.object({
    phone: Joi.string().required()
      .messages({
        'string.empty': 'Le numéro de téléphone est requis'
      }),
    password: Joi.string().required()
      .messages({
        'string.empty': 'Le mot de passe est requis'
      })
  });

  const { error } = schema.validate(req.body, { abortEarly: false });
  
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path[0],
      message: detail.message
    }));
    
    return res.status(400).json({
      success: false,
      errors
    });
  }

  next();
};

/**
 * Validation inscription administrateur
 */
const validateAdminRegister = (req, res, next) => {
  const schema = Joi.object({
    full_name: Joi.string().min(2).max(255).required()
      .messages({
        'string.empty': 'Le nom complet est requis',
        'string.min': 'Le nom doit contenir au moins 2 caractères'
      }),
    email: Joi.string().email().required()
      .messages({
        'string.email': 'Format d\'email invalide',
        'string.empty': 'L\'email est requis'
      }),
    password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required()
      .messages({
        'string.empty': 'Le mot de passe est requis',
        'string.min': 'Le mot de passe doit contenir au moins 8 caractères',
        'string.pattern.base': 'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'
      }),
    phone: Joi.string().pattern(/^\+[1-9]\d{1,14}$/).optional().allow(null, '')
      .messages({
        'string.pattern.base': 'Format de téléphone invalide (format: +225XXXXXXXXX)'
      })
  });

  const { error } = schema.validate(req.body, { abortEarly: false });
  
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path[0],
      message: detail.message
    }));
    
    return res.status(400).json({
      success: false,
      errors
    });
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateAdminRegister
};
