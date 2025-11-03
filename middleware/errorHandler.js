/**
 * Middleware de gestion des erreurs
 * @param {Error} err - L'erreur
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction next
 */
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  // Définir le statut par défaut à 500 (Erreur serveur interne)
  const statusCode = err.statusCode || 500;
  
  // Définir le message d'erreur
  const message = err.message || 'Une erreur est survenue sur le serveur';
  
  // Envoyer la réponse d'erreur
  res.status(statusCode).json({
    success: false,
    status: statusCode,
    message: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;