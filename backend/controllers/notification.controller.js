const db = require('../models');
const { Notification, User } = db;
const Op = db.Sequelize.Op;

// Créer et sauvegarder une nouvelle notification
exports.create = async (req, res) => {
  // Valider la requête
  if (!req.body.user_id || !req.body.title || !req.body.message) {
    return res.status(400).send({
      success: false,
      message: "Le contenu ne peut pas être vide!"
    });
  }

  // Créer une notification
  const notification = {
    user_id: req.body.user_id,
    title: req.body.title,
    body: req.body.body || req.body.message, // Support pour l'ancien champ 'message'
    type: req.body.type || 'other',
    is_read: req.body.is_read || false,
    data: req.body.data || req.body.metadata || null, // Support pour l'ancien champ 'metadata'
    sent_at: new Date()
  };

  try {
    // Sauvegarder la notification dans la base de données
    const data = await Notification.create(notification);
    res.send({
      success: true,
      data: data,
      message: "Notification créée avec succès!"
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: err.message || "Une erreur s'est produite lors de la création de la notification."
    });
  }
};

// Récupérer les notifications
// Si admin: peut voir toutes les notifications
// Si utilisateur normal: ne voit que ses propres notifications
exports.findAll = async (req, res) => {
  const { is_read, type, limit = 20, offset = 0, all = 'false' } = req.query;
  
  // Par défaut, on filtre par l'utilisateur connecté
  const condition = {};
  
  // Si pas de paramètre 'all' ou si 'all' est 'false', on filtre par l'utilisateur connecté
  if (all !== 'true') {
    condition.user_id = req.userId; // L'ID de l'utilisateur est défini par le middleware d'authentification
  }
  
  if (is_read !== undefined) {
    condition.is_read = is_read === 'true';
  }
  
  if (type) {
    condition.type = type;
  }

  try {
    const notifications = await Notification.findAndCountAll({
      where: condition,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['sent_at', 'DESC']],
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'full_name', 'email']
      }]
    });

    const { count, rows } = notifications;

    res.send({
      success: true,
      data: rows,
      total: count,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: err.message || "Une erreur s'est produite lors de la récupération des notifications."
    });
  }
};

// Marquer une notification comme lue
exports.markAsRead = async (req, res) => {
  const id = req.params.id;
  const user_id = req.userId; // Supposons que l'ID de l'utilisateur est dans le token JWT

  try {
    const [updated] = await Notification.update(
      { is_read: true },
      { 
        where: { 
          id: id,
          user_id: user_id // S'assurer que l'utilisateur ne peut marquer que ses propres notifications comme lues
        }
      }
    );

    if (updated) {
      res.send({
        success: true,
        message: "La notification a été marquée comme lue."
      });
    } else {
      res.status(404).send({
        success: false,
        message: `Impossible de trouver la notification avec l'id=${id}.`
      });
    }
  } catch (err) {
    res.status(500).send({
      success: false,
      message: `Erreur lors du marquage de la notification avec l'id=${id}`
    });
  }
};

// Marquer toutes les notifications comme lues
exports.markAllAsRead = async (req, res) => {
  const user_id = req.userId; // Supposons que l'ID de l'utilisateur est dans le token JWT

  try {
    const updated = await Notification.update(
      { is_read: true },
      { 
        where: { 
          user_id: user_id,
          is_read: false
        }
      }
    );

    res.send({
      success: true,
      message: `Toutes les notifications ont été marquées comme lues.`
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: "Une erreur s'est produite lors du marquage des notifications comme lues."
    });
  }
};

// Supprimer une notification
exports.delete = async (req, res) => {
  const id = req.params.id;
  const user_id = req.userId; // Supposons que l'ID de l'utilisateur est dans le token JWT

  try {
    const deleted = await Notification.destroy({
      where: { 
        id: id,
        user_id: user_id // S'assurer que l'utilisateur ne peut supprimer que ses propres notifications
      }
    });

    if (deleted) {
      res.send({
        success: true,
        message: "La notification a été supprimée avec succès!"
      });
    } else {
      res.status(404).send({
        success: false,
        message: `Impossible de trouver la notification avec l'id=${id}.`
      });
    }
  } catch (err) {
    res.status(500).send({
      success: false,
      message: `Impossible de supprimer la notification avec l'id=${id}`
    });
  }
};

// Supprimer toutes les notifications d'un utilisateur
exports.deleteAll = async (req, res) => {
  const user_id = req.userId; // Supposons que l'ID de l'utilisateur est dans le token JWT
  
  try {
    const deleted = await Notification.destroy({
      where: { user_id: user_id },
      truncate: false
    });

    res.send({
      success: true,
      message: `${deleted} notifications ont été supprimées avec succès!`
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: err.message || "Une erreur s'est produite lors de la suppression des notifications."
    });
  }
};
