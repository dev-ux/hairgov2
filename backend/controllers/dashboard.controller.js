const { User, Booking, Salon } = require('../models');

exports.getDashboardStats = async (_req, res) => {
  try {
    const hairdressersCount = await User.count({ where: { user_type: 'hairdresser' } });
    const salonsCount       = await Salon.count();
    const bookingsCount     = await Booking.count();

    const completedBookings = await Booking.findAll({
      attributes: ['service_fee'],
      where: { status: 'completed' },
    });
    const revenue = completedBookings.reduce(
      (sum, b) => sum + (parseFloat(b.service_fee) || 0), 0
    );

    res.status(200).json({
      success: true,
      data: { hairdressersCount, salonsCount, bookingsCount, revenue: Math.round(revenue * 100) / 100 },
    });
  } catch (error) {
    console.error('getDashboardStats error:', error);
    res.status(500).json({ success: false, error: 'Erreur statistiques tableau de bord' });
  }
};

exports.getRecentActivity = async (_req, res) => {
  try {
    const [recentBookings, recentUsers, recentSalons] = await Promise.all([
      Booking.findAll({
        attributes: ['id', 'client_name', 'status', 'service_type', 'service_fee', 'created_at', 'updated_at'],
        order: [['updated_at', 'DESC']],
        limit: 10,
      }),
      User.findAll({
        attributes: ['id', 'full_name', 'user_type', 'created_at'],
        where: { user_type: ['hairdresser', 'client'] },
        order: [['created_at', 'DESC']],
        limit: 8,
      }),
      Salon.findAll({
        attributes: ['id', 'name', 'created_at'],
        order: [['created_at', 'DESC']],
        limit: 5,
      }),
    ]);

    const STATUS_LABELS = {
      pending:     { label: 'Réservation en attente',   color: '#F59E0B', icon: 'clock' },
      accepted:    { label: 'Réservation confirmée',    color: '#3B82F6', icon: 'check-circle' },
      rejected:    { label: 'Réservation refusée',      color: '#EF4444', icon: 'x-circle' },
      in_progress: { label: 'Prestation en cours',      color: '#6C63FF', icon: 'activity' },
      completed:   { label: 'Prestation terminée',      color: '#22C55E', icon: 'check-circle-2' },
      cancelled:   { label: 'Réservation annulée',      color: '#9CA3AF', icon: 'ban' },
    };

    const events = [];

    recentBookings.forEach(b => {
      const cfg = STATUS_LABELS[b.status] || STATUS_LABELS.pending;
      events.push({
        id:          `booking-${b.id}`,
        type:        'booking',
        icon:        cfg.icon,
        color:       cfg.color,
        title:       cfg.label,
        description: `${b.client_name} · ${b.service_type === 'home' ? 'À domicile' : 'En salon'} · ${Math.round(parseFloat(b.service_fee) || 0).toLocaleString('fr-FR')} FCFA`,
        timestamp:   b.updated_at,
      });
    });

    recentUsers.forEach(u => {
      const isHD = u.user_type === 'hairdresser';
      events.push({
        id:          `user-${u.id}`,
        type:        'user',
        icon:        isHD ? 'scissors' : 'user-plus',
        color:       isHD ? '#8B5CF6' : '#06B6D4',
        title:       isHD ? 'Nouveau coiffeur inscrit' : 'Nouveau client inscrit',
        description: u.full_name,
        timestamp:   u.created_at,
      });
    });

    recentSalons.forEach(s => {
      events.push({
        id:          `salon-${s.id}`,
        type:        'salon',
        icon:        'store',
        color:       '#FF6584',
        title:       'Nouveau salon ajouté',
        description: s.name,
        timestamp:   s.created_at,
      });
    });

    events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.status(200).json({ success: true, data: events.slice(0, 15) });
  } catch (error) {
    console.error('getRecentActivity error:', error);
    res.status(500).json({ success: false, error: 'Erreur activité récente' });
  }
};
