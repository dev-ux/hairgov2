const express = require('express');
const router = express.Router();
const { authenticate, isAdmin } = require("../middleware/auth.middleware");
const controller = require("../controllers/notification.controller");

// Middleware pour les en-têtes CORS
router.use(function(req, res, next) {
  res.header(
    "Access-Control-Allow-Headers",
    "x-access-token, Origin, Content-Type, Accept"
  );
  next();
});

// Route publique - Récupérer toutes les notifications (pour développement)
// TODO: À remplacer par une route authentifiée en production
router.get(
  "/",
  controller.findAllPublic
);

// Route protégée - Créer une notification (pour les administrateurs)
router.post(
  "/notifications",
  [authenticate, isAdmin],
  controller.create
);

// Route protégée - Récupérer les notifications
// Pour les utilisateurs normaux: leurs propres notifications
// Pour les admins: possibilité de voir toutes les notifications avec ?all=true
router.get(
  "/notifications",
  [authenticate],
  controller.findAll
);

// Route protégée - Récupérer toutes les notifications (admin uniquement)
router.get(
  "/admin/notifications",
  [authenticate, isAdmin],
  (req, res) => {
    // On passe all=true dans la query pour indiquer qu'on veut toutes les notifications
    req.query.all = 'true';
    return controller.findAll(req, res);
  }
);

// Route publique - Marquer une notification comme lue (pour développement)
// TODO: À remplacer par une route authentifiée en production
router.put(
  "/:id/read",
  controller.markAsReadPublic
);

// Route protégée - Marquer une notification comme lue
router.put(
  "/notifications/:id/read",
  [authenticate],
  controller.markAsRead
);

// Route publique - Marquer toutes les notifications comme lues (pour développement)
// TODO: À remplacer par une route authentifiée en production
router.put(
  "/read-all",
  controller.markAllAsReadPublic
);

// Route protégée - Marquer toutes les notifications comme lues
router.put(
  "/notifications/read-all",
  [authenticate],
  controller.markAllAsRead
);

// Route protégée - Supprimer une notification
router.delete(
  "/notifications/:id",
  [authenticate],
  controller.delete
);

// Route protégée - Supprimer toutes les notifications de l'utilisateur
router.delete(
  "/notifications",
  [authenticate],
  controller.deleteAll
);

module.exports = router;
