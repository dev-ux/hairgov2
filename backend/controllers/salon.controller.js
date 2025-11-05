const db = require('../models');
const { Op } = require('sequelize');
const { validationResult } = require('express-validator');

// Récupérer les modèles
const Notification = db.notification;
const User = db.users;  // Assurez-vous que c'est le bon nom de modèle (peut être 'user' ou 'users')

/**
 * Obtenir la liste de tous les salons
 */
exports.getAllSalons = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {
      is_validated: true // Ne retourner que les salons validés
    };

    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { address: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows: salons } = await db.Salon.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: db.Hairdresser,
          as: 'hairdresser',
          include: [
            {
              model: db.User,
              as: 'user',
              attributes: ['id', 'full_name', 'profile_photo']
            },
            {
              model: db.Rating,
              as: 'ratings',
              attributes: ['rating']
            }
          ]
        }
      ],
      limit: parseInt(limit),
      offset: offset,
      order: [['created_at', 'DESC']]
    });

    // Calculer la note moyenne pour chaque salon
    const formattedSalons = salons.map(salon => {
      const ratings = salon.hairdresser?.ratings || [];
      const avgRating = ratings.length > 0 
        ? ratings.reduce((acc, curr) => acc + curr.rating, 0) / ratings.length 
        : 0;
      
      const hairdresser = salon.hairdresser?.user || {};

      return {
        id: salon.id,
        name: salon.name,
        address: salon.address,
        latitude: salon.latitude,
        longitude: salon.longitude,
        description: salon.description,
        phone: salon.phone,
        email: salon.email,
        photos: salon.photos,
        status: salon.status,
        average_rating: parseFloat(avgRating.toFixed(1)),
        hairdresser: {
          id: hairdresser.id,
          full_name: hairdresser.full_name,
          profile_photo: hairdresser.profile_photo
        },
        created_at: salon.created_at,
        updated_at: salon.updated_at
      };
    });

    res.status(200).json({
      success: true,
      data: formattedSalons,
      pagination: {
        total: count,
        page: parseInt(page),
        total_pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching salons:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Erreur lors de la récupération des salons',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    });
  }
};


/**
 * Créer un nouveau salon
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
      photos = []
    } = req.body;

    // Vérifier si le coiffeur existe et est approuvé
    const hairdresser = await db.Hairdresser.findOne({
      where: { 
        id: req.body.hairdresser_id || req.user.id,  // Prend hairdresser_id du body ou user.id du token
        registration_status: 'approved'
      },
      transaction
    });

    if (!hairdresser) {
      await transaction.rollback();
      return res.status(403).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Coiffeur non trouvé ou non approuvé. Assurez-vous que le hairdresser_id est valide et que le compte est approuvé.'
        }
      });
    }
    
    const hairdresserId = hairdresser.id;  // Utiliser l'ID du hairdresser trouvé

    // Vérifier si le coiffeur a déjà un salon
    // const existingSalon = await db.Salon.findOne({
    //   where: { hairdresser_id: req.user.id },
    //   transaction
    // });

    // if (existingSalon) {
    //   await transaction.rollback();
    //   return res.status(400).json({
    //     success: false,
    //     error: {
    //       code: 'SALON_EXISTS',
    //       message: 'Vous avez déjà un salon enregistré'
    //     }
    //   });
    // }

    // Créer le salon
    const salon = await db.Salon.create({
      hairdresser_id: hairdresserId,  // Utiliser l'ID du hairdresser validé
      name,
      address,
      latitude,
      longitude,
      description,
      phone,
      email,
      business_hours,
      photos,
      is_validated: false // Nécessite une validation par l'admin
    }, { transaction });

    // Créer une notification pour tous les utilisateurs
    try {
      console.log('Début de la création des notifications...');
      
      // Récupérer tous les utilisateurs actifs sauf celui qui a créé le salon
      console.log('Recherche des utilisateurs actifs...');
      const users = await db.User.findAll({
        attributes: ['id'],
        where: {
          is_active: true,
          id: { [Op.ne]: req.user.id }
        },
        raw: true,
        transaction
      });

      console.log(`Nombre d'utilisateurs trouvés: ${users.length}`);
      
      if (users.length > 0) {
        const notifications = users.map(user => ({
          user_id: user.id,
          title: 'Nouveau salon ajouté',
          body: `Un nouveau salon "${name}" a été ajouté à proximité de chez vous.`,  // Utiliser body au lieu de message
          type: 'new_salon',
          metadata: JSON.stringify({
            salon_id: salon.id,
            salon_name: name,
            address: address
          }),
          is_read: false,
          created_at: new Date(),
          updated_at: new Date()
        }));

        console.log(`Prêt à créer ${notifications.length} notifications`);
        
        // Créer les notifications en une seule requête
        if (notifications.length > 0) {
          console.log('Tentative de création de', notifications.length, 'notifications');
          
          // Essayer différentes variantes du nom du modèle
          const notificationModel = db.notifications || db.Notification || db.notification;
          if (!notificationModel) {
            throw new Error('Modèle de notification non trouvé dans db');
          }
          
          try {
            const createdNotifications = await notificationModel.bulkCreate(notifications, { 
              transaction,
              returning: true
            });
            console.log('Notifications créées avec succès:', createdNotifications);
          } catch (bulkCreateError) {
            console.error('Erreur lors du bulkCreate:', bulkCreateError);
            throw bulkCreateError;
          }
        } else {
          console.log('Aucune notification à créer');
        }
      } else {
        console.log('Aucun utilisateur trouvé pour envoyer des notifications');
      }
    } catch (notificationError) {
      console.error('Erreur lors de la création des notifications:', notificationError);
      console.error('Détails de l\'erreur:', {
        message: notificationError.message,
        stack: notificationError.stack,
        name: notificationError.name,
        // Ajouter des informations supplémentaires pour le débogage
        modelNames: Object.keys(db),
        notificationModel: db.notifications ? 'Existe' : 'Non défini',
        notificationModelKeys: db.notifications ? Object.keys(db.notifications) : []
      });
      // Annuler la transaction en cas d'erreur
      await transaction.rollback();
      return res.status(500).json({
        success: false,
        error: {
          code: 'NOTIFICATION_ERROR',
          message: 'Erreur lors de la création des notifications',
          details: notificationError.message
        }
      });
    }

    // Mettre à jour le statut has_salon du coiffeur
    await hairdresser.update({ has_salon: true }, { transaction });

    await transaction.commit();
    
    res.status(201).json({
      success: true,
      message: 'Salon créé avec succès. En attente de validation par un administrateur.',
      data: salon
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Create salon error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SALON_CREATION_ERROR',
        message: 'Erreur lors de la création du salon',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    });
  }
};

/**
 * Obtenir les détails d'un salon
 */
exports.getSalon = async (req, res) => {
  try {
    const { id } = req.params;

    const salon = await db.Salon.findByPk(id, {
      attributes: [
        'id', 'name', 'address',
        'latitude', 'longitude', 'is_validated',
        'created_at', 'updated_at', 'photos'
      ]
    });
    
    // Récupérer les informations du coiffeur séparément
    let hairdresser = null;
    if (salon && salon.hairdresser_id) {
      hairdresser = await db.Hairdresser.findByPk(salon.hairdresser_id, {
        attributes: ['id', 'first_name', 'last_name', 'email', 'phone', 'profile_photo']
      });
    }
    
    // Fusionner les données
    const salonData = salon.get({ plain: true });
    if (hairdresser) {
      salonData.hairdresser = hairdresser.get({ plain: true });
    }

    if (!salon) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Salon non trouvé'
        }
      });
    }

    // Formater la réponse
    const response = {
      success: true,
      data: {
        ...salon.get({ plain: true }),
        // S'assurer que photos est toujours un tableau
        photos: Array.isArray(salon.photos) ? salon.photos : []
      }
    };

    res.json(response);

  } catch (error) {
    console.error('Erreur lors de la récupération du salon:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SALON_FETCH_ERROR',
        message: 'Erreur lors de la récupération du salon',
        // En développement, on peut inclure plus de détails
        ...(process.env.NODE_ENV !== 'production' && {
          details: error.message
        })
      }
    });
  }
};

/**
 * Mettre à jour un salon
 */
exports.updateSalon = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Vérifier si le salon existe et appartient au coiffeur
    const salon = await db.Salon.findOne({
      where: { 
        id,
        hairdresser_id: req.user.id
      },
      transaction
    });

    if (!salon) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Salon non trouvé ou accès non autorisé'
        }
      });
    }

    // Mettre à jour le salon
    await salon.update(updateData, { transaction });
    
    // Si le salon est mis à jour après rejet, réinitialiser le statut de validation
    if (updateData.is_validated === undefined && salon.is_validated === false) {
      await salon.update({ is_validated: null }, { transaction });
    }

    await transaction.commit();
    
    res.json({
      success: true,
      message: 'Salon mis à jour avec succès',
      data: salon
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Update salon error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SALON_UPDATE_ERROR',
        message: 'Erreur lors de la mise à jour du salon',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    });
  }
};

/**
 * Supprimer un salon
 */
exports.deleteSalon = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const { id } = req.params;

    // Vérifier si le salon existe et appartient au coiffeur
    const salon = await db.Salon.findOne({
      where: { 
        id,
        hairdresser_id: req.user.id
      },
      transaction
    });

    if (!salon) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Salon non trouvé ou accès non autorisé'
        }
      });
    }

    // Mettre à jour le statut has_salon du coiffeur
    await db.Hairdresser.update(
      { has_salon: false },
      { 
        where: { id: req.user.id },
        transaction 
      }
    );

    // Supprimer le salon
    await salon.destroy({ transaction });
    await transaction.commit();
    
    res.json({
      success: true,
      message: 'Salon supprimé avec succès'
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Delete salon error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SALON_DELETE_ERROR',
        message: 'Erreur lors de la suppression du salon'
      }
    });
  }
};

/**
 * Rechercher des salons à proximité
 */
exports.searchSalons = async (req, res) => {
  try {
    const { 
      latitude, 
      longitude, 
      radius = 10, // en kilomètres
      page = 1, 
      limit = 10,
      search,
      min_rating
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {
      is_validated: true
    };

    // Filtre par recherche textuelle
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { address: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Filtre par note minimale
    if (min_rating) {
      whereClause['$hairdresser.average_rating$'] = {
        [Op.gte]: parseFloat(min_rating)
      };
    }

    // Requête de base
    const queryOptions = {
      where: whereClause,
      include: [
        {
          model: db.Hairdresser,
          as: 'hairdresser',
          attributes: ['id', 'user_id', 'average_rating', 'total_jobs'],
          where: {
            is_available: true,
            registration_status: 'approved'
          },
          include: [
            {
              model: db.User,
              as: 'user',
              attributes: ['full_name']
            }
          ],
          required: true
        }
      ],
      order: [],
      limit: parseInt(limit),
      offset: parseInt(offset),
      subQuery: false
    };

    // Si des coordonnées sont fournies, trier par distance
    if (latitude && longitude) {
      const point = {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
        crs: { type: 'name', properties: { name: 'EPSG:4326' } }
      };

      // Ajouter la condition de distance
      queryOptions.where.location = db.Sequelize.fn(
        'ST_DWithin',
        db.Sequelize.col('location'),
        db.Sequelize.fn('ST_SetSRID', db.Sequelize.fn('ST_MakePoint', point.coordinates[0], point.coordinates[1]), 4326),
        radius / 111.12 // Conversion approximative des degrés en kilomètres
      );

      // Trier par distance
      queryOptions.order.push([
        db.Sequelize.fn(
          'ST_Distance',
          db.Sequelize.col('location'),
          db.Sequelize.fn('ST_SetSRID', db.Sequelize.fn('ST_MakePoint', point.coordinates[0], point.coordinates[1]), 4326)
        )
      ]);
    } else {
      // Trier par note moyenne par défaut
      queryOptions.order.push([
        { model: db.Hairdresser, as: 'hairdresser' },
        'average_rating',
        'DESC'
      ]);
    }

    const { count, rows: salons } = await db.Salon.findAndCountAll(queryOptions);

    res.json({
      success: true,
      data: salons,
      pagination: {
        total: count,
        page: parseInt(page),
        total_pages: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    console.error('Search salons error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SALON_SEARCH_ERROR',
        message: 'Erreur lors de la recherche des salons',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    });
  }
};

/**
 * Valider un salon (admin)
 */
exports.validateSalon = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { is_validated, rejection_reason } = req.body;

    // Vérifier si l'utilisateur est un administrateur
    if (req.user.user_type !== 'admin') {
      await transaction.rollback();
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Accès refusé. Réservé aux administrateurs.'
        }
      });
    }

    // Vérifier si le salon existe
    const salon = await db.Salon.findByPk(id, {
      include: [
        {
          model: db.Hairdresser,
          as: 'hairdresser',
          transaction
        }
      ],
      transaction
    });

    if (!salon) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Salon non trouvé'
        }
      });
    }

    // Mettre à jour le statut de validation
    await salon.update({ 
      is_validated,
      rejection_reason: !is_validated ? rejection_reason : null
    }, { transaction });

    // Si le salon est validé, mettre à jour le statut du coiffeur
    if (is_validated && salon.hairdresser) {
      await salon.hairdresser.update({ has_salon: true }, { transaction });
    }

    await transaction.commit();
    
    // TODO: Envoyer une notification au coiffeur

    res.json({
      success: true,
      message: `Salon ${is_validated ? 'validé' : 'rejeté'} avec succès`,
      data: salon
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Validate salon error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SALON_VALIDATION_ERROR',
        message: `Erreur lors de la ${req.body.is_validated ? 'validation' : 'rejet'} du salon`,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    });
  }
};
