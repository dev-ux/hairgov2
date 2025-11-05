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

// Route protégée - Créer une notification (pour les administrateurs)
router.post(
  "/notifications",
  [authenticate, isAdmin],
  controller.create
);

// Route protégée - Récupérer toutes les notifications de l'utilisateur connecté
router.get(
  "/notifications",
  [authenticate],
  controller.findAll
);

// Route protégée - Marquer une notification comme lue
router.put(
  "/notifications/:id/read",
  [authenticate],
  controller.markAsRead
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
