const express = require('express');
const router = express.Router();
const { authenticate, isAdmin } = require('../middleware/auth.middleware');
const { getUsersList } = require('../controllers/admin.controller');
const { getDashboardStats } = require('../controllers/dashboard.controller');
const { createSalon, validateSalon } = require('../controllers/admin/salon.admin.controller');
const { 
  validateHairdresser, 
  getHairdressers: getHairdressersAdmin,
  toggleHairdresserStatus 
} = require('../controllers/admin/hairdresser.admin.controller');
const { uploadFields, handleUploadErrors } = require('../middleware/upload.middleware');
const db = require('../models');
const { Op } = require('sequelize');

// Routes protégées par authentification et autorisation admin
router.use(authenticate);
router.use(isAdmin);

/**
 * @route   GET /admin/users
 * @desc    Récupère la liste des utilisateurs (Admin uniquement)
 * @access  Private/Admin
 */
router.get('/users', getUsersList);

/**
 * @route   GET /admin/hairdressers
 * @desc    Récupère la liste des coiffeurs avec filtrage (Admin uniquement)
 * @query   {string} [status] - Filtrer par statut (pending, approved, rejected)
 * @query   {string} [search] - Recherche par nom
 * @query   {number} [page=1] - Numéro de page
 * @query   {number} [limit=10] - Nombre d'éléments par page
 * @access  Private/Admin
 */
router.get('/hairdressers', getHairdressersAdmin);

/**
 * @route   PATCH /admin/hairdressers/:id/validate
 * @route   PUT /admin/hairdressers/:id/approve
 * @desc    Valider ou rejeter un coiffeur (Admin uniquement)
 * @body    {string} [status=approved] - Statut à définir (approved, rejected)
 * @body    {string} [rejectionReason] - Raison du rejet (si status=rejected)
 * @access  Private/Admin
 */
router.patch('/hairdressers/:id/validate', validateHairdresser);
router.put('/hairdressers/:id/approve', validateHairdresser);

/**
 * @route   PATCH /admin/hairdressers/:id/status
 * @desc    Activer ou désactiver un coiffeur (Admin uniquement)
 * @body    {boolean} is_active - Statut d'activation (true/false)
 * @access  Private/Admin
 */
router.patch('/hairdressers/:id/status', toggleHairdresserStatus);

/**
 * @route   GET /api/v1/admin/dashboard/stats
 * @desc    Récupérer les statistiques du tableau de bord (Admin)
 * @access  Privé (Admin)
 */
router.get('/dashboard/stats', getDashboardStats);

/**
 * @route   GET /api/v1/admin/salons
 * @desc    Récupérer la liste des salons (Admin uniquement)
 * @query   {string} [status] - Filtrer par statut (validated, pending)
 * @query   {string} [search] - Recherche par nom ou adresse
 * @query   {number} [page=1] - Numéro de page
 * @query   {number} [limit=10] - Nombre d'éléments par page
 * @access  Private/Admin
 */
router.get('/salons', async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    // Construire la requête de base
    let query = {
      include: [
        {
          model: db.Hairdresser,
          as: 'hairdresser',
          include: [
            {
              model: db.User,
              as: 'user',
              attributes: ['id', 'full_name', 'email', 'phone', 'profile_photo']
            }
          ]
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    };

    // Filtrer par statut si spécifié
    if (status) {
      query.where = {
        ...query.where,
        is_validated: status === 'validated'
      };
    }

    // Recherche par nom ou adresse
    if (search) {
      query.where = {
        ...query.where,
        [Op.or]: [
          { name: { [Op.iLike]: `%${search}%` } },
          { address: { [Op.iLike]: `%${search}%` } }
        ]
      };
    }

    // Exécuter la requête
    const { count, rows: salons } = await db.Salon.findAndCountAll(query);

    // Calculer le nombre total de pages
    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      data: salons,
      pagination: {
        total: count,
        page: parseInt(page),
        totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching salons:', error);
    res.status(500).json({
      success: false,
      error: 'Une erreur est survenue lors de la récupération des salons',
      details: error.message
    });
  }
});

/**
 * @route   POST /api/v1/admin/salons
 * @desc    Créer un nouveau salon en tant qu'administrateur
 * @access  Privé (Admin)
 */
router.post(
  '/salons',
  uploadFields,
  createSalon
);

/**
 * @route   PATCH /api/v1/admin/salons/:id/validate
 * @desc    Valider ou invalider un salon (Admin uniquement)
 * @body    {boolean} is_validated - Statut de validation (true/false)
 * @access  Private/Admin
 */
router.patch('/salons/:id/validate', validateSalon);

module.exports = router;