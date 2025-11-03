// services/notification.service.js
const { Op } = require('sequelize');
const { User, Notification } = require('../models');

let admin = null;
try {
  // Essayer d'importer Firebase Admin s'il est configuré
  const firebaseAdmin = require('firebase-admin');
  const serviceAccount = require('../config/firebase-service-account.json');
  
  if (!firebaseAdmin.apps.length) {
    admin = firebaseAdmin.initializeApp({
      credential: firebaseAdmin.credential.cert(serviceAccount)
    });
  } else {
    admin = firebaseAdmin;
  }
  console.log('Firebase Admin initialisé avec succès');
} catch (error) {
  console.warn('Firebase Admin non configuré. Les notifications push seront désactivées.');
  console.warn('Pour activer les notifications, configurez Firebase Admin avec un fichier firebase-service-account.json valide.');
}

/**
 * Envoyer une notification push
 */
const sendPushNotification = async (userId, title, body, data = {}) => {
  try {
    if (!admin) {
      console.log('Notification non envoyée: Firebase Admin non configuré');
      return null;
    }
    
    const user = await User.findByPk(userId);
    if (!user || !user.fcm_token) return null;

    const message = {
      notification: { title, body },
      data: {
        ...data,
        click_action: 'FLUTTER_NOTIFICATION_CLICK',
        sound: 'default'
      },
      token: user.fcm_token
    };

    const response = await admin.messaging().send(message);
    
    // Enregistrer la notification dans la base de données
    await Notification.create({
      user_id: userId,
      title,
      message: body,
      type: data.type || 'general',
      data: JSON.stringify(data),
      is_read: false
    });

    return response;
  } catch (error) {
    console.error('Error sending push notification:', error);
    throw error;
  }
};

/**
 * Envoyer une notification à plusieurs utilisateurs
 */
const sendBulkPushNotification = async (userIds, title, body, data = {}) => {
  try {
    const users = await User.findAll({
      where: {
        id: userIds,
        fcm_token: { [Op.ne]: null }
      }
    });

    if (users.length === 0) return [];

    const messages = users.map(user => ({
      notification: { title, body },
      data: {
        ...data,
        click_action: 'FLUTTER_NOTIFICATION_CLICK',
        sound: 'default'
      },
      token: user.fcm_token
    }));

    const responses = await Promise.all(
      messages.map(message => 
        admin.messaging().send(message).catch(error => ({
          success: false,
          userId: userIds[messages.indexOf(message)],
          error: error.message
        }))
      )
    );

    // Enregistrer les notifications dans la base de données
    const notifications = users.map(user => ({
      user_id: user.id,
      title,
      message: body,
      type: data.type || 'general',
      data: JSON.stringify(data),
      is_read: false,
      created_at: new Date(),
      updated_at: new Date()
    }));

    await Notification.bulkCreate(notifications);

    return responses;
  } catch (error) {
    console.error('Error sending bulk push notifications:', error);
    throw error;
  }
};

/**
 * Marquer une notification comme lue
 */
const markAsRead = async (notificationId, userId) => {
  try {
    const notification = await Notification.findOne({
      where: { id: notificationId, user_id: userId }
    });

    if (!notification) {
      throw new Error('Notification non trouvée');
    }

    notification.is_read = true;
    await notification.save();

    return notification;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

/**
 * Récupérer les notifications d'un utilisateur
 */
const getUserNotifications = async (userId, page = 1, limit = 20) => {
  try {
    const offset = (page - 1) * limit;
    
    const { count, rows } = await Notification.findAndCountAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
      limit,
      offset
    });

    return {
      notifications: rows,
      pagination: {
        total: count,
        page,
        totalPages: Math.ceil(count / limit)
      }
    };
  } catch (error) {
    console.error('Error fetching user notifications:', error);
    throw error;
  }
};

module.exports = {
  sendPushNotification,
  sendBulkPushNotification,
  markAsRead,
  getUserNotifications
};
