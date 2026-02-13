// services/history.service.js
const { sequelize, Booking, History } = require('../models');
const { Op } = require('sequelize');

/**
 * Service pour gérer l'archivage des réservations dans l'historique
 */
class HistoryService {
  /**
   * Archive les réservations terminées depuis plus de 24h
   */
  static async archiveOldBookings() {
    try {
      console.log('🕐 Début de l\'archivage des réservations anciennes...');
      
      // Date limite : il y a 24 heures
      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
      
      // Trouver les réservations à archiver
      const bookingsToArchive = await Booking.findAll({
        where: {
          [Op.or]: [
            { status: 'completed' },
            { status: 'cancelled' }
          ],
          [Op.or]: [
            { completed_at: { [Op.lt]: twentyFourHoursAgo } },
            { cancelled_at: { [Op.lt]: twentyFourHoursAgo } }
          ]
        },
        include: [
          {
            model: require('../models').Hairdresser,
            as: 'hairdresser',
            include: [{
              model: require('../models').User,
              as: 'user',
              attributes: ['id', 'full_name', 'profile_photo']
            }]
          },
          {
            model: require('../models').Hairstyle,
            as: 'hairstyle'
          }
        ]
      });

      console.log(`📊 ${bookingsToArchive.length} réservations à archiver`);

      if (bookingsToArchive.length === 0) {
        console.log('✅ Aucune réservation à archiver');
        return { archived: 0, message: 'Aucune réservation à archiver' };
      }

      // Archiver dans la table History
      const historyRecords = bookingsToArchive.map(booking => ({
        booking_id: booking.id,
        client_id: booking.client_id,
        hairdresser_id: booking.hairdresser_id,
        hairstyle_id: booking.hairstyle_id,
        client_name: booking.client_name,
        client_phone: booking.client_phone,
        booking_date: booking.scheduled_time ? new Date(booking.scheduled_time) : new Date(),
        booking_time: booking.scheduled_time ? new Date(booking.scheduled_time).toTimeString().split(' ')[0] : null,
        status: booking.status === 'completed' ? 'completed' : 
                booking.status === 'cancelled' ? 'cancelled' : 'no_show',
        final_price: booking.client_price || booking.service_fee,
        duration_minutes: booking.estimated_duration,
        notes: booking.cancellation_reason || null,
        archived_at: new Date()
      }));

      // Créer les enregistrements d'historique
      const createdHistories = await History.bulkCreate(historyRecords);
      
      // Supprimer les réservations archivées
      const archivedBookingIds = bookingsToArchive.map(b => b.id);
      await Booking.destroy({
        where: {
          id: { [Op.in]: archivedBookingIds }
        }
      });

      console.log(`✅ ${createdHistories.length} réservations archivées avec succès`);
      
      return {
        archived: createdHistories.length,
        message: `${createdHistories.length} réservations archivées avec succès`
      };

    } catch (error) {
      console.error('❌ Erreur lors de l\'archivage:', error);
      throw error;
    }
  }

  /**
   * Récupère l'historique d'un client
   */
  static async getClientHistory(clientId, options = {}) {
    const { limit = 50, offset = 0, status } = options;
    
    const whereClause = { client_id: clientId };
    if (status) {
      whereClause.status = status;
    }

    const histories = await History.findAll({
      where: whereClause,
      include: [
        {
          model: require('../models').Hairdresser,
          as: 'hairdresser',
          include: [{
            model: require('../models').User,
            as: 'user',
            attributes: ['id', 'full_name', 'profile_photo']
          }]
        },
        {
          model: require('../models').Hairstyle,
          as: 'hairstyle',
          attributes: ['id', 'name', 'description', 'photo', 'category']
        }
      ],
      order: [['archived_at', 'DESC']],
      limit,
      offset
    });

    return histories;
  }

  /**
   * Récupère l'historique d'un coiffeur
   */
  static async getHairdresserHistory(hairdresserId, options = {}) {
    const { limit = 50, offset = 0, status } = options;
    
    const whereClause = { hairdresser_id: hairdresserId };
    if (status) {
      whereClause.status = status;
    }

    const histories = await History.findAll({
      where: whereClause,
      include: [
        {
          model: require('../models').User,
          as: 'client',
          attributes: ['id', 'full_name', 'phone']
        },
        {
          model: require('../models').Hairstyle,
          as: 'hairstyle',
          attributes: ['id', 'name', 'description', 'photo', 'category']
        }
      ],
      order: [['archived_at', 'DESC']],
      limit,
      offset
    });

    return histories;
  }

  /**
   * Nettoie les anciens enregistrements d'historique (plus de 1 an)
   */
  static async cleanupOldHistories() {
    try {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      const deletedCount = await History.destroy({
        where: {
          archived_at: { [Op.lt]: oneYearAgo }
        }
      });

      console.log(`🗑️ ${deletedCount} enregistrements d'historique supprimés (plus d'1 an)`);
      
      return {
        deleted: deletedCount,
        message: `${deletedCount} enregistrements d'historique supprimés`
      };

    } catch (error) {
      console.error('❌ Erreur lors du nettoyage de l\'historique:', error);
      throw error;
    }
  }
}

module.exports = HistoryService;
