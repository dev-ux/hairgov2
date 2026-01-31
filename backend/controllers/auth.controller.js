// controllers/auth.controller.js
const db = require('../models');
const { User } = db;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const uploadService = require('../services/upload.service');
const smsService = require('../services/sms.service');

// Accès aux modèles
const Hairdresser = require('../models').Hairdresser;
const Hairstyle = require('../models').Hairstyle;

/**
 * Inscription d'un nouveau client
 */
exports.registerClient = async (req, res) => {
  try {
    const { full_name, phone, email, password } = req.body;

    // Vérifier si le téléphone existe déjà
    const existingUser = await User.findOne({ where: { phone } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'PHONE_EXISTS',
          message: 'Ce numéro de téléphone est déjà utilisé'
        }
      });
    }

    // Vérifier si l'email existe (si fourni)
    if (email) {
      const existingEmail = await User.findOne({ where: { email } });
      if (existingEmail) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'EMAIL_EXISTS',
            message: 'Cet email est déjà utilisé'
          }
        });
      }
    }

    // Créer l'utilisateur
    const user = await User.create({
      full_name,
      phone,
      email,
      password_hash: password,
      user_type: 'client',
      is_verified: false
    });

    // Envoyer OTP (code de vérification)
    const otp = await smsService.sendOTP(phone);

    // Générer JWT
    const token = jwt.sign(
      { userId: user.id, userType: 'client' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
    );

    res.status(201).json({
      success: true,
      message: 'Compte client créé avec succès. Veuillez vérifier votre téléphone.',
      data: {
        user: {
          id: user.id,
          full_name: user.full_name,
          phone: user.phone,
          email: user.email,
          user_type: user.user_type,
          is_verified: user.is_verified
        },
        token,
        refreshToken,
        otp_sent: true
      }
    });

  } catch (error) {
    console.error('Register client error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'REGISTRATION_ERROR',
        message: 'Erreur lors de l\'inscription',
        details: error.message
      }
    });
  }
};

/**
 * Demande d'inscription coiffeur
 */
exports.registerHairdresser = async (req, res) => {
  try {
    const {
      full_name,
      phone,
      email,
      password,
      profession,
      residential_address,
      date_of_birth = '',
      id_card_number = '',
      has_salon = false,
      education_level = '',
      hairstyle_ids = [],
      is_active = true
    } = req.body;

    // Vérifier si c'est une création par un administrateur
    const isAdminCreation = req.query.is_admin_creation === 'true';
    const autoApprove = req.query.auto_approve === 'true';

    // Vérifier si le téléphone existe déjà
    const existingUser = await User.findOne({ where: { phone } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'PHONE_EXISTS',
          message: 'Ce numéro de téléphone est déjà utilisé'
        }
      });
    }

    // Upload des photos
    let profile_photo = null;
    let id_card_photo = null;

    if (req.files) {
      if (req.files.profile_photo) {
        profile_photo = await uploadService.uploadFile(req.files.profile_photo[0], 'profiles');
      }
      if (req.files.id_card_photo) {
        id_card_photo = await uploadService.uploadFile(req.files.id_card_photo[0], 'id_cards');
      }
    }

    // Créer l'utilisateur
    const user = await User.create({
      full_name,
      phone,
      email,
      password_hash: password,
      user_type: 'hairdresser',
      profile_photo,
      is_verified: isAdminCreation, // Vérification automatique si création par admin
      is_active: isAdminCreation ? is_active : false // Activer le compte si création par admin
    });

    // Convertir la date de naissance du format DD/MM/YYYY vers YYYY-MM-DD si nécessaire
    let formattedDateOfBirth = date_of_birth;
    if (date_of_birth && date_of_birth.includes('/')) {
      const parts = date_of_birth.split('/');
      if (parts.length === 3) {
        formattedDateOfBirth = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
    }

    // Créer le profil coiffeur
    const hairdresser = await Hairdresser.create({
      user_id: user.id,
      profession,
      residential_address,
      date_of_birth: formattedDateOfBirth && formattedDateOfBirth.trim() !== '' ? formattedDateOfBirth : null,
      id_card_number: id_card_number && id_card_number.trim() !== '' ? id_card_number : null,
      id_card_photo,
      has_salon: has_salon === 'true' || has_salon === true,
      education_level: education_level && education_level.trim() !== '' ? education_level : null,
      registration_status: isAdminCreation && autoApprove ? 'approved' : 'pending',
      is_available: isAdminCreation && autoApprove // Rendre disponible si approuvé par admin
    });

    // Associer les coiffures
    if (hairstyle_ids && Array.isArray(hairstyle_ids)) {
      const hairstyles = await Hairstyle.findAll({
        where: { id: { [Op.in]: hairstyle_ids } }
      });
      await hairdresser.addHairstyles(hairstyles);
    }

    // Envoyer OTP (code de vérification) si pas création par admin
    let otp = null;
    let token = null;
    let refreshToken = null;

    if (!isAdminCreation) {
      otp = await smsService.sendOTP(phone);

      // Générer JWT
      token = jwt.sign(
        { userId: user.id, userType: 'hairdresser' },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      refreshToken = jwt.sign(
        { userId: user.id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
      );
    }

    const response = {
      success: true,
      message: isAdminCreation 
        ? 'Le coiffeur a été créé avec succès.' 
        : 'Demande d\'inscription envoyée. Un administrateur va vérifier votre profil.',
      data: {
        hairdresser_id: hairdresser.id,
        user_id: user.id,
        registration_status: hairdresser.registration_status,
        is_active: user.is_active,
        ...(token && { token }),
        ...(refreshToken && { refreshToken }),
        ...(otp && { otp_sent: true })
      }
    };

    res.status(201).json(response);

  } catch (error) {
    console.error('Register hairdresser error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'REGISTRATION_ERROR',
        message: 'Erreur lors de l\'inscription',
        details: error.message
      }
    });
  }
};

/**
 * Connexion utilisateur
 */
exports.login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    // Trouver l'utilisateur
    const user = await User.findOne({ 
      where: { phone },
      include: [{
        model: Hairdresser,
        as: 'hairdresserProfile',
        required: false
      }]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Téléphone ou mot de passe incorrect'
        }
      });
    }

    // Vérifier le mot de passe
    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Téléphone ou mot de passe incorrect'
        }
      });
    }

    // Vérifier si le compte est actif
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCOUNT_DEACTIVATED',
          message: 'Votre compte a été désactivé'
        }
      });
    }

    // Pour les coiffeurs, vérifier le statut d'inscription
    if (user.user_type === 'hairdresser' && user.hairdresserProfile) {
      if (user.hairdresserProfile.registration_status === 'pending') {
        return res.status(403).json({
          success: false,
          error: {
            code: 'REGISTRATION_PENDING',
            message: 'Votre inscription est en attente de validation'
          }
        });
      }
      if (user.hairdresserProfile.registration_status === 'rejected') {
        return res.status(403).json({
          success: false,
          error: {
            code: 'REGISTRATION_REJECTED',
            message: 'Votre inscription a été rejetée'
          }
        });
      }
    }

    // Générer JWT
    const token = jwt.sign(
      { userId: user.id, userType: user.user_type },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
    );

    res.status(200).json({
      success: true,
      message: 'Connexion réussie',
      data: {
        user: {
          id: user.id,
          full_name: user.full_name,
          phone: user.phone,
          email: user.email,
          user_type: user.user_type,
          profile_photo: user.profile_photo,
          is_verified: user.is_verified
        },
        token,
        refreshToken
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'LOGIN_ERROR',
        message: 'Erreur lors de la connexion',
        details: error.message
      }
    });
  }
};

/**
 * Connexion invité (sans compte)
 */
exports.guestLogin = async (req, res) => {
  try {
    const { phone, full_name } = req.body;

    // Créer une session invité (24h)
    const sessionToken = jwt.sign(
      { 
        phone, 
        full_name, 
        type: 'guest' 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      success: true,
      message: 'Session invité créée',
      data: {
        session_token: sessionToken,
        phone,
        full_name,
        expires_in: 86400 // 24h en secondes
      }
    });

  } catch (error) {
    console.error('Guest login error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GUEST_LOGIN_ERROR',
        message: 'Erreur lors de la création de la session',
        details: error.message
      }
    });
  }
};

/**
 * Rafraîchir le token
 */
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_REFRESH_TOKEN',
          message: 'Refresh token manquant'
        }
      });
    }

    // Vérifier le refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Générer nouveau token
    const newToken = jwt.sign(
      { userId: decoded.userId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(200).json({
      success: true,
      data: {
        token: newToken
      }
    });

  } catch (error) {
    res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_REFRESH_TOKEN',
        message: 'Refresh token invalide ou expiré'
      }
    });
  }
};

/**
 * Déconnexion
 */
exports.logout = async (req, res) => {
  try {
    // Supprimer le FCM token
    await User.update(
      { fcm_token: null },
      { where: { id: req.userId } }
    );

    res.status(200).json({
      success: true,
      message: 'Déconnexion réussie'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'LOGOUT_ERROR',
        message: 'Erreur lors de la déconnexion'
      }
    });
  }
};

/**
 * Vérifier le numéro de téléphone avec OTP
 */
exports.verifyPhone = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    // Vérifier l'OTP
    const isValid = await smsService.verifyOTP(phone, otp);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_OTP',
          message: 'Code de vérification incorrect'
        }
      });
    }

    // Marquer l'utilisateur comme vérifié
    await User.update(
      { is_verified: true },
      { where: { phone } }
    );

    res.status(200).json({
      success: true,
      message: 'Numéro de téléphone vérifié avec succès'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'VERIFICATION_ERROR',
        message: 'Erreur lors de la vérification'
      }
    });
  }
};

/**
 * Renvoyer l'OTP
 */
exports.resendOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    const otp = await smsService.sendOTP(phone);

    res.status(200).json({
      success: true,
      message: 'Code de vérification renvoyé',
      data: {
        otp_sent: true
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'RESEND_OTP_ERROR',
        message: 'Erreur lors de l\'envoi du code'
      }
    });
  }
};

/**
 * Obtenir le profil utilisateur connecté
 */
exports.getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId, {
      include: [{
        model: Hairdresser,
        as: 'hairdresserProfile',
        required: false,
        include: [{
          model: Hairstyle,
          as: 'hairstyles',
          through: { attributes: [] }
        }]
      }],
      attributes: { exclude: ['password_hash'] }
    });

    res.status(200).json({
      success: true,
      data: { user }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_PROFILE_ERROR',
        message: 'Erreur lors de la récupération du profil'
      }
    });
  }
};

/**
 * Mettre à jour le token FCM
 */
exports.updateFCMToken = async (req, res) => {
  try {
    const { fcm_token } = req.body;

    await User.update(
      { fcm_token },
      { where: { id: req.userId } }
    );

    res.status(200).json({
      success: true,
      message: 'Token FCM mis à jour'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_FCM_ERROR',
        message: 'Erreur lors de la mise à jour du token'
      }
    });
  }
};

/**
 * Mot de passe oublié
 */
exports.forgotPassword = async (req, res) => {
  try {
    const { phone } = req.body;

    const user = await User.findOne({ where: { phone } });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'Aucun compte associé à ce numéro'
        }
      });
    }

    // Envoyer OTP pour réinitialisation
    const otp = await smsService.sendOTP(phone);

    res.status(200).json({
      success: true,
      message: 'Code de réinitialisation envoyé par SMS'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'FORGOT_PASSWORD_ERROR',
        message: 'Erreur lors de la demande de réinitialisation'
      }
    });
  }
};

/**
 * Réinitialiser le mot de passe
 */
exports.resetPassword = async (req, res) => {
  try {
    const { phone, otp, new_password } = req.body;

    // Vérifier l'OTP
    const isValid = await smsService.verifyOTP(phone, otp);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_OTP',
          message: 'Code de vérification incorrect'
        }
      });
    }

    // Mettre à jour le mot de passe
    const hashedPassword = await bcrypt.hash(new_password, 10);
    await User.update(
      { password_hash: hashedPassword },
      { where: { phone } }
    );

    res.status(200).json({
      success: true,
      message: 'Mot de passe réinitialisé avec succès'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'RESET_PASSWORD_ERROR',
        message: 'Erreur lors de la réinitialisation'
      }
    });
  }
};/**
 * Inscription d'un administrateur
 * Cette méthode est utilisée pour créer un compte administrateur
 */
exports.registerAdmin = async (req, res) => {
  try {
    const { full_name, email, password, phone } = req.body;

    // Vérifier si l'email existe déjà
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { email },
          { phone: phone || '' }
        ]
      }
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'USER_EXISTS',
          message: 'Un utilisateur avec cet email ou ce numéro de téléphone existe déjà'
        }
      });
    }

    // Créer l'administrateur
    const admin = await User.create({
      full_name,
      email,
      phone: phone || null,
      password_hash: password,
      user_type: 'admin',
      is_verified: true,
      is_active: true
    });

    // Générer le token JWT
    const token = jwt.sign(
      { userId: admin.id, userType: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    const refreshToken = jwt.sign(
      { userId: admin.id },
      process.env.JWT_REFRESH_SECRET || 'your-refresh-token-secret',
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Compte administrateur créé avec succès',
      data: {
        user: {
          id: admin.id,
          full_name: admin.full_name,
          email: admin.email,
          user_type: admin.user_type,
          is_verified: admin.is_verified,
          is_active: admin.is_active
        },
        token,
        refreshToken
      }
    });

  } catch (error) {
    console.error('Register admin error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'REGISTRATION_ERROR',
        message: 'Erreur lors de la création du compte administrateur',
        details: error.message
      }
    });
  }
};

/**
 * Mettre à jour le profil utilisateur
 */
exports.updateProfile = async (req, res) => {
  try {
    const { User } = require('../models');
    const userId = req.userId;

    // Trouver l'utilisateur
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'Utilisateur non trouvé'
        }
      });
    }

    // Gérer l'upload de la photo de profil
    if (req.file) {
      const profilePhoto = req.file;
      
      // Validation du fichier
      if (!profilePhoto.mimetype.startsWith('image/')) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_FILE_TYPE',
            message: 'Le fichier doit être une image'
          }
        });
      }

      // Taille maximale 5MB (déjà gérée par multer, mais vérification supplémentaire)
      if (profilePhoto.size > 5 * 1024 * 1024) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'FILE_TOO_LARGE',
            message: 'L\'image ne doit pas dépasser 5MB'
          }
        });
      }

      // Utiliser l'URL du fichier uploadé
      const imageUrl = `/uploads/profiles/${profilePhoto.filename}`;
      
      user.profile_photo = imageUrl;
    }

    // Mettre à jour les autres champs si fournis
    const { full_name, email, phone } = req.body;
    
    if (full_name) user.full_name = full_name;
    if (email) user.email = email;
    if (phone) user.phone = phone;

    user.updated_at = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profil mis à jour avec succès',
      data: {
        user: {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          phone: user.phone,
          profile_photo: user.profile_photo,
          user_type: user.user_type,
          is_verified: user.is_verified,
          is_active: user.is_active
        }
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_PROFILE_ERROR',
        message: 'Erreur lors de la mise à jour du profil',
        details: error.message
      }
    });
  }
};