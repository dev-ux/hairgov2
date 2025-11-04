const db = require('../../models');
const { Op } = require('sequelize');

/**
 * Valider un coiffeur
 */
exports.validateHairdresser = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const { id } = req.params; // ID du coiffeur
    const { status = 'approved', rejectionReason = null } = req.body;

    // Vérifier si le coiffeur existe
    const hairdresser = await db.Hairdresser.findByPk(id, { 
      include: [{
        model: db.User,
        as: 'user',
        attributes: ['id', 'email', 'full_name', 'phone']
      }],
      transaction 
    });

    if (!hairdresser) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Coiffeur non trouvé'
        }
      });
    }

    // Mettre à jour le statut du coiffeur
    await hairdresser.update({
      registration_status: status,
      rejection_reason: status === 'rejected' ? rejectionReason : null,
      is_available: status === 'approved'
    }, { transaction });

    // Si le coiffeur est approuvé, on peut activer son compte utilisateur
    if (status === 'approved') {
      await hairdresser.user.update({ is_active: true }, { transaction });
    }

    await transaction.commit();
    
    // Préparer la réponse
    const response = {
      id: hairdresser.id,
      user_id: hairdresser.user_id,
      email: hairdresser.user.email,
      full_name: hairdresser.user.full_name,
      phone: hairdresser.user.phone,
      registration_status: status,
      is_available: status === 'approved',
      updated_at: new Date()
    };

    if (status === 'rejected') {
      response.rejection_reason = rejectionReason;
    }

    res.status(200).json({
      success: true,
      data: response
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Erreur lors de la validation du coiffeur:', error);
    
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Une erreur est survenue lors de la validation du coiffeur',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    });
  }
};

/**
 * Obtenir la liste des coiffeurs avec filtrage
 */
exports.getHairdressers = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    const whereClause = {};
    
    // Filtre par statut
    if (status) {
      whereClause.registration_status = status;
    }
    
    // Filtre de recherche
    if (search) {
      whereClause['$user.full_name$'] = { [Op.iLike]: `%${search}%` };
    }
    
    const { count, rows } = await db.Hairdresser.findAndCountAll({
      where: whereClause,
      include: [{
        model: db.User,
        as: 'user',
        attributes: ['id', 'email', 'full_name', 'phone', 'profile_photo', 'is_active'],
        where: search ? { full_name: { [Op.iLike]: `%${search}%` } } : {}
      }],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      distinct: true
    });
    
    res.status(200).json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit)
      }
    });
    
  } catch (error) {
    console.error('Erreur lors de la récupération des coiffeurs:', error);
    
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Une erreur est survenue lors de la récupération des coiffeurs',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    });
  }
};
