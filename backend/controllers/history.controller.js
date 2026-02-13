// controllers/history.controller.js
const HistoryService = require('../services/history.service');

/**
 * Obtenir l'historique du client connecté
 */
exports.getClientHistory = async (req, res) => {
  try {
    const clientId = req.userId;
    const { limit = 50, offset = 0, status } = req.query;

    console.log('🔍 getClientHistory - Client ID:', clientId);

    const histories = await HistoryService.getClientHistory(clientId, {
      limit: parseInt(limit),
      offset: parseInt(offset),
      status
    });

    console.log('📊 getClientHistory - Historiques trouvés:', histories.length);

    res.status(200).json({
      success: true,
      data: { histories }
    });

  } catch (error) {
    console.error('❌ Get client history error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Erreur lors de la récupération de l\'historique',
        details: error.message
      }
    });
  }
};

/**
 * Obtenir l'historique d'un coiffeur
 */
exports.getHairdresserHistory = async (req, res) => {
  try {
    const hairdresserId = req.userId;
    const { limit = 50, offset = 0, status } = req.query;

    console.log('🔍 getHairdresserHistory - Hairdresser ID:', hairdresserId);

    const histories = await HistoryService.getHairdresserHistory(hairdresserId, {
      limit: parseInt(limit),
      offset: parseInt(offset),
      status
    });

    console.log('📊 getHairdresserHistory - Historiques trouvés:', histories.length);

    res.status(200).json({
      success: true,
      data: { histories }
    });

  } catch (error) {
    console.error('❌ Get hairdresser history error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Erreur lors de la récupération de l\'historique',
        details: error.message
      }
    });
  }
};

/**
 * Déclencher manuellement l'archivage des réservations anciennes (admin)
 */
exports.archiveOldBookings = async (req, res) => {
  try {
    console.log('🔧 Déclenchement manuel de l\'archivage');

    const result = await HistoryService.archiveOldBookings();

    res.status(200).json({
      success: true,
      data: result,
      message: 'Archivage terminé avec succès'
    });

  } catch (error) {
    console.error('❌ Archive bookings error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'ARCHIVE_ERROR',
        message: 'Erreur lors de l\'archivage des réservations',
        details: error.message
      }
    });
  }
};

/**
 * Nettoyer les anciens enregistrements d'historique (admin)
 */
exports.cleanupOldHistories = async (req, res) => {
  try {
    console.log('🧹 Déclenchement manuel du nettoyage');

    const result = await HistoryService.cleanupOldHistories();

    res.status(200).json({
      success: true,
      data: result,
      message: 'Nettoyage terminé avec succès'
    });

  } catch (error) {
    console.error('❌ Cleanup histories error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CLEANUP_ERROR',
        message: 'Erreur lors du nettoyage de l\'historique',
        details: error.message
      }
    });
  }
};
