const { authJwt } = require("../middleware");
const controller = require("../controllers/notification.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  // Route protégée - Créer une notification (pour les administrateurs)
  app.post(
    "/api/notifications",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.create
  );

  // Route protégée - Récupérer toutes les notifications de l'utilisateur connecté
  app.get(
    "/api/notifications",
    [authJwt.verifyToken],
    controller.findAll
  );

  // Route protégée - Marquer une notification comme lue
  app.put(
    "/api/notifications/:id/read",
    [authJwt.verifyToken],
    controller.markAsRead
  );

  // Route protégée - Marquer toutes les notifications comme lues
  app.put(
    "/api/notifications/read-all",
    [authJwt.verifyToken],
    controller.markAllAsRead
  );

  // Route protégée - Supprimer une notification
  app.delete(
    "/api/notifications/:id",
    [authJwt.verifyToken],
    controller.delete
  );

  // Route protégée - Supprimer toutes les notifications de l'utilisateur
  app.delete(
    "/api/notifications",
    [authJwt.verifyToken],
    controller.deleteAll
  );
};
