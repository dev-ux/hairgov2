/**
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