const db = require('../../models');
const { Op } = require('sequelize');

/**
 * Créer un nouveau salon en tant qu'administrateur
 */
exports.createSalon = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const { 
      name, 
      address, 
      latitude, 
      longitude, 
      description, 
      phone, 
      email, 
      business_hours,
      hairdresser_id,
      photos = []
    } = req.body;

    // Vérifier si le profil coiffeur existe
    const hairdresser = await db.Hairdresser.findByPk(hairdresser_id, { 
      include: [{
        model: db.User,
        as: 'user',
        attributes: ['id', 'user_type', 'email', 'full_name'],
        required: true
      }],
      transaction 
    });
    
    if (!hairdresser) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        error: {
          code: 'HAIRDRESSER_NOT_FOUND',
          message: 'Profil coiffeur non trouvé'
        }
      });
    }
    
    // Vérifier si l'utilisateur associé est bien un coiffeur
    if (hairdresser.user.user_type !== 'hairdresser') {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_USER_TYPE',
          message: "L'utilisateur associé n'est pas un coiffeur"
        }
      });
    }

    // Un coiffeur peut avoir plusieurs salons, donc on ne vérifie pas s'il en a déjà

    // Créer le salon avec uniquement les champs qui existent dans la table
    const salonData = {
      name,
      address,
      latitude,
      longitude,
      hairdresser_id: hairdresser.id,
      is_validated: true
      // Note: Les champs description, phone et email ne sont pas inclus car ils n'existent pas dans la table
    };

    // Ajouter les heures d'ouverture si fournies
    if (business_hours && Object.keys(business_hours).length > 0) {
      salonData.business_hours = business_hours;
    }

    const salon = await db.Salon.create(salonData, { transaction });

    // Mettre à jour le statut du coiffeur
    await hairdresser.update({ has_salon: true }, { transaction });

    // Gérer les photos si fournies
    if (req.files && req.files.photos) {
      const photoFiles = Array.isArray(req.files.photos) ? req.files.photos : [req.files.photos];
      const photoUrls = photoFiles.map(file => `/uploads/photos/${file.filename}`);
      await salon.update({ photos: photoUrls }, { transaction });
    }

    await transaction.commit();
    
    res.status(201).json({
      success: true,
      data: {
        id: salon.id,
        name: salon.name,
        address: salon.address,
        is_validated: salon.is_validated
      }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Erreur lors de la création du salon (admin):', error);
    
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Une erreur est survenue lors de la création du salon',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    });
  }
};

/**
 * Valider ou invalider un salon
 */
exports.validateSalon = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { is_validated } = req.body;

    // Vérifier si le salon existe
    const salon = await db.Salon.findByPk(id, {
      include: [{
        model: db.Hairdresser,
        as: 'hairdresser',
        include: [{
          model: db.User,
          as: 'user',
          attributes: ['id', 'full_name', 'email']
        }]
      }],
      transaction
    });
    
    if (!salon) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        error: {
          code: 'SALON_NOT_FOUND',
          message: 'Salon non trouvé'
        }
      });
    }

    // Mettre à jour le statut de validation du salon
    await salon.update({ is_validated }, { transaction });

    await transaction.commit();
    
    res.status(200).json({
      success: true,
      data: {
        id: salon.id,
        name: salon.name,
        is_validated: salon.is_validated,
        hairdresser: salon.hairdresser
      },
      message: is_validated ? 'Salon activé avec succès' : 'Salon désactivé avec succès'
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Erreur lors de la validation du salon:', error);
    
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Une erreur est survenue lors de la mise à jour du statut du salon',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    });
  }
};
