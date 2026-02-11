const express = require('express');
const router = express.Router();
const { authenticate, isAdmin } = require('../middleware/auth.middleware');
const { getUsersList } = require('../controllers/admin.controller');
const { getDashboardStats } = require('../controllers/dashboard.controller');
const { createSalon, updateSalon, validateSalon } = require('../controllers/admin/salon.admin.controller');
const { 
  validateHairdresser, 
  getHairdressers: getHairdressersAdmin,
  toggleHairdresserStatus,
  getHairdresserById 
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
 * @route   GET /admin/hairdressers/:id
 * @desc    Récupérer un coiffeur spécifique (Admin uniquement)
 * @access  Private/Admin
 */
router.get('/hairdressers/:id', getHairdresserById);

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
 * @route   GET /admin/salons/:id
 * @desc    Récupérer les détails d'un salon spécifique (Admin uniquement)
 * @access  Private/Admin
 */
router.get('/salons/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const salon = await db.Salon.findOne({
      where: { id },
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
      ]
    });

    if (!salon) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SALON_NOT_FOUND',
          message: 'Salon non trouvé'
        }
      });
    }

    res.json({
      success: true,
      data: salon
    });
  } catch (error) {
    console.error('Error fetching salon:', error);
    res.status(500).json({
      success: false,
      error: 'Une erreur est survenue lors de la récupération du salon',
      details: error.message
    });
  }
});

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
 * @route   PUT /api/v1/admin/salons/:id
 * @desc    Mettre à jour un salon (Admin uniquement)
 * @access  Private/Admin
 */
router.put(
  '/salons/:id',
  uploadFields,
  updateSalon
);

/**
 * @route   DELETE /api/v1/admin/salons/:id
 * @desc    Supprimer un salon (Admin uniquement)
 * @access  Private/Admin
 */
router.delete('/salons/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Vérifier si le salon existe
    const salon = await db.Salon.findByPk(id);
    
    if (!salon) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SALON_NOT_FOUND',
          message: 'Salon non trouvé'
        }
      });
    }

    // Supprimer le salon
    await salon.destroy();
    
    res.status(200).json({
      success: true,
      message: 'Salon supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du salon:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Une erreur est survenue lors de la suppression du salon',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    });
  }
});

/**
 * @route   PATCH /api/v1/admin/salons/:id/validate
 * @desc    Valider ou invalider un salon (Admin uniquement)
 * @body    {boolean} is_validated - Statut de validation (true/false)
 * @access  Private/Admin
 */
router.patch('/salons/:id/validate', validateSalon);

module.exports = router;