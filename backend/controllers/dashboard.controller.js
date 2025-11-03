const { User, Hairdresser, Booking, Salon } = require('../models');

/**
 * Récupère les statistiques pour le tableau de bord administrateur
 * @route GET /api/v1/admin/dashboard/stats
 * @access Privé (Admin)
 */
exports.getDashboardStats = async (req, res) => {
  try {
    // Compter le nombre de coiffeurs
    const hairdressersCount = await User.count({
      where: { user_type: 'hairdresser' }
    });

    // Compter le nombre de salons
    const salonsCount = await Salon.count();

    // Compter le nombre de réservations
    const bookingsCount = await Booking.count();

    // Calculer les revenus totaux à partir des réservations complétées
    const bookings = await Booking.findAll({
      attributes: ['service_fee'],
      where: { status: 'completed' }
    });
    
    const revenue = bookings.reduce((total, booking) => {
      return total + (parseFloat(booking.service_fee) || 0);
    }, 0);

    res.status(200).json({
      success: true,
      data: {
        hairdressersCount,
        salonsCount,
        bookingsCount,
        revenue: Math.round(revenue * 100) / 100 // Arrondir à 2 décimales
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des statistiques du tableau de bord'
    });
  }
};
