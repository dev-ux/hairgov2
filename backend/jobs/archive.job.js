// jobs/archive.job.js
const HistoryService = require('../services/history.service');

/**
 * Job d'archivage automatique des réservations
 * S'exécute toutes les heures pour archiver les réservations terminées depuis plus de 24h
 */
class ArchiveJob {
  static async run() {
    try {
      console.log('⏰ Démarrage du job d\'archivage automatique...');
      
      const result = await HistoryService.archiveOldBookings();
      
      console.log(`✅ Job d'archivage terminé: ${result.message}`);
      
      return result;
    } catch (error) {
      console.error('❌ Erreur dans le job d\'archivage:', error);
      throw error;
    }
  }

  /**
   * Démarre le cron job pour s'exécuter toutes les heures
   */
  static start() {
    // Exécuter immédiatement au démarrage
    this.run().catch(console.error);
    
    // Puis s'exécuter toutes les heures
    setInterval(() => {
      this.run().catch(console.error);
    }, 60 * 60 * 1000); // 1 heure en millisecondes
    
    console.log('🔄 Job d\'archivage automatique démarré (toutes les heures)');
  }

  /**
   * Démarre le cron job pour s'exécuter toutes les 6 heures (production)
   */
  static startProduction() {
    // Exécuter immédiatement au démarrage
    this.run().catch(console.error);
    
    // Puis s'exécuter toutes les 6 heures
    setInterval(() => {
      this.run().catch(console.error);
    }, 6 * 60 * 60 * 1000); // 6 heures en millisecondes
    
    console.log('🔄 Job d\'archivage automatique démarré (toutes les 6 heures)');
  }

  /**
   * Job de nettoyage des anciens enregistrements d'historique
   * S'exécute tous les jours pour supprimer les enregistrements de plus d'1 an
   */
  static async cleanupJob() {
    try {
      console.log('🧹 Démarrage du job de nettoyage de l\'historique...');
      
      const result = await HistoryService.cleanupOldHistories();
      
      console.log(`✅ Job de nettoyage terminé: ${result.message}`);
      
      return result;
    } catch (error) {
      console.error('❌ Erreur dans le job de nettoyage:', error);
      throw error;
    }
  }

  /**
   * Démarre le job de nettoyage quotidien
   */
  static startCleanupJob() {
    // Exécuter une fois par jour à 2h du matin
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(2, 0, 0, 0);
    
    const msUntilTomorrow = tomorrow - now;
    
    setTimeout(() => {
      this.cleanupJob().catch(console.error);
      
      // Puis s'exécuter tous les jours
      setInterval(() => {
        this.cleanupJob().catch(console.error);
      }, 24 * 60 * 60 * 1000); // 24 heures en millisecondes
      
    }, msUntilTomorrow);
    
    console.log('🧹 Job de nettoyage quotidien programmé (tous les jours à 2h)');
  }
}

module.exports = ArchiveJob;
