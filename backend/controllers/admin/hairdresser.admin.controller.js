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

/**
 * Activer/Désactiver un coiffeur
 */
exports.toggleHairdresserStatus = async (req, res) => {
  console.log('Début de toggleHairdresserStatus avec params:', req.params, 'et body:', req.body);
  const transaction = await db.sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { is_active } = req.body;
    console.log('ID du coiffeur:', id, 'Nouvel état:', is_active);

    if (typeof is_active !== 'boolean') {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Le statut doit être un booléen'
        }
      });
    }

    // Trouver le coiffeur avec son utilisateur associé
    console.log('Recherche du coiffeur avec ID:', id);
    const hairdresser = await db.Hairdresser.findByPk(id, {
      include: [{
        model: db.User,
        as: 'user',
        attributes: ['id', 'is_active', 'full_name']
      }],
      transaction
    });
    
    console.log('Coiffeur trouvé:', hairdresser ? 'Oui' : 'Non');
    if (hairdresser && hairdresser.user) {
      console.log('Utilisateur associé:', hairdresser.user.full_name, 'ID:', hairdresser.user.id, 'Statut actuel:', hairdresser.user.is_active);
    }

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

    // Mettre à jour le statut de l'utilisateur et du coiffeur
    console.log('Mise à jour du statut is_active à:', is_active);
    
    // Mettre à jour l'utilisateur
    const updatedUser = await hairdresser.user.update({ is_active }, { transaction });
    console.log('Résultat de la mise à jour utilisateur:', updatedUser ? 'Succès' : 'Échec');
    
    // Mettre à jour le statut d'enregistrement du coiffeur
    const newStatus = is_active ? 'approved' : 'rejected';
    const updatedHairdresser = await hairdresser.update({ 
      registration_status: newStatus,
      is_available: is_active
    }, { transaction });
    console.log('Résultat de la mise à jour du coiffeur:', updatedHairdresser ? 'Succès' : 'Échec');
    
    // Rafraîchir les instances pour s'assurer que les données sont à jour
    await Promise.all([
      hairdresser.user.reload({ transaction }),
      hairdresser.reload({ transaction })
    ]);
    
    console.log('Statut utilisateur après rechargement:', hairdresser.user.is_active);
    console.log('Statut coiffeur après rechargement:', hairdresser.registration_status);

    await transaction.commit();

    res.status(200).json({
      success: true,
      data: {
        id: hairdresser.id,
        is_active,
        message: `Coiffeur ${is_active ? 'activé' : 'désactivé'} avec succès`
      }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Erreur lors de la mise à jour du statut du coiffeur:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Erreur lors de la mise à jour du statut du coiffeur',
        details: error.message
      }
    });
  }
};
